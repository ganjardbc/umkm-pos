---
allowed-tools: Read, Write, Grep, Glob, Task, Bash(git status:*), Bash(git branch:*), Bash(git checkout:*), Bash(git ls-remote:*), Bash(git log:*), Bash(git diff:*), Bash(ls:*)
description: Jalankan seluruh pipeline Klaster 2 (Planner → Architect → implementasi → Documentation → QA → Reviewer) untuk satu ticket dalam satu sesi, tanpa caf-orchestrator dan tanpa buka PR
argument-hint: [TICKET-ID, contoh: "GAN-44"]
---

> DRAFT hasil caf-initiator — review dan lengkapi sebelum dipakai, terutama bagian
> yang ditandai TODO project-specific.

# Run Pipeline (Manual, Tanpa Orchestrator)

**Command ini MENULIS KODE dan MEMBUAT BRANCH.** Ini satu-satunya command hasil
caf-initiator yang melakukan keduanya — perlakukan lebih hati-hati dari command lain.

Tujuan: alternatif manual untuk project yang belum/tidak setup `caf-orchestrator`
(webhook + VPS). Alurnya sama dengan pipeline otomatis, bedanya jalan di satu sesi Claude Code
interaktif dan **berhenti setelah kode + verify selesai**.

**TIDAK membuka PR.** Tidak ada `gh pr create`, tidak ada `git push`, tidak ada status
ticket yang diubah di tracker. Semua itu tetap keputusan manusia, dilakukan manual setelah
command ini selesai. `allowed-tools` di atas sengaja tidak memuat `gh` maupun
`git push` supaya ini jadi batas yang di-enforce harness, bukan sekadar janji di teks.

Batas yang perlu diketahui: allowlist itu mengikat command ini, **bukan subagent yang
di-spawn** — subagent jalan dengan tool dari definisi agent-nya sendiri. Karena itu setiap
prompt spawn di bawah WAJIB memuat larangan push/PR secara eksplisit, dan di akhir run kamu
memverifikasi tidak ada PR/push yang terjadi.

## Ticket

Ticket ID: `$ARGUMENTS`

WAJIB diisi. Kalau kosong, tanya user ticket mana yang dimaksud dan STOP sampai dijawab —
jangan tebak.

Ambil detail ticket (title, description, acceptance criteria): kalau ada MCP tracker
terhubung (Linear/Jira/GitHub Issues), pakai itu. Kalau tidak, minta user paste detail ticket
secara manual sebelum lanjut — jangan mengarang requirement yang tidak disebutkan.

## 0. Guard — WAJIB, sebelum spawn apapun

Jalankan keempat cek ini **berurutan dan sampai tuntas** sebelum Task tool dipakai sama
sekali. Jangan spawn agent apapun "sambil menunggu jawaban user".

### 0.1 Working directory harus bersih

`git status --porcelain`. Kalau ada output (uncommitted changes) → **STOP**, tampilkan
daftarnya, minta user commit/stash dulu. Jangan checkout branch baru dengan perubahan yang
bisa ikut terbawa atau hilang.

### 0.2 Branch `ai-agent/{TICKET-ID}` sudah ada?

Cek **lokal DAN remote** — dua-duanya, jangan salah satu:

```
git branch --list ai-agent/{TICKET-ID}
git ls-remote --heads origin ai-agent/{TICKET-ID}
```

Cek remote itu bukan formalitas: `caf-orchestrator` jalan di VPS, jadi kalau dia sudah/sedang
menangani ticket ini, branch-nya muncul di **remote** dan belum tentu ada di working copy user.
Cek lokal saja akan lolos justru di kasus paling berbahaya.

Kalau repo ini tidak punya remote `origin` sama sekali (`git ls-remote` gagal dengan
"'origin' does not appear to be a git repository"), itu **bukan kegagalan guard** — repo lokal
murni memang tidak mungkin dipegang orchestrator. Catat "remote: tidak ada", lanjut dengan hasil
cek lokal saja. Jangan STOP karena ini, dan jangan pula anggap cek remote sudah lulus.

- **Tidak ada di keduanya** → lanjut ke 0.3.
- **Ada di salah satu/keduanya** → **STOP**. Ini sinyal kuat ticket ini sudah/sedang ditangani
  orchestrator atau run `/run-pipeline` sebelumnya. Tampilkan ke user:
  - `git log --oneline` branch itu (commit apa saja yang sudah ada di sana),
  - isi `.ai/tasks/{TICKET-ID}/verify-report.md` kalau ada,
  - lokal atau remote (atau dua-duanya).

  Lalu minta konfirmasi eksplisit: **lanjutkan di branch itu**, atau **batal**. JANGAN
  mengasumsikan aman untuk lanjut, dan JANGAN membuat branch baru yang menimpa. Kalau user
  memilih lanjut, `git checkout ai-agent/{TICKET-ID}` (jangan `-b`).

  **Limitasi yang harus kamu sampaikan ke user di titik ini:** orchestrator yang baru mulai
  dan belum sempat push branch TIDAK terdeteksi cek ini. Kalau user tahu pipeline otomatis
  sedang jalan untuk ticket ini, batalkan — apapun hasil cek di atas.

