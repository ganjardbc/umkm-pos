---
allowed-tools: Read, Grep, Glob, Task, Bash(git branch:*), Bash(gh pr list:*), Bash(gh pr view:*), Bash(gh repo view:*), Bash(gh api:*)
description: Fetch comment reviewer manusia di satu PR, biarkan user pilih scoped/global fix, spawn caf-reviewer.md untuk menilai, lalu reply balik ke GitHub
argument-hint: [PR-number, contoh: "81"]
---

> DRAFT hasil caf-initiator — review dan lengkapi sebelum dipakai, terutama bagian
> yang ditandai TODO project-specific.

# Fix Review (Post-PR, Interactive)

**Command ini MEMBALAS PR ORANG LAIN DI GITHUB.** Efek sampingnya nyata dan publik — reply ke
comment review + satu comment ringkasan baru. Ini bukan preview read-only seperti
`/caf-review-ticket` — jalankan hanya kalau memang berniat merespons comment review sekarang.

Tujuan: jalur interactive untuk mode post-PR Reviewer Agent — reaktif terhadap comment reviewer
manusia di PR yang sudah dibuka, beda dari `caf-reviewer` (`.claude/agents/caf-reviewer.md`) mode
pre-PR (gate wajib di pipeline, dipicu otomatis, tidak menerima comment manusia sebagai input).

## 0. Permission Check (WAJIB, sebelum langkah apapun di bawah)

`gh api repos/{owner}/{repo}/collaborators/{username}/permission --jq .permission`

`{username}` adalah user yang menjalankan command ini — ambil dari `gh api user --jq .login`.

Hasil BUKAN salah satu dari `write`, `maintain`, `admin` → **STOP, jangan proses
apapun setelah ini.** TIDAK ada pesan error ke user, TIDAK ada comment/reply ke GitHub — command
berhenti diam-diam, cukup catat internal (mis. satu baris log kalau ada mekanismenya) kalau perlu
jejak audit. Ini bukan bug, ini desain: whitelist trigger CAF-PRREVIEW-01 sengaja tidak membocorkan
ke pihak luar bahwa command ini pernah dipanggil oleh user yang tidak diotorisasi.

(Threshold ini dirujuk ke satu sumber: `.ai/tasks/CAF-PRREVIEW-01/plan.md` §5 — kalau
threshold berubah, update di sana dulu, lalu di sini DAN di sisi webhook caf-orchestrator
Checkpoint B. JANGAN update salah satu sisi saja.)

## 0.5 Resolusi PR Number

Argument `$ARGUMENTS` adalah **PR number** (mis. `81`), **BUKAN TICKET-ID** — beda dari
command lain hasil caf-initiator yang argumennya TICKET-ID. Jangan tertukar.

**`$ARGUMENTS` terisi** → pakai langsung sebagai PR number, lanjut ke resolusi TICKET-ID di
bawah.

**`$ARGUMENTS` kosong** → auto-detect dari branch aktif:

```
git branch --show-current
```

- Match pattern `ai-agent/{TICKET-ID}` → cari PR-nya:
  ```
  gh pr list --head ai-agent/{TICKET-ID} --json number,url
  ```
  (pola sama persis dengan pengecekan idempotensi PR di `/caf-run-pipeline` — reuse command
  `gh`-nya, jangan tulis ulang logic-nya sendiri.)
  - Ketemu satu PR → pakai number-nya, lanjut.
  - Tidak ketemu PR untuk branch itu → tanya user PR number-nya langsung, **STOP** sampai
    dijawab. Jangan menebak.
- Branch aktif TIDAK match pattern `ai-agent/*` → tanya user PR number-nya langsung, **STOP**
  sampai dijawab.

**Resolusi TICKET-ID** (dibutuhkan untuk path `.caf/tasks/{TICKET-ID}/fix-review-log.md` —
lihat langkah 4), di-DERIVE dari PR yang sudah resolve di atas, **bukan dideteksi ulang secara
terpisah**:

