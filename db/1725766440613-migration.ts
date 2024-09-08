import { MigrationInterface, QueryRunner } from "typeorm";

export class Migration1725766440613 implements MigrationInterface {
    name = 'Migration1725766440613'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "posts" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "post_text" text NOT NULL, "userId" uuid, CONSTRAINT "PK_2829ac61eff60fcec60d7274b9e" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "comments" DROP COLUMN "likes_count"`);
        await queryRunner.query(`ALTER TABLE "streams" DROP COLUMN "streaming_time"`);
        await queryRunner.query(`ALTER TABLE "streams" ADD "streaming_time" character varying`);
        await queryRunner.query(`ALTER TABLE "posts" ADD CONSTRAINT "FK_ae05faaa55c866130abef6e1fee" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "posts" DROP CONSTRAINT "FK_ae05faaa55c866130abef6e1fee"`);
        await queryRunner.query(`ALTER TABLE "streams" DROP COLUMN "streaming_time"`);
        await queryRunner.query(`ALTER TABLE "streams" ADD "streaming_time" TIMESTAMP`);
        await queryRunner.query(`ALTER TABLE "comments" ADD "likes_count" integer NOT NULL DEFAULT '0'`);
        await queryRunner.query(`DROP TABLE "posts"`);
    }

}
