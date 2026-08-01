import { MigrationInterface, QueryRunner } from "typeorm";

export class InitialBaseline1785621561561 implements MigrationInterface {
    name = 'InitialBaseline1785621561561'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "links" ("id" SERIAL NOT NULL, "code" character varying(64) NOT NULL, "long_url" text NOT NULL, "principal_id" character varying(128) NOT NULL, "clicks_count" integer NOT NULL DEFAULT '0', "expires_at" TIMESTAMP WITH TIME ZONE, "tags" text array NOT NULL DEFAULT '{}', "password" character varying, "domain" character varying(255), "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "PK_ecf17f4a741d3c5ba0b4c5ab4b6" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_98a50265d572afe137fdaae70a" ON "links" ("principal_id") `);
        await queryRunner.query(`CREATE UNIQUE INDEX "IDX_b06c7264827fa58d0e980fe912" ON "links" ("code", "domain") `);
        await queryRunner.query(`CREATE TABLE "click_logs" ("id" SERIAL NOT NULL, "link_id" integer NOT NULL, "device_type" character varying(32) NOT NULL DEFAULT 'other', "referrer" text, "user_agent" text, "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "PK_d83c6f94e3e697748ee94330128" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_f5b0ff057ee532c7391b529709" ON "click_logs" ("link_id") `);
        await queryRunner.query(`CREATE TABLE "webhooks" ("id" SERIAL NOT NULL, "principal_id" character varying(128) NOT NULL, "url" text NOT NULL, "events" text array NOT NULL, "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "PK_9e8795cfc899ab7bdaa831e8527" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_08623b20d33d50f76c9e1ffa10" ON "webhooks" ("principal_id") `);
        await queryRunner.query(`ALTER TABLE "click_logs" ADD CONSTRAINT "FK_f5b0ff057ee532c7391b5297097" FOREIGN KEY ("link_id") REFERENCES "links"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "click_logs" DROP CONSTRAINT "FK_f5b0ff057ee532c7391b5297097"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_08623b20d33d50f76c9e1ffa10"`);
        await queryRunner.query(`DROP TABLE "webhooks"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_f5b0ff057ee532c7391b529709"`);
        await queryRunner.query(`DROP TABLE "click_logs"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_b06c7264827fa58d0e980fe912"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_98a50265d572afe137fdaae70a"`);
        await queryRunner.query(`DROP TABLE "links"`);
    }

}
