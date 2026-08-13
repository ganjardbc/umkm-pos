---
allowed-tools: Read, Write, Bash
description: Jalankan Auditor Agent scan read-only terhadap scope tertentu, hasilkan dokumen temuan (tidak membuat ticket)
argument-hint: [scope, contoh: "apps/api/src/modules/auth" atau "semua modul"]
---

> DRAFT hasil caf-initiator — review dan lengkapi sebelum dipakai, terutama bagian
> yang ditandai TODO project-specific.

# Audit Scan

**PENTING: Ini command READ-ONLY. Jangan edit/tulis file kode apapun. Jangan
buat ticket — itu tugas command terpisah `/caf-audit-to-ticket`.**

Ikuti scope dan aturan yang sama seperti agent definition di
`.claude/agents/caf-auditor.md` — kalau file itu ada, baca dan patuhi isinya
sebagai sumber kebenaran utama. Kalau tidak ada, gunakan prinsip default:
tools terbatas ke Read + Bash read-only (`ls`, `grep`, `git blame`) plus Write
HANYA untuk menyimpan laporan di `.caf/audits/`; tidak ada akses tulis ke kode
maupun ke sistem eksternal (Linear, Jira, GitHub, dst).

## Scope

Target audit: $ARGUMENTS

Kalau argument kosong atau berisi "semua modul", lakukan full-scan terhadap
seluruh modul aplikasi (deteksi struktur dulu dari package.json/workspace
config sebelum mulai — jangan asumsi nama folder tanpa verifikasi).

## Yang Dicari

**Bug fungsional (dari perilaku kode, bukan asumsi):**
- Logic yang tidak konsisten dengan dokumentasi/ADR/golden-example yang ada
- Edge case yang terlihat tidak ditangani (null/undefined check hilang di path yang jelas
  membutuhkannya, error handling yang silent-swallow tanpa log)
- Kontrak API yang berubah tapi konsumennya (frontend/service lain) belum disesuaikan

**Tech debt:**
- Duplikasi logic yang seharusnya di-share (melanggar golden-example pattern yang sudah
  didokumentasikan)
- Kode yang menyimpang dari konvensi ADR tanpa catatan alasan
- TODO/FIXME comment yang sudah lama tidak ditindaklanjuti (cek usia comment via `git blame`)

**Performance (indikasi dari kode statis, bukan profiling runtime):**
- Query di dalam loop (pola N+1)
- Index yang jelas dibutuhkan dari pola query yang sering dipakai tapi belum ada
- Payload response yang jelas berlebihan (mis. select semua kolom padahal cuma 2 yang dipakai)

**Di luar scope Auditor CAF — JANGAN scan:**
- Security scanning mendalam (secret, injection, auth bypass) DI LUAR scope Auditor CAF (lihat CAF.md § Klaster 4) — itu tanggung jawab security review terpisah. Kalau kepentok indikasi security serius secara insidental, tulis di `## Catatan` untuk perhatian manusia; jangan jadikan temuan prioritas dan jangan jadikan ticket lewat jalur ini.

**Aturan routing: sensitive-data-exposure (berlaku lintas kategori).**

Sebelum menempatkan temuan ke "Temuan Prioritas" atau "Non-Prioritas", cek: apakah temuan ini
melibatkan EXPOSURE data sensitif/kredensial (password/password_hash, token, secret, API key,
session secret, atau PII yang seharusnya tidak publik) — baik ditemukan lewat scan bug
fungsional, tech debt, maupun performance?

Kalau YA — apapun kategori aslinya (`BUG` / `PERFORMANCE` / `TECH_DEBT` / `COVERAGE`) — pindahkan ke
`## Catatan` § `### Sensitive Data Exposure`, BUKAN ke Temuan
Prioritas/Non-Prioritas. Ini bukan kategori baru: klasifikasi kategori awalnya tetap ditulis,
yang berubah cuma rute penanganannya.

Tulis deskripsi secukupnya supaya actionable (lokasi file/baris, jenis data yang bocor, kategori
asli) TANPA menyertakan nilai/payload nyata yang ter-expose.

Temuan di subsection ini TIDAK dikonversi jadi ticket oleh `/caf-audit-to-ticket` — perlakuannya
sama dengan indikasi security lain yang sudah dikecualikan. Manusia yang memutuskan rute
penanganannya di luar tracker biasa.

Gunakan penilaian untuk pola lain yang relevan dengan domain project (cek CLAUDE.md dan
riwayat incident/hotfix kalau ada), tapi JANGAN menetapkan severity tanpa menyertakan bukti
baris kode.

## Format Output

