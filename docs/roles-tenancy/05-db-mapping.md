# DB Mapping (Draft)

Dokumen ini mencatat rancangan sementara database untuk mendukung multi-tenant,
struktur role organisasi, serta kebutuhan lokasi dan device.

## Prinsip Utama
- Role global hanya ADMIN/USER dan disimpan di users (ADMIN = superuser platform; USER = semua akun biasa, termasuk Principal/Company/Customer).
- Role organisasi (OWNER/PRINCIPAL/COMPANY/CUSTOMER) disimpan di membership; Principal bukan role global, tapi role_in_org pada organization_members.
- Kepemilikan device berada di organisasi tipe CUSTOMER.
- Address adalah titik map (site), sedangkan location adalah spot di dalam site.
- Latitude/longitude tidak dibuat unik agar banyak device bisa di satu titik.

## Desain Tabel (Narasi)

1) users
Menyimpan akun login dan identitas dasar user. Role global hanya untuk akses
superuser (ADMIN) atau user biasa (USER).
Kolom utama: user_id, username, email, phone_number, password_hash,
role_global, profil_img, status, created_at, updated_at.
Detail kolom (users):
- user_id (uuid): primary key untuk identitas user.
- username (varchar, unique): nama login yang unik.
- email (varchar, unique): email login dan kontak utama.
- phone_number (varchar, nullable): nomor telepon untuk kontak/OTP.
- password_hash (varchar): hash password (bukan plaintext).
- role_global (enum ADMIN/USER): role akses global; role organisasi ada di membership.
- profil_img (varchar, nullable): path atau URL foto profil.
- status (enum ACTIVE/INACTIVE, not null, default ACTIVE): status akun untuk enable/disable.
- created_at (timestamptz, default now()): waktu pembuatan akun.
- updated_at (timestamptz, default now()): waktu update terakhir akun.
- deleted_at (timestamptz, nullable): penanda soft delete (jika dipakai).

2) organizations
Menyimpan struktur hirarki organisasi.
Kolom utama: org_id, name, type (OWNER/PRINCIPAL/COMPANY/CUSTOMER), parent_id,
is_active, created_at, updated_at, deleted_at.
Detail kolom (organizations):
- org_id (uuid): primary key organisasi.
- name (varchar): nama organisasi.
- type (enum OWNER/PRINCIPAL/COMPANY/CUSTOMER): level organisasi.
- parent_id (uuid, nullable): relasi ke org parent; null untuk OWNER.
- is_active (boolean, default true): status aktif organisasi.
- created_at (timestamptz, default now()): waktu pembuatan org.
- updated_at (timestamptz, default now()): waktu update terakhir org.
- deleted_at (timestamptz, nullable): penanda soft delete.

3) organization_members
Menghubungkan user dengan organisasi dan role di dalam org.
Kolom utama: org_member_id, org_id, user_id, role_in_org, status, joined_at.
Satu user bisa punya akses di lebih dari satu organisasi.
Detail kolom (organization_members):
- org_member_id (uuid): primary key membership.
- org_id (uuid): FK ke organizations.org_id (tidak unique).
- user_id (uuid): FK ke users.user_id (tidak unique).
- role_in_org (enum OWNER/PRINCIPAL/COMPANY/CUSTOMER): peran user di org.
- status (enum ACTIVE/INACTIVE, not null, default ACTIVE): status keanggotaan.
- joined_at (timestamptz, default now()): waktu join.
- created_at (timestamptz, default now()): waktu pembuatan record.
- updated_at (timestamptz, default now()): waktu update terakhir record.
- deleted_at (timestamptz, nullable): penanda soft delete.
Constraint penting:
- UNIQUE (org_id, user_id): mencegah membership ganda pada org yang sama.
Relasi organizations <-> users:
- many-to-many lewat organization_members.
- satu user bisa punya akses di banyak org, satu org punya banyak user.
- Admin global boleh tidak punya membership.
- Owner account biasanya menjadi member pada org type OWNER.

## Keputusan MVP (1 rumah = 1 akun)
- Untuk customer, 1 rumah = 1 akun user.
- Saat user registrasi (role_global USER), sistem otomatis membuat organization type CUSTOMER
  dan organization_members dengan role_in_org CUSTOMER.
- Untuk organisasi OWNER/PRINCIPAL/COMPANY, satu org bisa punya beberapa user
  (contoh: owner internal dan testing).
- Rule device: 1 customer org hanya boleh memiliki 1 device aktif (policy aplikasi).
 

