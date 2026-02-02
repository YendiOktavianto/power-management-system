import { MigrationInterface, QueryRunner } from 'typeorm';

export class AuthContents0006 implements MigrationInterface {
  name = '0006-auth-contents';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE "refresh_sessions" (
        "refresh_session_id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "user_id" uuid NOT NULL,
        "jti" character varying NOT NULL,
        "token_hash" character varying NOT NULL,
        "expires_at" TIMESTAMP WITH TIME ZONE NOT NULL,
        "revoked_at" TIMESTAMP WITH TIME ZONE,
        "replaced_by_jti" character varying,
        "user_agent" character varying,
        "ip" character varying,
        "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        CONSTRAINT "PK_refresh_sessions_id" PRIMARY KEY ("refresh_session_id")
      )
    `);
    await queryRunner.query(
      `CREATE UNIQUE INDEX "UQ_refresh_sessions_jti" ON "refresh_sessions" ("jti")`,
    );
    await queryRunner.query(
      `ALTER TABLE "refresh_sessions" ADD CONSTRAINT "FK_refresh_sessions_user" FOREIGN KEY ("user_id") REFERENCES "users"("user_id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );

    await queryRunner.query(`
      CREATE TABLE "reset_otp" (
        "otp_id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "user_id" uuid NOT NULL,
        "purpose" character varying NOT NULL,
        "code_hash" character varying NOT NULL,
        "expires_at" TIMESTAMP WITH TIME ZONE NOT NULL,
        "used_at" TIMESTAMP WITH TIME ZONE,
        "attempts" integer NOT NULL DEFAULT 0,
        "resend_count" integer NOT NULL DEFAULT 0,
        "ip" character varying,
        "user_agent" character varying,
        "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        CONSTRAINT "PK_reset_otp_id" PRIMARY KEY ("otp_id")
      )
    `);
    await queryRunner.query(
      `ALTER TABLE "reset_otp" ADD CONSTRAINT "FK_reset_otp_user" FOREIGN KEY ("user_id") REFERENCES "users"("user_id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );

    await queryRunner.query(`
      CREATE TABLE "contents" (
        "content_id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "key" character varying NOT NULL,
        "data" jsonb NOT NULL,
        "updated_by" uuid,
        "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "deleted_at" TIMESTAMP WITH TIME ZONE,
        CONSTRAINT "PK_contents_id" PRIMARY KEY ("content_id"),
        CONSTRAINT "UQ_contents_key" UNIQUE ("key")
      )
    `);
    await queryRunner.query(
      `ALTER TABLE "contents" ADD CONSTRAINT "FK_contents_updated_by" FOREIGN KEY ("updated_by") REFERENCES "users"("user_id") ON DELETE SET NULL ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX "UQ_refresh_sessions_jti"`);
    await queryRunner.query(`ALTER TABLE "contents" DROP CONSTRAINT "FK_contents_updated_by"`);
    await queryRunner.query(`DROP TABLE "contents"`);

    await queryRunner.query(`ALTER TABLE "reset_otp" DROP CONSTRAINT "FK_reset_otp_user"`);
    await queryRunner.query(`DROP TABLE "reset_otp"`);

    await queryRunner.query(`ALTER TABLE "refresh_sessions" DROP CONSTRAINT "FK_refresh_sessions_user"`);
    await queryRunner.query(`DROP TABLE "refresh_sessions"`);
  }
}
