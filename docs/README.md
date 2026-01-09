## Ringkasan Project

Power Management System adalah solusi **monitoring kelistrikan dan kualitas grounding** yang dirancang untuk dipakai di lingkungan rumah, kantor, maupun industri ringan. Sistem ini dibangun sebagai produk **bundling hardware + software**, di mana satu perangkat (device) berisi **ESP32** sebagai controller, **PZEM / Power Meter** untuk pembacaan parameter listrik, serta opsi sensor tambahan (misal temperatur/ground measurement) untuk melengkapi kebutuhan monitoring.

Tujuan utama sistem ini adalah menyediakan data kelistrikan yang **realtime, terekam rapi, dan mudah dianalisis** untuk mendukung keputusan teknis seperti pengecekan kualitas instalasi, deteksi anomali, serta perencanaan perawatan (maintenance). Target pengguna sistem mencakup **End User** (pemilik/pengelola lokasi), **Teknisi** (instalasi & troubleshooting), dan **Admin** (pengelolaan perangkat, user, dan konfigurasi sistem).


## Nilai Utama (Value Proposition)

- **Realtime Monitoring**  
  Menampilkan parameter penting (misal Ground, Voltage, Frequency, Energy) secara langsung untuk membantu deteksi kondisi abnormal secepat mungkin.

- **Historis & Reporting Energi**  
  Menyimpan data telemetry sebagai timeseries sehingga pengguna bisa melihat histori, tren, dan membuat laporan energi berdasarkan rentang waktu tertentu (harian/mingguan/bulanan).

- **Alarm & Notifikasi Otomatis**  
  Mendukung alarm berbasis threshold untuk kondisi seperti tegangan tidak normal, grounding bermasalah, atau frequency di luar batas—dengan opsi notifikasi (contoh: Telegram ata Whatsapp).

- **Evidence Data untuk Audit & Maintenance**  
  Data terekam menjadi bukti (evidence) untuk audit, dokumentasi kualitas instalasi, serta acuan tindakan maintenance dan evaluasi performa listrik.


## Saran Implementasi (3 poin)

1. **Mulai dari MVP “End-to-End Slice”**  
   Fokuskan implementasi awal pada 1 alur lengkap: *device mengirim telemetry → backend menyimpan → dashboard menampilkan realtime + dan logger sederhana*. Ini memastikan fondasi sistem solid sebelum menambah fitur kompleks (multi-tenant, alarm advanced, dll).

2. **Standarisasi Format Data & Timestamp Sejak Awal**  
   Tetapkan struktur payload telemetry (field wajib, satuan, dan format timestamp) agar firmware, backend, dan frontend selalu sinkron—mengurangi refactor besar di tengah jalan.

3. **Siapkan Observability Minimal untuk Debugging**  
   Pastikan sejak awal ada logging yang jelas (device online/offline, ingest success/fail, alarm trigger) supaya troubleshooting di lapangan lebih cepat dan sistem mudah di-scale.
  

## Project Status

- Status: Draft / In Progress
- MVP Target: Telemetry end-to-end (ESP32 -> backend ingest -> DB -> dashboard realtime + histori sederhana)

## Repository Structure (High Level)

- `apps/` : Aplikasi (API / Web / dll)
- `firmware/esp32/` : Source code firmware ESP32 (PZEM, sensor, Wi-Fi, telemetry)
- `docs/` : Dokumentasi (architecture, API contract, ADR, runbooks)
- `scripts/` : Script helper (dev, seed db, dll)
- `.github/` : CI workflows, issue templates, PR template

## Documentation Index

- Architecture & Data Flow: `docs/architecture/`
- API Contract (OpenAPI): `docs/api/openapi.md`
- Runbooks (Dev/Deploy/Ops): `docs/runbooks/`
- ADR (Architecture Decisions): `docs/adr/`

## Quick Start (Local Development)

### Prerequisites
- Node.js (LTS)
- npm
- Docker (untuk service lokal seperti DB/broker)
- PlatformIO (untuk firmware, jika diperlukan)

### Setup
1. Install dependencies:
   - `npm install`

2. Jalankan service lokal (jika ada docker compose):
   - `docker compose up -d`

3. Jalankan aplikasi via Turborepo:
   - `npm run dev`

## Configuration

- Copy env file:
  - `cp .env.example .env` (sesuaikan per app jika ada)
- Pastikan variable penting terisi (DB_URL, MQTT_BROKER_URL, dll)

## Common Commands

- Dev: `npm run dev`
- Build: `npm run build`
- Lint: `npm run lint`
- Test: `npm run test`
