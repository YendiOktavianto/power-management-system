import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddRequestDeviceTable1760944460043 implements MigrationInterface {
  name = 'AddRequestDeviceTable1760944460043';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "device_requests" ("id" SERIAL NOT NULL, "username" character varying(120) NOT NULL, "address" text NOT NULL, "segmen" character varying(120), "detail_address" character varying(180), "lat" double precision NOT NULL, "lng" double precision NOT NULL, "status" character varying(20) NOT NULL DEFAULT 'pending', "time" bigint NOT NULL, CONSTRAINT "PK_f2f086a7c082373a6404d79ad27" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_8649b350b7b33235ef99f908ad" ON "device_requests" ("username") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_fde6f54155e0666223d4d043b8" ON "device_requests" ("status") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_f433d46f5bd2af87896e62bb61" ON "device_requests" ("time") `,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX "public"."IDX_f433d46f5bd2af87896e62bb61"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_fde6f54155e0666223d4d043b8"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_8649b350b7b33235ef99f908ad"`);
    await queryRunner.query(`DROP TABLE "device_requests"`);
  }
}
