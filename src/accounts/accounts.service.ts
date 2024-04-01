import { Injectable, ForbiddenException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, FindOptionsWhere, FindOptionsRelations, DataSource, Not } from 'typeorm';

import NotFoundException from '../shared/exceptions/not-found.exception';
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
import { createTransferTransaction } from './utils/createTransferTransaction.util';
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
        const where: FindOptionsWhere<Account> = {
            user: { id: userId },
            type,
            status,
        };

        if (typeof excludeId !== 'undefined') {
            where.id = Not(excludeId);
        }

        return this.accountRepository.find({
            where,
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
            throw new ForbiddenException(
                `User #${userId} already has the maximum number of Accounts`,
            );
        }

        const order = getNewAccountNewOrder(activeAccounts, type);

        const accountTemplate = this.accountRepository.create({
            ...createAccountDto,
            initBalance: balance,
            order,
            user,
        });

        const account = await this.accountRepository.save(accountTemplate);

        return this.findOne(account.id);
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

        const { status, type, user, balance: oldBalance, currency } = oldAccount;
        const { status: newStatus, balance } = editAccountDto;

        const isBalanceChanging = typeof balance !== 'undefined' && balance !== oldBalance;
        const isArchiving = status !== newStatus && newStatus === EAccountStatus.ARCHIVED;

        if (isBalanceChanging) {
            await createTransferTransaction({
                user,
                account,
                value: balance - oldBalance,
                currency,
                updatedBalance: balance,
                create: this.transactionRepository.create.bind(this.transactionRepository),
                save: this.transactionRepository.save.bind(this.transactionRepository),
            });
        }

        if (isArchiving) {
            return archiveAccount({
                userId: user.id,
                type,
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
            throw new BadRequestException('The new `currency` is the same like current');
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
            throw new BadRequestException(`Account #${id} is archived`);
        }

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
            });
            const newAccountsByType = accountsByType.filter(
                ({ id: accountId }) => accountId !== id,
            );

            newAccountsByType.splice(order, 0, account);
            newAccountsByType.forEach(({ id: accountId }, i) => {
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

    async delete(id: Account['id']): Promise<Account> {
        const account = await this.findOne(id);

        return this.accountRepository.remove(account);
    }
}
