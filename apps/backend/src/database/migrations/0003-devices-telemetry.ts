import { MigrationInterface, QueryRunner } from 'typeorm';

export class DevicesTelemetry0003 implements MigrationInterface {
  name = '0003-devices-telemetry';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TYPE "public"."device_phase_enum" AS ENUM('1 PHASE', '3 PHASE')`,
    );
    await queryRunner.query(`
      CREATE TABLE "devices" (
        "device_id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "serial_number" character varying NOT NULL,
        "device_name" character varying,
        "phase" "public"."device_phase_enum" NOT NULL,
        "wattage" character varying,
        "is_active" boolean NOT NULL DEFAULT true,
        "location_id" uuid NOT NULL,
        "owner_org_id" uuid NOT NULL,
        "provisioned_by_user_id" uuid,
        "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "deleted_at" TIMESTAMP WITH TIME ZONE,
        CONSTRAINT "PK_devices_device_id" PRIMARY KEY ("device_id"),
        CONSTRAINT "UQ_devices_serial_number" UNIQUE ("serial_number")
      )
    `);
    await queryRunner.query(
      `ALTER TABLE "devices" ADD CONSTRAINT "FK_devices_location" FOREIGN KEY ("location_id") REFERENCES "locations"("location_id") ON DELETE RESTRICT ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "devices" ADD CONSTRAINT "FK_devices_owner_org" FOREIGN KEY ("owner_org_id") REFERENCES "organizations"("org_id") ON DELETE RESTRICT ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "devices" ADD CONSTRAINT "FK_devices_provisioned_by" FOREIGN KEY ("provisioned_by_user_id") REFERENCES "users"("user_id") ON DELETE SET NULL ON UPDATE NO ACTION`,
    );

    await queryRunner.query(`
      CREATE TABLE "telemetry_readings" (
        "telemetry_id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "device_id" uuid NOT NULL,
        "recorded_at" TIMESTAMP WITH TIME ZONE NOT NULL,
        "cost_id" uuid,
        "voltage" numeric NOT NULL,
        "current" numeric NOT NULL,
        "frequency" numeric NOT NULL,
        "power" numeric NOT NULL,
        "power_factor" numeric NOT NULL,
        "total_energy_usage" numeric,
        "total_energy_usage_today" numeric,
        "total_energy_usage_mtd" numeric,
        "total_energy_cost" numeric,
        "total_energy_cost_today" numeric,
        "total_energy_cost_mtd" numeric,
        "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        CONSTRAINT "PK_telemetry_id" PRIMARY KEY ("telemetry_id")
      )
    `);
    await queryRunner.query(
      `ALTER TABLE "telemetry_readings" ADD CONSTRAINT "FK_telemetry_device" FOREIGN KEY ("device_id") REFERENCES "devices"("device_id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_telemetry_device_recorded_at" ON "telemetry_readings" ("device_id", "recorded_at")`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX "IDX_telemetry_device_recorded_at"`);
    await queryRunner.query(`ALTER TABLE "telemetry_readings" DROP CONSTRAINT "FK_telemetry_device"`);
    await queryRunner.query(`DROP TABLE "telemetry_readings"`);

    await queryRunner.query(`ALTER TABLE "devices" DROP CONSTRAINT "FK_devices_provisioned_by"`);
    await queryRunner.query(`ALTER TABLE "devices" DROP CONSTRAINT "FK_devices_owner_org"`);
    await queryRunner.query(`ALTER TABLE "devices" DROP CONSTRAINT "FK_devices_location"`);
    await queryRunner.query(`DROP TABLE "devices"`);
    await queryRunner.query(`DROP TYPE "public"."device_phase_enum"`);
  }
}
