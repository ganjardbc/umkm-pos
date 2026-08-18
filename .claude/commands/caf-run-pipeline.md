---
allowed-tools: Read, Write, Grep, Glob, Task, Bash(git status:*), Bash(git branch:*), Bash(git checkout:*), Bash(git ls-remote:*), Bash(git log:*), Bash(git diff:*), Bash(git add:*), Bash(git commit:*), Bash(git fetch:*), Bash(git merge-base:*), Bash(git push:*), Bash(git show:*), Bash(gh pr create:*), Bash(gh pr list:*), Bash(gh repo view:*), Bash(ls:*)
description: Jalankan seluruh pipeline Klaster 2 (Planner → Architect → implementasi → Documentation → QA → Reviewer) untuk satu ticket dalam satu sesi, tanpa caf-orchestrator — auto-commit/push/PR saat SUCCESS, tanpa commit saat NEEDS_HUMAN
argument-hint: [TICKET-ID, contoh: "GAN-44"]
---

> DRAFT hasil caf-initiator — review dan lengkapi sebelum dipakai, terutama bagian
> yang ditandai TODO project-specific.

# Run Pipeline (Manual, Tanpa Orchestrator)

**Command ini MENULIS KODE dan MEMBUAT BRANCH.** Ini satu-satunya command hasil
caf-initiator yang melakukan keduanya — perlakukan lebih hati-hati dari command lain.

Tujuan: alternatif manual untuk project yang belum/tidak setup `caf-orchestrator`
(webhook + VPS). Alurnya sama dengan pipeline otomatis, termasuk **auto-commit, auto-push, dan
auto `gh pr create`** setelah Reviewer APPROVE — lihat section 7. Tidak ada status ticket yang
diubah di tracker (itu tetap manual); yang otomatis cuma git + PR.

**Kalau berhenti NEEDS_HUMAN** (implementasi, gate QA, atau gate Reviewer): TIDAK ADA commit,
push, atau PR sama sekali — working tree ditinggal apa adanya di branch `ai-agent/{TICKET-ID}`
untuk manusia. Lihat "Berhenti Terkendali" di bawah.

Batas yang perlu diketahui: allowlist `allowed-tools` di atas mengikat command ini (MAIN
THREAD), **bukan subagent yang di-spawn** — subagent jalan dengan tool dari definisi agent-nya
sendiri. Karena itu setiap prompt spawn di bawah WAJIB memuat larangan push/PR secara eksplisit
("itu tugas main thread di section 7, bukan tugas kamu") — commit/push/PR HANYA boleh terjadi
sekali, di section 7, dilakukan main thread setelah semua gate lulus.

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
  orchestrator atau run `/caf-run-pipeline` sebelumnya. Tampilkan ke user:
  - `git log --oneline` branch itu (commit apa saja yang sudah ada di sana),
  - isi `.caf/tasks/{TICKET-ID}/verify-report.md` kalau ada,
  - lokal atau remote (atau dua-duanya).

  Lalu minta konfirmasi eksplisit: **lanjutkan di branch itu**, atau **batal**. JANGAN
  mengasumsikan aman untuk lanjut, dan JANGAN membuat branch baru yang menimpa. Kalau user
  memilih lanjut, `git checkout ai-agent/{TICKET-ID}` (jangan `-b`).

  **Limitasi yang harus kamu sampaikan ke user di titik ini:** orchestrator yang baru mulai
  dan belum sempat push branch TIDAK terdeteksi cek ini. Kalau user tahu pipeline otomatis
  sedang jalan untuk ticket ini, batalkan — apapun hasil cek di atas.

### 0.3 Sudah pernah selesai?

Cek `.caf/tasks/{TICKET-ID}/verify-report.md`.

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

Spawn Planner. Sumber kebenaran perannya `.claude/agents/caf-planner.md` — baca file itu dan patuhi
isinya. Input: detail ticket dari section Ticket di atas.

