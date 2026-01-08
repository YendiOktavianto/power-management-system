import { MigrationInterface, QueryRunner } from 'typeorm';

export class MoveWattageAndPhaseToGeneralInfo1761813790028 implements MigrationInterface {
  name = 'MoveWattageAndPhaseToGeneralInfo1761813790028';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "monitoring_info" DROP COLUMN "wattage"`);
    await queryRunner.query(`ALTER TABLE "monitoring_info" DROP COLUMN "phase"`);
    await queryRunner.query(`DROP TYPE "public"."phase_type_enum"`);
    await queryRunner.query(
      `ALTER TABLE "general_info" ADD "phase" character varying(16) NOT NULL DEFAULT '1 PHASE'`,
    );
    await queryRunner.query(`ALTER TABLE "general_info" ADD "wattage" numeric(12,3) NOT NULL`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "general_info" DROP COLUMN "wattage"`);
    await queryRunner.query(`ALTER TABLE "general_info" DROP COLUMN "phase"`);
    await queryRunner.query(`CREATE TYPE "public"."phase_type_enum" AS ENUM('1 PHASE', '3 PHASE')`);
    await queryRunner.query(
      `ALTER TABLE "monitoring_info" ADD "phase" "public"."phase_type_enum" NOT NULL`,
    );
    await queryRunner.query(`ALTER TABLE "monitoring_info" ADD "wattage" numeric(12,3) NOT NULL`);
  }
}
