---
description: Baca prd.md + flow.md hasil Discovery (Klaster 1), tampilkan ringkasannya untuk approval manusia per item, lalu create ticket HANYA untuk yang di-approve, dan catat mapping slug → ticket ID di handoff.md. Tidak pernah auto-create tanpa konfirmasi eksplisit.
---

## Konteks

Kamu menjalankan langkah manusia-in-the-loop setelah alur Discovery (`/discovery-start`)
selesai. PM Agent SENGAJA tidak punya write access ke ticket tracker (lihat
`.opencode/agent/pm.md` § Tools yang Diizinkan) — mengubah dokumen discovery jadi ticket adalah
keputusan manusia. Command ini adalah satu-satunya jalur resmi dari dokumen discovery ke Linear/issue tracker — jangan buat jalur lain.

## Argumen

`$ARGUMENTS` — opsional, slug discovery (mis. `checkout-tanpa-login`) atau path ke
foldernya. Kalau kosong, cari folder terbaru di `.ai/discovery/`.

## Langkah

### 1. Temukan dan baca dokumen discovery

- Kalau `$ARGUMENTS` berisi slug/path: baca `.ai/discovery/{slug}/prd.md` dan
  `.ai/discovery/{slug}/flow.md`.
- Kalau `$ARGUMENTS` kosong: periksa folder `.ai/discovery/` untuk lihat folder yang ada.
  - Kalau cuma ada 1 folder → pakai itu.
  - Kalau ada lebih dari 1 → tampilkan daftarnya (slug + judul fitur dari `prd.md`) dan minta
    user pilih. JANGAN asumsi yang terbaru adalah yang dimaksud.
- Kalau `prd.md` tidak ada → laporkan dan STOP. Discovery-nya belum selesai; jalankan
  `/discovery-start` dulu.
- Kalau `prd.md` ada tapi `flow.md` tidak ada → laporkan ke user dan tanya: lanjut hanya
  dengan `prd.md`, atau lengkapi discovery dulu. STOP sampai dijawab.
- Kalau `.ai/discovery/{slug}/handoff.md` SUDAH ada → discovery ini pernah dikonversi.
  Tampilkan isinya dan tanya user: mau tambah ticket baru (append ke handoff yang ada), atau
  batal. JANGAN buat ticket duplikat diam-diam.

### 2. Tampilkan ringkasan discovery ke user

Sebelum bicara soal ticket sama sekali, tampilkan ringkasan supaya user bisa menilai apakah
dokumennya memang sudah siap:

```
---
Discovery: {slug}
Problem: <dari prd.md>
Target User: <dari prd.md>
Success Metric: <dari prd.md>
Scope: <ringkas>
Out-of-Scope: <ringkas>
Dependency: <ringkas, atau "tidak ada">
Keputusan UX Designer: <dipakai/tidak + alasan, dari flow.md>

Lanjut buat ticket dari discovery ini? (ya / batal)
---
```

Kalau user jawab **batal** → STOP tanpa membuat apapun.

Kalau `prd.md` punya section wajib yang kosong atau masih `TBD`, sebutkan eksplisit di sini
sebagai peringatan sebelum user memutuskan — jangan sembunyikan di balik ringkasan yang rapi.

### 3. Usulkan ticket, minta keputusan eksplisit per item

Dari `## Scope` di `prd.md` (dan `## Alur Utama` di `flow.md`), usulkan pemecahan jadi
ticket. Fitur kecil boleh jadi 1 ticket — jangan memecah demi terlihat rapi.

Tampilkan usulannya SATU PER SATU dan TUNGGU jawaban sebelum lanjut ke item berikutnya —
jangan proses batch tanpa konfirmasi per item:

```
---
Ticket N/TOTAL: <judul usulan>
Scope ticket ini: <bagian scope yang dicakup>
Alur terkait: <ringkasan dari flow.md>
Dependency: <kalau ada>

Buat ticket ini? (ya / edit / skip)
---
```

- **ya** → lanjut ke langkah 4 dengan isi apa adanya
- **edit** → tanya bagian mana yang mau diubah (judul/scope/deskripsi), lalu konfirmasi ulang
  versi editan sebelum lanjut ke langkah 4
- **skip** → catat sebagai "tidak dibuat", lanjut ke item berikutnya

### 4. Create Issue Tracker (hanya untuk yang di-approve)

- Jika ada tool MCP tracker terpasang, gunakan untuk create issue.
- Title: judul ticket yang sudah dikonfirmasi user di langkah 3 (ringkas, actionable).
- Description: format berikut, isi dari prd.md/flow.md (atau versi editan):
```
## Sumber
Discovery `{slug}`, file: `.ai/discovery/{slug}/prd.md` + `flow.md`

## Problem
<dari prd.md ## Problem>

## Target User
<dari prd.md ## Target User>

## Scope Ticket Ini
<bagian scope yang jadi tanggung jawab ticket ini saja>

## Out-of-Scope
<dari prd.md ## Out-of-Scope, yang relevan>

## Alur
<ringkasan dari flow.md yang relevan dengan ticket ini>

## Success Metric
<dari prd.md ## Success Metric>

## Dependency
<dari prd.md ## Dependency, kalau ada>
```
- Label/priority: default masuk akal label `feature`, priority Medium, kecuali user menentukan lain saat approval.
- Simpan issue ID + URL yang dikembalikan tracker — dipakai di langkah 5.

### 5. Tulis handoff.md

Setelah semua item diproses, tulis `.ai/discovery/{slug}/handoff.md` — mapping dari discovery
ke ticket yang benar-benar dibuat. Ini satu-satunya file di folder discovery yang boleh ditulis
command ini.

```markdown
# Handoff: {slug}

> Dibuat oleh `/discovery-to-ticket` pada <YYYY-MM-DD HH:MM>.
> Sumber: `prd.md` + `flow.md` di folder yang sama.

## Ticket

| Ticket ID | Judul | URL | Catatan |
| --- | --- | --- | --- |
| <ID> | <judul> | <url> | <"apa adanya" / "diedit saat approval"> |

## Tidak Dibuat

- <judul usulan> — di-skip user
```

Kalau `handoff.md` sudah ada (kasus append dari langkah 1): JANGAN overwrite. Tambahkan baris
baru ke tabel yang ada, dan catat tanggal run tambahan di bawah tabel.

Kalau TIDAK ADA satupun ticket dibuat (semua di-skip): jangan tulis `handoff.md` — tidak ada
mapping untuk dicatat. Laporkan saja di chat.

### 6. Ringkasan akhir

```
Selesai. Dari N usulan ticket untuk discovery {slug}:
- X dibuat: [daftar judul + link/nomor]
- Y di-skip: [daftar judul singkat]
- Z di-edit sebelum dibuat: [daftar judul]

Mapping tercatat di: .ai/discovery/{slug}/handoff.md
```

## Batasan (jangan dilanggar)

- JANGAN create ticket tanpa konfirmasi eksplisit per item — "ya" untuk satu usulan bukan
  berarti "ya" untuk semua.
- JANGAN edit/hapus `prd.md` atau `flow.md` — file itu milik PM/UX Designer Agent, command
  ini read-only terhadapnya. Satu-satunya file yang ditulis di folder discovery adalah
  `handoff.md`.
- JANGAN sentuh kode apapun. Command ini berhenti di ticket.
- JANGAN buat folder `.ai/tasks/<TICKET-ID>/` — itu domain Planner Agent setelah ticket masuk
  pipeline normal, bukan tanggung jawab command ini.
