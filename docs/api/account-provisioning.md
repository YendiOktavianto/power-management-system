# Account Provisioning (Admin/Owner/Company)

Dokumen ini menjadi acuan implementasi fitur "registrasi akun" versi provisioning
(bukan self-register). Skema mengikuti keputusan terakhir:
- Admin/Owner membuat Principal dan Company.
- Company membuat Customer.
- Password tidak di-set oleh pembuat akun, melainkan lewat invite token (set password).

---

## 1) Scope dan Default Status

### Siapa membuat siapa
- Admin/Owner -> membuat Principal dan Company.
- Company -> membuat Customer.
- Tidak ada self-register untuk role tinggi.

### Default status yang disarankan
Karena memakai invite token, akses login user ditahan sampai password dibuat.
Dengan schema yang ada (status ACTIVE/INACTIVE):

Saat create akun:
- users.status = INACTIVE
- organization_members.status = INACTIVE
- organizations.is_active = true (org sudah valid, hanya user belum aktif)

Saat invite digunakan (set password):
- users.status -> ACTIVE
- organization_members.status -> ACTIVE

Catatan:
- Jika ingin menahan seluruh org sampai user aktif, set organizations.is_active=false
  lalu aktifkan pada saat invite dipakai. Ini opsional.
- account_invites.purpose gunakan SET_PASSWORD agar jelas tujuannya.

---

## 2) API Contract (Usulan Endpoint)

### Opsi A - Endpoint terpisah per role
Lebih eksplisit, tetapi endpoint lebih banyak.

Create Principal (Admin/Owner)
```
POST /provisioning/principals
```
Request:
```json
{
  "email": "principal@corp.com",
  "username": "principal01",
  "phoneNumber": "+62xxxx",
  "orgName": "Principal A",
  "parentOrgId": "owner_org_id"
}
```

Create Company (Admin/Owner)
```
POST /provisioning/companies
```
Request:
```json
{
  "email": "company@corp.com",
  "username": "company01",
  "phoneNumber": "+62xxxx",
  "orgName": "Company A",
  "parentOrgId": "principal_org_id"
}
```

Create Customer (Company)
```
POST /provisioning/customers
```
Request:
```json
{
  "email": "customer@corp.com",
  "username": "customer01",
  "phoneNumber": "+62xxxx",
  "orgName": "Customer A",
  "parentOrgId": "company_org_id"
}
```

Response (umum):
```json
{
  "userId": "uuid",
  "orgId": "uuid",
  "roleInOrg": "PRINCIPAL|COMPANY|CUSTOMER",
  "status": "INACTIVE",
  "inviteSentTo": "email/phone"
}
```

Catatan UI:
- UI Admin/Owner memanggil /provisioning/principals dan /provisioning/companies.
- UI Company memanggil /provisioning/customers.

---

### Opsi B - Endpoint tunggal (lebih ringkas)
Semua role memakai satu endpoint dan divalidasi di backend.

```
POST /provisioning/users
```
Request:
```json
{
  "email": "user@corp.com",
  "username": "user01",
  "phoneNumber": "+62xxxx",
  "orgName": "Org Name",
  "orgType": "PRINCIPAL|COMPANY|CUSTOMER",
  "parentOrgId": "uuid"
}
```

Response:
```json
{
  "userId": "uuid",
  "orgId": "uuid",
  "roleInOrg": "PRINCIPAL|COMPANY|CUSTOMER",
  "status": "INACTIVE",
  "inviteSentTo": "email/phone"
}
```

---

## 3) Error Codes yang Umum

- 400 Bad Request -> payload tidak valid, missing field.
- 401 Unauthorized -> tidak login.
- 403 Forbidden -> role tidak berhak membuat target role.
- 409 Conflict -> email/username/phone sudah dipakai.
- 422 Unprocessable Entity -> parent_org_id tidak valid / tidak sesuai scope.
- 500 Internal Server Error -> kesalahan server.

---

## 4) Flow DB (Ringkas)

Dalam satu transaction:
1) Insert users (INACTIVE).
2) Insert organizations (type sesuai role, is_active true).
3) Insert organization_members (role_in_org + INACTIVE).
4) Insert account_invites + kirim token.
5) Insert audit_logs.
