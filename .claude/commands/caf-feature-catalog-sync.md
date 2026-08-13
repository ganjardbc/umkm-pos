---
allowed-tools: Read, Write, Edit, Grep, Glob, Bash
description: Sinkronkan docs/feature-catalog.md dengan kode — tambah fitur baru, refresh entri TODO, tandai entri yang hilang. Tidak pernah menghapus entri tulisan manusia.
argument-hint: [opsional: scope, mis. "apps/api" atau nama module tertentu]
---

> DRAFT hasil caf-initiator — review dan lengkapi sebelum dipakai, terutama bagian
> yang ditandai TODO project-specific.

# Feature Catalog Sync

Sinkronkan `docs/feature-catalog.md` dengan keadaan kode saat ini.

Project ini terdeteksi **controller-based** (backend punya `*.controller.ts`, frontend punya
router). Fitur = irisan antara endpoint backend dan route frontend yang memakainya.

Kalau agent Documentation ada di `.claude/agents/caf-documentation.md`, baca dan patuhi
aturan penulisan dokumentasi di sana sebagai sumber kebenaran utama untuk gaya dan
struktur — command ini hanya mengatur *cara mendeteksi* isinya.

## Argumen

`$ARGUMENTS` — opsional, batasi scan ke scope tertentu (path app atau nama module/domain).
Kalau kosong, scan seluruh repo.

## Langkah

### 1. Baca katalog yang sudah ada

- Baca `docs/feature-catalog.md`. Kalau belum ada, buat baru dengan header dan tabel kosong
  (format di langkah 3), lalu lanjut — semua hasil scan jadi entri baru.
- Kalau sudah ada, catat untuk tiap entri: nama fitur, lokasi kode yang dirujuk, dan
  apakah isinya masih `TODO` atau sudah ditulis manusia. Klasifikasi ini yang dipakai
  di langkah 4 — jangan lewati.

### 2. Scan kode — strategi controller-based

1. Kumpulkan semua controller backend:
   ```bash
   rg --files -g '**/*.controller.ts'
   ```
2. Kelompokkan per module — module = nama folder induk controller
   (mis. `src/modules/auth/auth.controller.ts` → module `auth`). Kalau struktur folder
   tidak punya level module, pakai basename controller tanpa suffix (`auth.controller.ts`
   → `auth`).
3. Untuk tiap controller, baca decorator/handler-nya dan catat daftar endpoint
   (HTTP method + path).
4. Kumpulkan route frontend dari file router — **per app**, jangan digabung:
   - Kalau monorepo punya lebih dari satu frontend app (cek workspace config atau
     apps/*/package.json), scan router tiap app secara terpisah dan simpan asal
     app-nya (mis. `apps/web` vs `apps/landing`).
   - Kalau ada beberapa frontend app, JANGAN asumsikan sembarang satu adalah
     konsumer utama API. Coba cocokkan tiap controller ke SEMUA frontend app,
     bukan berhenti begitu ketemu match pertama.
   - Kalau setelah verifikasi (baca kode, bukan tebak nama) controller tidak
     terhubung ke app manapun secara jelas, tandai ambigu di ringkasan akhir
     alih-alih memaksa assign ke salah satu app — biarkan manusia yang putuskan.
5. **Kapabilitas = irisan controller + route**: satu entri fitur untuk tiap module backend
   yang punya route frontend yang memakainya. Cocokkan lewat nama module/path yang mirip,
   lalu VERIFIKASI dengan membaca kode frontend (import service/composable/API call yang
   memanggil endpoint tersebut) — jangan andalkan kemiripan nama saja.
6. Kalau ada module backend TANPA route frontend (mis. webhook, cron, internal API),
   tetap catat sebagai entri fitur tapi tandai `(backend-only)` di kolom Route.
   Kalau ada route frontend TANPA controller backend (mis. halaman statis), tandai
   `(no backend)` di kolom Endpoint.

### 3. Format entri

Katalog memakai satu tabel dengan kolom berikut:

```markdown
| Fitur | Module | Endpoint | Route frontend | Status |
| --- | --- | --- | --- | --- |
| Autentikasi | `auth` | `POST /auth/login`, `POST /auth/refresh` | `/login` | TODO |
```

Kolom Status: `TODO` (hasil generate, belum diverifikasi manusia), `OK` (sudah
diverifikasi), atau `⚠️ stale` (lihat langkah 4).

### 4. Aturan merge (IDEMPOTENCY — ini bagian paling penting)

Bandingkan hasil scan langkah 2 dengan katalog yang dibaca di langkah 1:

- **Ada di kode, belum ada di katalog** → APPEND entri baru di akhir tabel dengan
  Status `TODO`. Jangan menyisipkan di tengah dan jangan mengurutkan ulang tabel —
  urutan yang ada bisa saja disusun manusia dengan sengaja.
- **Ada di kode, sudah ada di katalog dengan Status `TODO`** → REFRESH: update kolom
  lokasi kode/kapabilitas sesuai hasil scan terbaru. Entri `TODO` memang milik
  generator, aman ditimpa.
- **Ada di kode, sudah ada di katalog dengan isi tulisan manusia** (Status `OK`, atau
  deskripsi yang jelas bukan hasil generate) → JANGAN DISENTUH sama sekali. Kalau hasil
  scan berbeda dengan isi entri, laporkan perbedaannya ke user di ringkasan akhir dan
  biarkan user yang memutuskan.
- **Ada di katalog, TIDAK ada lagi di kode** → JANGAN HAPUS. Tandai Status jadi
  `⚠️ stale` dan tambahkan catatan singkat kenapa (mis. "module `x` tidak ditemukan
  lagi di kode"). Penghapusan entri selalu keputusan manusia.

### 5. Ringkasan akhir

Setelah menulis, tampilkan ringkasan:

```
Selesai sync docs/feature-catalog.md:
- N entri baru ditambahkan (Status TODO): [daftar]
- M entri TODO di-refresh: [daftar]
- K entri ditandai ⚠️ stale: [daftar + alasan]
- L entri human-authored dilewati: [daftar]
- Perbedaan yang perlu keputusan manusia: [daftar, atau "tidak ada"]
```

## Batasan (jangan dilanggar)

- JANGAN menghapus baris apapun dari `docs/feature-catalog.md` — entri yang hilang dari kode
  ditandai `⚠️ stale`, bukan dihapus.
- JANGAN menimpa entri yang sudah ditulis manusia, sekalipun hasil scan terlihat lebih
  akurat. Laporkan, jangan perbaiki sendiri.
- JANGAN mengurutkan ulang atau memformat ulang tabel yang sudah ada — hanya sentuh
  baris yang memang berubah.
- JANGAN mengubah file kode apapun. Command ini hanya menulis `docs/feature-catalog.md`.
- Kalau scan tidak menemukan apapun, STOP dan laporkan — jangan menulis katalog kosong
  yang menimpa isi sebelumnya.
