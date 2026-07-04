## Ticket: CAF-QA-AGENT-INTEGRATION
## Status: PLAN

## Deskripsi

Integrasikan QA Agent ke pipeline CAF, dengan retry loop 1x otomatis
antara QA dan Backend/Frontend Agent sebelum lanjut ke Reviewer/Documentation.

## Temuan Awal — PENTING

`run-agent-pipeline.use-case.ts` **tidak ada di repo ini**. Orchestration
saat ini bukan kode terprogram — dijalankan manual oleh developer yang
spawn tiap agent lewat Claude Code (Task tool), dengan urutan yang
didefinisikan di `.ai/workflows/agent-handoff.md`. Tidak ada state machine
atau pipeline runner di codebase (`apps/api`, `apps/web`, atau tempat lain)
yang match nama itu. Sudah dicek dengan grep/find di seluruh repo, hasil nihil.

Implikasi: rencana ini nggak bisa "tambah step ke file X" karena file itu
tidak ada. Ada 2 opsi nyata:

**Opsi A — Update dokumen orchestrasi (agent-handoff.md)**
QA Agent sebenarnya SUDAH tercatat di `agent-handoff.md` (baris 50, 209,
229-230) sebagai step setelah Backend/Frontend SUCCESS. Yang belum ada:
- alur retry 1x eksplisit (FAIL → re-run Backend/Frontend → re-QA → NEEDS_HUMAN)
- posisi QA relatif ke Documentation Agent (paralel atau sebelum?)

**Opsi B — Bangun pipeline runner terprogram**
Kalau maksud user emang mau bikin file `run-agent-pipeline.use-case.ts`
beneran (NestJS use-case yang orchestrate spawn agent via API/CLI), ini
scope baru — bukan "update file existing". Perlu keputusan user dulu:
apakah orchestrator ini mau tetap manual (developer trigger tiap agent
via Claude Code), atau mau di-automate jadi service/CLI yang jalan sendiri.

**Rencana ini asumsikan Opsi A** (update dokumen, sesuai konvensi CAF
sekarang yang semua agent-to-agent handoff-nya file-based, bukan kode).
Kalau user maksudnya Opsi B, perlu planning terpisah (arsitektur baru).

## Posisi QA di Pipeline

```
Backend/Frontend Agent → verify-report.md (Status: SUCCESS)
        ↓
   QA Agent run #1 → qa-report.md (Status: PASS/FAIL/PARTIAL)
        ↓ FAIL
   Backend/Frontend Agent (retry, baca qa-report.md) → verify-report.md updated
        ↓
   QA Agent run #2 (final) → qa-report.md overwritten
        ↓ FAIL lagi           ↓ PASS
   Status: NEEDS_HUMAN    Reviewer Agent → Documentation Agent (paralel, non-blocking)
```

QA ditempatkan **sebelum** Reviewer, **sebelum** Documentation — karena
Documentation Agent saat ini baca `verify-report.md` (bukan qa-report.md),
jadi urutan aman: Documentation bisa jalan paralel dengan QA/Reviewer asal
verify-report.md sudah final (retry sudah kelar). Kalau retry masih jalan,
Documentation harus nunggu — supaya nggak dokumentasiin kode yang bakal diubah lagi.

## Cara Backend/Frontend Agent Bedakan Run Pertama vs Retry

qa-report.md **tidak ada** di folder task saat run pertama (Planner baru
selesai, belum ada QA sama sekali). Backend/Frontend Agent cukup cek:

```
if exists(.ai/tasks/<TICKET-ID>/qa-report.md):
    # ini retry — baca Issues Found di qa-report.md, fix spesifik itu
else:
    # run pertama — ikuti requirements.md + tasks.md seperti biasa
```

Sudah ditulis di section Input backend.md/frontend.md: "qa-report.md —
(jika ada) hasil QA run sebelumnya". Kata "jika ada" itu sendiri sudah
jadi sinyal run pertama vs retry — nggak perlu flag/field tambahan di
requirements.md atau tasks.md.

Tambahan yang perlu ada di Batasan/Pola Kerja Backend/Frontend Agent
(belum ditulis, perlu approval dulu): saat qa-report.md ada, agent WAJIB
baca section "Issues Found" (CRITICAL list) dan HANYA fix item itu — bukan
re-implement modul dari nol. Ini konsisten sama Retry Logic yang sudah ada
di backend.md/frontend.md ("Fix spesifik — jangan rewrite ulang file").

## Cara Lacak Retry Count (1x)

Karena tidak ada pipeline runner terprogram (lihat Temuan Awal), tidak ada
"variable" tempat state disimpan di kode. State retry count ada di **filesystem**,
diturunkan dari jumlah artifact, bukan field eksplisit:

- Retry count = 0 → qa-report.md belum ada.
- Retry count = 1 (sedang retry) → qa-report.md ada dengan Status: FAIL,
  dan verify-report.md sudah di-update SETELAH qa-report.md itu (attempt log
  bertambah — lihat "Attempt Log" di verify-report.md, existing format
  di agent-handoff.md baris 131-132).
- Retry count = 2 (harus stop) → qa-report.md run KEDUA juga Status: FAIL.

Siapa yang cek ini dan putuskan stop? Karena orchestrator itu manual
(developer via Claude Code), yang enforce "retry cuma 1x" adalah:
1. Instruksi eksplisit di qa.md section Retry Logic (sudah ditambahkan)
   yang bilang "Jangan retry lagi" kalau qa-report.md run kedua masih FAIL.
2. Developer/user yang spawn agent secara manual — kalau QA Agent nulis
   Status: NEEDS_HUMAN, itu sinyal ke developer buat stop, bukan spawn
   Backend/Frontend lagi.

Kalau nanti Opsi B (pipeline runner kode) jadi dipilih, baru retry count
perlu disimpan sebagai field eksplisit — misal `qa_retry_count` di semacam
task-state.json atau kolom di tabel job kalau ada job queue. Belum relevan
sekarang karena orchestrator masih file-based + manual.

## Perubahan yang SUDAH dibuat (bukan bagian "implementasi kode" —
## ini update dokumen agent, sesuai instruksi)

1. `qa.md` — tambah section "Retry Logic" (posisi QA dalam retry loop,
   siapa yang fix, kapan stop ke NEEDS_HUMAN).
2. `backend.md`, `frontend.md` — tambah `qa-report.md` ke section Input,
   dengan catatan "jika ada".

## Perubahan yang BELUM dibuat — nunggu approval

3. Update `.ai/workflows/agent-handoff.md`:
   - Handoff Map: tambah baris retry (QA → Backend/Frontend jika FAIL)
   - Contoh Alur Handoff: tambah skenario FAIL → retry → PASS
   - Status yang Valid: perjelas `FAIL` dari QA trigger apa persis
     (bedakan dari `FAIL` versi Reviewer kalau perlu)
4. Tambah instruksi eksplisit di Batasan backend.md/frontend.md: kalau
   qa-report.md ada, HANYA fix item di "Issues Found", bukan rewrite modul.
5. Kalau user pilih Opsi B (pipeline runner terprogram): planning terpisah,
   architect agent perlu dilibatkan untuk desain state machine + retry count storage.

## Pertanyaan untuk user sebelum implementasi

- Konfirmasi: Opsi A (update dokumen) yang dimaksud, bukan Opsi B (bikin
  pipeline runner kode baru)?
- Posisi Documentation Agent: paralel dengan QA/Reviewer, atau tunggu QA PASS dulu?
