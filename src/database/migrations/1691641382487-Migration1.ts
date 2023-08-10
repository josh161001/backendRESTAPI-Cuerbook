import { MigrationInterface, QueryRunner } from "typeorm";

export class Migration11691641382487 implements MigrationInterface {
    name = 'Migration11691641382487'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "user" ALTER COLUMN "status" SET DEFAULT true`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "user" ALTER COLUMN "status" SET DEFAULT false`);
    }

}
