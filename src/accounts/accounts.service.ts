import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, FindOptionsRelations, DataSource, Not } from 'typeorm';

import NotFoundException from '../shared/exceptions/not-found.exception';
import MaximumEntitiesNumberException from '../shared/exceptions/maximum-entities-number.exception';
import ArchivedEntityException from '../shared/exceptions/archived-entity.exception';
import { Account } from '../shared/entities/account.entity';
import { Transaction } from '../shared/entities/transaction.entity';
import { EAccountStatus } from '../shared/enums/account.enums';
import { UsersService } from '../users/users.service';

import { FindAllAccountsDto } from './dtos/find-all-accounts.dto';
import { CreateAccountDto } from './dtos/create-account.dto';
import { EditAccountDto } from './dtos/edit-account.dto';
import { EditAccountCurrencyDto } from './dtos/edit-account-currency.dto';
import { ReorderAccountDto } from './dtos/reorder-account.dto';
import { MAX_ACCOUNTS_PER_USER } from './constants/accounts-pagination.constants';
import { validateAccountProperties } from './utils/validateAccountProperties.util';
import { getNewAccountNewOrder } from './utils/getNewAccountNewOrder.util';
import { getOldAccountNewOrder } from './utils/getOldAccountNewOrder.util';
import { createBalanceCorrectionTransaction } from './utils/createBalanceCorrectionTransaction';
import { archiveAccount } from './utils/archiveAccount.util';

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

    async findOne(id: Account['id'], relations?: FindOptionsRelations<Account>): Promise<Account> {
        const account = await this.accountRepository.findOne({
            where: { id },
            relations,
        });

        if (!account) {
            throw new NotFoundException('Account', id);
        }

        return account;
    }

    async create(createAccountDto: CreateAccountDto): Promise<Account> {
        validateAccountProperties(createAccountDto);

        const { userId, balance, type } = createAccountDto;
        const user = await this.usersService.findOne(userId);
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

    async edit(id: Account['id'], editAccountDto: EditAccountDto): Promise<Account> {
        const oldAccount = await this.findOne(id, { user: true });
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
                findOneAccount: this.findOne.bind(this),
                findAllAccounts: this.findAll.bind(this),
            });
        } else {
            return this.accountRepository.save(account);
        }
    }

    async editCurrency(
        id: Account['id'],
        { currency, rate }: EditAccountCurrencyDto,
    ): Promise<Account> {
        const oldAccount = await this.findOne(id);
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

    async reorder(id: Account['id'], { order }: ReorderAccountDto): Promise<Account[]> {
        const account = await this.findOne(id, { user: true });

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
            });
        } catch (err) {
            await queryRunner.rollbackTransaction();
            throw err;
        } finally {
            await queryRunner.release();
        }
    }

    async delete(id: Account['id']): Promise<Account[]> {
        const account = await this.findOne(id, {
            user: true,
        });

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