```
gh pr view {number} --json headRefName
```

Parse pattern `ai-agent/{TICKET-ID}` dari `headRefName` hasilnya.

- Match → itu TICKET-ID-nya.
- PR-nya BUKAN dari branch pattern itu (PR manual, bukan hasil `/caf-run-pipeline` atau
  caf-orchestrator) → tanya user TICKET-ID-nya manual, **STOP** sampai dijawab. Jangan
  mengarang TICKET-ID dari nama branch yang tidak jelas polanya.

Simpan hasil resolusi sebagai `{owner}`, `{repo}` (dari `gh repo view --json owner,name`
— command ini jalan di dalam repo yang sudah di-clone dengan remote GitHub, jadi `gh repo
view` sendiri cukup, tidak perlu fallback `git remote`), `{number}`, dan `{TICKET-ID}` —
dipakai di semua langkah berikutnya.

## 1. Fetch Comment

Pakai `{owner}/{repo}/{number}` hasil resolusi 0.5. Ambil DUA sumber, gabungkan:

```
gh api repos/{owner}/{repo}/pulls/{number}/comments
gh api repos/{owner}/{repo}/issues/{number}/comments
```

- Hasil pertama = comment **INLINE** (terikat ke `path`+`line`, punya field
  `in_reply_to_id` — `null` untuk comment awal thread, terisi ID comment induk untuk reply).
- Hasil kedua = comment **GENERAL** (percakapan umum tab Conversation, tidak punya struktur
  reply sama sekali).

Label eksplisit tiap comment di data yang kamu kumpulkan: `[INLINE {path}:{line}]` atau
`[GENERAL]` — dipakai langkah 2.

## 2. Tampilkan Daftar

Kelompokkan dulu sebelum ditampilkan ke user — **grouping per-thread khusus untuk INLINE**:

- Comment INLINE dengan `in_reply_to_id == null` → satu ENTRY bernomor (thread-starter).
  Reply-reply ke thread yang sama (`in_reply_to_id` terisi ID comment ini) **TIDAK** jadi
  entry bernomor terpisah — tampilkan ter-indent/quote di bawah thread-starter-nya, urut
  kronologis, mis.:
  ```
  [3] INLINE apps/api/src/health/health.controller.ts:7
      "The route is defined as ... consider ..."
      ↳ reply: "Fixed in 0b786fe."
  ```
  User cuma pilih **satu nomor per thread**, bukan per comment.
- Comment GENERAL tidak punya struktur reply — tetap satu entry per comment apa adanya, tidak
  ada grouping yang applicable.
- Selalu sertakan opsi terakhir eksplisit: `[semua]` — global fix, seluruh comment
  outstanding (lihat langkah 3 untuk detail cakupannya).

Tampilkan di chat langsung ke user, **bukan** ditulis ke file.

## 3. User Pilih

- Satu nomor **thread INLINE** → scoped fix. Bawa **SELURUH histori thread** (comment awal +
  semua reply, urut kronologis — bukan cuma comment awal) sebagai context ke langkah 4, supaya
  agent tahu diskusi lengkapnya sebelum menilai FIXED/SKIPPED/NOT_APPLICABLE.
- Satu nomor **GENERAL** → scoped fix, comment tunggal apa adanya (tidak ada histori thread
  untuk dibawa).
- `[semua]` → global fix, seluruh comment outstanding (INLINE + GENERAL, satu thread dihitung
  sebagai satu unit kalau ber-reply). **Tidak difilter status "resolved"** — command ini tidak
  punya cara cek status resolved GitHub lewat `gh api` REST biasa tanpa GraphQL. TODO
  project-specific: opsional, tambahkan filter resolved via GraphQL kalau reviewer manusia
  resolve comment secara manual dan tidak mau comment itu ikut ke-fix ulang.

Input user di luar daftar yang ditampilkan (nomor tidak ada, bukan `semua`) → tanya ulang,
jangan menebak yang dimaksud.

## 4. Spawn `caf-reviewer` (`.claude/agents/caf-reviewer.md`)

