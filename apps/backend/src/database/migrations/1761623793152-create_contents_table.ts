import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateContentsTable1761623793152 implements MigrationInterface {
  name = 'CreateContentsTable1761623793152';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "contents" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "key" character varying(120) NOT NULL, "data" jsonb NOT NULL DEFAULT '{}', "updatedBy" character varying(120), "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_b7c504072e537532d7080c54fac" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "IDX_5a161456f6a9c9810fbe6e6b73" ON "contents" ("key") `,
    );
    await queryRunner.query(`ALTER TABLE "address" DROP COLUMN IF EXISTS "latitude"`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "address" ADD "lattitude" double precision`);
    await queryRunner.query(`DROP INDEX "public"."IDX_5a161456f6a9c9810fbe6e6b73"`);
    await queryRunner.query(`DROP TABLE "contents"`);
  }
}
