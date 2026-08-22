---
allowed-tools: Read, Grep, Glob, Task, Bash(gh pr view:*), Bash(gh pr list:*), Bash(gh pr diff:*), Bash(gh repo view:*), Bash(gh api user:*), Bash(gh api repos/*/collaborators/*/permission:*), Bash(gh api repos/*/pulls/*/reviews:*)
description: Review penuh dari nol untuk PR yang belum direview — spawn caf-reviewer.md mode INITIAL, lalu post hasilnya sebagai GitHub PR Review
argument-hint: [PR-number, contoh: "81"]
---

> DRAFT hasil caf-initiator — review dan lengkapi sebelum dipakai, terutama bagian
> yang ditandai TODO project-specific.

# Review (Initial, Pre-existing PR)

**Command ini MEMBUAT PR REVIEW BARU DI GITHUB.** Efek sampingnya nyata dan publik — satu PR
Review (APPROVE/REQUEST_CHANGES/COMMENT) muncul di timeline PR orang lain. Ini bukan preview
read-only seperti `/caf-review-ticket` — jalankan hanya kalau memang berniat review PR ini
sekarang.

Tujuan: jalur interactive untuk mode INITIAL Reviewer Agent — review dari nol untuk PR yang
belum pernah direview siapapun (manusia atau bot), beda dari `/caf-fix-review` (mode reactive,
merespons comment reviewer manusia di PR yang SUDAH direview) dan beda dari
`caf-reviewer` (`.claude/agents/caf-reviewer.md`) gate pre-PR (dipicu otomatis di pipeline, bukan manual
post-PR).

## 0. Permission Check (WAJIB, sebelum langkah apapun di bawah)

`gh api repos/{owner}/{repo}/collaborators/{username}/permission --jq .permission`

`{username}` adalah user yang menjalankan command ini — ambil dari `gh api user --jq .login`.
Simpan hasil `{username}` ini, dipakai lagi di langkah 0.7 untuk cek review existing.

Hasil BUKAN salah satu dari `write`, `maintain`, `admin` → **STOP, jangan proses
apapun setelah ini.** TIDAK ada pesan error ke user, TIDAK ada review/comment ke GitHub —
command berhenti diam-diam, cukup catat internal (mis. satu baris log kalau ada mekanismenya)
kalau perlu jejak audit. Ini bukan bug, ini desain: whitelist trigger CAF-PRREVIEW-01 sengaja
tidak membocorkan ke pihak luar bahwa command ini pernah dipanggil oleh user yang tidak
diotorisasi.

(Threshold ini dirujuk ke satu sumber: `.ai/tasks/CAF-PRREVIEW-01/plan.md` §5 — kalau
threshold berubah, update di sana dulu, lalu di sini, di `/caf-fix-review`, DAN di sisi
webhook caf-orchestrator Checkpoint B. JANGAN update salah satu sisi saja.)

## 0.5 Resolusi PR Number & TICKET-ID

Argument `$ARGUMENTS` adalah **PR number** (mis. `81`), **BUKAN TICKET-ID** — konsisten
dengan `/caf-fix-review`, jangan tertukar.

**`$ARGUMENTS` terisi** → pakai langsung sebagai PR number, lanjut ke resolusi TICKET-ID di
bawah.

**`$ARGUMENTS` kosong** → auto-detect dari branch aktif (pola sama persis dengan
`/caf-fix-review` — reuse logic-nya, jangan tulis ulang beda):

```
git branch --show-current
```

- Match pattern `ai-agent/{TICKET-ID}` → cari PR-nya:
  ```
  gh pr list --head ai-agent/{TICKET-ID} --json number,url
  ```
  - Ketemu satu PR → pakai number-nya, lanjut.
  - Tidak ketemu PR untuk branch itu → tanya user PR number-nya langsung, **STOP** sampai
    dijawab. Jangan menebak.
- Branch aktif TIDAK match pattern `ai-agent/*` → tanya user PR number-nya langsung, **STOP**
  sampai dijawab.

**Resolusi TICKET-ID** (dibutuhkan untuk path `.caf/tasks/{TICKET-ID}/` — lihat langkah 1),
di-DERIVE dari PR yang sudah resolve di atas, **bukan dideteksi ulang secara terpisah**:

```
gh pr view {number} --json headRefName,baseRefName,url
```

Parse pattern `ai-agent/(.+)` dari `headRefName` hasilnya — regex ini SAMA dengan yang
dipakai `caf-orchestrator` (`AI_AGENT_BRANCH_PATTERN` di `run-pr-review.use-case.ts`),
jaga tetap sinkron kalau salah satu sisi berubah.

