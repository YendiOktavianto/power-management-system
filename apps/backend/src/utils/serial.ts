// apps/backend/src/utils/serial.ts
import { EntityManager } from 'typeorm';

type MaxRow = { max: unknown };
function isMaxRowArray(v: unknown): v is MaxRow[] {
  return Array.isArray(v) && (v.length === 0 || 'max' in (v[0] as object));
}

export async function nextSerialNumber(manager: EntityManager): Promise<string> {
  const sql = `
    SELECT COALESCE(MAX(CAST(SUBSTRING(serial_number FROM '\\d+$') AS INTEGER)), 0) AS max
    FROM general_info
  `;

  const rowsUnknown: unknown = await manager.query(sql);

  if (!isMaxRowArray(rowsUnknown)) {
    // bentuk hasil tak terduga → anggap 0
    const next = 1;
    return `ETS - ${String(next).padStart(3, '0')}`;
  }

  const raw = rowsUnknown[0]?.max;
  const maxNum =
    typeof raw === 'number' ? raw : typeof raw === 'string' ? Number.parseInt(raw, 10) || 0 : 0;

  const next = maxNum + 1;
  return `ETS - ${String(next).padStart(3, '0')}`;
}
