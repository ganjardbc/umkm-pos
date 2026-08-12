---
description: Jalankan seluruh pipeline Klaster 2 (Planner → Architect → implementasi → Documentation → QA → Reviewer) untuk satu ticket dalam satu sesi, tanpa caf-orchestrator dan tanpa buka PR
---

# Run Pipeline (Manual, Tanpa Orchestrator)

**Command ini MENULIS KODE dan MEMBUAT BRANCH.** Ini satu-satunya command hasil
caf-initiator yang melakukan keduanya — perlakukan lebih hati-hati dari command lain.

Tujuan: alternatif manual untuk project yang belum/tidak setup `caf-orchestrator`
(webhook + VPS). Alurnya sama dengan pipeline otomatis, bedanya jalan di satu sesi OpenCode
interaktif dan **berhenti setelah kode + verify selesai**.

**TIDAK membuka PR.** Tidak ada `gh pr create`, tidak ada `git push`, tidak ada status
ticket yang diubah di tracker. Semua itu tetap keputusan manusia, dilakukan manual setelah
command ini selesai.

Setiap subagent yang dijalankan WAJIB mematuhi larangan push/PR secara eksplisit, dan di akhir run kamu
memverifikasi tidak ada PR/push yang terjadi.

## Ticket

Ticket ID: `$ARGUMENTS`

WAJIB diisi. Kalau kosong, tanya user ticket mana yang dimaksud dan STOP sampai dijawab —
jangan tebak.

Ambil detail ticket (title, description, acceptance criteria): kalau ada tracker terhubung, pakai itu. Kalau tidak, minta user paste detail ticket secara manual sebelum lanjut — jangan mengarang requirement yang tidak disebutkan.

## 0. Guard — WAJIB, sebelum spawn apapun

Jalankan keempat cek ini **berurutan dan sampai tuntas** sebelum Task tool / agent dipakai sama
sekali. Jangan spawn agent apapun "sambil menunggu jawaban user".

### 0.1 Working directory harus bersih

`git status --porcelain`. Kalau ada output (uncommitted changes) → **STOP**, tampilkan
daftarnya, minta user commit/stash dulu. Jangan checkout branch baru dengan perubahan yang
bisa ikut terbawa atau hilang.

### 0.2 Branch `ai-agent/{TICKET-ID}` sudah ada?

Cek **lokal DAN remote** — dua-duanya, jangan salah satu:

```bash
git branch --list ai-agent/{TICKET-ID}
git ls-remote --heads origin ai-agent/{TICKET-ID}
```

- **Tidak ada di keduanya** → lanjut ke 0.3.
- **Ada di salah satu/keduanya** → **STOP**. Tampilkan ke user:
  - `git log --oneline` branch itu,
  - isi `.ai/tasks/{TICKET-ID}/verify-report.md` kalau ada,
  - lokal atau remote (atau dua-duanya).

  Lalu minta konfirmasi eksplisit: **lanjutkan di branch itu**, atau **batal**. JANGAN
  mengasumsikan aman untuk lanjut, dan JANGAN membuat branch baru yang menimpa. Kalau user
  memilih lanjut, `git checkout ai-agent/{TICKET-ID}` (jangan `-b`).

### 0.3 Sudah pernah selesai?

Cek `.ai/tasks/{TICKET-ID}/verify-report.md`.

Kalau file itu ada dan status-nya **bukan** `NEEDS_HUMAN` → **STOP**. Ticket ini kemungkinan
sudah pernah dikerjakan sampai selesai. Tampilkan isi ringkasnya, tanya user: **ulang dari awal
(override)** atau **batal**. Jangan diam-diam menimpa kerja yang sudah selesai.

Kalau status-nya `NEEDS_HUMAN`, jangan STOP: ticket ini memang ditinggal belum selesai.
Sebutkan ke user bahwa run ini melanjutkan pekerjaan yang sebelumnya berhenti, lalu lanjut.

### 0.4 Buat branch

Baru setelah 0.1-0.3 lolos: `git checkout -b ai-agent/{TICKET-ID}` dari branch aktif
sekarang. Kalau user sudah memilih "lanjutkan" di 0.2, branch-nya sudah ke-checkout — lewati
langkah ini.

## 1. Planner (wajib)

Jalankan Planner Agent (`.opencode/agent/planner.md`). Sumber kebenaran perannya `.opencode/agent/planner.md` — baca file itu dan patuhi isinya. Input: detail ticket dari section Ticket di atas.

Output wajib: `.ai/tasks/{TICKET-ID}/requirements.md` dan `.ai/tasks/{TICKET-ID}/tasks.md`.

Kalau Planner melaporkan ticket terlalu ambigu untuk di-breakdown, **STOP seluruh pipeline** —
lapor ke user dan minta klarifikasi ticket. Jangan lanjut ke implementasi dengan rencana yang
Planner sendiri bilang tidak yakin.

## 2. Architect (kondisional)

Stage ini **kondisional** — jangan selalu dijalankan.

Jalankan Architect (`.opencode/agent/architect.md`) HANYA kalau salah satu benar:

