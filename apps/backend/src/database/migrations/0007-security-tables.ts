import { MigrationInterface, QueryRunner } from 'typeorm';

export class SecurityTables1700000000007 implements MigrationInterface {
  name = 'SecurityTables1700000000007';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TYPE "public"."account_invites_purpose_enum" AS ENUM('SET_PASSWORD','ACTIVE')`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."account_invites_channel_enum" AS ENUM('EMAIL','WHATSAPP','SMS')`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."audit_logs_status_enum" AS ENUM('SUCCESS','FAILED')`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."audit_logs_action_enum" AS ENUM(
        'AUTH_LOGIN_SUCCESS','AUTH_LOGIN_FAILED','AUTH_LOGOUT','AUTH_LOGOUT_ALL','AUTH_REFRESH_TOKEN','AUTH_TOKEN_REVOKED',
        'AUTH_PASSWORD_RESET_REQUEST','AUTH_PASSWORD_RESET_VERIFY','AUTH_PASSWORD_RESET_COMPLETE',
        'AUTH_ACCOUNT_INVITE_CREATED','AUTH_ACCOUNT_INVITE_SENT','AUTH_ACCOUNT_INVITE_USED','AUTH_ACCOUNT_INVITE_EXPIRED',
        'AUTH_ACCOUNT_ACTIVATED','AUTH_ACCOUNT_DEACTIVATED',
        'USER_CREATED','USER_UPDATED','USER_DELETED','USER_STATUS_UPDATED','USER_ROLE_UPDATED','USER_PASSWORD_CHANGED',
        'USER_PROFILE_UPDATED','USER_PHONE_UPDATED','USER_EMAIL_UPDATED','USER_AVATAR_UPDATED','USER_LOGIN_DISABLED','USER_LOGIN_ENABLED',
        'ORG_CREATED','ORG_UPDATED','ORG_DELETED','ORG_STATUS_UPDATED','ORG_PARENT_CHANGED','ORG_TYPE_CHANGED',
        'ORG_MEMBER_ADDED','ORG_MEMBER_UPDATED','ORG_MEMBER_REMOVED','ORG_MEMBER_ROLE_CHANGED','ORG_MEMBER_STATUS_CHANGED',
        'DEVICE_CREATED','DEVICE_UPDATED','DEVICE_DELETED','DEVICE_STATUS_UPDATED','DEVICE_ASSIGNED','DEVICE_UNASSIGNED',
        'DEVICE_PROVISIONED','DEVICE_UNPROVISIONED','DEVICE_TRANSFERRED',
        'DEVICE_REQUEST_CREATED','DEVICE_REQUEST_UPDATED','DEVICE_REQUEST_APPROVED','DEVICE_REQUEST_REJECTED',
        'DEVICE_REQUEST_CANCELLED','DEVICE_REQUEST_DELETED',
        'ADDRESS_CREATED','ADDRESS_UPDATED','ADDRESS_DELETED','LOCATION_CREATED','LOCATION_UPDATED','LOCATION_DELETED',
        'TELEMETRY_INGEST_SUCCESS','TELEMETRY_INGEST_FAILED','TELEMETRY_EXPORT','TELEMETRY_DELETED',
        'COST_CREATED','COST_UPDATED','COST_DELETED','COST_HISTORY_CREATED','COST_HISTORY_UPDATED','COST_HISTORY_DELETED',
        'CONTENT_CREATED','CONTENT_UPDATED','CONTENT_DELETED','CONTENT_PUBLISHED','CONTENT_UNPUBLISHED',
        'FILE_UPLOADED','FILE_DELETED','FILE_REPLACED',
        'REPORT_GENERATED','REPORT_EXPORTED','REPORT_DELETED',
        'SYSTEM_CONFIG_UPDATED','SYSTEM_MAINTENANCE_MODE_ON','SYSTEM_MAINTENANCE_MODE_OFF',
        'DATA_BACKUP_CREATED','DATA_RESTORE_EXECUTED','DATA_MIGRATION_RUN'
      )`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."audit_logs_target_type_enum" AS ENUM(
        'USER','ORGANIZATION','ORGANIZATION_MEMBER','DEVICE','DEVICE_REQUEST','LOCATION','ADDRESS','TELEMETRY_READING',
        'COST','COST_HISTORY','CONTENT','REFRESH_SESSION','RESET_OTP','ACCOUNT_INVITE','AUDIT_LOG',
        'SYSTEM_CONFIG','FILE_UPLOAD','REPORT','EXPORT','IMPORT'
      )`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."session_event_event_enum" AS ENUM('ISSUED','REFRESHED','REVOKED','REPLACED')`,
    );

    await queryRunner.query(`
      CREATE TABLE "account_invites" (
        "invite_id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "user_id" uuid NOT NULL,
        "created_by_user_id" uuid NOT NULL,
        "org_id" uuid,
        "purpose" "public"."account_invites_purpose_enum" NOT NULL,
        "token_hash" character varying NOT NULL,
        "expires_at" timestamptz NOT NULL DEFAULT now(),
        "used_at" timestamptz,
        "attempts" integer NOT NULL DEFAULT 0,
        "channel" "public"."account_invites_channel_enum" NOT NULL,
        "sent_to" character varying NOT NULL,
        "ip" character varying,
        "user_agent" character varying,
        "created_at" timestamptz NOT NULL DEFAULT now(),
        CONSTRAINT "PK_account_invites_id" PRIMARY KEY ("invite_id")
      )
    `);
    await queryRunner.query(
      `CREATE UNIQUE INDEX "UQ_account_invites_token_hash" ON "account_invites" ("token_hash")`,
    );
    await queryRunner.query(`
      ALTER TABLE "account_invites"
      ADD CONSTRAINT "FK_account_invites_user" FOREIGN KEY ("user_id") REFERENCES "users"("user_id") ON DELETE CASCADE ON UPDATE NO ACTION
    `);
    await queryRunner.query(`
      ALTER TABLE "account_invites"
      ADD CONSTRAINT "FK_account_invites_created_by" FOREIGN KEY ("created_by_user_id") REFERENCES "users"("user_id") ON DELETE CASCADE ON UPDATE NO ACTION
    `);
    await queryRunner.query(`
      ALTER TABLE "account_invites"
      ADD CONSTRAINT "FK_account_invites_org" FOREIGN KEY ("org_id") REFERENCES "organizations"("org_id") ON DELETE SET NULL ON UPDATE NO ACTION
    `);

    await queryRunner.query(`
      CREATE TABLE "audit_logs" (
        "audit_id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "actor_user_id" uuid NOT NULL,
        "actor_org_id" uuid,
        "action" "public"."audit_logs_action_enum" NOT NULL,
        "target_type" "public"."audit_logs_target_type_enum" NOT NULL,
        "target_id" uuid,
        "status" "public"."audit_logs_status_enum" NOT NULL,
        "ip" character varying,
        "user_agent" character varying,
        "metadata" jsonb,
        "created_at" timestamptz NOT NULL DEFAULT now(),
        CONSTRAINT "PK_audit_logs_id" PRIMARY KEY ("audit_id")
      )
    `);
    await queryRunner.query(
      `CREATE INDEX "IDX_audit_logs_created_at" ON "audit_logs" ("created_at")`,
    );
    await queryRunner.query(`
      ALTER TABLE "audit_logs"
      ADD CONSTRAINT "FK_audit_logs_actor_user" FOREIGN KEY ("actor_user_id") REFERENCES "users"("user_id") ON DELETE SET NULL ON UPDATE NO ACTION
    `);
    await queryRunner.query(`
      ALTER TABLE "audit_logs"
      ADD CONSTRAINT "FK_audit_logs_actor_org" FOREIGN KEY ("actor_org_id") REFERENCES "organizations"("org_id") ON DELETE SET NULL ON UPDATE NO ACTION
    `);

    await queryRunner.query(`
      CREATE TABLE "login_attempts" (
        "attempt_id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "user_id" uuid,
        "identifier" character varying NOT NULL,
        "success" boolean NOT NULL,
        "ip" character varying,
        "user_agent" character varying,
        "created_at" timestamptz NOT NULL DEFAULT now(),
        CONSTRAINT "PK_login_attempts_id" PRIMARY KEY ("attempt_id")
      )
    `);
    await queryRunner.query(
      `CREATE INDEX "IDX_login_attempts_created_at" ON "login_attempts" ("created_at")`,
    );
    await queryRunner.query(`
      ALTER TABLE "login_attempts"
      ADD CONSTRAINT "FK_login_attempts_user" FOREIGN KEY ("user_id") REFERENCES "users"("user_id") ON DELETE SET NULL ON UPDATE NO ACTION
    `);

    await queryRunner.query(`
      CREATE TABLE "session_event" (
        "event_id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "refresh_session_id" uuid NOT NULL,
        "user_id" uuid NOT NULL,
        "event" "public"."session_event_event_enum" NOT NULL,
        "ip" character varying,
        "user_agent" character varying,
        "created_at" timestamptz NOT NULL DEFAULT now(),
        CONSTRAINT "PK_session_event_id" PRIMARY KEY ("event_id")
      )
    `);
    await queryRunner.query(
      `CREATE INDEX "IDX_session_event_created_at" ON "session_event" ("created_at")`,
    );
    await queryRunner.query(`
      ALTER TABLE "session_event"
      ADD CONSTRAINT "FK_session_event_refresh_session" FOREIGN KEY ("refresh_session_id") REFERENCES "refresh_sessions"("refresh_session_id") ON DELETE CASCADE ON UPDATE NO ACTION
    `);
    await queryRunner.query(`
      ALTER TABLE "session_event"
      ADD CONSTRAINT "FK_session_event_user" FOREIGN KEY ("user_id") REFERENCES "users"("user_id") ON DELETE SET NULL ON UPDATE NO ACTION
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "session_event" DROP CONSTRAINT "FK_session_event_user"`);
    await queryRunner.query(
      `ALTER TABLE "session_event" DROP CONSTRAINT "FK_session_event_refresh_session"`,
    );
    await queryRunner.query(`DROP INDEX "IDX_session_event_created_at"`);
    await queryRunner.query(`DROP TABLE "session_event"`);
    await queryRunner.query(`DROP TYPE "public"."session_event_event_enum"`);

    await queryRunner.query(
      `ALTER TABLE "login_attempts" DROP CONSTRAINT "FK_login_attempts_user"`,
    );
    await queryRunner.query(`DROP INDEX "IDX_login_attempts_created_at"`);
    await queryRunner.query(`DROP TABLE "login_attempts"`);

    await queryRunner.query(`ALTER TABLE "audit_logs" DROP CONSTRAINT "FK_audit_logs_actor_org"`);
    await queryRunner.query(`ALTER TABLE "audit_logs" DROP CONSTRAINT "FK_audit_logs_actor_user"`);
    await queryRunner.query(`DROP INDEX "IDX_audit_logs_created_at"`);
    await queryRunner.query(`DROP TABLE "audit_logs"`);
    await queryRunner.query(`DROP TYPE "public"."audit_logs_target_type_enum"`);
    await queryRunner.query(`DROP TYPE "public"."audit_logs_action_enum"`);
    await queryRunner.query(`DROP TYPE "public"."audit_logs_status_enum"`);

    await queryRunner.query(
      `ALTER TABLE "account_invites" DROP CONSTRAINT "FK_account_invites_org"`,
    );
    await queryRunner.query(
      `ALTER TABLE "account_invites" DROP CONSTRAINT "FK_account_invites_created_by"`,
    );
    await queryRunner.query(
      `ALTER TABLE "account_invites" DROP CONSTRAINT "FK_account_invites_user"`,
    );
    await queryRunner.query(`DROP INDEX "UQ_account_invites_token_hash"`);
    await queryRunner.query(`DROP TABLE "account_invites"`);
    await queryRunner.query(`DROP TYPE "public"."account_invites_channel_enum"`);
    await queryRunner.query(`DROP TYPE "public"."account_invites_purpose_enum"`);
  }
}
