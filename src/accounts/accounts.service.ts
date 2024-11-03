import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource, Not } from 'typeorm';

import NotFoundException from 'shared/exceptions/not-found.exception';
import MaximumEntitiesNumberException from 'shared/exceptions/maximum-entities-number.exception';
import ArchivedEntityException from 'shared/exceptions/archived-entity.exception';
import { Account } from 'shared/entities/account.entity';
import { Transaction } from 'shared/entities/transaction.entity';
import { EAccountStatus } from 'shared/enums/account.enums';
import { validateUserOwnership } from 'shared/utils/validateUserOwnership';

import { UsersService } from 'users/users.service';

import { FindAllAccountsDto } from 'accounts/dtos/find-all-accounts.dto';
import { CreateAccountDto } from 'accounts/dtos/create-account.dto';
import { MAX_ACCOUNTS_PER_USER } from 'accounts/constants/accounts-pagination.constants';
import { validateAccountProperties } from 'accounts/utils/validateAccountProperties.util';
import { getNewAccountNewOrder } from 'accounts/utils/getNewAccountNewOrder.util';
import { getOldAccountNewOrder } from 'accounts/utils/getOldAccountNewOrder.util';
import { createBalanceCorrectionTransaction } from 'accounts/utils/createBalanceCorrectionTransaction';
import { archiveAccount } from 'accounts/utils/archiveAccount.util';
import { IGetOneAccountArgs } from 'accounts/interfaces/get-one-account-args.interface';
import { IEditAccountArgs } from 'accounts/interfaces/edit-account-args.interface';
import { IEditAccountCurrencyArgs } from 'accounts/interfaces/edit-account-currency-args.interface';
import { IReorderAccountArgs } from 'accounts/interfaces/reorder-account-args.interface';
import { IDeleteAccountArgs } from 'accounts/interfaces/delete-account-args.interface';

@Injectable()
export class AccountsService {
    constructor(
        @InjectRepository(Account)
        private readonly accountRepository: Repository<Account>,
        @InjectRepository(Transaction)
        private readonly transactionRepository: Repository<Transaction>,
        private readonly usersService: UsersService,
        private readonly dataSource: DataSource,
    ) {}

    async findAll({
        userId,
        type,
        status = EAccountStatus.ACTIVE,
        excludeId,
    }: FindAllAccountsDto): Promise<Account[]> {
        return this.accountRepository.find({
            where: {
                id: typeof excludeId === 'number' ? Not(excludeId) : undefined,
                user: { id: userId },
                type,
                status,
            },
            order: { type: 'ASC', order: 'ASC' },
        });
    }

    async getOne({ id, activeUserId, relations }: IGetOneAccountArgs): Promise<Account> {
        const account = await this.accountRepository.findOne({
            where: { id },
            relations: {
                user: true,
                ...relations,
            },
        });

        validateUserOwnership({
            activeUserId,
            entity: account,
        });

        if (!account) {
            throw new NotFoundException('Account', id);
        }

        return account;
    }

    async create(createAccountDto: CreateAccountDto): Promise<Account> {
        validateAccountProperties(createAccountDto);

        const { userId, balance, type } = createAccountDto;
        const user = await this.usersService.getOne(userId);
        const activeAccounts = await this.findAll({
            userId,
        });

        if (activeAccounts.length >= MAX_ACCOUNTS_PER_USER) {
            throw new MaximumEntitiesNumberException(userId, 'account');
        }

        const order = getNewAccountNewOrder(activeAccounts, type);

        const accountTemplate = this.accountRepository.create({
            ...createAccountDto,
            initBalance: balance,
            order,
            user,
        });

        return this.accountRepository.save(accountTemplate);
    }

