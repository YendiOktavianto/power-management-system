# Account Provisioning API Testing

Dokumen ini khusus untuk pengujian endpoint provisioning:
- `POST /provisioning/principals`
- `POST /provisioning/companies`
- `POST /provisioning/customers`

Tujuan pengujian:
- Memastikan policy role berjalan benar (siapa boleh create siapa).
- Memastikan validasi request konsisten.
- Memastikan status default dan insert ke tabel terkait sesuai desain.
- Memastikan response contract stabil untuk FE/Postman.

---

## 1) Prasyarat Test

- Backend sudah running.
- Migration sudah jalan sampai `0007-security-tables`.
- Data master sudah tersedia:
  - 1 user ADMIN aktif.
  - 1 user OWNER aktif dan menjadi member OWNER.
  - 1 org OWNER.
  - 1 org PRINCIPAL (untuk create company).
  - 1 org COMPANY (untuk create customer).
  - 1 user COMPANY aktif yang menjadi member di org COMPANY tersebut.
- Optional:
  - Set `INVITE_DEBUG=true` untuk menampilkan `inviteToken` pada response sukses.

---

## 2) Environment Variables Postman

- `base_url` -> contoh `http://localhost:4000`
- `admin_user_id`
- `owner_user_id`
- `company_user_id`
- `owner_org_id`
- `principal_org_id`
- `company_org_id`
- `unknown_user_id` -> UUID random yang tidak ada di DB
- `unknown_org_id` -> UUID random yang tidak ada di DB

---

## 3) Template Request

Header wajib:
- `Content-Type: application/json`
- `x-actor-user-id: <uuid>`

Header opsional:
- `x-actor-org-id: <uuid>`

Body template:
```json
{
  "email": "user+{{timestamp}}@mail.test",
  "username": "user_{{timestamp}}",
  "phoneNumber": "+628123456789",
  "orgName": "Org {{timestamp}}",
  "parentOrgId": "{{some_org_id}}"
}
```

---

## 4) Validasi Field (DTO)

Mengacu ke `ProvisioningBaseDto`:
- `email`: wajib, format email valid.
- `username`: wajib, panjang 3-60.
- `phoneNumber`: optional, jika ada panjang 6-20.
- `orgName`: wajib, panjang 2-120.
- `parentOrgId`: wajib, UUID valid.

Expected error validasi NestJS:
- HTTP `400`
- Bentuk umum response:
```json
{
  "statusCode": 400,
  "message": [
    "..."
  ],
  "error": "Bad Request"
}
```

---

## 5) Expected Response Sukses

HTTP `201`, body minimal:
```json
{
  "userId": "uuid",
  "orgId": "uuid",
  "roleInOrg": "PRINCIPAL|COMPANY|CUSTOMER",
  "status": "INACTIVE",
  "inviteSentTo": "email"
}
```

Jika `INVITE_DEBUG=true`, response juga berisi:
- `inviteToken`

---

## 6) Query Validasi DB (Setelah Sukses)

Gunakan nilai `userId` dan `orgId` dari response:

```sql
-- users
select user_id, email, username, status, role_global
from users
where user_id = '<userId>';

-- organizations
select org_id, name, type, parent_id, is_active
from organizations
where org_id = '<orgId>';

-- organization_members
select org_member_id, org_id, user_id, role_in_org, status
from organization_members
where org_id = '<orgId>' and user_id = '<userId>';

-- account_invites
select invite_id, user_id, created_by_user_id, org_id, purpose, sent_to, expires_at, used_at
from account_invites
where user_id = '<userId>'
order by created_at desc
limit 1;

-- audit_logs
select audit_id, actor_user_id, actor_org_id, action, target_type, target_id, status
from audit_logs
where action = 'AUTH_ACCOUNT_INVITE_CREATED'
  and target_type = 'ACCOUNT_INVITE'
order by created_at desc
limit 1;
```

Validasi kunci:
- `users.status = INACTIVE`
- `organization_members.status = INACTIVE`
- `account_invites.purpose = SET_PASSWORD`
- `organizations.type` sesuai endpoint
- `audit_logs.action = AUTH_ACCOUNT_INVITE_CREATED`

---

## 7) Test Matrix (Sukses + Gagal)

Isi kolom `Result` dengan `DONE` / `NOT DONE` / `FAILED`.

