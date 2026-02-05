import { MigrationInterface, QueryRunner } from 'typeorm';

export class DeviceRequests1700000000005 implements MigrationInterface {
  name = 'DeviceRequests1700000000005';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TYPE "public"."device_request_status_enum" AS ENUM('PENDING', 'APPROVED', 'REJECTED')`,
    );

    await queryRunner.query(`
      CREATE TABLE "device_requests" (
        "request_id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "requester_user_id" uuid NOT NULL,
        "requester_org_id" uuid NOT NULL,
        "target_org_id" uuid NOT NULL,
        "address_id" uuid,
        "address_name" character varying,
        "detail_address" character varying,
        "location_label" character varying,
        "longitude" double precision NOT NULL,
        "latitude" double precision NOT NULL,
        "status" "public"."device_request_status_enum" NOT NULL DEFAULT 'PENDING',
        "approved_by" uuid,
        "approved_at" timestamptz,
        "rejected_by" uuid,
        "rejected_at" timestamptz,
        "note" text,
        "device_id" uuid,
        "created_at" timestamptz NOT NULL DEFAULT now(),
        "updated_at" timestamptz NOT NULL DEFAULT now(),
        CONSTRAINT "PK_device_requests_id" PRIMARY KEY ("request_id"),
        CONSTRAINT "UQ_device_requests_device_id" UNIQUE ("device_id")
      )
    `);

    await queryRunner.query(`
      ALTER TABLE "device_requests"
      ADD CONSTRAINT "FK_device_requests_user" FOREIGN KEY ("requester_user_id") REFERENCES "users"("user_id") ON DELETE CASCADE ON UPDATE NO ACTION
    `);
    await queryRunner.query(`
      ALTER TABLE "device_requests"
      ADD CONSTRAINT "FK_device_requests_requester_org" FOREIGN KEY ("requester_org_id") REFERENCES "organizations"("org_id") ON DELETE RESTRICT ON UPDATE NO ACTION
    `);
    await queryRunner.query(`
      ALTER TABLE "device_requests"
      ADD CONSTRAINT "FK_device_requests_target_org" FOREIGN KEY ("target_org_id") REFERENCES "organizations"("org_id") ON DELETE RESTRICT ON UPDATE NO ACTION
    `);
    await queryRunner.query(`
      ALTER TABLE "device_requests"
      ADD CONSTRAINT "FK_device_requests_address" FOREIGN KEY ("address_id") REFERENCES "addresses"("address_id") ON DELETE SET NULL ON UPDATE NO ACTION
    `);
    await queryRunner.query(`
      ALTER TABLE "device_requests"
      ADD CONSTRAINT "FK_device_requests_approved_by" FOREIGN KEY ("approved_by") REFERENCES "users"("user_id") ON DELETE SET NULL ON UPDATE NO ACTION
    `);
    await queryRunner.query(`
      ALTER TABLE "device_requests"
      ADD CONSTRAINT "FK_device_requests_rejected_by" FOREIGN KEY ("rejected_by") REFERENCES "users"("user_id") ON DELETE SET NULL ON UPDATE NO ACTION
    `);
    await queryRunner.query(`
      ALTER TABLE "device_requests"
      ADD CONSTRAINT "FK_device_requests_device" FOREIGN KEY ("device_id") REFERENCES "devices"("device_id") ON DELETE SET NULL ON UPDATE NO ACTION
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "device_requests" DROP CONSTRAINT "FK_device_requests_device"`,
    );
    await queryRunner.query(
      `ALTER TABLE "device_requests" DROP CONSTRAINT "FK_device_requests_rejected_by"`,
    );
    await queryRunner.query(
      `ALTER TABLE "device_requests" DROP CONSTRAINT "FK_device_requests_approved_by"`,
    );
    await queryRunner.query(
      `ALTER TABLE "device_requests" DROP CONSTRAINT "FK_device_requests_address"`,
    );
    await queryRunner.query(
      `ALTER TABLE "device_requests" DROP CONSTRAINT "FK_device_requests_target_org"`,
    );
    await queryRunner.query(
      `ALTER TABLE "device_requests" DROP CONSTRAINT "FK_device_requests_requester_org"`,
    );
    await queryRunner.query(
      `ALTER TABLE "device_requests" DROP CONSTRAINT "FK_device_requests_user"`,
    );
    await queryRunner.query(`DROP TABLE "device_requests"`);
    await queryRunner.query(`DROP TYPE "public"."device_request_status_enum"`);
  }
}
