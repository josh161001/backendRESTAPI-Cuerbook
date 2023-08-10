import { MigrationInterface, QueryRunner } from "typeorm";

export class Migration21691643158437 implements MigrationInterface {
    name = 'Migration21691643158437'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "user_to_group" DROP CONSTRAINT "FK_177692922d880c756b86056e910"`);
        await queryRunner.query(`ALTER TABLE "user_to_group" ADD CONSTRAINT "FK_177692922d880c756b86056e910" FOREIGN KEY ("groupId") REFERENCES "group"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "user_to_group" DROP CONSTRAINT "FK_177692922d880c756b86056e910"`);
        await queryRunner.query(`ALTER TABLE "user_to_group" ADD CONSTRAINT "FK_177692922d880c756b86056e910" FOREIGN KEY ("groupId") REFERENCES "group"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

}
