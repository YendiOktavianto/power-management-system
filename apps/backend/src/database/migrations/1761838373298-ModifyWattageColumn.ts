import { MigrationInterface, QueryRunner } from 'typeorm';

export class ModifyWattageColumn1761838373298 implements MigrationInterface {
  name = 'ModifyWattageColumn1761838373298';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "general_info" DROP COLUMN "wattage"`);
    await queryRunner.query(`ALTER TABLE "general_info" ADD "wattage" character varying(32)`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "general_info" DROP COLUMN "wattage"`);
    await queryRunner.query(`ALTER TABLE "general_info" ADD "wattage" numeric(12,3) NOT NULL`);
  }
}
