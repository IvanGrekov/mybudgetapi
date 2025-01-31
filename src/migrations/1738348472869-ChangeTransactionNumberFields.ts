import { MigrationInterface, QueryRunner } from 'typeorm';

export class ChangeTransactionNumberFields1738348472869 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE "transaction"
            ALTER COLUMN "fromAccountUpdatedBalance" TYPE NUMERIC(10,2) USING "fromAccountUpdatedBalance"::NUMERIC(10,2),
            ALTER COLUMN "toAccountUpdatedBalance" TYPE NUMERIC(10,2) USING "toAccountUpdatedBalance"::NUMERIC(10,2),
            ALTER COLUMN "fee" TYPE NUMERIC(10,2) USING "fee"::NUMERIC(10,2),
            ALTER COLUMN "value" TYPE NUMERIC(10,2) USING "value"::NUMERIC(10,2)
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
    }
}
