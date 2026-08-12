---
description: Review kualitatif manual terhadap implementasi satu ticket (review-notes.md) tanpa trigger pipeline penuh
---

# Review Ticket (Preview, Manual)

**Command ini READ-ONLY terhadap kode aplikasi. Boleh menulis ke `.ai/tasks/{TICKET-ID}/review-notes.md` saja — JANGAN perbaiki kode yang kamu temukan bermasalah. Review melaporkan, bukan menambal.**

Tujuan: review kualitatif manual sebelum buka PR atau sebelum ticket masuk pipeline otomatis.
Beda dari `/qa-check` yang menjawab "jalan atau tidak", command ini menjawab "layak di-merge
atau tidak": konsistensi dengan konvensi project, kualitas struktur, risiko yang tidak
kelihatan dari hasil test yang hijau.

## Ticket

Ticket ID: `$ARGUMENTS`

WAJIB diisi. Kalau kosong, tanya user ticket mana yang dimaksud dan STOP sampai dijawab —
jangan tebak.

Ambil detail ticket (title, description, acceptance criteria): kalau ada MCP tracker
terhubung (Linear/Jira/GitHub Issues), pakai itu. Kalau tidak, minta user paste detail ticket
secara manual sebelum lanjut — jangan mengarang requirement yang tidak disebutkan.

## Input

Implementasi lengkap dalam konteks ticket — **bukan cuma diff**. Baca file yang diubah secara
utuh, karena masalah struktur sering tidak kelihatan dari potongan diff.

Opsional, kalau tersedia di `.ai/tasks/{TICKET-ID}/` — dibaca sebagai konteks:
- `requirements.md` (acuan: apakah yang diimplementasi memang yang diminta)
- `design.md` (acuan: apakah implementasi menyimpang dari desain yang disepakati)
- `qa-report.md` (biar tidak mengulang temuan yang sudah dilaporkan QA)

## Ikuti Pola Reviewer Agent

Kalau `.opencode/agent/reviewer.md` ada, **baca file itu dan patuhi isinya sebagai sumber
kebenaran utama** untuk scope, pola kerja, dan format output — bukan instruksi di command ini.
Command ini cuma wrapper: kamu yang menjalankan peran Reviewer di thread utama, tanpa
men-spawn subagent.

Kalau file itu tidak ada, gunakan default berikut:

1. **Kesesuaian dengan ticket** — apa yang ditulis kode memang yang diminta requirement?
   Ada scope creep (perubahan di luar ticket) atau ada requirement yang terlewat?
2. **Konsistensi konvensi** — bandingkan dengan kode sekitar yang sudah ada: penamaan,
   struktur folder, pola error handling, layering. Verifikasi dari kode aktual, bukan dari
   preferensi umum.
3. **Kepatuhan ADR** — cek `docs/decisions/`. Kalau ada ADR yang berlaku dan dilanggar,
   itu temuan, apapun alasannya.
4. **Struktur & duplikasi** — logika yang diduplikasi dari yang sudah ada, abstraksi yang
   bocor antar layer, fungsi yang mengerjakan terlalu banyak hal.
5. **Risiko** — cek scoping data antar tenant/user, coverage otorisasi, penanganan error yang menelan exception diam-diam, perubahan schema/migration yang tidak reversible, data sensitif yang bocor ke log/response.
6. Kalau tidak menemukan masalah berarti, **katakan itu apa adanya** — jangan mengarang
   temuan minor supaya laporan kelihatan berisi.

## Format Output

```markdown
review-notes.md
## Status: APPROVE / REQUEST_CHANGES / NEEDS_HUMAN

## Ringkasan Perubahan
<apa yang berubah, dalam 2-3 kalimat>

## Kesesuaian dengan Ticket
- [ ] <requirement> — terpenuhi / tidak, bukti file:baris

## Temuan
### BLOCKING
- <file:baris> — masalah, kenapa blocking, saran perbaikan

### NON-BLOCKING
- <file:baris> — masalah, saran perbaikan

## Kepatuhan ADR
<ADR mana yang relevan, patuh atau dilanggar>

## Catatan untuk Manusia
<hal yang butuh keputusan manusia, bukan temuan teknis>
```

Tiap temuan WAJIB punya lokasi `file:baris`. Temuan tanpa lokasi tidak bisa
ditindaklanjuti — cari lokasinya atau jangan laporkan.

## Simpan Hasil

WAJIB tulis hasil ke `.ai/tasks/{TICKET-ID}/review-notes.md` — jangan cuma tampilkan di chat.

Sebelum menulis, cek dulu file target sudah ada atau belum:

- **Belum ada** → buat foldernya kalau perlu, tulis, lanjut.
- **Sudah ada** → JANGAN langsung overwrite. Tampilkan ringkasan isi yang sekarang ke user
  dan tanya mau diapakan: overwrite (hasil run ini menimpa), simpan sebagai file
  pembanding, atau batal. STOP sampai user menjawab.

## Setelah Selesai

Laporan disimpan di `.ai/tasks/{TICKET-ID}/review-notes.md`. Kalau ada temuan BLOCKING, sarankan user perbaiki dulu sebelum buka PR.