### 0.3 Sudah pernah selesai?

Cek `.ai/tasks/{TICKET-ID}/verify-report.md`.

Kalau file itu ada dan status-nya **bukan** `NEEDS_HUMAN` → **STOP**. Ticket ini kemungkinan
sudah pernah dikerjakan sampai selesai. Tampilkan isi ringkasnya, tanya user: **ulang dari awal
(override)** atau **batal**. Jangan diam-diam menimpa kerja yang sudah selesai.

Sengaja dirumuskan sebagai "bukan NEEDS_HUMAN", bukan "sama dengan SUCCESS": label sukses di
`verify-report.md` tidak seragam antar sumber (CAF.md menyebut `SUCCESS`, template handoff
menyebut `PASS`, dan agent di lapangan kadang menulis `DONE`). Yang konsisten cuma
`NEEDS_HUMAN` sebagai penanda belum selesai. Mencocokkan string `SUCCESS` persis akan
membuat guard ini diam-diam tidak pernah aktif — persis kegagalan yang mau dicegah.

Kalau status-nya `NEEDS_HUMAN`, jangan STOP: ticket ini memang ditinggal belum selesai.
Sebutkan ke user bahwa run ini melanjutkan pekerjaan yang sebelumnya berhenti, lalu lanjut.

### 0.4 Buat branch

Baru setelah 0.1-0.3 lolos: `git checkout -b ai-agent/{TICKET-ID}` dari branch aktif
sekarang. Kalau user sudah memilih "lanjutkan" di 0.2, branch-nya sudah ke-checkout — lewati
langkah ini.

## 1. Planner (wajib)

Spawn Planner. Sumber kebenaran perannya `.claude/agents/planner.md` — baca file itu dan patuhi
isinya. Input: detail ticket dari section Ticket di atas.

Output wajib: `.ai/tasks/{TICKET-ID}/requirements.md` dan `.ai/tasks/{TICKET-ID}/tasks.md`.

Kalau Planner melaporkan ticket terlalu ambigu untuk di-breakdown, **STOP seluruh pipeline** —
lapor ke user dan minta klarifikasi ticket. Jangan lanjut ke implementasi dengan rencana yang
Planner sendiri bilang tidak yakin.

## 2. Architect (kondisional)

Stage ini **kondisional** — jangan selalu di-spawn.

Spawn Architect (`.claude/agents/architect.md`) HANYA kalau salah satu benar:

- `tasks.md` dari Planner secara eksplisit menyebut butuh keputusan arsitektur/desain, ATAU
- task menyentuh lebih dari satu app/service, ATAU melibatkan schema/migration baru.

Kalau ticket-nya sederhana dan single-app, **skip** — lanjut ke stage 3. Membuat `design.md`
untuk task yang tidak membutuhkannya cuma menambah biaya run dan dokumen yang tidak dibaca
siapa-siapa.

Output: `.ai/tasks/{TICKET-ID}/design.md`. Kalau di-skip, catat di ringkasan akhir bahwa
stage ini dilewati beserta alasannya — jangan diam-diam hilang dari laporan.

## 3. Implementasi

Agent implementasi yang tersedia di project ini:

- `frontend` (`.claude/agents/frontend.md`)
- `backend` (`.claude/agents/backend.md`)

**Cara memilih agent mana yang di-spawn** (keputusan ini JANGAN ditebak):

1. Baca kolom app/module tiap task di `tasks.md`.
2. Cocokkan dengan scope tiap agent di atas — baca `## Scope` di file agent-nya, jangan
   menebak dari namanya.
3. Task yang app/module-nya cocok dengan scope satu agent → agent itu yang mengerjakan.
4. Kalau ada task yang tidak cocok dengan scope agent manapun, ATAU cocok dengan lebih dari
   satu, **tanya user** agent mana yang harus mengerjakannya dan STOP sampai dijawab.
   Salah routing berarti agent menulis kode di luar scope-nya — itu kegagalan senyap yang baru
   ketahuan saat review.
5. Agent yang tidak punya task sama sekali: JANGAN di-spawn. Bukan kegagalan — memang tidak
   ada kerjaan untuknya di ticket ini.

Kalau ada beberapa agent yang kebagian task, jalankan **berurutan, bukan paralel** — keduanya
menulis ke working tree yang sama. Urutan mengikuti dependency antar task di `tasks.md`.

