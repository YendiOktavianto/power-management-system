import { MigrationInterface, QueryRunner } from 'typeorm';

export class Cost1700000000003 implements MigrationInterface {
  name = 'Cost1700000000003';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE "cost" (
        "cost_id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "tariff_group" character varying NOT NULL,
        "power_limit" character varying NOT NULL,
        "created_at" timestamptz NOT NULL DEFAULT now(),
        "updated_at" timestamptz NOT NULL DEFAULT now(),
        "deleted_at" timestamptz,
        CONSTRAINT "PK_cost_cost_id" PRIMARY KEY ("cost_id")
      )
    `);
    await queryRunner.query(
      `CREATE UNIQUE INDEX "UQ_cost_group_limit" ON "cost" ("tariff_group", "power_limit")`,
    );

    await queryRunner.query(`
      CREATE TABLE "cost_history" (
        "history_id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "cost_id" uuid NOT NULL,
        "cost_value" numeric(12,2) NOT NULL,
        "valid_from" date NOT NULL,
        "valid_to" date,
        "created_at" timestamptz NOT NULL DEFAULT now(),
        "deleted_at" timestamptz,
        CONSTRAINT "PK_cost_history_id" PRIMARY KEY ("history_id")
      )
    `);
    await queryRunner.query(`
      ALTER TABLE "cost_history"
      ADD CONSTRAINT "FK_cost_history_cost" FOREIGN KEY ("cost_id") REFERENCES "cost"("cost_id") ON DELETE CASCADE ON UPDATE NO ACTION
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "cost_history" DROP CONSTRAINT "FK_cost_history_cost"`);
    await queryRunner.query(`DROP TABLE "cost_history"`);
    await queryRunner.query(`DROP INDEX "UQ_cost_group_limit"`);
    await queryRunner.query(`DROP TABLE "cost"`);
  }
}
