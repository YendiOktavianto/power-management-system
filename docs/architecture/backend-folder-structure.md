# Backend Folder Structure (Detailed)

Dokumen ini menjelaskan struktur folder backend yang direkomendasikan untuk project
Power Management System (NestJS + TypeORM) beserta alasan dan kegunaan tiap folder.
Tujuan utamanya: membuat codebase lebih rapi, mudah dipelihara, mudah di-scale,
dan memudahkan onboarding tim baru.

---

## Prinsip Umum

1. **Pisahkan domain (fitur bisnis) dari infrastruktur.**
   - Domain seperti `users`, `devices`, `telemetry` ditempatkan di `modules/`.
   - Infrastruktur seperti DB config/migrations/seeds ditempatkan di `database/`.

2. **Satu folder = satu tanggung jawab.**
   - Kalau 1 folder isinya campur aduk, makin sulit dirawat.

3. **Konfigurasi terpusat & tervalidasi.**
   - Semua env, config, dan validasi ditempatkan di `config/` agar konsisten.

4. **Komponen lintas fitur ditempatkan di `common/` atau `shared/`.**
   - `common/` = runtime helper (guard, interceptor, pipes).
   - `shared/` = tipe/enum yang dipakai lintas module.

---

## Struktur Rekomendasi

```
apps/backend/
  src/
    main.ts
    app.module.ts
    app.controller.ts
    app.service.ts

    config/
      configuration.ts
      env.schema.ts

    database/
      entities/
      migrations/
      seeds/
      ormconfig.ts
      database.module.ts

    common/
      constants/
      decorators/
      guards/
      interceptors/
      filters/
      pipes/
      utils/

    modules/
      auth/
        dto/
        auth.controller.ts
        auth.service.ts
        auth.module.ts
        strategies/
        guards/

      users/
        dto/
        users.controller.ts
        users.service.ts
        users.module.ts

      organizations/
        dto/
        organizations.controller.ts
        organizations.service.ts
        organizations.module.ts

      organization-members/
        dto/
        organization-members.controller.ts
        organization-members.service.ts
        organization-members.module.ts

      devices/
        dto/
        devices.controller.ts
        devices.service.ts
        devices.module.ts

      telemetry/
        dto/
        telemetry.controller.ts
        telemetry.service.ts
        telemetry.module.ts

      device-requests/
        dto/
        device-requests.controller.ts
        device-requests.service.ts
        device-requests.module.ts

      costs/
        dto/
        costs.controller.ts
        costs.service.ts
        costs.module.ts

      contents/
        dto/
        contents.controller.ts
        contents.service.ts
        contents.module.ts

    shared/
      enums/
      types/
      interfaces/
```

---

## Penjelasan Detail per Folder

### 1) `config/`
Berisi semua konfigurasi runtime aplikasi dan validasi env:
- **`configuration.ts`**
  - Menyusun object config yang rapi untuk diakses di code.
  - Contoh akses: `config.db.host`, `config.jwt.accessSecret`, dll.
- **`env.schema.ts`**
  - Validasi env agar aplikasi gagal start jika ada env yang hilang/typo.
  - Contoh: `DB_HOST`, `DB_NAME`, `JWT_ACCESS_SECRET` harus ada.

Manfaat:
- Config konsisten dan terpusat.
- Menghindari error produksi karena env belum lengkap.

---

### 2) `database/`
Semua hal yang berkaitan langsung dengan database:
- **`entities/`** → definisi tabel dan relasi TypeORM.
- **`migrations/`** → versi skema DB (DDL).
- **`seeds/`** → data awal / sample data.
- **`ormconfig.ts`** → konfigurasi koneksi TypeORM.
- **`database.module.ts`** → module Nest untuk injeksi DataSource.

Manfaat:
- Schema DB terpisah rapi dari logic bisnis.
- Memudahkan audit & kontrol perubahan data.

---

### 3) `common/`
Komponen lintas fitur yang dipakai banyak module:
- **`constants/`** → konstanta global (cookie name, header name, dll).
- **`decorators/`** → custom decorator (mis. `@CurrentUser()`, `@OrgScope()`).
- **`guards/`** → auth guard, roles guard, org-scope guard.
- **`interceptors/`** → logging, transform response, timeout.
- **`filters/`** → error handler / global exception filter.
- **`pipes/`** → validasi input, transform payload.
- **`utils/`** → helper kecil reusable.

Manfaat:
- Menghindari duplikasi logic.
- Struktur aplikasi lebih konsisten.

---