4) addresses
Menyimpan alamat utama untuk titik map (site).
Kolom utama: address_id, address_name, latitude, longitude,
opsional: city, district, subdistrict, postal_code.
Detail kolom (addresses):
- address_id (uuid): primary key alamat/site.
- address_name (varchar): alamat utama (tanpa detail lantai/ruangan).
- latitude (double precision): titik koordinat latitude.
- longitude (double precision): titik koordinat longitude.
- city (varchar, nullable): kota (opsional untuk filter).
- district (varchar, nullable): kecamatan (opsional).
- subdistrict (varchar, nullable): kelurahan (opsional).
- postal_code (varchar, nullable): kode pos (opsional).

5) locations
Menyimpan spot/sub-lokasi di dalam alamat.
Kolom utama: location_id, address_id, location_label (contoh: ROY HOME),
detail_address (contoh: Lantai 1), segment (opsional).
Hover di map mengambil location_label, sedangkan detail menampilkan
address_name + detail_address.
Detail kolom (locations):
- location_id (uuid): primary key location/spot.
- address_id (uuid): FK ke addresses.address_id.
- location_label (varchar): nama lokasi untuk hover/label (contoh: ROY HOME).
- detail_address (varchar, nullable): detail lokasi (contoh: Lantai 1).
- segment (varchar, nullable): segment opsional untuk grouping.
- is_active (boolean, default true): status aktif lokasi.

6) devices (general_info)
Menyimpan data device dan relasinya dengan lokasi dan organisasi.
Kolom utama: device_id, serial_number (unik), device_name, phase, wattage,
is_active, location_id, owner_org_id (FK ke CUSTOMER).
Opsional: provisioned_by_user_id untuk audit.
Detail kolom (devices):
- device_id (uuid): primary key device.
- serial_number (varchar, unique): identitas hardware (ditampilkan ke user).
- device_name (varchar): nama device untuk UI (contoh: Panel Utama Lantai 1).
- phase (enum 1 PHASE / 3 PHASE): tipe fase listrik.
- wattage (varchar, nullable): kapasitas daya (contoh: 2200 VA).
- is_active (boolean, default true): status aktif device.
- location_id (uuid): FK ke locations.location_id.
- owner_org_id (uuid): FK ke organizations.org_id (type CUSTOMER).
- provisioned_by_user_id (uuid, nullable): user yang melakukan provisioning.

7) telemetry_readings
Menyimpan telemetry/time series per device (data dari PZEM).
Kolom utama: telemetry_id, device_id, recorded_at (timestamptz),
voltage, current, frequency, power, power_factor, total_energy_usage,
serta field summary (today/mtd) jika dibutuhkan.
Tambahkan index di (device_id, recorded_at) untuk query cepat.
Detail kolom (telemetry_readings):
- telemetry_id (uuid): primary key.
- device_id (uuid): FK ke devices.device_id.
- recorded_at (timestamptz): waktu pengukuran (utama untuk query).
- cost_id (uuid, nullable): FK ke cost.cost_id (tarif yang berlaku saat itu).
- voltage (numeric): tegangan.
- current (numeric): arus.
- frequency (numeric): frekuensi.
- power (numeric): daya.
- power_factor (numeric): faktor daya.
- total_energy_usage (numeric): total energi kumulatif.
- total_energy_usage_today (numeric, nullable): total energi harian (opsional).
- total_energy_usage_mtd (numeric, nullable): total energi bulanan (opsional).
- total_energy_cost (numeric, nullable): total biaya kumulatif (opsional).
- total_energy_cost_today (numeric, nullable): biaya harian (opsional).
- total_energy_cost_mtd (numeric, nullable): biaya bulanan (opsional).

8) cost dan cost_history
cost menyimpan jenis tarif dan power limit, cost_history menyimpan riwayat
perubahan tarif.
Kolom utama cost: cost_id, tariff_group, power_limit.
Kolom utama cost_history: history_id, cost_id, cost_value, valid_from,
valid_to, created_at.
Detail kolom (cost):
- cost_id (uuid): primary key tarif.
- tariff_group (varchar): golongan tarif (contoh: R-1/TR, R-2/TR).
- power_limit (varchar): batas daya (contoh: 2200 VA).
- created_at (timestamptz, default now()): waktu dibuat.
- updated_at (timestamptz, default now()): waktu update terakhir.
Detail kolom (cost_history):
- history_id (uuid): primary key riwayat.
- cost_id (uuid): FK ke cost.cost_id.
- cost_value (numeric(12,2)): nilai tarif.
- valid_from (date): mulai berlaku.
- valid_to (date, nullable): selesai berlaku.
- created_at (timestamptz, default now()): waktu dibuat.

