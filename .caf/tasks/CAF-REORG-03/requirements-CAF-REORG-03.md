## Ticket: CAF-REORG-03 (internal, pra-tracker)
## Status: READY FOR PLAN

## Latar Belakang

Checkpoint 3 dari 5 di urutan yang disarankan rangkuman 13 Agustus 2026:

1. ✅ Update `caf-initiator` — selesai (CAF-REORG-01)
2. ✅ Update `CAF.md` sumber — selesai (CAF-REORG-01)
3. 🔵 **Reset `.caf/` dan struktur terkait di `umkm-pos`, generate ulang dari nol** ← checkpoint ini
4. ⏳ Propagasi ke `caf-orchestrator` / `caf-orchestrator-cms` — checkpoint terpisah
5. ⏳ Dry-run 1 ticket nyata end-to-end — checkpoint terpisah

`umkm-pos` direset total sesuai kesepakatan awal — tidak ada migrasi/preservasi data lama.
Ini pertama kalinya seluruh perubahan CAF-REORG-01 diuji terhadap repo nyata dengan data
production (bukan scratch repo VERIFY-phase kemarin), jadi risikonya lebih tinggi dari
sekadar "jalankan generator lagi".

**Konteks kritis yang membedakan checkpoint ini dari CAF-REORG-01:** `umkm-pos/.claude/agents/planner.md`
saat ini berisi **manual edit untuk fix GAN-69** (headless Planner exit tanpa nulis `tasks.md`
— root cause: instruksi interaktif "STOP sampai user jawab" yang tidak kompatibel headless
execution). Fix ini sudah dibawa ke `caf-initiator` (`agent-md.js` — Fallback Discovery
section branch on headless marker) sebagai bagian dari CAF-REORG-01's blanket `.ai/`→`.caf/`
replace. Reset total berarti file ini di-generate ulang dari nol, menimpa manual edit yang
ada — **kalau template `caf-initiator` sekarang tidak menghasilkan behavior yang setara,
GAN-69 regresi.** Ini prioritas verifikasi #1 di checkpoint ini.

## Keputusan yang sudah dikonfirmasi (jangan tanya ulang)
- Folder `.ai/tasks/` lama (10+ ticket history) **di-discard langsung, tanpa backup**
- `.gitignore` untuk `.caf/tasks/` **tetap jadi backlog terpisah**, tidak diselesaikan
  di checkpoint ini
- **Tidak perlu pause** webhook/queue `caf-orchestrator` — belum ada trigger aktif ke
  `umkm-pos` saat ini

## Scope

**In scope:**
- Hapus `.ai/` (dan seluruh isinya) dari `umkm-pos` — tanpa backup, sesuai keputusan
- Hapus `.claude/agents/*.md` dan `.claude/commands/*.md` versi lama dari `umkm-pos`
- Jalankan `caf-initiator` (versi CAF-REORG-01) end-to-end untuk generate ulang dari nol:
  `.caf/` (knowledge/, discovery/, audits/, tasks/, workflows/), `.claude/agents/`
  (8 `caf-*` + `frontend.md`/`backend.md` tanpa prefix), `.claude/commands/` (10 `caf-*`)
- Verifikasi GAN-69 fix tereproduksi benar di `caf-planner.md` hasil generate baru
- Golden-examples `RULES.md` untuk app nyata di `umkm-pos` (path harus dideteksi dari
  struktur repo asli, bukan diasumsikan dari nama umum)

**Eksplisit di luar scope:**
- Propagasi rename `frontend`/`backend` ke `caf-orchestrator` (checkpoint 4)
- Menyelesaikan `.gitignore` untuk `.caf/tasks/` (backlog terpisah, per keputusan di atas)
- Backup/arsip `.ai/tasks/` lama (per keputusan di atas — discard langsung)
- Pause `caf-orchestrator` webhook (per keputusan di atas — tidak perlu)
- Perubahan apapun di repo `caf-orchestrator`/`caf-orchestrator-cms`
- Dry-run ticket nyata end-to-end (checkpoint 5)

## Acceptance Criteria

### AC1 — `.ai/` lama dihapus bersih
- [ ] Folder `.ai/` dan seluruh isinya (`tasks/`, apapun sisa lain) dihapus dari working
      tree, tanpa sisa file/folder kosong
- [ ] Konfirmasi tidak ada referensi tersisa ke path `.ai/` di file manapun yang tidak
      seharusnya (`CLAUDE.md`, `AGENTS.md`, config lain di root `umkm-pos` — di luar yang
      di-generate ulang oleh `caf-initiator`)

### AC2 — `.claude/agents/` & `.claude/commands/` [REVISI setelah PLAN — koreksi scope]