Output wajib: `.caf/tasks/{TICKET-ID}/requirements.md` dan `.caf/tasks/{TICKET-ID}/tasks.md`.

Kalau Planner melaporkan ticket terlalu ambigu untuk di-breakdown, **STOP seluruh pipeline** —
lapor ke user dan minta klarifikasi ticket. Jangan lanjut ke implementasi dengan rencana yang
Planner sendiri bilang tidak yakin.

## 2. Architect (kondisional)

Stage ini **kondisional** — jangan selalu di-spawn.

Spawn Architect (`.claude/agents/caf-architect.md`) HANYA kalau salah satu benar:

- `tasks.md` dari Planner secara eksplisit menyebut butuh keputusan arsitektur/desain, ATAU
- task menyentuh lebih dari satu app/service, ATAU melibatkan schema/migration baru.

Kalau ticket-nya sederhana dan single-app, **skip** — lanjut ke stage 3. Membuat `design.md`
untuk task yang tidak membutuhkannya cuma menambah biaya run dan dokumen yang tidak dibaca
siapa-siapa.

Output: `.caf/tasks/{TICKET-ID}/design.md`. Kalau di-skip, catat di ringkasan akhir bahwa
stage ini dilewati beserta alasannya — jangan diam-diam hilang dari laporan.

## 3. Implementasi

Agent implementasi yang tersedia di project ini:

- `caf-frontend` (`.claude/agents/caf-frontend.md`)
- `caf-backend` (`.claude/agents/caf-backend.md`)

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

> Jangan `git push`, jangan buat PR, jangan ubah status ticket di tracker — itu tugas main thread di section 7, bukan tugas kamu. Tulis kode dan
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

Spawn Documentation (`.claude/agents/caf-documentation.md`) untuk memperbarui dokumentasi sesuai
perubahan yang sudah ditulis.

Prompt spawn WAJIB memuat, apa adanya:

> Jangan `git push`, jangan buat PR, jangan ubah status ticket di tracker — itu tugas main thread di section 7, bukan tugas kamu.

**Stage ini NON-BLOCKING.** Sesuai desain CAF, Documentation bukan gate: kalau agent ini gagal,
menolak, atau menyimpulkan tidak ada dokumentasi yang perlu diubah — **jangan hentikan
pipeline**. Catat hasilnya sebagai satu baris di ringkasan akhir dan lanjut ke stage QA.

Jangan retry stage ini. Tidak ada budget retry untuk stage non-blocking.

## 5. QA (gate)

Prompt spawn QA (`.claude/agents/caf-qa.md`) WAJIB memuat, apa adanya:

> Jangan `git push`, jangan buat PR, jangan ubah status ticket di tracker — itu tugas main thread di section 7, bukan tugas kamu.

**Gate — `qaRetryCount`, `MAX_QA_RETRIES = 1`.**

Set `qaRetryCount = 0` di awal run ini. Counter ini **fresh tiap kali `/caf-run-pipeline`
dijalankan** dan **independen** dari counter gate lain — budget yang habis di satu gate TIDAK
mengurangi budget gate lainnya. Jangan perlakukan sebagai budget bersama.

Alur:

1. Spawn QA (`.claude/agents/caf-qa.md`), tunggu hasilnya.
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

Artifact: `.caf/tasks/{TICKET-ID}/qa-report.md`.

## 6. Reviewer (gate)

Prompt spawn Reviewer (`.claude/agents/caf-reviewer.md`) WAJIB memuat, apa adanya:

> Jangan `git push`, jangan buat PR, jangan ubah status ticket di tracker — itu tugas main thread di section 7, bukan tugas kamu.

**Gate — `reviewerRetryCount`, `MAX_REVIEWER_RETRIES = 1`.**

Set `reviewerRetryCount = 0` di awal run ini. Counter ini **fresh tiap kali `/caf-run-pipeline`
dijalankan** dan **independen** dari counter gate lain — budget yang habis di satu gate TIDAK
mengurangi budget gate lainnya. Jangan perlakukan sebagai budget bersama.