- Match → itu TICKET-ID-nya.
- PR-nya BUKAN dari branch pattern itu (PR manual, bukan hasil `/caf-run-pipeline` atau
  caf-orchestrator) → tanya user TICKET-ID-nya manual, **STOP** sampai dijawab. Jangan mengarang
  TICKET-ID dari nama branch yang tidak jelas polanya.

Simpan hasil resolusi sebagai `{owner}`, `{repo}` (dari `gh repo view --json owner,name`),
`{number}`, `{headRefName}`, `{baseRefName}`, dan `{TICKET-ID}` — dipakai di semua
langkah berikutnya.

## 0.7 Cek Review Existing (idempotency)

Command ini bisa dipanggil manual meski PR sudah pernah direview sebelumnya (mis. lewat webhook
`caf-orchestrator`, atau run `/caf-review` sebelumnya) — cek dulu supaya tidak menumpuk
review tanpa sepengetahuan user.

```
gh api repos/{owner}/{repo}/pulls/{number}/reviews
```

Filter hasilnya: cari entry dengan `user.login == {username}` (hasil resolusi langkah 0 — user/
token yang sama menjalankan command ini tiap kali dipanggil).

- **Ketemu review sebelumnya dari `{username}`** → tampilkan ke user: timestamp
  (`submitted_at`), `state` (APPROVED/CHANGES_REQUESTED/COMMENTED), dan `html_url` review
  lama itu. Tanya eksplisit: lanjut buat review baru (menumpuk di PR timeline), atau batal? Input
  di luar ya/tidak → tanya ulang, jangan menebak. User pilih batal → **STOP**, tidak ada
  side-effect apapun setelah ini.
- **Tidak ketemu** (belum pernah direview oleh `{username}`) → lanjut diam-diam ke langkah 1.

Review dari actor LAIN (reviewer manusia lain, bot lain) tidak masuk hitungan idempotency ini —
tidak relevan untuk keputusan "command ini sudah pernah jalan di PR ini atau belum".

## 1. Baca Artifact Task (opsional, best-effort)

Konteks tambahan untuk reviewer — path: `.caf/tasks/{TICKET-ID}/`:

- `requirements.md`
- `design.md`
- `verify-report.md`

Cek tiap file dengan `test -f` (atau baca langsung dan tangkap not-found) sebelum
diasumsikan ada. **Folder atau file manapun tidak ada → skip diam-diam, JANGAN gagal atau STOP**
— PR yang direview command ini belum tentu berasal dari pipeline CAF (bisa PR manual), jadi
artifact ini murni opsional.

## 2. Ambil Diff PR

```
gh pr diff {number}
```

Simpan hasilnya (plus `{headRefName}`, `{baseRefName}` dari resolusi 0.5) sebagai konteks
utama yang dibawa ke spawn langkah 3 — ini yang direview, bukan artifact task di langkah 1
(artifact itu cuma konteks tambahan).

## 3. Spawn `caf-reviewer` (`.claude/agents/caf-reviewer.md`) — mode INITIAL

Prompt spawn WAJIB memuat, apa adanya:

> Jangan `git push`, jangan `gh api` apapun ke GitHub, jangan ubah status ticket di tracker, jangan fix kode apapun — tulis `review-notes.md` saja, format seperti biasa (Verdict, Security Audit, Kualitatif Review, dst). Komunikasi balik ke GitHub (post PR Review) itu tugas main thread command ini, dilakukan setelah kamu selesai.

Selain larangan di atas, prompt WAJIB memuat:
- **Mode eksplisit: INITIAL** — review PENUH dari diff PR ini dari nol, pakai kriteria &
  golden-examples yang SAMA seperti review pre-PR biasa (security audit checklist, kualitatif
  review, verdict APPROVE/CHANGES REQUESTED/DEFER — lihat `.claude/agents/caf-reviewer.md` untuk
  format lengkap). Ini BUKAN mode fix-comment `/caf-fix-review` — tidak ada comment reviewer
  manusia yang direspons.
- `commentContext = []` (array kosong, apa adanya — tidak ada comment untuk dibawa, beda dari
  `/caf-fix-review` yang membawa histori thread).
- TICKET-ID (hasil resolusi 0.5 — jangan dideteksi ulang di sini).
- Diff PR hasil langkah 2, plus artifact task hasil langkah 1 kalau ada (kosongkan section itu
  di prompt kalau memang tidak ketemu, jangan pura-pura ada).
- Instruksi tulis `.caf/tasks/{TICKET-ID}/review-notes.md` — format PERSIS seperti didefinisikan
  di `.claude/agents/caf-reviewer.md` (Ticket, Agent, Verdict, Security Audit, Kualitatif Review,
  Verdict Rationale, Untuk Developer) — **jangan buat struktur baru**, reuse yang sudah ada.

