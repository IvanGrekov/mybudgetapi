import { MigrationInterface, QueryRunner } from 'typeorm';

export class ChangeMaxNumericLength1738352318173 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE "transaction"
            ALTER COLUMN "fromAccountUpdatedBalance" TYPE NUMERIC(32,2) USING "fromAccountUpdatedBalance"::NUMERIC(32,2),
            ALTER COLUMN "toAccountUpdatedBalance" TYPE NUMERIC(32,2) USING "toAccountUpdatedBalance"::NUMERIC(32,2),
            ALTER COLUMN "fee" TYPE NUMERIC(32,2) USING "fee"::NUMERIC(32,2),
            ALTER COLUMN "value" TYPE NUMERIC(32,2) USING "value"::NUMERIC(32,2)
        `);

        await queryRunner.query(`
            ALTER TABLE "account"
            ALTER COLUMN "balance" TYPE NUMERIC(32,2) USING "balance"::NUMERIC(32,2),
            ALTER COLUMN "initBalance" TYPE NUMERIC(32,2) USING "initBalance"::NUMERIC(32,2)
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE "transaction"
            ALTER COLUMN "fromAccountUpdatedBalance" TYPE REAL USING "fromAccountUpdatedBalance"::REAL,
            ALTER COLUMN "toAccountUpdatedBalance" TYPE REAL USING "toAccountUpdatedBalance"::REAL,
            ALTER COLUMN "fee" TYPE REAL USING "fee"::REAL,
            ALTER COLUMN "value" TYPE REAL USING "value"::REAL
        `);

        await queryRunner.query(`
            ALTER TABLE "account"
            ALTER COLUMN "balance" TYPE REAL USING "balance"::REAL,
            ALTER COLUMN "initBalance" TYPE REAL USING "initBalance"::REAL
        `);
    }
}