- `tasks.md` dari Planner secara eksplisit menyebut butuh keputusan arsitektur/desain, ATAU
- task menyentuh lebih dari satu app/service, ATAU melibatkan schema/migration baru.

Kalau ticket-nya sederhana dan single-app, **skip** — lanjut ke stage 3.
Output: `.ai/tasks/{TICKET-ID}/design.md`. Kalau di-skip, catat di ringkasan akhir bahwa
stage ini dilewati beserta alasannya.

## 3. Implementasi

Agent implementasi yang tersedia di project ini:

- `frontend` (`.opencode/agent/frontend.md`)
- `backend` (`.opencode/agent/backend.md`)

**Cara memilih agent mana yang dijalankan**:

1. Baca kolom app/module tiap task di `tasks.md`.
2. Cocokkan dengan scope tiap agent di atas — baca `## Scope` di file agent-nya.
3. Task yang app/module-nya cocok dengan scope satu agent → agent itu yang mengerjakan.
4. Kalau ada task yang tidak cocok dengan scope agent manapun, ATAU cocok dengan lebih dari
   satu, **tanya user** agent mana yang harus mengerjakannya dan STOP sampai dijawab.
5. Jalankan secara berurutan sesuai dependency.

Setiap prompt eksekusi WAJIB memuat:

> Jangan `git push`, jangan buat PR, jangan ubah status ticket di tracker. Tulis kode dan
> `verify-report.md` saja, di branch yang sudah aktif.

Kalau agent selesai dengan `verify-report.md` `Status: NEEDS_HUMAN`:
**STOP seluruh pipeline di sini.** Jangan lanjut ke Documentation/QA/Reviewer.

## 4. Documentation (non-blocking)

Jalankan Documentation Agent (`.opencode/agent/documentation.md`) untuk memperbarui dokumentasi.
**Stage ini NON-BLOCKING.** Kalau stage ini selesai atau tidak ada doc yang diubah, lanjut ke QA.

## 5. QA (gate)

Set `qaRetryCount = 0`, `MAX_QA_RETRIES = 1`.

1. Jalankan QA Agent (`.opencode/agent/qa.md`), tunggu hasilnya.
2. Hasil OK (`Status: PASS`) → lanjut ke Reviewer.
3. Hasil `NEEDS_HUMAN / CRITICAL issue`:
   - Jika `qaRetryCount >= MAX_QA_RETRIES` → STOP, lapor NEEDS_HUMAN.
   - Jika belum → naikkan counter, jalankan ulang implementasi untuk memperbaiki temuan QA saja, lalu uji ulang QA.

Artifact: `.ai/tasks/{TICKET-ID}/qa-report.md`.

## 6. Reviewer (gate)

Set `reviewerRetryCount = 0`, `MAX_REVIEWER_RETRIES = 1`.

1. Jalankan Reviewer Agent (`.opencode/agent/reviewer.md`), tunggu hasilnya.
2. Hasil OK (`Status: APPROVE`) → lanjut ke ringkasan.
3. Hasil `REQUEST_CHANGES / NEEDS_HUMAN`:
   - Jika `reviewerRetryCount >= MAX_REVIEWER_RETRIES` → STOP, lapor NEEDS_HUMAN.
   - Jika belum → naikkan counter, jalankan ulang implementasi untuk memperbaiki temuan BLOCKING saja, lalu jalankan Reviewer lagi.

Artifact: `.ai/tasks/{TICKET-ID}/review-notes.md`.

## Berhenti Terkendali (NEEDS_HUMAN)

Jika ada gate yang budget retry-nya habis atau implementasi gagal: ini **pemberhentian terkendali**.
Tulis ringkasan akhir dengan status NEEDS_HUMAN. Kode tetap ditinggal di branch lokal.

## Verify

Sebelum menulis ringkasan akhir, konfirmasi:
- [ ] Branch aktif adalah `ai-agent/{TICKET-ID}`
- [ ] Artifact tiap stage ada di `.ai/tasks/{TICKET-ID}/`
- [ ] Tidak ada git push yang dilakukan

## Ringkasan Akhir

Tampilkan tabel status tiap stage:

```markdown
| Stage          | Status                          | Artifact |
| Planner        | SUCCESS                         | requirements.md, tasks.md |
| Architect      | SUCCESS / SKIP (alasan)         | design.md |
| Implementasi   | SUCCESS / NEEDS_HUMAN           | verify-report.md |
| Documentation  | SUCCESS / GAGAL (non-blocking) / TIDAK TERSEDIA | - |
| QA             | PASS (retry: n/1) / NEEDS_HUMAN / TIDAK DIJALANKAN | qa-report.md |
| Reviewer       | APPROVE (retry: n/1) / NEEDS_HUMAN / TIDAK DIJALANKAN | review-notes.md |
```

Tutup dengan:
> Kode ada di branch `ai-agent/{TICKET-ID}`, belum di-push. Buka PR manual kalau sudah siap — command ini sengaja tidak auto-create PR.