Prompt spawn WAJIB memuat, apa adanya:

> Jangan `git push`, jangan `gh api` apapun ke GitHub, jangan ubah status ticket di tracker — tulis `fix-review-log.md` saja. Komunikasi balik ke GitHub itu tugas main thread command ini, dilakukan setelah kamu selesai.

Selain larangan di atas, prompt WAJIB memuat:
- TICKET-ID (hasil resolusi 0.5 — jangan dideteksi ulang di sini).
- Comment/thread terpilih dari langkah 3 apa adanya: untuk thread INLINE, seluruh histori (bukan
  cuma comment awal); label INLINE (+ path:line) atau GENERAL; mode scoped atau global (langkah
  3).
- Instruksi tulis `.caf/tasks/{TICKET-ID}/fix-review-log.md` dengan format:
  ```
  ## Fix Review Log — {TICKET-ID}
  Generated: {timestamp}
  Triggered by: {mode: scoped | global}

  ### Comment {comment_id atau url} [{INLINE path:line | GENERAL}]
  > {kutipan comment asli, dipotong kalau panjang}
  Status: FIXED | SKIPPED | NOT_APPLICABLE
  Catatan: {alasan singkat, terutama wajib diisi untuk SKIPPED/NOT_APPLICABLE}
  ```
  Satu blok `### Comment ...` per comment yang diproses — mode global berarti satu blok per
  comment outstanding, bukan satu ringkasan gabungan.

Tunggu hasil spawn selesai sebelum lanjut ke langkah 5.

## 5. Reply & Post Summary

Baca `.caf/tasks/{TICKET-ID}/fix-review-log.md` hasil langkah 4. Untuk tiap blok
`### Comment ...` di dalamnya:

- **INLINE** → reply ke comment itu:
  ```
  gh api repos/{owner}/{repo}/pulls/comments/{comment_id}/replies -f body="{status + catatan}"
  ```
  Untuk thread yang di-fix (bukan comment tunggal), reply ditujukan ke comment **paling akhir**
  dalam thread itu (comment terakhir sebelum command ini jalan), bukan selalu comment awal —
  supaya reply-nya muncul di posisi paling relevan dalam urutan thread.
- **GENERAL** → tidak ada endpoint reply untuk comment general (bukan review comment). Skip
  reply individual untuk comment ini — statusnya tetap masuk ke ringkasan penutup di bawah.

Setelah semua reply terkirim (atau di-skip untuk GENERAL), post **satu comment ringkasan**
penutup:

```
gh api repos/{owner}/{repo}/issues/{number}/comments -f body="{ringkasan isi fix-review-log.md}"
```

Ringkasan penutup ini WAJIB ada terlepas dari mode (scoped/global) — reviewer manusia yang
tidak buka tiap thread satu-satu tetap dapat gambaran lengkap dari satu tempat.

## 6. Ringkasan ke User

Tampilkan ke chat: daftar comment yang diproses + status masing-masing, link ke reply/comment
ringkasan yang baru dibuat (dari respons `gh api` langkah 5), dan lokasi
`fix-review-log.md` untuk dibaca lengkap.

## Batasan

- Command ini TIDAK pernah `git push`, TIDAK pernah buat/ubah PR, TIDAK pernah ubah status
  ticket di tracker — satu-satunya sisi tulis adalah `fix-review-log.md` (subagent) dan
  reply/comment GitHub (main thread, langkah 5).
- Filter status "resolved" GitHub belum didukung (lihat TODO di langkah 3) — mode `[semua]`
  memproses SEMUA comment outstanding tanpa mengecek apakah reviewer manusia sudah menandainya
  selesai secara manual di GitHub UI.
- Checkpoint A ini (caf-initiator) belum terhubung ke webhook otomatis — trigger command ini
  selalu manual oleh user. Trigger reaktif otomatis (comment GitHub → jalan sendiri) adalah
  scope caf-orchestrator Checkpoint B, di luar command ini.
