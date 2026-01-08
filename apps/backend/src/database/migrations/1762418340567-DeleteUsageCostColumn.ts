import { MigrationInterface, QueryRunner } from 'typeorm';

export class DeleteUsageCostColumn1762418340567 implements MigrationInterface {
  name = 'DeleteUsageCostColumn1762418340567';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "cost" DROP COLUMN "usage_cost"`);
    await queryRunner.query(`ALTER TYPE "public"."gol_tarif_enum" RENAME TO "gol_tarif_enum_old"`);
    await queryRunner.query(
      `CREATE TYPE "public"."gol_tarif_enum" AS ENUM('R-1/TR', 'R-2/TR', 'R-3/TR')`,
    );
    await queryRunner.query(
      `ALTER TABLE "cost" ALTER COLUMN "tariff_group" TYPE "public"."gol_tarif_enum" USING "tariff_group"::"text"::"public"."gol_tarif_enum"`,
    );
    await queryRunner.query(`DROP TYPE "public"."gol_tarif_enum_old"`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TYPE "public"."gol_tarif_enum_old" AS ENUM('R-1/TR', 'R-2/TR', 'R-3/TR', 'B-1/TR', 'B-2/TR', 'I-1/TR', 'I-2/TR', 'I-3/TR')`,
    );
    await queryRunner.query(
      `ALTER TABLE "cost" ALTER COLUMN "tariff_group" TYPE "public"."gol_tarif_enum_old" USING "tariff_group"::"text"::"public"."gol_tarif_enum_old"`,
    );
    await queryRunner.query(`DROP TYPE "public"."gol_tarif_enum"`);
    await queryRunner.query(`ALTER TYPE "public"."gol_tarif_enum_old" RENAME TO "gol_tarif_enum"`);
    await queryRunner.query(`ALTER TABLE "cost" ADD "usage_cost" numeric(12,2) NOT NULL`);
  }
}
