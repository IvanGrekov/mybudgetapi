import { MigrationInterface, QueryRunner } from 'typeorm';

export class ChangeAccountBalanceColumnsType1738348249420 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            `ALTER TABLE "account" ALTER COLUMN "balance" TYPE NUMERIC(10,2) USING "balance"::NUMERIC(10,2)`,
        );
        await queryRunner.query(
            `ALTER TABLE "account" ALTER COLUMN "initBalance" TYPE NUMERIC(10,2) USING "initBalance"::NUMERIC(10,2)`,
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            `ALTER TABLE "account" ALTER COLUMN "balance" TYPE REAL USING "balance"::REAL`,
        );
        await queryRunner.query(
            `ALTER TABLE "account" ALTER COLUMN "initBalance" TYPE REAL USING "initBalance"::REAL`,
        );
    }
}
