# Local Development Runbook

Dokumen ini menjelaskan cara menjalankan Power Management System di environment lokal untuk development.

## Prerequisites
- Node.js (LTS)
- npm
- Docker + Docker Compose (jika service lokal memakai container)
- (Opsional) PlatformIO untuk firmware ESP32v
- (Opsional) Flutter SDK jika mobile app ada di repo / terkait proses testing

## Repo Setup
1. Clone repo:
   - `git clone <your-repo-url>`
2. Install dependencies:
   - `npm install`

## Environment Variables
- Copy `.env.example` menjadi `.env` (sesuaikan lokasi file jika per app):
  - `cp .env.example .env`

Minimum env untuk MVP (contoh, sesuaikan):
- `DB_URL=...`
- `MQTT_BROKER_URL=...` (jika pakai MQTT)
- `PORT=...`

## Start Services (Docker)
Jika ada `docker-compose.yml`:
- `docker compose up -d`

Cek container:
- `docker ps`

## Run Apps (Turborepo)
Jalankan mode dev:
- `npm run dev`

Build:
- `npm run build`

Lint:
- `npm run lint`

Test:
- `npm run test`

## Seed Database
Jika tersedia script:
- `./scripts/seed-db.sh`

## Common Issues
### Port conflict
- Matikan service yang bentrok atau ubah PORT di `.env`

### DB connection failed
- Pastikan docker compose sudah up
- Pastikan `DB_URL` benar

### MQTT publish tidak masuk backend
- Pastikan broker hidup
- Pastikan backend subscribe topic yang benar (lihat ADR + data-flow)

## Definition of Done (Local Dev Ready)
- `npm install` sukses
- `npm run dev` jalan
- Backend bisa menerima telemetry (MQTT/HTTP)
- UI bisa menampilkan data terakhir/histori sederhana