    async edit({ id, activeUserId, editAccountDto }: IEditAccountArgs): Promise<Account> {
        const oldAccount = await this.getOne({ id, activeUserId });
        const order = await getOldAccountNewOrder({
            oldAccount,
            editAccountDto,
            findAllAccounts: this.findAll.bind(this),
        });
        const account = await this.accountRepository.preload({
            id,
            ...editAccountDto,
            order,
        });

        validateAccountProperties(account);

        const { status, user, balance: oldBalance } = oldAccount;
        const { status: newStatus, balance: newBalance } = editAccountDto;

        const isBalanceChanging = typeof newBalance !== 'undefined' && newBalance !== oldBalance;
        if (isBalanceChanging) {
            await createBalanceCorrectionTransaction({
                user,
                account,
                value: newBalance - oldBalance,
                updatedBalance: newBalance,
                createTransaction: this.transactionRepository.create.bind(
                    this.transactionRepository,
                ),
                saveTransaction: this.transactionRepository.save.bind(this.transactionRepository),
            });
        }

        const isArchiving = status !== newStatus && newStatus === EAccountStatus.ARCHIVED;
        if (isArchiving) {
            return archiveAccount({
                userId: user.id,
                account,
                createQueryRunner: this.dataSource.createQueryRunner.bind(this.dataSource),
                getOneAccount: this.getOne.bind(this),
                findAllAccounts: this.findAll.bind(this),
            });
        } else {
            return this.accountRepository.save(account);
        }
    }

    async editCurrency({
        id,
        activeUserId,
        editAccountCurrencyDto: { currency, rate },
    }: IEditAccountCurrencyArgs): Promise<Account> {
        const oldAccount = await this.getOne({ id, activeUserId });
        const oldCurrency = oldAccount.currency;
        if (oldCurrency === currency) {
            throw new BadRequestException('The new `currency` is the same like current one');
        }

        const relatedTransactions = await this.transactionRepository.count({
            take: 1,
            where: {
                fromAccount: { id },
                toAccount: { id },
            },
        });
        if (relatedTransactions) {
            throw new BadRequestException('The Account already has related Transactions');
        }

        const { balance, initBalance } = oldAccount;
        const account = await this.accountRepository.preload({
            id,
            currency,
            balance: balance * rate,
            initBalance: initBalance * rate,
        });

        return this.accountRepository.save(account);
    }

    async reorder({
        id,
        activeUserId,
        reorderAccountDto: { order },
    }: IReorderAccountArgs): Promise<Account[]> {
        const account = await this.getOne({ id, activeUserId });

        if (account.status === EAccountStatus.ARCHIVED) {
            throw new ArchivedEntityException('account', id);
        }

        const queryRunner = this.dataSource.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();

        try {
            const {
                user: { id: userId },
                order: oldOrder,
                type,
            } = account;

            if (order === oldOrder) {
                throw new BadRequestException('The `order` is the same like current one');
            }

            const accountsByType = await this.findAll({
                userId,
                type,
                excludeId: id,
            });

            if (order > accountsByType.length) {
                throw new BadRequestException('The `order` is out of Accounts range');
            }

            accountsByType.splice(order, 0, account);
            accountsByType.forEach(({ id: accountId }, i) => {
                queryRunner.manager.update(Account, accountId, { order: i });
            });
            await queryRunner.commitTransaction();

            return this.findAll({
                userId,
                type,
            });
        } catch (err) {
            await queryRunner.rollbackTransaction();
            throw err;
        } finally {
            await queryRunner.release();
        }
    }

    async delete({ id, activeUserId }: IDeleteAccountArgs): Promise<Account[]> {
        const account = await this.getOne({ id, activeUserId });

        const queryRunner = this.dataSource.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();

        try {
            const {
                user: { id: userId },
                type,
            } = account;

            const accountsByType = await this.findAll({
                userId,
                type,
                excludeId: id,
            });

            accountsByType.forEach(({ id: accountId }, i) => {
                queryRunner.manager.update(Account, accountId, { order: i });
            });

            queryRunner.manager.remove(account);

            await queryRunner.commitTransaction();

            return this.findAll({
                userId,
                type,
            });
        } catch (err) {
            await queryRunner.rollbackTransaction();
            throw err;
        } finally {
            await queryRunner.release();
        }
    }
}
