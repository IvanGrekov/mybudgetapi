import { QueryRunner } from 'typeorm';

import { EAccountType } from '../../shared/enums/account.enums';
import { Account } from '../../shared/entities/account.entity';

import { FindAllAccountsDto } from '../dtos/find-all-accounts.dto';

type TFindAllAccounts = (args: FindAllAccountsDto) => Promise<Account[]>;

type TSyncAccountsOrder = (args: {
    queryRunner: QueryRunner;
    userId: number;
    type: EAccountType;
    excludeId?: number;
    findAllAccounts: TFindAllAccounts;
}) => Promise<void>;

const syncAccountsOrder: TSyncAccountsOrder = async ({
    queryRunner,
    userId,
    type,
    excludeId,
    findAllAccounts,
}) => {
    const accountsByType = await findAllAccounts({
        userId,
        type,
        excludeId,
    });

    accountsByType.forEach(({ id }, i) => {
        queryRunner.manager.update(Account, id, { order: i });
    });
};

type TArchiveAccountArgs = (args: {
    account: Account;
    userId: number;
    type: EAccountType;
    createQueryRunner(): QueryRunner;
    findOneAccount(id: number): Promise<Account>;
    findAllAccounts: TFindAllAccounts;
}) => Promise<Account>;

export const archiveAccount: TArchiveAccountArgs = async ({
    account,
    userId,
    type,
    createQueryRunner,
    findOneAccount,
    findAllAccounts,
}) => {
    const accountId = account.id;

    const queryRunner = createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
        queryRunner.manager.update(Account, accountId, account);

        await syncAccountsOrder({
            queryRunner,
            userId,
            type,
            excludeId: accountId,
            findAllAccounts,
        });

        await queryRunner.commitTransaction();

        return findOneAccount(accountId);
    } catch (err) {
        await queryRunner.rollbackTransaction();
        throw err;
    } finally {
        await queryRunner.release();
    }
};
