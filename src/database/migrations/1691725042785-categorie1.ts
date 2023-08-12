import { MigrationInterface, QueryRunner } from "typeorm";

export class Categorie11691725042785 implements MigrationInterface {
    name = 'Categorie11691725042785'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "category" DROP CONSTRAINT "FK_dc80af15ad8913831d0c359018d"`);
        await queryRunner.query(`ALTER TABLE "category" DROP COLUMN "group_id"`);
        await queryRunner.query(`ALTER TABLE "group" ADD "categoryId" integer`);
        await queryRunner.query(`ALTER TABLE "group" ADD CONSTRAINT "UQ_3dd087a187e839fc50a14b5ad98" UNIQUE ("categoryId")`);
        await queryRunner.query(`ALTER TABLE "group" ADD CONSTRAINT "FK_3dd087a187e839fc50a14b5ad98" FOREIGN KEY ("categoryId") REFERENCES "category"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "group" DROP CONSTRAINT "FK_3dd087a187e839fc50a14b5ad98"`);
        await queryRunner.query(`ALTER TABLE "group" DROP CONSTRAINT "UQ_3dd087a187e839fc50a14b5ad98"`);
        await queryRunner.query(`ALTER TABLE "group" DROP COLUMN "categoryId"`);
        await queryRunner.query(`ALTER TABLE "category" ADD "group_id" uuid`);
        await queryRunner.query(`ALTER TABLE "category" ADD CONSTRAINT "FK_dc80af15ad8913831d0c359018d" FOREIGN KEY ("group_id") REFERENCES "group"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

}