| ID | Endpoint | Skenario | Setup / Input | Expected |
|---|---|---|---|---|
| TC-PR-001 | `/provisioning/principals` | Sukses via ADMIN | `x-actor-user-id={{admin_user_id}}`, `parentOrgId={{owner_org_id}}` | `201`, `roleInOrg=PRINCIPAL`, status `INACTIVE`, 5 tabel terisi |
| TC-PR-002 | `/provisioning/principals` | Sukses via OWNER | `x-actor-user-id={{owner_user_id}}`, `parentOrgId={{owner_org_id}}` | `201`, hasil sama seperti TC-PR-001 |
| TC-PR-003 | `/provisioning/principals` | Forbidden role | actor user biasa / company | `403` |
| TC-PR-004 | `/provisioning/principals` | Parent org tidak ada | `parentOrgId={{unknown_org_id}}` | `422`, `parentOrgId not found.` |
| TC-PR-005 | `/provisioning/principals` | Parent type salah | `parentOrgId={{principal_org_id}}` | `422`, `parentOrgId must be OWNER.` |
| TC-CO-001 | `/provisioning/companies` | Sukses via ADMIN | actor admin, parent principal | `201`, `roleInOrg=COMPANY`, status `INACTIVE` |
| TC-CO-002 | `/provisioning/companies` | Sukses via OWNER | actor owner, parent principal | `201` |
| TC-CO-003 | `/provisioning/companies` | Forbidden role | actor company / user biasa | `403` |
| TC-CO-004 | `/provisioning/companies` | Parent org tidak ada | `parentOrgId={{unknown_org_id}}` | `422` |
| TC-CO-005 | `/provisioning/companies` | Parent type salah | `parentOrgId={{owner_org_id}}` atau company org | `422`, `must be PRINCIPAL` |
| TC-CU-001 | `/provisioning/customers` | Sukses via COMPANY member | actor company member, parent company org yang sama | `201`, `roleInOrg=CUSTOMER`, status `INACTIVE` |
| TC-CU-002 | `/provisioning/customers` | Forbidden non-company | actor admin/owner/user biasa | `403` |
| TC-CU-003 | `/provisioning/customers` | Company actor tapi bukan member org tersebut | actor company lain | `403` |
| TC-CU-004 | `/provisioning/customers` | Parent org tidak ada | unknown org | `422` |
| TC-CU-005 | `/provisioning/customers` | Parent type salah | parent principal/owner | `422`, `must be COMPANY` |
| TC-CM-001 | semua endpoint | Missing `x-actor-user-id` | header tidak dikirim | `400`, `Missing x-actor-user-id header.` |
| TC-CM-002 | semua endpoint | Actor user tidak ditemukan | `x-actor-user-id={{unknown_user_id}}` | `400`, `Actor user not found.` (khusus principal/company flow) |
| TC-CM-003 | semua endpoint | Duplicate email | pakai email existing | `409`, `Email/username/phone already in use.` |
| TC-CM-004 | semua endpoint | Duplicate username | pakai username existing | `409` |
| TC-CM-005 | semua endpoint | Duplicate phone | pakai phone existing | `409` (jika field phone dikirim) |
| TC-VD-001 | semua endpoint | Email invalid | `email: "abc"` | `400` |
| TC-VD-002 | semua endpoint | Username < 3 | `username: "ab"` | `400` |
| TC-VD-003 | semua endpoint | phoneNumber < 6 | `phoneNumber: "12345"` | `400` |
| TC-VD-004 | semua endpoint | orgName kosong | `orgName: ""` | `400` |
| TC-VD-005 | semua endpoint | parentOrgId bukan UUID | `parentOrgId: "abc"` | `400` |
| TC-RS-001 | semua endpoint | `INVITE_DEBUG=true` | sukses case mana saja | response mengandung `inviteToken` |
| TC-RS-002 | semua endpoint | `INVITE_DEBUG=false` | sukses case mana saja | response tidak mengandung `inviteToken` |

---

## 8) Sheet Hasil Uji (Isi Manual)

| ID | Tester | Date | Result (DONE/NOT DONE/FAILED) | Evidence (Postman/DB) | Note |
|---|---|---|---|---|---|
| TC-PR-001 |  |  |  |  |  |
| TC-PR-002 |  |  |  |  |  |
| TC-PR-003 |  |  |  |  |  |
| TC-PR-004 |  |  |  |  |  |
| TC-PR-005 |  |  |  |  |  |
| TC-CO-001 |  |  |  |  |  |
| TC-CO-002 |  |  |  |  |  |
| TC-CO-003 |  |  |  |  |  |
| TC-CO-004 |  |  |  |  |  |
| TC-CO-005 |  |  |  |  |  |
| TC-CU-001 |  |  |  |  |  |
| TC-CU-002 |  |  |  |  |  |
| TC-CU-003 |  |  |  |  |  |
| TC-CU-004 |  |  |  |  |  |
| TC-CU-005 |  |  |  |  |  |
| TC-CM-001 |  |  |  |  |  |
| TC-CM-002 |  |  |  |  |  |
| TC-CM-003 |  |  |  |  |  |
| TC-CM-004 |  |  |  |  |  |
| TC-CM-005 |  |  |  |  |  |
| TC-VD-001 |  |  |  |  |  |
| TC-VD-002 |  |  |  |  |  |
| TC-VD-003 |  |  |  |  |  |
| TC-VD-004 |  |  |  |  |  |
| TC-VD-005 |  |  |  |  |  |
| TC-RS-001 |  |  |  |  |  |
| TC-RS-002 |  |  |  |  |  |

---

## 9) Kriteria Lulus

- Semua test case role-policy utama lulus (`TC-PR-001..005`, `TC-CO-001..005`, `TC-CU-001..005`).
- Semua validation case lulus (`TC-CM-*`, `TC-VD-*`).
- Pada case sukses, semua data konsisten di 5 tabel dan status default sesuai desain (`INACTIVE`).
- Tidak ada insert parsial pada case gagal.
