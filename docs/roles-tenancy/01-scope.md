# Roles and Tenancy Scope

Dokumen ini mendefinisikan struktur organisasi dan peran (roles) pada Power Management System. Sistem ini dijual bundling dengan hardware (Grounding System + rangkaian alat, termasuk PZEM), sehingga struktur akses perlu jelas sejak awal.

## Struktur Organisasi

Urutan hirarki:
Admin (global) -> Owner -> Principal -> Company -> Customer

## Definisi Roles

1) Admin (Developer)
- Akun developer yang memiliki akses penuh ke seluruh organisasi dan data.
- Tidak ada form pendaftaran untuk Admin saat ini.
- Admin dibuat secara manual (seed/provisioning) oleh developer.

2) Owner (Perusahaan pembuat hardware + website)
- Owner adalah organisasi utama yang memproduksi hardware dan website.
- Saat ini ada 3 akun Owner dan jumlahnya tidak bertambah:
  - Akun Pak Tri Wardiyanto (device dipasang di rumah beliau).
  - Akun Owner internal (akses penuh untuk melihat dan mengedit semua data).
  - Akun Owner testing (dipakai untuk demo/testing hardware sebelum ada Customer).
- Semua akun Owner memiliki hak akses yang sama seperti Owner.

3) Principal (Turunan Owner)
- Principal adalah cabang/anak perusahaan dari Owner (contoh: PT Innotech Global Solusindo).
- Principal hanya memiliki akses ke group miliknya sendiri (Company dan Customer di bawahnya).
- Jumlah Principal bisa bertambah.

4) Company
- Company berada di bawah Principal.
- Company memiliki akses ke seluruh Customer yang mereka jangkau.
- Jumlah Company bisa bertambah.

5) Customer
- Customer adalah end user.
- Customer hanya dapat melihat device miliknya sendiri.
- Satu Customer dapat memiliki lebih dari 1 device.
