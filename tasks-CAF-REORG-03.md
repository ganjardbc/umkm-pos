## Ticket: CAF-REORG-03
## Pola Kerja: PIV, retry max 3x per task verify

---

### PLAN — investigasi wajib sebelum sentuh apapun di umkm-pos

1. **Audit struktur nyata `umkm-pos`** — jangan asumsikan nama app. Baca `pnpm-workspace.yaml`/
   `turbo.json`/root `package.json` untuk dapat nama app sebenarnya (backend NestJS, frontend
   Vue, landing page Vue — nama folder pastinya dari deteksi, bukan dugaan seperti
   `apps/api`/`apps/web` yang mungkin salah).

2. **Diff `planner.md` manual-edit lama vs `caf-planner.md` yang akan digenerate baru.**
   Generate dulu versi baru ke direktori scratch terpisah (JANGAN tulis ke `umkm-pos` dulu),
   lalu diff isi lengkap terhadap `umkm-pos/.claude/agents/planner.md` yang ada sekarang.
   Cari 2 hal:
   - Apakah Fallback Discovery section (fix GAN-69) di versi baru setara/lebih baik
   - Apakah ada konten lain di versi lama (customization project-specific) yang tidak ada
     di versi baru — kalau ada, JANGAN diabaikan, laporkan detailnya

3. **Cek status 2 backlog bug pre-existing yang relevan** — sebelum full regen dijalankan
   untuk 10 agent nyata `umkm-pos`, verifikasi:
   - Apakah `buildInputSection()` template regression untuk non-planner agent benar-benar
     termanifestasi kalau dijalankan terhadap set agent nyata `umkm-pos` (backend, frontend,
     qa, reviewer, dst)? Kalau ya, seberapa parah — cukup untuk memutuskan fix-sekarang vs
     proceed-dengan-known-issue
   - Apakah `KNOWN_KINDS` di `agent-sections.js` benar-benar sudah cover `pm` dan
     `ux-designer` juga (CAF-REORG-01 cuma eksplisit sebut fix untuk `auditor`) — kalau
     belum, ini WAJIB diperbaiki sebelum reset `umkm-pos`, karena kalau tidak,
     `caf-pm.md`/`caf-ux-designer.md` hasil generate nanti bisa salah diklasifikasi
     `detectKind()` seperti kasus `auditor` yang sempat kejadian

4. **Inventarisir isi `.ai/` yang akan dihapus** — hitung jumlah folder ticket di
   `.ai/tasks/`, catat range ticket ID (misal `GAN-40` s.d. `GAN-70`) untuk audit trail
   percakapan, meski tidak di-backup fisik.

5. **STOP setelah Langkah 1–4, laporkan temuan.** Terutama Langkah 2 (diff planner.md) dan
   Langkah 3 (status 2 backlog bug) — ini yang menentukan apakah aman lanjut IMPLEMENT atau
   perlu perbaikan tambahan di `caf-initiator` dulu sebelum reset `umkm-pos` dieksekusi.

---

### IMPLEMENT (baru jalan setelah PLAN dikonfirmasi) [REVISI setelah PLAN]

6. **Fix `KNOWN_KINDS` dulu di `caf-initiator`** (tambah `pm`, `ux-designer` ke array di
   `agent-sections.js`) — sebelum langkah manapun di bawah ini
6a. **Investigasi drift `.claude/commands/*.md`** — bandingkan isi command lama `umkm-pos`
   vs hasil generate `caf-init` ke scratch dir. Kalau ada customization serupa kasus
   `planner.md` (bukan cuma path rename), STOP dan laporkan sebelum lanjut — command itu
   diperlakukan sama seperti agent (rename+patch, bukan regenerate)
7. Hapus `.ai/` dari `umkm-pos` (tanpa backup, sesuai keputusan) — INI TETAP full delete,
   scope-nya cuma folder artifact, bukan `.claude/`
8. `git mv` untuk 8 agent (`planner.md`→`caf-planner.md`, dst, KECUALI frontend/backend)
   — isi file dipertahankan utuh, BUKAN ditimpa hasil generate
9. Patch surgical ke masing-masing 8 file hasil `git mv`: ganti path `.ai/`→`.caf/` di body,
   update frontmatter `name`/`slug` jadi `caf-<nama>`, JANGAN sentuh section lain
10. Command: kalau Langkah 6a menemukan tidak ada drift berarti (murni boilerplate) →
    boleh generate ulang normal dengan `caf-init`. Kalau ada drift → `git mv` + patch
    surgical sama seperti agent
11. Generate `.caf/` dari nol via `caf-init` (knowledge/, discovery/, audits/, tasks/,
    workflows/) — ini yang memang dimaksud "reset total, generate ulang dari nol"

---

### VERIFY

12. Cross-check hasil akhir vs AC1–AC6 (revisi) di `requirements-CAF-REORG-03.md` — termasuk
    verifikasi eksplisit bahwa section custom di `caf-planner.md` (Skip Agents Directive,
    format requirements/tasks project-specific, verify checklist, retry logic, batasan,
    tools frontmatter) masih utuh persis seperti versi lama, cuma path & slug yang berubah
13. **Verifikasi fungsional GAN-69** — bukan cuma inspeksi visual template. Kalau
    memungkinkan, simulasikan invoke Planner headless terhadap 1 ticket dummy dan pastikan
    `tasks.md` benar-benar tertulis (bukti nyata, bukan asumsi dari isi template)
14. Spot-check golden-examples `RULES.md` — buka isi, pastikan path yang direferensikan
    benar-benar ada file-nya di `umkm-pos`
15. Jalankan `caf-audit-scan` (command hasil generate/patch baru) sekali untuk konfirmasi
    0 gap wajib di kondisi baru — sama seperti audit akhir CAF-REORG-01

Retry max 3x per item verify yang gagal. Kalau GAN-69 (Langkah 11) gagal setelah 3x
percobaan perbaikan → STOP total, JANGAN lanjut, laporkan NEEDS_HUMAN — ini bukan item
verify biasa, ini regresi produksi.

---

### Eksplisit TIDAK termasuk checkpoint ini
- Propagasi rename `frontend`/`backend` ke `caf-orchestrator`
- Menyelesaikan `.gitignore` `.caf/tasks/`
- Backup `.ai/tasks/` lama
- Pause `caf-orchestrator` webhook
- Perubahan di `caf-orchestrator`/`caf-orchestrator-cms`
- Dry-run 1 ticket nyata end-to-end (itu Checkpoint 5, setelah Checkpoint 4 selesai)