import { MigrationInterface, QueryRunner } from "typeorm";

export class Event1691788615664 implements MigrationInterface {
    name = 'Event1691788615664'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "user_to_event" DROP CONSTRAINT "FK_ccfa4086114aa7f27ac270130af"`);
        await queryRunner.query(`ALTER TABLE "user_to_event" ADD CONSTRAINT "FK_ccfa4086114aa7f27ac270130af" FOREIGN KEY ("eventId") REFERENCES "event"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "user_to_event" DROP CONSTRAINT "FK_ccfa4086114aa7f27ac270130af"`);
        await queryRunner.query(`ALTER TABLE "user_to_event" ADD CONSTRAINT "FK_ccfa4086114aa7f27ac270130af" FOREIGN KEY ("eventId") REFERENCES "event"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

}
