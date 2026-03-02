# Postman Testing Master Plan

Dokumen ini adalah acuan utama untuk struktur folder dan request testing API backend di Postman.

Terakhir diperbarui: 2026-02-25

---

## 1) Tujuan

- Menjaga struktur koleksi Postman tetap konsisten.
- Memisahkan test case per fitur dan per role.
- Memudahkan update saat ada endpoint baru.
- Menjadi checklist regression cepat sebelum rilis.

---

## 2) Koleksi Utama

- Collection: `Backend - Power Management System`

Struktur folder saat ini:

```text
00 - Health & Setup
01 - Auth Provisioning (Role Creation)
02 - Auth Activation & Session
03 - Users
04 - Organizations
05 - Organization Members
06 - Device Requests
07 - Devices
08 - Telemetry
09 - Costs
10 - Contents
90 - Negative Cases (Cross Feature)
99 - Regression Smoke
```

Status isi saat ini:

- `00`: draft
- `01`: aktif, sudah terisi
- `02`: aktif, sudah terisi
- `03`-`10`: placeholder (siap diisi bertahap)
- `90`: placeholder
- `99`: placeholder

---

## 3) Konvensi Penamaan Request

Gunakan format berikut:

- Happy path: `HP - <Action>`
- Negative path: `NG - <Action>`

Contoh:

- `POST HP - Create Principal`
- `POST HP - Login (email/username/phone)`
- `POST NG - Refresh after logout`

Catatan:

- Prefix method HTTP tetap ditulis di nama request (`GET`, `POST`, dll) agar mudah scan.
- Satu request untuk satu skenario.

---

## 4) Environment Variables Standar

Minimal:

- `base_url`
- `admin_user_id`
- `owner_user_id`
- `owner_org_id`
- `principal_user_id`
- `principal_org_id`
- `company_user_id`
- `company_org_id`
- `customer_user_id`
- `customer_org_id`
- `admin_email`
- `admin_password`
- `principal_email`
- `principal_password`
- `access_token`
- `refresh_token`
- `refresh_token_old`

Opsional per role (disarankan agar sesi tidak saling timpa):

- `admin_access_token`, `admin_refresh_token`
- `owner_access_token`, `owner_refresh_token`
- `principal_access_token`, `principal_refresh_token`
- `company_access_token`, `company_refresh_token`
- `customer_access_token`, `customer_refresh_token`

---

## 5) Detail Folder 01

Folder: `01 - Auth Provisioning (Role Creation)`

Daftar request aktif:

- `POST HP - Create Principal`
- `POST HP - Create Company`
- `POST HP - Create Customer`
- `POST NG - Missing x-actor-user-id`
- `POST NG - Forbidden role`
- `POST NG - Invalid parentOrgId`
- `POST NG - Wrong parent type`
- `POST NG - Duplicate email/username/phone`

Format request provisioning:

- Method: `POST`
- Header wajib:
  - `Content-Type: application/json`
  - `x-actor-user-id: <uuid>`
- Header opsional:
  - `x-actor-org-id: <uuid>`
- Body:

```json
{
  "email": "user+{{timestamp}}@mail.test",
  "username": "user_{{timestamp}}",
  "phoneNumber": "081100000999",
  "orgName": "Org {{timestamp}}",
  "parentOrgId": "{{some_org_id}}"
}
```

Endpoint:

- `POST {{base_url}}/auth/provisioning/principals`
- `POST {{base_url}}/auth/provisioning/companies`
- `POST {{base_url}}/auth/provisioning/customers`

---

## 5A) Folder 01 per Role (Mapping Request)

Folder: `01 - Auth Provisioning (Role Creation)`

### Admin / Programmer

- `POST HP - Create Principal`
- `POST HP - Create Company`
- `POST NG - Missing x-actor-user-id`
- `POST NG - Invalid parentOrgId`
- `POST NG - Wrong parent type` 
- `POST NG - Duplicate email/username/phone`

### Owner

- `POST HP - Create Principal`
- `POST HP - Create Company`
- `POST NG - Missing x-actor-user-id`
- `POST NG - Invalid parentOrgId`
- `POST NG - Wrong parent type`
- `POST NG - Duplicate email/username/phone`

### Principal

- `POST NG - Forbidden role` (untuk aksi yang hanya boleh ADMIN/OWNER)

### Company

- `POST HP - Create Customer`
- `POST NG - Invalid parentOrgId`
- `POST NG - Wrong parent type`
- `POST NG - Duplicate email/username/phone`

### Customer

- `POST NG - Forbidden role`

Catatan Folder 01:

- Satu request di folder ini bisa dipakai lintas role dengan mengganti `x-actor-user-id` dan `x-actor-org-id`.
- Jika ingin audit lebih rapi per-role, duplikasi request dengan suffix role, misalnya:
  - `POST HP - Create Principal (Admin)`
  - `POST HP - Create Principal (Owner)`

---

## 6) Detail Folder 02

Folder: `02 - Auth Activation & Session`

Daftar request aktif:

- `POST HP - Set Password`
- `POST HP - Login (email/username/phone)`
- `POST HP - Login Principal`
- `POST HP - Refresh`
- `POST HP - Logout`
- `GET NG - Set Password invalid token`
- `GET NG - Set Password used token`
- `POST NG - Login wrong password`
- `POST NG - Login inactive account`
- `GET NG - Refresh invalid token`
- `POST NG - Refresh after logout`
- `POST NG - Idle timeout`