Input tiap agent: `requirements.md`, `tasks.md`, dan `design.md` kalau stage 2 jalan.

Setiap prompt spawn WAJIB memuat, apa adanya:

> Jangan `git push`, jangan buat PR, jangan ubah status ticket di tracker. Tulis kode dan
> `verify-report.md` saja, di branch yang sudah aktif.

**PIV internal adalah urusan agent itu sendiri.** Agent implementasi sudah punya Retry Logic
sendiri (implement → verify → perbaiki, max 3x) di definisinya. Kamu **TIDAK** boleh
men-spawn ulang agent implementasi hanya karena verify-nya gagal — itu membuat budget retry
efektif jadi berlipat. Satu-satunya jalur spawn ulang adalah retry gate di stage 5 dan 6.

Kalau agent selesai dengan `verify-report.md` `Status: NEEDS_HUMAN`:
**STOP seluruh pipeline di sini.** Jangan lanjut ke Documentation/QA/Reviewer dengan kode yang
verify-nya belum lulus — semua stage sesudahnya akan menghasilkan laporan tentang kode yang
sudah diketahui bermasalah, dan itu buang biaya.

## 4. Documentation (non-blocking)

Spawn Documentation (`.claude/agents/documentation.md`) untuk memperbarui dokumentasi sesuai
perubahan yang sudah ditulis.

**Stage ini NON-BLOCKING.** Sesuai desain CAF, Documentation bukan gate: kalau agent ini gagal,
menolak, atau menyimpulkan tidak ada dokumentasi yang perlu diubah — **jangan hentikan
pipeline**. Catat hasilnya sebagai satu baris di ringkasan akhir dan lanjut ke stage QA.

Jangan retry stage ini. Tidak ada budget retry untuk stage non-blocking.

## 5. QA (gate)

**Gate — `qaRetryCount`, `MAX_QA_RETRIES = 1`.**

Set `qaRetryCount = 0` di awal run ini. Counter ini **fresh tiap kali `/run-pipeline`
dijalankan** dan **independen** dari counter gate lain — budget yang habis di satu gate TIDAK
mengurangi budget gate lainnya. Jangan perlakukan sebagai budget bersama.

Alur:

1. Spawn QA (`.claude/agents/qa.md`), tunggu hasilnya.
2. Hasil OK → lanjut ke stage berikutnya.
3. Hasil `NEEDS_HUMAN / ada CRITICAL issue`:
   - Kalau `qaRetryCount >= MAX_QA_RETRIES` → **STOP di sini**, lapor NEEDS_HUMAN (lihat
     "Berhenti Terkendali" di bawah).
   - Kalau belum → naikkan `qaRetryCount` sebanyak 1 dari nilai sebelumnya, lalu
     **spawn ulang agent implementasi** yang relevan dengan `qa-report.md` sebagai input, minta
     perbaiki temuannya saja (bukan mengulang implementasi dari nol). Setelah perbaikan
     selesai, jalankan gate ini **sekali lagi**, kembali ke langkah 1.
4. Budget habis (`qaRetryCount >= MAX_QA_RETRIES`) dan gate masih gagal → STOP, NEEDS_HUMAN.

Retry berarti **perbaiki lalu periksa ulang** — bukan menjalankan gate dua kali atas kode yang
persis sama. Menjalankan ulang gate tanpa ada yang berubah cuma membakar biaya untuk hasil yang
sudah pasti sama.

Issue `NON-CRITICAL` yang ditemukan QA TIDAK menggagalkan gate — itu memang niatnya, bukan
celah yang belum kepikiran. Kalau QA menutup dengan `## Status: PASS` sementara section
`### NON-CRITICAL` di `qa-report.md` terisi, perlakukan sebagai "Hasil OK" dan lanjut ke
stage berikutnya. Temuan itu tetap tercatat di `qa-report.md` untuk ditindaklanjuti
terpisah — di luar retry loop ini. Yang memicu retry gate hanya `## Status: NEEDS_HUMAN`
atau adanya isi di section `### CRITICAL`.

Artifact: `.ai/tasks/{TICKET-ID}/qa-report.md`.

## 6. Reviewer (gate)

**Gate — `reviewerRetryCount`, `MAX_REVIEWER_RETRIES = 1`.**

Set `reviewerRetryCount = 0` di awal run ini. Counter ini **fresh tiap kali `/run-pipeline`
dijalankan** dan **independen** dari counter gate lain — budget yang habis di satu gate TIDAK
mengurangi budget gate lainnya. Jangan perlakukan sebagai budget bersama.

Alur:

