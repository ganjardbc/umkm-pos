## Ticket: copy-nomor-invoice-transaksi
## Status: PLAN

Sumber: discovery draft `.ai/discovery/copy-nomor-invoice-transaksi/prd.md` + `flow.md` (belum
di-convert jadi ticket Linear — dipakai apa adanya atas persetujuan user).

## Deskripsi
Tambah aksi "copy nomor invoice ke clipboard" di riwayat transaksi (list) dan detail transaksi,
dengan feedback toast, supaya kasir/owner tidak perlu select-manual teks saat share ke pelanggan
atau mencatat referensi retur/komplain.

## Acceptance Criteria
- [ ] Setiap baris di riwayat transaksi (`apps/web/src/modules/transaction/pages/index.vue`) menampilkan nomor invoice + ikon copy inline, target sentuh minimal 44x44px.
- [ ] Halaman detail transaksi (`apps/web/src/modules/transaction/pages/detail.vue`) menampilkan nomor invoice + ikon copy di header, dengan tampilan yang sama.
- [ ] Klik ikon copy di list TIDAK ikut men-trigger navigasi/klik ke card/row (stopPropagation).
- [ ] Copy berhasil → toast sukses non-blocking, auto-dismiss ~2-3 detik (pakai PrimeVue Toast, konsisten dengan pola existing di `apps/web` kalau ada).
- [ ] Copy gagal (Clipboard API tidak tersedia/permission ditolak/non-HTTPS) → toast error, dan fallback tetap memungkinkan user mendapatkan nomor invoice (minimal via text yang bisa di-select manual).
- [ ] Klik copy berkali-kali cepat (double-tap mobile) tidak menumpuk toast — toast baru menggantikan yang lama, bukan antre.
- [ ] Kalau nomor invoice kosong/null, ikon copy disembunyikan (bukan di-disable).
- [ ] Berfungsi di desktop dan mobile web.

## Constraints
- Tidak ada perubahan skema database atau migration — pakai field yang sudah ada di response API existing (`transactions.id`), bukan bikin field `invoice_number` baru (lihat Celah & Ambiguitas).
- Tidak ada perubahan pada `apps/api` — murni frontend, karena `id` transaksi sudah ter-expose di response list & detail (dipakai `ReceiptData.id` saat ini).
- Ikuti pola module Vue existing (`apps/web/src/modules/transaction/`), pakai Toast dari `primevue/usetoast` kalau sudah dipakai modul lain — cek dulu sebelum tambah pola baru.

## Out of Scope
- Copy elemen transaksi lain (detail lengkap, daftar item, total pembayaran).
- Perubahan format/struktur penomoran invoice (mis. bikin skema `INV-YYYYMMDD-XXXX` baru) — di luar scope ticket ini, lihat Celah & Ambiguitas.
- Tombol share langsung ke aplikasi eksternal (WhatsApp dsb).
- Perubahan tampilan/format struk cetak thermal printer.
- Event tracking/analytics baru untuk ukur adopsi fitur.

## Dependensi
- Tidak ada dependency task lain. Field `id` transaksi sudah tersedia di response API yang dipakai `index.vue` dan `detail.vue` saat ini (dipakai `ReceiptModal`/`ReceiptData`).

## Celah & Ambiguitas

**Temuan utama — tidak ada konsep "nomor invoice" di sistem saat ini:**
- Schema `transactions` (`apps/api/prisma/schema.prisma:353`) TIDAK punya kolom `invoice_number`
  atau sejenisnya — grep `invoice` di seluruh `apps/api/src`, `apps/web/src`, dan
  `packages/shared-types/src` nol hasil.
- Satu-satunya tempat ada representasi mirip "nomor invoice" adalah di struk cetak
  (`apps/web/src/modules/transaction/utils/receiptGenerator.ts:86`):
  `Receipt #${transaction?.id?.slice(0, 8).toUpperCase()}` — yaitu 8 karakter pertama UUID
  `transaction.id`, di-uppercase. Ini TIDAK ditampilkan di list (`index.vue`, yang sekarang cuma
  tampilkan nomor urut baris `#1, #2, ...`) maupun di `detail.vue`.
- PRD (`prd.md` Out-of-Scope) bilang "Perubahan pada format atau struktur penomoran invoice itu
  sendiri" di luar scope — tersirat asumsi skema penomoran invoice SUDAH ADA. Faktanya belum ada,
  jadi asumsi ini tidak akurat.

**Keputusan yang diambil untuk plan ini** (perlu dikonfirmasi user sebelum implementasi jalan):
pakai representasi yang sudah dipakai di struk (`id.slice(0,8).toUpperCase()`) sebagai "nomor
invoice" yang di-copy, dan tampilkan string yang sama itu (bukan raw UUID penuh) secara konsisten
di list + detail. Ini bukan bikin skema penomoran baru (tetap derived dari `id` yang sudah ada),
jadi tidak melanggar "Out of Scope" PRD soal format invoice.

Kalau user maunya nomor invoice human-readable beneran (mis. `INV-20260812-0001` sequential per
outlet), itu butuh field baru + migration + logic generate nomor — di luar scope ticket ini,
perlu ticket terpisah.

## Pertanyaan Terbuka (dari discovery draft, belum terjawab)
- Apakah ada tooling analytics/event tracking yang sudah terpasang di `apps/web`? 
  **STATUS: belum dijawab, TIDAK menghalangi implementasi — ini soal pengukuran 
  Success Metric, di luar scope kode fitur ini.**
- Apakah ada data historis insiden salah kirim/salah catat nomor invoice? 
  **STATUS: belum dijawab, TIDAK menghalangi implementasi — sama, soal baseline metric.**
- Konfirmasi: setuju pakai `id.slice(0,8).toUpperCase()` (representasi yang sudah dipakai
  di struk) sebagai "nomor invoice" untuk ticket ini, bukan bikin skema penomoran baru?
  **KEPUTUSAN: YA, setuju. Scope tetap kecil, tidak ada migration.**
