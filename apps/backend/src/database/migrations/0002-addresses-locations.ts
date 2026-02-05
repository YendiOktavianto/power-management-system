import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddressesLocations0002 implements MigrationInterface {
  name = '0002-addresses-locations';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE "addresses" (
        "address_id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "address_name" character varying NOT NULL,
        "longitude" double precision NOT NULL,
        "latitude" double precision NOT NULL,
        "city" character varying,
        "district" character varying,
        "subdistrict" character varying,
        "postal_code" character varying,
        "is_active" boolean NOT NULL DEFAULT true,
        "created_at" timestamptz NOT NULL DEFAULT now(),
        "updated_at" timestamptz NOT NULL DEFAULT now(),
        "deleted_at" timestamptz,
        CONSTRAINT "PK_addresses_address_id" PRIMARY KEY ("address_id")
      )
    `);

    await queryRunner.query(`
      CREATE TABLE "locations" (
        "location_id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "address_id" uuid NOT NULL,
        "location_label" character varying NOT NULL,
        "detail_address" character varying,
        "segment" character varying,
        "is_active" boolean NOT NULL DEFAULT true,
        "created_at" timestamptz NOT NULL DEFAULT now(),
        "updated_at" timestamptz NOT NULL DEFAULT now(),
        "deleted_at" timestamptz,
        CONSTRAINT "PK_locations_location_id" PRIMARY KEY ("location_id")
      )
    `);
    await queryRunner.query(`
      ALTER TABLE "locations"
      ADD CONSTRAINT "FK_locations_address" FOREIGN KEY ("address_id") REFERENCES "addresses"("address_id") ON DELETE RESTRICT ON UPDATE NO ACTION
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "locations" DROP CONSTRAINT "FK_locations_address"`);
    await queryRunner.query(`DROP TABLE "locations"`);
    await queryRunner.query(`DROP TABLE "addresses"`);
  }
}