1. Spawn Reviewer (`.claude/agents/reviewer.md`), tunggu hasilnya.
2. Hasil OK → lanjut ke stage berikutnya.
3. Hasil `REQUEST_CHANGES / NEEDS_HUMAN`:
   - Kalau `reviewerRetryCount >= MAX_REVIEWER_RETRIES` → **STOP di sini**, lapor NEEDS_HUMAN (lihat
     "Berhenti Terkendali" di bawah).
   - Kalau belum → naikkan `reviewerRetryCount` sebanyak 1 dari nilai sebelumnya, lalu
     **spawn ulang agent implementasi** yang relevan dengan `review-notes.md` (temuan BLOCKING saja) sebagai input, minta
     perbaiki temuannya saja (bukan mengulang implementasi dari nol). Setelah perbaikan
     selesai, jalankan gate ini **sekali lagi**, kembali ke langkah 1.
4. Budget habis (`reviewerRetryCount >= MAX_REVIEWER_RETRIES`) dan gate masih gagal → STOP, NEEDS_HUMAN.

Retry berarti **perbaiki lalu periksa ulang** — bukan menjalankan gate dua kali atas kode yang
persis sama. Menjalankan ulang gate tanpa ada yang berubah cuma membakar biaya untuk hasil yang
sudah pasti sama.

Artifact: `.ai/tasks/{TICKET-ID}/review-notes.md`.

Tegasnya: `reviewerRetryCount` **tidak terpengaruh** oleh apa yang terjadi di stage QA.
Ticket yang QA-nya lulus setelah retry tetap masuk stage ini dengan budget penuh 1x.

## Berhenti Terkendali (NEEDS_HUMAN)

Kalau ada gate yang budget-nya habis, atau implementasi berakhir NEEDS_HUMAN: itu
**pemberhentian terkendali, bukan error**. Jangan lempar exception, jangan bikin command
kelihatan "crash", jangan coba jalur alternatif yang tidak diinstruksikan di sini.

Yang dilakukan: berhenti di stage itu, lanjut langsung ke Ringkasan Akhir dengan status
NEEDS_HUMAN dan sebutkan stage mana yang menghentikannya + temuan apa yang belum selesai.
Kode yang sudah ditulis tetap ditinggal di branch — jangan di-revert, jangan dihapus. Manusia
yang memutuskan lanjut atau buang.

## Verify

Sebelum menulis ringkasan akhir, konfirmasi dengan Bash/Read — bukan dari ingatan alur:

- [ ] Branch aktif sekarang memang `ai-agent/{TICKET-ID}` (`git branch --show-current`)
- [ ] Artifact tiap stage yang jalan benar-benar ada di `.ai/tasks/{TICKET-ID}/`
- [ ] **Tidak ada push** — `git status -sb`: baris pertama tidak boleh menyebut upstream
      (`...origin/ai-agent/{TICKET-ID}`) untuk branch yang baru dibuat run ini. Jangan pakai
      `git log origin/<branch>..HEAD` untuk cek ini: kalau branch memang belum pernah
      di-push, ref itu tidak ada dan command-nya error, bukan memberi jawaban.
- [ ] Kalau ternyata ada yang ter-push oleh subagent, **laporkan ke user secara menonjol** di
      ringkasan akhir — itu pelanggaran kontrak command ini, bukan detail kecil.

## Ringkasan Akhir

Tampilkan tabel status tiap stage:

```
| Stage          | Status                          | Artifact |
| Planner        | SUCCESS                         | requirements.md, tasks.md |
| Architect      | SUCCESS / SKIP (alasan)         | design.md |
| Implementasi   | SUCCESS / NEEDS_HUMAN           | verify-report.md |
| Documentation  | SUCCESS / GAGAL (non-blocking) / TIDAK TERSEDIA | - |
| QA             | PASS (retry: n/1) / NEEDS_HUMAN / TIDAK DIJALANKAN (stage sebelumnya berhenti) | qa-report.md |
| Reviewer       | APPROVE (retry: n/1) / NEEDS_HUMAN / TIDAK DIJALANKAN (stage sebelumnya berhenti) | review-notes.md |
```

Stage yang **tidak pernah dipanggil** karena pipeline sudah berhenti sebelum sampai ke sana
(mis. QA exhausted → Reviewer tidak pernah di-spawn) diisi `TIDAK DIJALANKAN (stage
sebelumnya berhenti)`. **Jangan pernah** mengisi `NEEDS_HUMAN` untuk stage yang tidak
pernah dieksekusi — itu menyiratkan stage-nya jalan dan menemukan masalah, padahal tidak.
Artifact-nya juga tidak ada, jadi tulis `-` di kolom Artifact.

Sebutkan `qaRetryCount` dan `reviewerRetryCount` akhir apa adanya — itu yang memberi tahu
user seberapa mulus run ini berjalan.

Tutup dengan, apa adanya:

> Kode ada di branch `ai-agent/{TICKET-ID}`, belum di-push. Buka PR manual kalau sudah siap —
> command ini sengaja tidak auto-create PR.