### 4) `modules/`
Inti domain aplikasi. Setiap module biasanya berisi:
```
dto/
controller.ts
service.ts
module.ts
```
Module harus mencerminkan domain bisnis, bukan menu UI:
- **auth** → login, refresh token, reset password.
- **users** → profil user, update password, dsb.
- **organizations** → struktur organisasi (parent-child).
- **organization-members** → relasi user ↔ org + role.
- **devices** → device CRUD + provisioning.
- **telemetry** → ingestion data, query grafik.
- **device-requests** → flow approval.
- **costs** → tarif & history.
- **contents** → CMS landing / static content.

Manfaat:
- Logic domain terpisah jelas.
- Mudah scale jika tim bertambah.

---

### 5) `shared/`
Tempat menyimpan tipe/enum/interface lintas module:
- **`enums/`** → `UserRole`, `DevicePhase`, dsb.
- **`types/`** → type helper (`Pagination`, `ApiResponse`).
- **`interfaces/`** → kontrak data antar module.

Manfaat:
- Type safety lebih baik.
- Menjaga konsistensi antar module.

---

### 6) Root `src/`
File bootstrap aplikasi:
- **`main.ts`** → entrypoint app.
- **`app.module.ts`** → gabungkan semua module.
- **`app.controller.ts`** → endpoint root (health check).
- **`app.service.ts`** → service dasar.

---

## Tips Penerapan di Project Ini

1. **Mulai dari core module**:
   - `auth`, `users`, `organizations`, `devices`, `telemetry`.
2. **Baru tambah module pendukung**:
   - `device-requests`, `costs`, `contents`.
3. **Pastikan config & env schema lengkap** sebelum running.
4. **Pisahkan logic scope org** ke guard/service khusus agar konsisten.

---

## Hubungan dengan Menu FE

Menu FE tidak wajib sama dengan module BE.  
Module BE sebaiknya mengikuti domain bisnis agar stabil.  
Contoh:
- Menu "Monitoring" di FE → data berasal dari module `telemetry` dan `devices`.
- Menu "Device Request" → module `device-requests`.
- Menu "CMS Landing" → module `contents`.

---

## Checklist Implementasi Fitur (Clean, Rapi, Aman)

Bagian ini adalah acuan kerja setiap kali menambahkan fitur baru (contoh: Register, Login, dsb).
Tujuannya memastikan implementasi konsisten, minim bug, dan aman.

### 1) Definisi Fitur & Scope
- Tuliskan **goal utama** fitur (1–2 kalimat).
- Definisikan **batasan**: data apa yang boleh diakses, data apa yang tidak boleh.
- Catat dependensi (tabel/relasi/module lain).

### 2) Contract‑First (API Contract)
- Definisikan endpoint, method, dan path.
- Tuliskan request/response schema (payload).
- Tentukan kode status untuk semua skenario (200/201/400/401/403/409/500).
- Pastikan DTO sesuai kontrak (hindari mismatch FE/BE).

### 3) Threat Modeling Mini (5–10 menit)
- Identifikasi 3–5 risiko utama (contoh: brute force, data leak, bypass scope).
- Tentukan mitigasi (rate limit, guard, validation, audit log).
- Catat di dokumentasi fitur.

### 4) Implementasi BE (Struktur)
- Controller: hanya handle request/response.
- Service: logic utama, panggil repo.
- DTO: validasi payload + transform.
- Entity/Repository: interaksi DB.
- Guard/Policy: otorisasi & scope.
- Transaction jika melibatkan >1 tabel.

### 5) Validasi Input & Normalisasi
- `ValidationPipe` global aktif.
- Normalisasi: email lowercase, trim string.
- Validasi panjang/password/format.

### 6) Otorisasi & Scope Data
- Cek `role_global` dan `role_in_org`.
- Batasi akses org scope (parent-child).
- Pastikan query selalu memakai filter org scope.

### 7) Idempotensi & Anti‑Double Submit
- Gunakan unique constraint + cek existing.
- Gunakan transaction agar atomic.

### 8) Observability Minimum
- Log dengan userId + orgId + requestId.
- Catat success/failure events.

### 9) Testing (Manual + Automation)
**Manual:**
- Success path
- Invalid payload
- Duplicate data
- Unauthorized/Forbidden

**Automation:**
- Unit test (service logic)
- Integration test (DB, transaction)
- E2E test (HTTP)

**Security baseline:**
- Rate limit test
- Input validation test (SQLi/XSS payload)

### 10) Dokumentasi Fitur
- Dokumentasi API (request/response/flow).
- Dokumentasi testing (test cases, hasil).
- Catat perubahan schema/migrations jika ada.

### 11) Definition of Done (DoD)
- Semua test lulus.
- Lint & typecheck lulus.
- Dokumentasi lengkap.
- Security mitigasi tercapai.
