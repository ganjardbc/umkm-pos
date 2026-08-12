---
description: Baca audit-report.md hasil Auditor Agent, tampilkan tiap temuan untuk approval manusia satu per satu, lalu create ticket HANYA untuk yang di-approve. Tidak pernah auto-create tanpa konfirmasi eksplisit per item.
---

## Konteks

Kamu menjalankan langkah manusia-in-the-loop setelah Auditor Agent selesai scan.
Auditor Agent SENGAJA tidak boleh create ticket sendiri (lihat `.opencode/agent/auditor.md`
§ Scope: "itu keputusan manusia, bukan agent ini"). Command ini adalah satu-satunya jalur resmi dari audit-report.md ke Linear/issue tracker — jangan buat jalur lain.

## Argumen

`$ARGUMENTS` — opsional, path ke file audit spesifik (mis.
`.ai/audits/2026-07-10/audit-report.md` dari agent `auditor`, atau
`.ai/audits/2026-07-10/audit-report-{scope-slug}.md` dari
`/audit-scan`). Kalau kosong, cari folder tanggal terbaru di `.ai/audits/`.

## Langkah

### 1. Temukan dan baca file audit

- Kalau `$ARGUMENTS` kosong: cari folder tanggal
  terbaru di `.ai/audits/`, lalu periksa semua file
  `audit-report*.md` di dalamnya (bisa lebih dari satu: `audit-report.md`
  dari agent `auditor` full-scan, dan/atau `audit-report-{scope-slug}.md`
  dari `/audit-scan`).
  - Kalau cuma ada 1 file → baca langsung.
  - Kalau ada lebih dari 1 file → tampilkan daftarnya ke user (nama file +
    scope dari header masing-masing) dan minta user pilih satu (atau
    proses semua secara berurutan kalau user minta eksplisit). JANGAN
    asumsi file mana yang dimaksud.
- Kalau tidak ada file `audit-report*.md` sama sekali di folder tanggal
  terbaru, laporkan ke user dan STOP — jangan lanjut dengan asumsi apapun.
- Parse SEMUA section "## Temuan Prioritas" di file yang dipilih — file bisa
  berisi lebih dari satu section ini kalau `/audit-scan` di-run beberapa kali
  di hari yang sama pada scope sama (hasilnya di-append, bukan ditimpa; lihat
  "## Scan Tambahan" sebagai pemisah antar run). Gabungkan semua temuan dari
  tiap section "## Temuan Prioritas" yang ditemukan ke satu daftar untuk
  diproses. Abaikan "## Temuan Non-Prioritas" di section manapun (memang
  sengaja tidak diusulkan jadi task oleh Auditor).
- Abaikan juga SELURUH isi "## Catatan" — termasuk subsection
  "### Sensitive Data Exposure". Isinya sengaja dirutekan keluar dari jalur
  ticket (lihat Batasan di bawah).
- Kalau ada temuan di "## Temuan Prioritas"/"## Temuan Non-Prioritas" yang
  ternyata soal exposure data sensitif/kredensial (password/password_hash,
  token, secret, API key, session secret, PII yang seharusnya tidak publik) —
  berarti lolos dari filter Auditor. JANGAN proses jadi ticket. Laporkan ke
  user bahwa temuan itu di-skip karena salah tempat dan seharusnya ada di
  "## Catatan" § "### Sensitive Data Exposure", tanpa mengutip
  nilai/payload yang ter-expose.

### 2. Tampilkan tiap temuan satu per satu, minta keputusan eksplisit

Untuk SETIAP temuan di "Temuan Prioritas", tampilkan ke user persis seperti ini
dan TUNGGU jawaban sebelum lanjut ke temuan berikutnya — jangan proses batch
tanpa konfirmasi per item:

```
---
Temuan N/TOTAL: [KATEGORI] <judul>
Lokasi: <file:line>
Masalah: <deskripsi dari audit-report.md>
Dampak: <dari audit-report.md>
Usulan: <dari audit-report.md>

Buat jadi ticket? (ya / edit / skip)
---
```

- **ya** → lanjut ke langkah 3 dengan deskripsi apa adanya dari audit-report.md
- **edit** → tanya bagian mana yang mau diubah (judul/deskripsi/severity), lalu
  konfirmasi ulang versi editan sebelum lanjut ke langkah 3
- **skip** → catat sebagai "tidak dibuat", lanjut ke temuan berikutnya

### 3. Create issue (hanya untuk yang di-approve)

- Jika ada tool MCP Linear / tracker terhubung, gunakan untuk create issue. Jika tidak ada, buat format markdown untuk siap di-paste user.
- Title: judul temuan (ringkas, actionable — bukan copy-paste deskripsi panjang)
- Description: format berikut, isi dari audit-report.md (atau versi editan):
  ```
  ## Sumber
  Auditor Agent scan <tanggal audit>, file: `.ai/audits/<tanggal>/audit-report.md`

  ## Lokasi
  <file:line>

  ## Masalah
  <deskripsi>

  ## Dampak
  <dampak>

  ## Usulan
  <usulan task>
  ```
- Label/priority: map dari kategori —
  - `BUG` → priority High, label `bug`
  - `PERFORMANCE` → priority Medium, label `performance`
  - `TECH_DEBT` → priority Medium, label `tech-debt`
  - `COVERAGE` → priority Low-Medium, label `test-coverage`
- Simpan issue ID + URL jika dibuat via tool MCP.

### 4. Ringkasan akhir

Setelah semua temuan diproses, tampilkan ringkasan:

```
Selesai. Dari N temuan prioritas:
- X dibuat jadi ticket: [daftar judul + link/nomor]
- Y di-skip: [daftar judul singkat]
- Z di-edit sebelum dibuat: [daftar judul]
```

## Batasan (jangan dilanggar)

- JANGAN create issue tanpa konfirmasi eksplisit per item — "ya" untuk satu temuan
  bukan berarti "ya" untuk semua.
- JANGAN proses "Temuan Non-Prioritas" (severity Minor) — itu memang
  sengaja tidak diusulkan Auditor. Yang diproses hanya Critical / Moderate.
- Kategori temuan yang valid hanya `BUG` / `PERFORMANCE` / `TECH_DEBT` / `COVERAGE`. Security scanning mendalam (secret, injection, auth bypass) DI LUAR scope Auditor CAF (lihat CAF.md § Klaster 4) — itu tanggung jawab security review terpisah. Kalau kepentok indikasi security serius secara insidental, tulis di `## Catatan` untuk perhatian manusia; jangan jadikan temuan prioritas dan jangan jadikan ticket lewat jalur ini.
- JANGAN create ticket untuk temuan yang melibatkan exposure data sensitif/kredensial
  (password/password_hash, token, secret, API key, session secret, PII yang seharusnya tidak
  publik) — apapun kategori aslinya (`BUG` / `PERFORMANCE` / `TECH_DEBT` / `COVERAGE`), dan apapun section tempatnya ditulis.
  Rutenya ke "## Catatan" § "### Sensitive Data Exposure" untuk keputusan manusia
  di luar tracker. Penilaian pakai substansi temuan, bukan string match nama field.
- JANGAN edit/hapus audit-report.md — file itu milik Auditor Agent, command ini
  read-only terhadapnya.
- JANGAN buat folder `.ai/tasks/<TICKET-ID>/` — itu domain Planner Agent setelah
  ticket masuk pipeline normal, bukan tanggung jawab command ini.
