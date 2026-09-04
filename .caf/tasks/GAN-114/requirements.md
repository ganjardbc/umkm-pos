## Ticket: GAN-114
## Status: PLAN

## Deskripsi
Perbaiki race condition overselling di `TransactionsService`: validasi stock cukup saat
ini dibaca di luar `$transaction` (`prepareTransactionPayload`, via `this.prisma`) dan
sudah stale saat decrement sesungguhnya dijalankan di `applyInventorySale` (dipanggil
di dalam `$transaction`, dari `createPosTransaction` line 381/417 dan
`finalizeCustomerOrder` line 482/483). Decrement pakai `{ decrement: item.qty }` tanpa
guard `stock_qty >= qty` di level query, sehingga dua transaksi POS konkuren untuk
produk+outlet yang sama bisa sama-sama lolos check awal dan stock_qty jadi negatif.

## Acceptance Criteria
- [ ] Cek stock cukup (`stock_qty >= qty`) dan decrement stock jadi satu operasi atomic
      per row (misal `updateMany` dengan `WHERE outlet_id = ? AND product_id = ? AND
      stock_qty >= qty`, dieksekusi lewat `tx` di dalam `$transaction` yang sama dengan
      insert transaction/transaction_items), bukan check terpisah sebelum `$transaction`
      dibuka.
- [ ] Kalau conditional update mengembalikan `count === 0` (baris tidak match karena
      stock tidak cukup, atau row tidak ditemukan), seluruh `$transaction` di-rollback
      dan API mengembalikan error 4xx yang jelas menyebutkan nama produk & outlet
      terkait (pesan setara dengan error "Insufficient stock" yang sudah ada sekarang,
      supaya kontrak error tidak berubah drastis untuk FE).
- [ ] Validasi awal di `prepareTransactionPayload` (line ~601, `outletInventory.stock_qty
      < item.qty` baca lewat `this.prisma`) TIDAK lagi dijadikan satu-satunya sumber
      kebenaran soal stock cukup/tidak — boleh dipertahankan sebagai fail-fast check
      (early UX feedback sebelum transaction dibuka), tapi keputusan final HARUS selalu
      divalidasi ulang secara atomic di dalam `$transaction` saat decrement.
- [ ] `inventory_movements.stock_after` yang ditulis mencerminkan stock_qty aktual
      SETELAH decrement atomic sukses di dalam transaction tsb (bukan nilai yang
      dihitung stale di `prepareTransactionPayload`/`itemsData`), supaya audit trail
      tetap akurat di bawah concurrency.
- [ ] Kedua call-site (`createPosTransaction` dan `finalizeCustomerOrder`) memakai
      logic decrement yang sama (lewat `applyInventorySale` yang direvisi) — tidak ada
      jalur POS commit lain yang masih pakai decrement tanpa guard.
- [ ] Regression test (unit atau integration, sesuai konvensi test module `transactions`
      yang sudah ada) yang membuktikan: dua request konkuren untuk stock yang cuma
      cukup untuk salah satu → salah satu berhasil, salah satu gagal dengan error
      insufficient stock, dan `stock_qty` akhir tidak pernah negatif.
- [ ] `stock_qty` tidak pernah bisa jadi negatif hasil dari flow sale POS ini
      (dibuktikan lewat test di atas, bukan cuma review manual).

## Constraints
- Multi-tenant: semua query tetap discope oleh `merchant_id` dari JWT — jangan ubah
  cara `merchant_id`/`outlet_id` diresolve, cukup perbaiki urutan check-vs-decrement.
- Perbaikan harus tetap di dalam pola `$transaction` yang sudah ada (lihat
  `apps/api/src/transactions/transactions.service.ts:381` dan `:482`) — jangan pindah
  ke pendekatan locking lain (mis. row lock manual / advisory lock) tanpa alasan kuat,
  karena `updateMany` dengan `WHERE stock_qty >= qty` sudah cukup untuk MySQL InnoDB di
  bawah transaction Prisma default (guidance dari audit report, lihat section Usulan).
  Kalau selama investigasi ternyata Prisma transaction mode/isolation level saat ini
  tidak cukup untuk membuat conditional `updateMany` benar-benar atomic (misal karena
  raw query diperlukan), backend agent boleh eksplorasi tapi harus dokumentasikan
  alasannya di PR/commit — bukan default plan.
- Signature `applyInventorySale` boleh diubah (masih private method, dipanggil dari 2
  tempat di file yang sama) tapi kedua call site harus disesuaikan konsisten.
- Jangan ubah kontrak endpoint publik (`POST /api/v1/transactions`,
  `PATCH /api/v1/transactions/:id/status` atau endpoint terkait finalize) — response
  shape sukses/gagal tetap `{ success, data }` / `{ success: false, message, code }`
  sesuai `apps/api/CLAUDE.md`.
- Tidak boleh mengubah skema `outlet_product_inventory` (tidak ada migration di task
  ini) — fix ini murni di level query/service logic.

## Out of Scope
- Refactor besar struktur `TransactionsService` di luar yang diperlukan untuk fix ini.
- Perubahan pada `inventory_movements`/`stock_logs` audit schema.
- Perbaikan race condition serupa di modul lain (mis. `stock/` adjustment module) di
  luar flow POS sale (`createPosTransaction` + `finalizeCustomerOrder`) — kalau
  ditemukan pola serupa di tempat lain saat investigasi, laporkan sebagai temuan
  terpisah, jangan diperbaiki dalam task ini tanpa ticket sendiri.
- Perubahan di frontend (`apps/web`) — task ini backend-only. Kalaupun pesan error
  berubah struktur, FE tidak perlu disentuh di task ini (bandingkan pesan lama vs baru
  kalau ada konsumen FE yang parsing pesan spesifik, sebagai catatan untuk QA saja).

## Dependensi
- Tidak ada dependensi task lain — perbaikan berdiri sendiri di
  `apps/api/src/transactions/transactions.service.ts`.