Alur:

1. Spawn Reviewer (`.claude/agents/caf-reviewer.md`), tunggu hasilnya.
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

Artifact: `.caf/tasks/{TICKET-ID}/review-notes.md`.

Tegasnya: `reviewerRetryCount` **tidak terpengaruh** oleh apa yang terjadi di stage QA.
Ticket yang QA-nya lulus setelah retry tetap masuk stage ini dengan budget penuh 1x.

## 7. Commit, Push, PR (SUCCESS)

**Stage ini HANYA dijalankan kalau Reviewer APPROVE.** Kalau pipeline berhenti di stage
manapun sebelum ini (implementasi NEEDS_HUMAN, gate QA/Reviewer exhausted), **lewati seluruh
section ini** dan langsung ke "Berhenti Terkendali" di bawah — jangan commit apapun.

Jalankan ketujuh langkah ini **berurutan**. Tiap langkah dengan kondisi STOP wajib berhenti di
situ, tidak lanjut ke langkah berikutnya — commit yang scope-nya salah atau push yang menabrak
branch remote tidak bisa gampang dibatalkan setelah terjadi.

### 7.1 Whitelist scope

Path yang boleh masuk commit (HANYA ini, bukan seluruh working tree):

- `.caf/tasks/{TICKET-ID}/` (artifact)
- `caf-frontend`: `apps/web/`
- `caf-backend`: `apps/api/`
- `caf-documentation`: `README.md`
- `caf-documentation`: `CHANGELOG.md`
- `caf-documentation`: `docs/`

`docs/` di-whitelist sebagai satu folder utuh (bukan subpath spesifik) karena Documentation
agent tidak punya scope path granular — ini berarti scope-check di 7.1 tidak bisa membedakan
tulisan Documentation agent dari file lain yang kebetulan ditulis ke `docs/` oleh proses lain
di run yang sama.

`git status --porcelain` → cocokkan **setiap** path yang berubah ke whitelist di atas.

Ada path yang berubah TAPI tidak masuk whitelist manapun → **STOP, JANGAN commit apapun**.
Tampilkan daftar path mencurigakan ke user, jelaskan ini kemungkinan file di luar scope agent
yang ditugaskan (bug atau scope creep di subagent). Minta user putuskan manual — lanjut commit
sendiri setelah verifikasi, atau investigasi dulu. Di Ringkasan Akhir, catat status sebagai
"SUCCESS tapi commit dibatalkan — scope drift terdeteksi", bukan status SUCCESS polos.

### 7.2 Commit

`git add --` diikuti daftar path eksplisit dari 7.1 yang benar-benar berubah (**bukan**
`git add -A`), lalu:

```
git commit -m "AI agent pipeline: {TICKET-ID}"
```

Tanpa `--allow-empty`. Kalau commit gagal karena tidak ada apapun untuk di-commit ("nothing
to commit") — itu sinyal aneh (implementasi dilaporkan selesai tapi tidak ada diff sama
sekali) → **STOP**, laporkan ke user, jangan lanjut ke push/PR.

### 7.3 Guard — fetch sebelum push

```
git fetch origin ai-agent/{TICKET-ID}
```

Kalau fetch gagal karena branch belum ada di remote sama sekali, itu bukan kegagalan guard —
lanjut anggap "remote belum ada" (langkah berikutnya).

- **Remote belum ada** → aman, lanjut ke 7.4.
- **Remote ada**, dan `git merge-base --is-ancestor origin/ai-agent/{TICKET-ID} HEAD`
  sukses (exit 0) → SHA remote adalah ancestor HEAD lokal, aman, lanjut ke 7.4.