**Temuan PLAN:** `.claude/agents/*.md` (contoh: `planner.md`) BUKAN boilerplate — isinya sudah
berevolusi lewat iterasi project nyata (format `requirements.md`/`tasks.md` project-specific,
Skip Agents Directive, verify checklist, retry logic, batasan stack, tools frontmatter dengan
`WebFetch`). Pendekatan "hapus lalu generate ulang dari nol" yang tepat untuk `.caf/` (artifact
disposable) **salah kalau diterapkan ke file ini** — akan menghapus proses kerja nyata yang
dipakai project, bukan cuma boilerplate.

- [ ] **`.claude/agents/*.md` TIDAK dihapus-lalu-regenerate.** Sebagai gantinya: `git mv`
      (rename ke `caf-<nama>.md`, isi tetap utuh), lalu patch surgical HANYA untuk:
      - Path `.ai/` → `.caf/` di body teks (mengikuti pola blanket-replace CAF-REORG-01)
      - Frontmatter `name`/`slug` → `caf-<nama>` (konsisten dengan filename baru)
      - Verifikasi tools frontmatter TIDAK berubah dari isi asli, kecuali memang ada
        perubahan yang disengaja dan dikonfirmasi eksplisit
      - Semua section lain (Pola Kerja PIV detail, format requirements/tasks project-specific,
        Skip Agents Directive, Verify Checklist, Retry Logic, Batasan) **tetap utuh, tidak
        diganti versi generik**
- [ ] Sebelum Langkah 8 (rename massal), **investigasi dulu apakah `.claude/commands/*.md`
      punya drift serupa** (belum dicek di PLAN) — kalau ya, perlakukan sama (rename+patch,
      bukan regenerate); kalau memang murni boilerplate tanpa customization, regenerate biasa
      boleh dilanjutkan
- [ ] Hasil akhir: 8 `caf-*.md` agent (isi preserved + patch struktural) + `frontend.md` +
      `backend.md` (isi preserved, tidak di-rename per keputusan Checkpoint 1) + command
      sesuai hasil investigasi drift di atas

### AC3 — GAN-69 fix tereproduksi (PRIORITAS #1) [PASS — dikonfirmasi PLAN]
- [x] `caf-planner.md` (via patch surgical, bukan regenerate — lihat AC2) mempertahankan
      Fallback Discovery section headless-marker, path sudah `.caf/discovery/`/`caf-discovery-start`
- [x] Diff eksplisit sudah dilakukan di PLAN — hasilnya justru mengungkap AC2 perlu direvisi
      (bukan GAN-69 yang bermasalah, tapi pendekatan reset yang salah untuk file ini)
- [ ] (Tetap direkomendasikan) Simulasikan invoke Planner headless terhadap 1 ticket dummy
      di VERIFY nanti — bukti fungsional, bukan cuma inspeksi visual

### AC4 — `.caf/` baru sesuai struktur CAF-REORG-01
- [ ] Struktur `.caf/knowledge/decisions/`, `.caf/knowledge/golden-examples/`,
      `.caf/discovery/`, `.caf/audits/`, `.caf/tasks/`, `.caf/workflows/` ter-generate,
      cocok 1:1 dengan tree di `CAF.md`
- [ ] `.caf/knowledge/INDEX.md` ter-generate, status ✓/✗ mencerminkan `docs/` yang
      sebenarnya ada di `umkm-pos` (bukan hasil scratch-repo test kemarin)

### AC5 — Golden-examples untuk app nyata `umkm-pos`
- [ ] Path app nyata di `umkm-pos` dideteksi dari struktur repo aktual (workspace config
      Turborepo/pnpm), bukan diasumsikan dari nama generik
- [ ] `RULES.md` per app berisi path yang benar-benar valid — spot-check minimal 2-3 file
      referensi benar-benar ada di path yang disebut

### AC6 — Konsistensi `CLAUDE.md`/`AGENTS.md` root
- [ ] Kalau `CLAUDE.md`/`AGENTS.md` `umkm-pos` menyebut path `.ai/` di mana pun, diupdate
      ke `.caf/` (lewat mekanisme sync/update yang sudah ada, bukan ditimpa total — file
      ini historically bukan bagian dari "reset total", cuma perlu konsisten)

## Non-negotiable constraints (tetap berlaku)
- Tidak ada backup untuk `.ai/tasks/` lama — sudah diputuskan, jangan tanya ulang, tapi
  tetap laporkan isi ringkas apa yang dihapus (jumlah folder, range ticket ID) untuk
  audit trail percakapan ini
- `writeIfAbsent` tetap berlaku untuk file yang bukan bagian dari "reset total" (CLAUDE.md/AGENTS.md)
- Field TODO (Tools yang Diizinkan, Scope, ADR reasoning, golden-example alasan) tetap TODO
- Kalau GAN-69 fix ternyata TIDAK tereproduksi dengan benar di AC3 — STOP, jangan lanjut
  reset, laporkan ke saya dulu. Ini blocking, bukan sekadar catatan