Struktur output WAJIB sama dengan `.claude/agents/caf-auditor.md` (lihat section
`## Format Laporan` di file itu) biar bisa diparse `/caf-audit-to-ticket` (yang
mencari heading `## Temuan Prioritas` dan mengabaikan
`## Temuan Non-Prioritas` serta seluruh `## Catatan`):

```markdown
## Audit: <DATE>
## Agent: audit-scan (command)
## Scope: <argument asli>

## Ringkasan

<1-2 kalimat kondisi area yang di-scan>

## Temuan Prioritas

### 1. [KATEGORI] <judul singkat>
- **Lokasi:** `path/to/file.ext:baris`
- **Kategori:** `BUG` / `PERFORMANCE` / `TECH_DEBT` / `COVERAGE`
- **Severity:** Critical / Moderate
- **Masalah:** <deskripsi konkret, kenapa ini masalah>
- **Dampak:** <konsekuensi kalau dibiarkan>
- **Usulan:** <arah perbaikan singkat, bukan implementasi lengkap>

### 2. ...

## Temuan Non-Prioritas (dicatat, tidak diusulkan jadi task)

- <kategori, lokasi file:line, severity Minor — list singkat tanpa detail>

## Catatan

<hal yang perlu perhatian manusia — mis. butuh keputusan arsitektur, scope yang diminta
ternyata lebih luas dari yang bisa di-cover, atau indikasi security yang keluar dari scope
Auditor>

### Sensitive Data Exposure

<temuan exposure data sensitif/kredensial, apapun kategori aslinya — kosongkan kalau tidak ada>

- **Lokasi:** `path/to/file.ext:baris`
- **Kategori asli:** `BUG` / `PERFORMANCE` / `TECH_DEBT` / `COVERAGE`
- **Data yang ter-expose:** <jenis data saja, mis. "hash password di response endpoint" —
  JANGAN tulis nilai/payload nyatanya>
- **Masalah:** <deskripsi singkat>
```

Severity Critical / Moderate → Temuan Prioritas; Minor → Temuan
Non-Prioritas. Kelompokkan temuan per modul/area di dalam tiap section. Temuan
sensitive-data-exposure masuk `## Catatan` § `### Sensitive Data Exposure`
(aturan lengkap di section "Yang Dicari").

Berbeda dari `auditor.md`: **Temuan Prioritas TIDAK dibatasi jumlah (N)**.
Auditor agent membatasi ke 5 karena scan seluruh repo (kontrol budget AI run
mingguan); command ini scoped ke area yang eksplisit diminta user, jadi semua
temuan Critical / Moderate yang genuinely ditemukan di scope itu masuk ke
Temuan Prioritas.

Jangan buat rekomendasi implementasi detail di command ini — itu keluar dari
scope read-only audit.

## Simpan Hasil

WAJIB tulis hasil audit ke file, JANGAN cuma tampilkan di chat.

Lokasi: `.caf/audits/<DATE>/audit-report-{scope-slug}.md`
- `<DATE>`: tanggal hari ini, format YYYY-MM-DD (folder per tanggal, sama
  konvensi dengan agent `auditor.md`)
- `{scope-slug}`: dari argument yang diberikan, disederhanakan jadi
  lowercase-kebab-case (contoh: "apps/web/src/modules/auth" jadi
  "auth-module"; "semua modul" jadi "full-scan")

Nama file sengaja BUKAN `audit-report.md` polos — nama itu direservasi untuk
output agent `auditor.md` (full-repo scan). Command ini scoped, jadi selalu
pakai suffix `-{scope-slug}` supaya tidak pernah bentrok dengan file agent.

Kalau folder `.caf/audits/<DATE>/` belum ada, buat dulu.

**Kalau file `.caf/audits/<DATE>/audit-report-{scope-slug}.md` sudah ada**
(re-run scope yang sama di tanggal yang sama): JANGAN overwrite diam-diam.
APPEND section baru ke file yang sama, dengan pemisah jelas:

```markdown

---

## Scan Tambahan: <HH:MM>
## Scope: <argument asli>

## Ringkasan
...
## Temuan Prioritas
...
## Temuan Non-Prioritas
...
```

Beri tahu user di chat bahwa hasil di-append ke file existing (sebutkan
berapa section sudah ada di file itu), bukan menimpa temuan run sebelumnya.

Setelah file tersimpan, tetap tampilkan ringkasan di chat (jumlah temuan
per severity), tapi beri tahu user path file lengkapnya supaya bisa
dirujuk nanti — termasuk oleh `/caf-audit-to-ticket`.

Verify: konfirmasi file benar-benar tertulis di path yang disebutkan
(cek dengan Read atau ls), bukan cuma klaim "sudah disimpan".

## Setelah Selesai

Sarankan ke user untuk menjalankan `/caf-audit-to-ticket` kalau mau convert
temuan ini jadi ticket (dengan approval per-item, bukan auto-create).