- **Remote ada**, dan `git merge-base --is-ancestor` gagal (exit != 0) → SHA remote BUKAN
  ancestor HEAD lokal. **STOP sebelum push.** Ini sinyal branch remote sudah diubah pihak lain
  (orchestrator, atau run `/caf-run-pipeline` lain) sejak guard 0.2 dijalankan di awal command
  ini. Tampilkan ke user: SHA remote, `git log --oneline` branch remote itu, dan commit lokal
  yang baru dibuat di 7.2 (masih ada di working tree, belum ter-push). **JANGAN force-push,
  JANGAN merge/rebase otomatis** — itu keputusan manusia.

**Keterbatasan yang harus disampaikan ke user di titik ini**: ini best-effort, bukan jaminan
absolut — race condition antara fetch-check ini dan push di 7.4 tetap mungkin (window kecil,
tapi ada) kalau pihak lain push persis di antara dua langkah itu. Tidak ada lock terdistribusi
yang tersedia dari sisi command ini untuk menutup celah itu sepenuhnya — sama pola limitasi
dengan guard 0.2.

### 7.4 Push

```
git push --set-upstream origin ai-agent/{TICKET-ID}
```

### 7.5 Deteksi base branch

```
gh repo view --json defaultBranchRef --jq .defaultBranchRef.name
```

Simpan hasilnya sebagai `{BASE-BRANCH}`. **Jangan hardcode `main`** — repo target bisa
pakai `master`, `develop`, atau nama lain.

### 7.6 Cek PR existing (idempotensi)

```
gh pr list --head ai-agent/{TICKET-ID} --state open --json url,number
```

- **Ada hasil** → PR untuk branch ini sudah ada (mis. dibuka manual user setelah run
  NEEDS_HUMAN sebelumnya, sekarang run lanjutan berhasil SUCCESS). **Jangan** panggil
  `gh pr create` — push di 7.4 sudah cukup untuk update branch yang mendasari PR itu. Ambil
  URL dari hasil `gh pr list`, catat untuk Ringkasan Akhir sebagai "PR sudah ada, branch sudah
  diupdate" — bukan error.
- **Kosong** → lanjut ke 7.7.

### 7.7 `gh pr create`

Title:
```
{TICKET-ID}: {judul ticket dari section Ticket}
```

Body — struktur identik `buildPrBody` di caf-orchestrator (`run-agent-pipeline.use-case.ts`),
supaya dua jalur eksekusi menghasilkan bentuk PR yang sama:

```
Ticket: {TICKET-ID}
{deskripsi ticket dari section Ticket}

## Reports
- Requirements: `.caf/tasks/{TICKET-ID}/requirements.md`
- Verify: `.caf/tasks/{TICKET-ID}/verify-report.md`
- QA: `.caf/tasks/{TICKET-ID}/qa-report.md`
- Review: `.caf/tasks/{TICKET-ID}/review-notes.md`

{docsNote — status Documentation dari stage 4: SUCCESS / GAGAL (non-blocking) / TIDAK TERSEDIA,
kalimat setara yang sudah dipakai di Ringkasan Akhir}

{isi mentah qa-report.md}

{isi mentah review-notes.md}
```

Tidak ada blok peringatan skip-gate (`qualityGateWarning` di orchestrator) — command ini tidak
punya fitur skip QA/Reviewer, jadi tidak applicable.

Base: `{BASE-BRANCH}` dari 7.5. Simpan URL hasil `gh pr create` untuk Ringkasan Akhir.

## Berhenti Terkendali (NEEDS_HUMAN)

Kalau ada gate yang budget-nya habis, atau implementasi berakhir NEEDS_HUMAN: itu
**pemberhentian terkendali, bukan error**. Jangan lempar exception, jangan bikin command
kelihatan "crash", jangan coba jalur alternatif yang tidak diinstruksikan di sini.

Yang dilakukan: berhenti di stage itu, lanjut langsung ke Ringkasan Akhir dengan status
NEEDS_HUMAN dan sebutkan stage mana yang menghentikannya + temuan apa yang belum selesai.
Kode yang sudah ditulis tetap ditinggal di branch — jangan di-revert, jangan dihapus. Manusia
yang memutuskan lanjut atau buang.

