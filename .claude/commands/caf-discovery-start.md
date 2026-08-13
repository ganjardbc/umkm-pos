---
allowed-tools: Read, Write, Glob, Bash(ls:*), Bash(git status:*), Bash(git branch:*), Bash(git checkout:*), Task
description: Mulai alur Discovery (Klaster 1) untuk satu fitur — PM Agent menulis prd.md + flow.md di .caf/discovery/{slug}/, tanpa membuat ticket
argument-hint: [nama fitur, contoh: "checkout tanpa login"]
---

> DRAFT hasil caf-initiator — review dan lengkapi sebelum dipakai, terutama bagian
> yang ditandai TODO project-specific.

# Discovery Start

**PENTING: command ini TIDAK membuat ticket apapun.** Output-nya dokumen discovery untuk
direview manusia. Convert ke ticket adalah command terpisah `/caf-discovery-to-ticket` dengan
approval per-item.

## Argumen

`$ARGUMENTS` — nama fitur dalam bahasa manusia. WAJIB diisi. Kalau kosong, tanya user nama
fiturnya dan STOP sampai dijawab — jangan tebak fitur apa yang dimaksud.

## 1. Siapkan branch

1. Generate slug dari nama fitur (kebab-case).
2. Cek branch `discovery/{slug}` sudah ada atau belum (`git branch --list`):
   - **Belum ada** → `git checkout -b discovery/{slug}` dari branch aktif saat ini.
   - **Sudah ada** → berarti discovery ini pernah dimulai sebelumnya. Checkout ke branch
     itu (`git checkout discovery/{slug}`), JANGAN buat branch baru menimpa. Lanjut seperti
     biasa — kalau folder `.caf/discovery/{slug}/` juga sudah ada, ini jadi kasus "lanjutkan
     discovery yang belum selesai", bukan mulai dari nol.
3. Kalau working directory tidak bersih (ada perubahan belum commit) SEBELUM checkout,
   STOP dan laporkan ke user — jangan checkout branch baru dengan uncommitted changes yang
   bisa ikut terbawa atau hilang.
4. Command ini TIDAK melakukan push atau buat PR — itu keputusan manusia, dilakukan manual
   setelah discovery dianggap selesai (biasanya setelah `handoff.md` ditulis oleh
   `/caf-discovery-to-ticket`).

## 2. Bikin slug dan folder

- Slug: dari `$ARGUMENTS`, lowercase-kebab-case, hanya `a-z0-9-` (contoh: "checkout tanpa
  login" jadi `checkout-tanpa-login`).
- Cek dulu apakah `.caf/discovery/{slug}/` sudah ada:
  - **Belum ada** → buat foldernya, lanjut.
  - **Sudah ada dan berisi `prd.md`** → JANGAN overwrite. Tampilkan isi ringkasnya ke user
    dan tanya: lanjutkan/perbarui discovery yang ada, atau pakai slug lain. STOP sampai
    dijawab.
- Konfirmasi slug ke user sebelum lanjut kalau hasil slugify-nya jauh berbeda dari nama yang
  diketik (mis. banyak karakter non-latin yang terbuang).

## 3. Spawn PM Agent

Spawn PM Agent dengan slug sebagai konteks. Sumber kebenaran aturan agent ini adalah
`.claude/agents/caf-pm.md` — baca file itu dan patuhi isinya. Kalau file itu tidak ada, gunakan
prinsip default: scope tulis TERBATAS ke `.caf/discovery/{slug}/**`, tidak boleh menyentuh
kode apapun, dan TIDAK PUNYA write access ke ticket tracker.

PM Agent menulis `.caf/discovery/{slug}/prd.md` LEBIH DULU, dengan section wajib:

- `## Problem` — masalah nyata yang dipecahkan, bukan deskripsi solusi
- `## Target User` — siapa yang terdampak, sespesifik mungkin
- `## Success Metric` — bagaimana tahu fitur ini berhasil (angka/sinyal terukur)
- `## Scope` — yang dikerjakan
- `## Out-of-Scope` — yang sengaja TIDAK dikerjakan (eksplisit, biar tidak melebar)
- `## Dependency` — sistem/tim/fitur lain yang jadi prasyarat

Kalau `docs/product/feature-catalog.md` ada, baca dulu sebagai konteks — cek apakah fitur ini
overlap dengan yang sudah ada (kalau ya, catat di `## Dependency`).

## 4. PM Agent menilai kebutuhan UX Designer

Setelah `prd.md` selesai, PM Agent MENILAI SENDIRI dari deskripsi fitur: apakah fitur ini
menyentuh permukaan user — yaitu ada UI/layar baru, atau alur interaksi user yang berubah.

Project ini punya UX Designer Agent (`.claude/agents/caf-ux-designer.md`), jadi PM Agent
punya dua pilihan:

- **Menyentuh permukaan user** (ada UI/layar baru, atau alur interaksi yang berubah) →
  spawn UX Designer Agent dengan slug yang sama sebagai konteks. UX Designer yang menulis
  `.caf/discovery/{slug}/flow.md`, mengikuti scope dan aturan di
  `.claude/agents/caf-ux-designer.md`.
- **Tidak menyentuh permukaan user** (mis. perubahan internal, job background, kontrak API
  antar service) → JANGAN spawn UX Designer. PM Agent sendiri yang menulis `flow.md`
  versi ringkas: alur data/proses secukupnya, tanpa detail interaksi UI.

**Keputusan ini WAJIB dicatat** di bagian paling atas `flow.md`, dengan alasan singkat:

```markdown
## Keputusan UX Designer

<dipakai / tidak dipakai> — <alasan 1-2 kalimat, merujuk ke sifat fitur di prd.md>
```

Tujuannya supaya keputusan ini bisa direview manusia, bukan black-box. Jangan skip section ini
walau jawabannya terasa jelas.

## 5. Struktur flow.md

Siapapun yang menulisnya (PM Agent atau UX Designer Agent), `flow.md` punya section:

- `## Keputusan UX Designer` — dipakai atau tidak, plus alasan singkat
- `## Entry Point` — dari mana user masuk ke alur ini
- `## Alur Utama` — langkah per langkah, happy path
- `## State Kosong & Error` — kondisi data kosong, gagal, atau tidak punya akses
- `## Pertanyaan Terbuka` — hal yang belum diputuskan dan butuh jawaban manusia

## Verify

Sebelum mengaku selesai, konfirmasi dengan Read/ls bahwa kedua file benar-benar ada di
`.caf/discovery/{slug}/`:
- [ ] `prd.md` ada dan punya keenam section wajib (bukan heading kosong)
- [ ] `flow.md` ada dan punya `## Keputusan UX Designer` beserta alasannya
- [ ] Tidak ada file di luar `.caf/discovery/{slug}/` yang berubah

Bukan cuma klaim "sudah disimpan" — cek beneran.

## Setelah Selesai

Tampilkan ringkasan di chat (slug, judul fitur, keputusan UX Designer + alasan, path kedua
file). Sarankan ke user untuk review dulu, lalu jalankan `/caf-discovery-to-ticket {slug}` kalau
sudah siap dikonversi jadi ticket — dengan approval per-item, bukan auto-create.