Endpoint utama:

- `POST {{base_url}}/auth/set-password`
- `POST {{base_url}}/auth/login`
- `POST {{base_url}}/auth/refresh`
- `POST {{base_url}}/auth/logout`

Contoh body:

Set Password:

```json
{
  "inviteToken": "{{principal_invite_token}}",
  "newPassword": "Principal#12345"
}
```

Login:

```json
{
  "identifier": "{{admin_email}}",
  "password": "{{admin_password}}"
}
```

Refresh:

```json
{
  "refreshToken": "{{refresh_token}}"
}
```

Logout:

```json
{
  "refreshToken": "{{refresh_token}}"
}
```

---

## 6A) Folder 02 per Role (Mapping Request)

Folder: `02 - Auth Activation & Session`

### Admin / Programmer

- `POST HP - Login (email/username/phone)`
- `POST HP - Refresh`
- `POST HP - Logout`
- `POST NG - Login wrong password`
- `POST NG - Login inactive account`
- `GET NG - Refresh invalid token`
- `POST NG - Refresh after logout`
- `POST NG - Idle timeout`

### Owner

- `POST HP - Login (email/username/phone)` (gunakan credential owner)
- `POST HP - Refresh`
- `POST HP - Logout`
- `POST NG - Login wrong password`
- `POST NG - Login inactive account`
- `GET NG - Refresh invalid token`
- `POST NG - Refresh after logout`
- `POST NG - Idle timeout`

### Principal

- `POST HP - Set Password`
- `POST HP - Login Principal`
- `POST HP - Refresh`
- `POST HP - Logout`
- `GET NG - Set Password invalid token`
- `GET NG - Set Password used token`
- `POST NG - Login wrong password`
- `POST NG - Login inactive account`
- `GET NG - Refresh invalid token`
- `POST NG - Refresh after logout`
- `POST NG - Idle timeout`

### Company

- `POST HP - Set Password`
- `POST HP - Login (email/username/phone)` (gunakan credential company)
- `POST HP - Refresh`
- `POST HP - Logout`
- `GET NG - Set Password invalid token`
- `GET NG - Set Password used token`
- `POST NG - Login wrong password`
- `POST NG - Login inactive account`
- `GET NG - Refresh invalid token`
- `POST NG - Refresh after logout`
- `POST NG - Idle timeout`

### Customer

- `POST HP - Set Password`
- `POST HP - Login (email/username/phone)` (gunakan credential customer)
- `POST HP - Refresh`
- `POST HP - Logout`
- `GET NG - Set Password invalid token`
- `GET NG - Set Password used token`
- `POST NG - Login wrong password`
- `POST NG - Login inactive account`
- `GET NG - Refresh invalid token`
- `POST NG - Refresh after logout`
- `POST NG - Idle timeout`

Catatan Folder 02:

- Saat ini nama request khusus role yang sudah ada: `POST HP - Login Principal`.
- Untuk menghindari token saling timpa antar role, disarankan tambah request terpisah:
  - `POST HP - Login Admin`
  - `POST HP - Login Owner`
  - `POST HP - Login Company`
  - `POST HP - Login Customer`
  - `POST HP - Refresh <Role>`
  - `POST HP - Logout <Role>`

---

## 7) Template Folder 03-10

Untuk setiap folder fitur (`03` sampai `10`) gunakan pola:

- `POST HP - Create <Entity>`
- `GET HP - List <Entity>`
- `GET HP - Detail <Entity>`
- `PATCH HP - Update <Entity>`
- `DELETE HP - Delete <Entity>`
- `POST/GET NG - Validation/Forbidden/Not found`

Tujuan per folder:

- `03 - Users`: manajemen profil dan status user.
- `04 - Organizations`: CRUD organisasi + hirarki.
- `05 - Organization Members`: membership dan role dalam org.
- `06 - Device Requests`: request assign/approval perangkat.
- `07 - Devices`: registry perangkat dan relasi owner/location.
- `08 - Telemetry`: ingest + query data telemetry.
- `09 - Costs`: setup tarif dan perhitungan biaya.
- `10 - Contents`: konten statis/informasi.

---

## 8) Folder 90 dan 99

`90 - Negative Cases (Cross Feature)`:

- Skenario lintas modul, misalnya token valid tapi akses org salah, atau urutan proses tidak valid.

`99 - Regression Smoke`:

- Ringkasan endpoint inti yang wajib lolos setelah ada perubahan:
  - login admin
  - refresh token
  - logout
  - create principal
  - set password principal
  - login principal

---

## 9) Aturan Update Dokumentasi

Setiap ada request/folder baru di Postman:

1. Tambahkan nama request di section folder terkait.
2. Tambahkan env var baru jika dibutuhkan.
3. Update section `99 - Regression Smoke` jika endpoint termasuk critical path.
4. Ubah tanggal `Terakhir diperbarui`.

Jika endpoint belum siap di backend:

- Tetap boleh buat request placeholder di Postman.
- Tandai status request di deskripsi: `DRAFT - endpoint belum implement`.