**Tegas: jalur NEEDS_HUMAN tidak pernah mencapai section 7.** Tidak ada commit, push, atau PR
sama sekali di jalur ini — working tree ditinggal persis seperti kondisi terakhir stage yang
menghentikan pipeline. Ini bukan perilaku baru (sudah tersirat dari struktur stop/`return` di
tiap gate), ditulis eksplisit di sini supaya tidak ambigu.

## Verify

Sebelum menulis ringkasan akhir, konfirmasi dengan Bash/Read — bukan dari ingatan alur.

**Kalau run berakhir NEEDS_HUMAN:**

- [ ] Branch aktif sekarang memang `ai-agent/{TICKET-ID}` (`git branch --show-current`)
- [ ] Artifact tiap stage yang jalan benar-benar ada di `.caf/tasks/{TICKET-ID}/`
- [ ] **Tidak ada push** — `git status -sb`: baris pertama tidak boleh menyebut upstream
      (`...origin/ai-agent/{TICKET-ID}`) untuk branch yang baru dibuat run ini. Jangan pakai
      `git log origin/<branch>..HEAD` untuk cek ini: kalau branch memang belum pernah
      di-push, ref itu tidak ada dan command-nya error, bukan memberi jawaban.
- [ ] Kalau ternyata ada yang ter-push oleh subagent, **laporkan ke user secara menonjol** di
      ringkasan akhir — itu pelanggaran kontrak command ini, bukan detail kecil.

**Kalau run berakhir SUCCESS (section 7 jalan):**

- [ ] Branch aktif sekarang memang `ai-agent/{TICKET-ID}`
- [ ] Push memang terjadi — `git status -sb` menyebut upstream `origin/ai-agent/{TICKET-ID}`
- [ ] PR ada — baru dibuat di 7.7 ATAU existing terdeteksi di 7.6, URL-nya benar dan bisa
      diakses
- [ ] `git show --stat HEAD` — tiap path di commit terakhir memang masuk whitelist 7.1, tidak
      ada file di luar scope yang ikut ter-commit
- [ ] Kalau ternyata ada file di luar whitelist yang lolos ke commit, **laporkan ke user secara
      menonjol** di ringkasan akhir — itu pelanggaran kontrak scope command ini.

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
| Commit/Push/PR | SUCCESS (PR baru/existing) / DIBATALKAN (scope drift) / TIDAK DIJALANKAN (stage sebelumnya berhenti) | commit + URL PR |
```

Stage yang **tidak pernah dipanggil** karena pipeline sudah berhenti sebelum sampai ke sana
(mis. QA exhausted → Reviewer tidak pernah di-spawn) diisi `TIDAK DIJALANKAN (stage
sebelumnya berhenti)`. **Jangan pernah** mengisi `NEEDS_HUMAN` untuk stage yang tidak
pernah dieksekusi — itu menyiratkan stage-nya jalan dan menemukan masalah, padahal tidak.
Artifact-nya juga tidak ada, jadi tulis `-` di kolom Artifact.

Sebutkan `qaRetryCount` dan `reviewerRetryCount` akhir apa adanya — itu yang memberi tahu
user seberapa mulus run ini berjalan.

Tutup dengan, sesuai status akhir:

**SUCCESS** (section 7 selesai):

> Kode di-commit, push ke `ai-agent/{TICKET-ID}`, PR: {URL PR dari 7.6/7.7}.

**NEEDS_HUMAN**:

> Kode ada di branch `ai-agent/{TICKET-ID}`, belum di-commit/push. Lanjutkan atau perbaiki
> manual, lalu jalankan ulang `/caf-run-pipeline {TICKET-ID}` kalau sudah siap — guard 0.2/0.3
> di atas akan mendeteksi branch/artifact yang sudah ada dan menawarkan lanjut dari situ.