Tunggu hasil spawn selesai sebelum lanjut ke langkah 4.

## 4. Post GitHub PR Review

Baca `.caf/tasks/{TICKET-ID}/review-notes.md` hasil langkah 3. Ambil `Verdict` dari situ,
map ke `event` GitHub PR Review (mapping ini keputusan command ini, TIDAK didefinisikan di
`caf-reviewer.md`):

| Verdict (review-notes.md) | `event` GitHub |
|---|---|
| APPROVE | `APPROVE` |
| CHANGES REQUESTED | `REQUEST_CHANGES` |
| DEFER | `COMMENT` |

Verdict LAIN dari tiga ini (mis. `NEEDS_HUMAN` — nilai itu didefinisikan di
`caf-reviewer.md` untuk siklus retry otomatis pipeline, BUKAN untuk single-run manual command
ini) atau kapitalisasi/ejaan yang tidak persis cocok → **STOP**, tampilkan `Verdict` mentahnya
ke user, tanya event GitHub yang dipakai secara manual. Jangan menebak atau default ke
`COMMENT` secara diam-diam.

`body` = ringkasan `review-notes.md` (Verdict Rationale + daftar Blocker/Non-blocker
ringkas — bukan tempel seluruh file mentah-mentah, tapi cukup lengkap supaya reviewer manusia
tidak wajib buka file untuk paham garis besar).

`comments[]` (opsional) — kalau `review-notes.md` punya temuan dengan `path`+`line`
spesifik yang bisa dipetakan ke diff PR (mis. dari section Security Audit yang menyebut file
tertentu), sertakan sebagai inline comment per-file:

```
gh api repos/{owner}/{repo}/pulls/{number}/reviews -X POST \
  -f event="{APPROVE|REQUEST_CHANGES|COMMENT}" \
  -f body="{ringkasan}" \
  -f 'comments[][path]=...' -f 'comments[][line]=...' -f 'comments[][body]=...'
```

(atau payload JSON via `--input -` kalau `comments[]` lebih dari satu — pilih cara yang
valid untuk banyak comment, jangan asumsikan satu comment saja.)

Temuan yang tidak punya `path`+`line` jelas (concern umum, kualitatif) → masuk `body`
saja, tidak usah dipaksa jadi inline comment.

## 5. Ringkasan ke User

Tampilkan ke chat: Verdict akhir, event GitHub yang dipakai, link PR Review yang baru dibuat
(dari respons `gh api` langkah 4), dan lokasi `review-notes.md` untuk dibaca lengkap.

## Batasan

- Command ini TIDAK pernah `git push`, TIDAK pernah checkout/commit kode, TIDAK pernah ubah
  status ticket di tracker — satu-satunya sisi tulis adalah `review-notes.md` (subagent) dan
  PR Review baru di GitHub (main thread, langkah 4).
- Idempotency check (langkah 0.7) HANYA mendeteksi run `/caf-review` sebelumnya (baik dari
  command ini sendiri, dari `{username}` yang sama). Review INITIAL dari webhook
  `caf-orchestrator` **TIDAK terdeteksi** — saat ini webhook mem-post initial review sebagai
  satu issue comment ringkasan (`RunPrReviewUseCase` → `postIssueComment`), BUKAN sebagai PR
  Review object via `pulls/{number}/reviews` seperti command ini. Dua kontrak artifact yang
  berbeda, jadi `GET pulls/{number}/reviews` tidak akan pernah menemukan review webhook itu,
  terlepas dari login siapa yang dicari. Lihat item backlog terpisah di
  `.ai/tasks/CAF-PRREVIEW-01/open-items.md` (caf-initiator) — migrasi webhook initial-review ke
  `pulls/{number}/reviews` (kalau disetujui) akan sekaligus membuat idempotency check ini
  otomatis kerja lintas-jalur, tapi itu keputusan yang menyentuh `caf-orchestrator`, di luar
  scope command ini.
- `comments[]` inline (langkah 4) bergantung pada `review-notes.md` menyebut `path`+`line`
  eksplisit di temuannya — kalau reviewer cuma kasih concern umum tanpa lokasi jelas, review
  tetap terpost tapi tanpa inline comment (semua masuk `body` ringkasan).
- Checkpoint A ini (caf-initiator) belum terhubung ke webhook otomatis — trigger command ini
  selalu manual oleh user. Trigger otomatis untuk PR baru (mis. dipicu event `opened`) adalah
  scope caf-orchestrator, di luar command ini.
