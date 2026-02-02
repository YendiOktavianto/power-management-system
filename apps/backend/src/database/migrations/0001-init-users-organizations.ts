import { MigrationInterface, QueryRunner } from 'typeorm';

export class InitUsersOrganizations0001 implements MigrationInterface {
  name = '0001-init-users-organizations';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`);

    await queryRunner.query(
      `CREATE TYPE "public"."users_role_global_enum" AS ENUM('ADMIN', 'USER')`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."users_status_enum" AS ENUM('ACTIVE', 'INACTIVE')`,
    );
    await queryRunner.query(`
      CREATE TABLE "users" (
        "user_id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "username" character varying NOT NULL,
        "email" character varying NOT NULL,
        "phone_number" character varying,
        "password_hash" character varying NOT NULL,
        "role_global" "public"."users_role_global_enum" NOT NULL,
        "profil_img" character varying,
        "status" "public"."users_status_enum" NOT NULL DEFAULT 'ACTIVE',
        "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "deleted_at" TIMESTAMP WITH TIME ZONE,
        CONSTRAINT "PK_users_user_id" PRIMARY KEY ("user_id"),
        CONSTRAINT "UQ_users_username" UNIQUE ("username"),
        CONSTRAINT "UQ_users_email" UNIQUE ("email")
      )
    `);

    await queryRunner.query(
      `CREATE TYPE "public"."organizations_type_enum" AS ENUM('OWNER', 'PRINCIPAL', 'COMPANY', 'CUSTOMER')`,
    );
    await queryRunner.query(`
      CREATE TABLE "organizations" (
        "org_id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "name" character varying NOT NULL,
        "type" "public"."organizations_type_enum" NOT NULL,
        "parent_id" uuid,
        "is_active" boolean NOT NULL DEFAULT true,
        "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "deleted_at" TIMESTAMP WITH TIME ZONE,
        CONSTRAINT "PK_organizations_org_id" PRIMARY KEY ("org_id")
      )
    `);
    await queryRunner.query(
      `ALTER TABLE "organizations" ADD CONSTRAINT "FK_organizations_parent" FOREIGN KEY ("parent_id") REFERENCES "organizations"("org_id") ON DELETE SET NULL ON UPDATE NO ACTION`,
    );

    await queryRunner.query(
      `CREATE TYPE "public"."organization_members_role_enum" AS ENUM('OWNER', 'PRINCIPAL', 'COMPANY', 'CUSTOMER')`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."organization_members_status_enum" AS ENUM('ACTIVE', 'INACTIVE')`,
    );
    await queryRunner.query(`
      CREATE TABLE "organization_members" (
        "org_member_id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "org_id" uuid NOT NULL,
        "user_id" uuid NOT NULL,
        "role_in_org" "public"."organization_members_role_enum" NOT NULL,
        "status" "public"."organization_members_status_enum" NOT NULL DEFAULT 'ACTIVE',
        "joined_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "deleted_at" TIMESTAMP WITH TIME ZONE,
        CONSTRAINT "PK_org_members_id" PRIMARY KEY ("org_member_id"),
        CONSTRAINT "UQ_org_member_org_user" UNIQUE ("org_id", "user_id")
      )
    `);
    await queryRunner.query(
      `ALTER TABLE "organization_members" ADD CONSTRAINT "FK_org_members_org" FOREIGN KEY ("org_id") REFERENCES "organizations"("org_id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "organization_members" ADD CONSTRAINT "FK_org_members_user" FOREIGN KEY ("user_id") REFERENCES "users"("user_id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "organization_members" DROP CONSTRAINT "FK_org_members_user"`);
    await queryRunner.query(`ALTER TABLE "organization_members" DROP CONSTRAINT "FK_org_members_org"`);
    await queryRunner.query(`DROP TABLE "organization_members"`);
    await queryRunner.query(`DROP TYPE "public"."organization_members_status_enum"`);
    await queryRunner.query(`DROP TYPE "public"."organization_members_role_enum"`);

    await queryRunner.query(`ALTER TABLE "organizations" DROP CONSTRAINT "FK_organizations_parent"`);
    await queryRunner.query(`DROP TABLE "organizations"`);
    await queryRunner.query(`DROP TYPE "public"."organizations_type_enum"`);

    await queryRunner.query(`DROP TABLE "users"`);
    await queryRunner.query(`DROP TYPE "public"."users_status_enum"`);
    await queryRunner.query(`DROP TYPE "public"."users_role_global_enum"`);
  }
}
