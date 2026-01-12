# Data Flow

Dokumen ini menjelaskan alur data end-to-end pada Power Management System, dari hardware (ESP32 + sensor/PZEM) sampai tampil di aplikasi Web/Mobile (web-based, responsive), termasuk aturan pengiriman, timestamp (NTP), jenis data, dan skenario kegagalan (failure) yang perlu ditangani.

---

## 1. High-Level Diagram (Alur Utama)

ESP32 → (Wi-Fi) → (MQTT/HTTP) → Backend → DB → Web / Mobile (Web Based, Responsive)

### Catatan Transport
- **MQTT**: cocok untuk telemetry realtime (publish berkala), efisien, mudah scale.
- **HTTP**: bisa dipakai untuk MVP/alternatif/fallback (POST data ke endpoint).

---

## 2. Komponen yang Terlibat

### Firmware / Device
- **ESP32**: membaca data dari PZEM/sensor lalu mengirim data ke backend.
- **Sensors/PZEM**: sumber data kelistrikan (ground, voltage, frequency, energy, dsb).
- **NTP Client**: sinkronisasi waktu untuk timestamp.

### Network / Transport
- **Wi-Fi**: koneksi device ke jaringan lokal / internet.
- **MQTT Broker** (opsional jika pakai MQTT): perantara publish/subscribe.
- **HTTP API** (opsional jika pakai HTTP): endpoint menerima data telemetry.

### Backend
- **Ingest Service**: menerima data telemetry/status/alarm dari device.
- **Validation/Normalization**: validasi payload, normalisasi unit/format.
- **Storage Writer**: simpan ke DB (timeseries).

### Database
- Penyimpanan **telemetry timeseries** + data device + event/alarm (jika ada).

### Frontend (Web/Mobile)
- Web dashboard (responsive) untuk realtime & histori.
- Mobile/web-based view untuk monitoring & (opsional) recording.

---

## 3. Flow Utama (MQTT) - Recommended

1. ESP32 membaca data sensor/PZEM (interval 3–5 detik saat ini).
2. ESP32 membuat payload JSON (telemetry/status/alarm).
3. ESP32 publish ke MQTT broker (topic sesuai konvensi).
4. Backend subscribe topic telemetry.
5. Backend validasi payload → simpan ke DB (timeseries).
6. Web/Mobile mengambil data dari backend (API) untuk:
   - Live view (realtime)
   - History (grafik/tabel)
   - Reports (summary/energy)

---

## 4. Flow Alternatif (HTTP)

1. ESP32 membaca data sensor/PZEM (interval 3–5 detik).
2. ESP32 membuat payload JSON.
3. ESP32 `POST` ke endpoint backend (mis. `/telemetry/ingest`).
4. Backend validasi → simpan ke DB.
5. Web/Mobile read data via API.

---

