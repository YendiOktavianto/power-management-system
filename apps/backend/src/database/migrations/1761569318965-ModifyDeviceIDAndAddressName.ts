import { MigrationInterface, QueryRunner } from 'typeorm';

export class ModifyDeviceIDAndAddressName1761569318965 implements MigrationInterface {
  name = 'ModifyDeviceIDAndAddressName1761569318965';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "address" DROP COLUMN "latitude"`);
    await queryRunner.query(`ALTER TABLE "address" DROP COLUMN "address_name"`);
    await queryRunner.query(`ALTER TABLE "address" ADD "address_name" character varying(200)`);
    await queryRunner.query(
      `ALTER TABLE "location" DROP CONSTRAINT "FK_77084a2fd668737ed5b7284e895"`,
    );
    await queryRunner.query(
      `ALTER TABLE "location" DROP CONSTRAINT "REL_77084a2fd668737ed5b7284e89"`,
    );
    await queryRunner.query(`ALTER TABLE "location" DROP COLUMN "device_id"`);
    await queryRunner.query(`ALTER TABLE "location" ADD "device_id" integer`);
    await queryRunner.query(
      `ALTER TABLE "location" ADD CONSTRAINT "UQ_77084a2fd668737ed5b7284e895" UNIQUE ("device_id")`,
    );
    await queryRunner.query(
      `ALTER TABLE "monitoring_info" DROP CONSTRAINT "FK_3851690d1b89a194f3a8035de5d"`,
    );
    await queryRunner.query(`DROP INDEX "public"."IDX_3851690d1b89a194f3a8035de5"`);
    await queryRunner.query(
      `ALTER TABLE "monitoring_info" DROP CONSTRAINT "REL_3851690d1b89a194f3a8035de5"`,
    );
    await queryRunner.query(`ALTER TABLE "monitoring_info" DROP COLUMN "device_id"`);
    await queryRunner.query(`ALTER TABLE "monitoring_info" ADD "device_id" integer`);
    await queryRunner.query(
      `ALTER TABLE "monitoring_info" ADD CONSTRAINT "UQ_3851690d1b89a194f3a8035de5d" UNIQUE ("device_id")`,
    );
    await queryRunner.query(
      `ALTER TABLE "general_info" DROP CONSTRAINT "PK_d1d8296e22024fc5a926863b521"`,
    );
    await queryRunner.query(`ALTER TABLE "general_info" DROP COLUMN "device_id"`);
    await queryRunner.query(`ALTER TABLE "general_info" ADD "device_id" SERIAL NOT NULL`);
    await queryRunner.query(
      `ALTER TABLE "general_info" ADD CONSTRAINT "PK_d1d8296e22024fc5a926863b521" PRIMARY KEY ("device_id")`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_3851690d1b89a194f3a8035de5" ON "monitoring_info" ("device_id") `,
    );
    await queryRunner.query(
      `ALTER TABLE "location" ADD CONSTRAINT "FK_77084a2fd668737ed5b7284e895" FOREIGN KEY ("device_id") REFERENCES "general_info"("device_id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "monitoring_info" ADD CONSTRAINT "FK_3851690d1b89a194f3a8035de5d" FOREIGN KEY ("device_id") REFERENCES "general_info"("device_id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "monitoring_info" DROP CONSTRAINT "FK_3851690d1b89a194f3a8035de5d"`,
    );
    await queryRunner.query(
      `ALTER TABLE "location" DROP CONSTRAINT "FK_77084a2fd668737ed5b7284e895"`,
    );
    await queryRunner.query(`DROP INDEX "public"."IDX_3851690d1b89a194f3a8035de5"`);
    await queryRunner.query(
      `ALTER TABLE "general_info" DROP CONSTRAINT "PK_d1d8296e22024fc5a926863b521"`,
    );
    await queryRunner.query(`ALTER TABLE "general_info" DROP COLUMN "device_id"`);
    await queryRunner.query(
      `ALTER TABLE "general_info" ADD "device_id" uuid NOT NULL DEFAULT uuid_generate_v4()`,
    );
    await queryRunner.query(
      `ALTER TABLE "general_info" ADD CONSTRAINT "PK_d1d8296e22024fc5a926863b521" PRIMARY KEY ("device_id")`,
    );
    await queryRunner.query(
      `ALTER TABLE "monitoring_info" DROP CONSTRAINT "UQ_3851690d1b89a194f3a8035de5d"`,
    );
    await queryRunner.query(`ALTER TABLE "monitoring_info" DROP COLUMN "device_id"`);
    await queryRunner.query(`ALTER TABLE "monitoring_info" ADD "device_id" uuid`);
    await queryRunner.query(
      `ALTER TABLE "monitoring_info" ADD CONSTRAINT "REL_3851690d1b89a194f3a8035de5" UNIQUE ("device_id")`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_3851690d1b89a194f3a8035de5" ON "monitoring_info" ("device_id") `,
    );
    await queryRunner.query(
      `ALTER TABLE "monitoring_info" ADD CONSTRAINT "FK_3851690d1b89a194f3a8035de5d" FOREIGN KEY ("device_id") REFERENCES "general_info"("device_id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "location" DROP CONSTRAINT "UQ_77084a2fd668737ed5b7284e895"`,
    );
    await queryRunner.query(`ALTER TABLE "location" DROP COLUMN "device_id"`);
    await queryRunner.query(`ALTER TABLE "location" ADD "device_id" uuid`);
    await queryRunner.query(
      `ALTER TABLE "location" ADD CONSTRAINT "REL_77084a2fd668737ed5b7284e89" UNIQUE ("device_id")`,
    );
    await queryRunner.query(
      `ALTER TABLE "location" ADD CONSTRAINT "FK_77084a2fd668737ed5b7284e895" FOREIGN KEY ("device_id") REFERENCES "general_info"("device_id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(`ALTER TABLE "address" DROP COLUMN "address_name"`);
    await queryRunner.query(`ALTER TABLE "address" ADD "address_name" character varying`);
    await queryRunner.query(`ALTER TABLE "address" ADD "latitude" double precision`);
  }
}
