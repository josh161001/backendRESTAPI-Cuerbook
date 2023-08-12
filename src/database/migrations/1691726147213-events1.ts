import { MigrationInterface, QueryRunner } from "typeorm";

export class Events11691726147213 implements MigrationInterface {
    name = 'Events11691726147213'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "event" ADD "cupo" integer NOT NULL`);
        await queryRunner.query(`ALTER TABLE "event" ALTER COLUMN "lugar" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "event" ALTER COLUMN "description" SET NOT NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "event" ALTER COLUMN "description" DROP NOT NULL`);
        await queryRunner.query(`ALTER TABLE "event" ALTER COLUMN "lugar" DROP NOT NULL`);
        await queryRunner.query(`ALTER TABLE "event" DROP COLUMN "cupo"`);
    }

}