9) device_requests
Menyimpan permintaan device sebelum provisioning.
Kolom utama: request_id, requester_user_id, target_org_id, address_id
(atau alamat mentah jika belum dibuat), lat, lng, status, approved_by,
approved_at, device_id (hasil provisioning).
Detail kolom (device_requests):
- request_id (uuid): primary key request.
- requester_user_id (uuid): FK ke users.user_id (user yang mengajukan).
- requester_org_id (uuid, not null): FK ke organizations.org_id (org context saat request dibuat).
- target_org_id (uuid, not null): FK ke organizations.org_id (org CUSTOMER tujuan).
- address_id (uuid, nullable): FK ke addresses.address_id jika sudah ada.
- address_name (varchar, nullable): alamat utama (jika address_id belum ada).
- detail_address (varchar, nullable): detail alamat (lantai/ruang).
- location_label (varchar, nullable): nama lokasi (contoh: ROY HOME).
- latitude (double precision): koordinat latitude.
- longitude (double precision): koordinat longitude.
- status (enum pending/approved/rejected, default pending): status request.
- approved_by (uuid, nullable): FK ke users.user_id (user yang menyetujui).
- approved_at (timestamptz, nullable): waktu disetujui.
- rejected_by (uuid, nullable): FK ke users.user_id (user yang menolak).
- rejected_at (timestamptz, nullable): waktu ditolak.
- note (text, nullable): catatan/alasan penolakan.
- device_id (uuid, nullable): FK ke devices.device_id (device hasil provisioning).
- created_at (timestamptz, default now()): waktu dibuat.
- updated_at (timestamptz, default now()): waktu update terakhir.

## Approval Flow (Device Request)
- Customer request -> disetujui oleh Company (parent org).
- Company request -> disetujui oleh Principal (parent org).
- Principal request -> disetujui oleh Owner/Admin.
- Owner/Admin request -> auto-approved (langsung provisioning).

10) auth tables
refresh_sessions dan reset_otp tetap dipakai untuk login dan reset password.
Detail kolom (refresh_sessions):
- refresh_session_id (uuid): primary key session.
- user_id (uuid): FK ke users.user_id.
- jti (varchar): token id.
- token_hash (varchar): hash refresh token.
- expires_at (timestamptz): waktu kadaluarsa.
- revoked_at (timestamptz, nullable): waktu revoke (jika logout).
- replaced_by_jti (varchar, nullable): token pengganti.
- user_agent (varchar, nullable): user agent.
- ip (varchar, nullable): ip address.
- created_at (timestamptz, default now()): waktu dibuat.
- updated_at (timestamptz, default now()): waktu update terakhir.
Detail kolom (reset_otp):
- otp_id (uuid): primary key OTP.
- user_id (uuid): FK ke users.user_id.
- purpose (varchar): tujuan OTP (reset password, dsb).
- code_hash (varchar): hash kode OTP.
- expires_at (timestamptz): waktu kadaluarsa.
- used_at (timestamptz, nullable): waktu digunakan.
- attempts (int, default 0): jumlah percobaan.
- resend_count (int, default 0): jumlah kirim ulang.
- ip (varchar, nullable): ip address.
- user_agent (varchar, nullable): user agent.
- created_at (timestamptz, default now()): waktu dibuat.

11) contents dan migrations
Tetap dipakai untuk kebutuhan CMS dan tracking schema.
Detail kolom (contents):
- content_id (uuid): primary key.
- key (varchar, unique): kunci konten.
- data (jsonb): isi konten.
- updated_by (uuid, nullable): FK ke users.user_id.
- created_at (timestamptz, default now()): waktu dibuat.
- updated_at (timestamptz, default now()): waktu update terakhir.
Detail kolom (migrations):
- id (int/bigint): primary key.
- timestamp (bigint): timestamp migration.
- name (varchar): nama migration.

## Catatan
- Device dibedakan dengan serial_number dan device_name, bukan lat/long.
- Struktur ini menjaga fleksibilitas jika jumlah Principal/Company/Customer bertambah.

## Relasi Utama (Ringkas)
- organizations.parent_id -> organizations.org_id (self-reference).
- organization_members.user_id -> users.user_id.
- organization_members.org_id -> organizations.org_id.
- locations.address_id -> addresses.address_id.
- devices.location_id -> locations.location_id.
- devices.owner_org_id -> organizations.org_id (type CUSTOMER).
- devices.provisioned_by_user_id -> users.user_id (nullable).
- telemetry_readings.device_id -> devices.device_id.
