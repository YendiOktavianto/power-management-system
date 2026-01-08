import { MigrationInterface, QueryRunner } from 'typeorm';

export class ModifySomeColumnRelatedWithMonitoringInfo1762432050442 implements MigrationInterface {
  name = 'ModifySomeColumnRelatedWithMonitoringInfo1762432050442';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX "public"."IDX_3851690d1b89a194f3a8035de5"`);
    await queryRunner.query(
      `ALTER TABLE "cost_history" DROP CONSTRAINT "FK_de53df333107772f5ab82542b03"`,
    );
    await queryRunner.query(
      `ALTER TABLE "cost_history" DROP CONSTRAINT "PK_071408348e56d2639d04dc412eb"`,
    );
    await queryRunner.query(`ALTER TABLE "cost_history" DROP COLUMN "history_id"`);
    await queryRunner.query(`ALTER TABLE "cost_history" ADD "history_id" SERIAL NOT NULL`);
    await queryRunner.query(
      `ALTER TABLE "cost_history" ADD CONSTRAINT "PK_071408348e56d2639d04dc412eb" PRIMARY KEY ("history_id")`,
    );
    await queryRunner.query(
      `ALTER TABLE "cost_history" DROP CONSTRAINT "REL_de53df333107772f5ab82542b0"`,
    );
    await queryRunner.query(`ALTER TABLE "cost_history" DROP COLUMN "cost_id"`);
    await queryRunner.query(`ALTER TABLE "cost_history" ADD "cost_id" integer NOT NULL`);
    await queryRunner.query(
      `ALTER TABLE "monitoring_info" DROP CONSTRAINT "FK_b770f082093b3a7544527540ee6"`,
    );
    await queryRunner.query(`ALTER TABLE "cost" DROP CONSTRAINT "PK_3eeb57fc21d4704dc3bdf32db81"`);
    await queryRunner.query(`ALTER TABLE "cost" DROP COLUMN "cost_id"`);
    await queryRunner.query(`ALTER TABLE "cost" ADD "cost_id" SERIAL NOT NULL`);
    await queryRunner.query(
      `ALTER TABLE "cost" ADD CONSTRAINT "PK_3eeb57fc21d4704dc3bdf32db81" PRIMARY KEY ("cost_id")`,
    );
    await queryRunner.query(
      `ALTER TABLE "monitoring_info" DROP CONSTRAINT "FK_3851690d1b89a194f3a8035de5d"`,
    );
    await queryRunner.query(
      `ALTER TABLE "monitoring_info" DROP CONSTRAINT "PK_19c2de9ce107c6102c6b428dee2"`,
    );
    await queryRunner.query(`ALTER TABLE "monitoring_info" DROP COLUMN "monitoring_info_id"`);
    await queryRunner.query(
      `ALTER TABLE "monitoring_info" ADD "monitoring_info_id" SERIAL NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "monitoring_info" ADD CONSTRAINT "PK_19c2de9ce107c6102c6b428dee2" PRIMARY KEY ("monitoring_info_id")`,
    );
    await queryRunner.query(`ALTER TABLE "monitoring_info" ALTER COLUMN "device_id" SET NOT NULL`);
    await queryRunner.query(
      `ALTER TABLE "monitoring_info" DROP CONSTRAINT "UQ_3851690d1b89a194f3a8035de5d"`,
    );
    await queryRunner.query(`ALTER TABLE "monitoring_info" DROP COLUMN "cost_id"`);
    await queryRunner.query(`ALTER TABLE "monitoring_info" ADD "cost_id" integer`);
    await queryRunner.query(
      `ALTER TABLE "cost_history" ADD CONSTRAINT "FK_de53df333107772f5ab82542b03" FOREIGN KEY ("cost_id") REFERENCES "cost"("cost_id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "monitoring_info" ADD CONSTRAINT "FK_3851690d1b89a194f3a8035de5d" FOREIGN KEY ("device_id") REFERENCES "general_info"("device_id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "monitoring_info" ADD CONSTRAINT "FK_b770f082093b3a7544527540ee6" FOREIGN KEY ("cost_id") REFERENCES "cost"("cost_id") ON DELETE SET NULL ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "monitoring_info" DROP CONSTRAINT "FK_b770f082093b3a7544527540ee6"`,
    );
    await queryRunner.query(
      `ALTER TABLE "monitoring_info" DROP CONSTRAINT "FK_3851690d1b89a194f3a8035de5d"`,
    );
    await queryRunner.query(
      `ALTER TABLE "cost_history" DROP CONSTRAINT "FK_de53df333107772f5ab82542b03"`,
    );
    await queryRunner.query(`ALTER TABLE "monitoring_info" DROP COLUMN "cost_id"`);
    await queryRunner.query(`ALTER TABLE "monitoring_info" ADD "cost_id" uuid`);
    await queryRunner.query(
      `ALTER TABLE "monitoring_info" ADD CONSTRAINT "UQ_3851690d1b89a194f3a8035de5d" UNIQUE ("device_id")`,
    );
    await queryRunner.query(`ALTER TABLE "monitoring_info" ALTER COLUMN "device_id" DROP NOT NULL`);
    await queryRunner.query(
      `ALTER TABLE "monitoring_info" DROP CONSTRAINT "PK_19c2de9ce107c6102c6b428dee2"`,
    );
    await queryRunner.query(`ALTER TABLE "monitoring_info" DROP COLUMN "monitoring_info_id"`);
    await queryRunner.query(
      `ALTER TABLE "monitoring_info" ADD "monitoring_info_id" uuid NOT NULL DEFAULT uuid_generate_v4()`,
    );
    await queryRunner.query(
      `ALTER TABLE "monitoring_info" ADD CONSTRAINT "PK_19c2de9ce107c6102c6b428dee2" PRIMARY KEY ("monitoring_info_id")`,
    );
    await queryRunner.query(
      `ALTER TABLE "monitoring_info" ADD CONSTRAINT "FK_3851690d1b89a194f3a8035de5d" FOREIGN KEY ("device_id") REFERENCES "general_info"("device_id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(`ALTER TABLE "cost" DROP CONSTRAINT "PK_3eeb57fc21d4704dc3bdf32db81"`);
    await queryRunner.query(`ALTER TABLE "cost" DROP COLUMN "cost_id"`);
    await queryRunner.query(
      `ALTER TABLE "cost" ADD "cost_id" uuid NOT NULL DEFAULT uuid_generate_v4()`,
    );
    await queryRunner.query(
      `ALTER TABLE "cost" ADD CONSTRAINT "PK_3eeb57fc21d4704dc3bdf32db81" PRIMARY KEY ("cost_id")`,
    );
    await queryRunner.query(
      `ALTER TABLE "monitoring_info" ADD CONSTRAINT "FK_b770f082093b3a7544527540ee6" FOREIGN KEY ("cost_id") REFERENCES "cost"("cost_id") ON DELETE SET NULL ON UPDATE NO ACTION`,
    );
    await queryRunner.query(`ALTER TABLE "cost_history" DROP COLUMN "cost_id"`);
    await queryRunner.query(`ALTER TABLE "cost_history" ADD "cost_id" uuid NOT NULL`);
    await queryRunner.query(
      `ALTER TABLE "cost_history" ADD CONSTRAINT "REL_de53df333107772f5ab82542b0" UNIQUE ("cost_id")`,
    );
    await queryRunner.query(
      `ALTER TABLE "cost_history" DROP CONSTRAINT "PK_071408348e56d2639d04dc412eb"`,
    );
    await queryRunner.query(`ALTER TABLE "cost_history" DROP COLUMN "history_id"`);
    await queryRunner.query(
      `ALTER TABLE "cost_history" ADD "history_id" uuid NOT NULL DEFAULT uuid_generate_v4()`,
    );
    await queryRunner.query(
      `ALTER TABLE "cost_history" ADD CONSTRAINT "PK_071408348e56d2639d04dc412eb" PRIMARY KEY ("history_id")`,
    );
    await queryRunner.query(
      `ALTER TABLE "cost_history" ADD CONSTRAINT "FK_de53df333107772f5ab82542b03" FOREIGN KEY ("cost_id") REFERENCES "cost"("cost_id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_3851690d1b89a194f3a8035de5" ON "monitoring_info" ("device_id") `,
    );
  }
}
