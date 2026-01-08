import { DataSource } from 'typeorm';
import dataSource from '../ormconfig'; // sesuaikan path DataSource kamu

async function main() {
  const ds: DataSource = await dataSource.initialize();
  await ds.query(`
    DO $$
    BEGIN
      IF NOT EXISTS (
        SELECT 1 FROM pg_indexes
        WHERE schemaname = 'public' AND indexname = 'uq_cost_group_limit'
      ) THEN
        CREATE UNIQUE INDEX uq_cost_group_limit ON cost (tariff_group, power_limit);
      END IF;
    END$$;

    WITH seed_cost (tariff_group, power_limit) AS (
      VALUES
        ('R-1/TR','900 VA'),
        ('R-1/TR','1300 VA'),
        ('R-1/TR','2200 VA'),
        ('R-2/TR','3500-5500 VA'),
        ('R-3/TR','>6600 VA')
    ),
    upsert_cost AS (
      INSERT INTO cost (tariff_group, power_limit)
      SELECT (s.tariff_group)::gol_tarif_enum, s.power_limit
      FROM seed_cost s
      ON CONFLICT (tariff_group, power_limit) DO NOTHING
      RETURNING cost_id, tariff_group, power_limit
    ),
    all_cost AS (
      SELECT c.cost_id, c.tariff_group::text AS tariff_group, c.power_limit
      FROM cost c
      JOIN seed_cost s
        ON s.tariff_group = c.tariff_group::text
       AND s.power_limit  = c.power_limit
    ),
    history_seed (tariff_group, power_limit, cost_value, valid_from, valid_to) AS (
      VALUES
        ('R-1/TR','900 VA',       1352.00, DATE '2025-11-06', DATE '2025-11-25'),
        ('R-1/TR','1300 VA',      1444.70, DATE '2025-11-06', DATE '2025-11-30'),
        ('R-1/TR','2200 VA',      1444.70, DATE '2025-11-06', DATE '2025-11-24'),
        ('R-2/TR','3500-5500 VA', 1699.53, DATE '2025-11-06', DATE '2025-12-01')
    )
    INSERT INTO cost_history (cost_id, cost_value, valid_from, valid_to, created_at)
    SELECT ac.cost_id, hs.cost_value, hs.valid_from, hs.valid_to, now()
    FROM all_cost ac
    JOIN history_seed hs
      ON hs.tariff_group = ac.tariff_group
     AND hs.power_limit  = ac.power_limit
    WHERE NOT EXISTS (
      SELECT 1 FROM cost_history ch
      WHERE ch.cost_id = ac.cost_id
        AND ch.valid_from = hs.valid_from
        AND ch.valid_to = hs.valid_to
    );
  `);
  await ds.destroy();
  console.log('✅ Seed cost & cost_history done');
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
