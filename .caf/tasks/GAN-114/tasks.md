## Ticket: GAN-114

## Backend Tasks
- [ ] BE-1: Di `apps/api/src/transactions/transactions.service.ts`, ubah
      `applyInventorySale` (line ~706-748) supaya untuk tiap item:
      1. Jalankan `tx.outlet_product_inventory.updateMany({ where: { outlet_id,
         product_id, merchant_id, is_active: true, stock_qty: { gte: item.qty } },
         data: { stock_qty: { decrement: item.qty }, updated_by: userId, updated_at:
         new Date() } })` — pakai `updateMany` (bukan `update` dengan unique key)
         supaya bisa menambahkan kondisi `stock_qty: { gte: item.qty }` di WHERE clause,
         menjadikan check-and-decrement satu operasi atomic.
      2. Cek `result.count === 0` → lempar exception (lihat BE-2) supaya
         `$transaction` di caller rollback otomatis (Prisma interactive transaction
         akan rollback kalau callback throw).
      3. Kalau `count === 1`, baca ulang row `outlet_product_inventory` (via `tx`,
         `findFirst` dengan `outlet_id_product_id`) untuk dapat `stock_qty` aktual
         pasca-decrement, dan gunakan nilai ini sebagai `stock_after` saat
         `tx.inventory_movements.create` (line ~733-746) — ganti dari
         `item.stock_after` (nilai stale dari `prepareTransactionPayload`) ke nilai
         hasil baca ulang ini.
- [ ] BE-2: Tambahkan exception yang jelas saat `count === 0` di `applyInventorySale`
      — gunakan `BadRequestException` dengan pesan senada dengan yang sudah ada di
      `prepareTransactionPayload` line 602-604 (`Insufficient stock for product "X" in
      this outlet...`), termasuk nama produk. Karena `applyInventorySale` saat ini
      cuma menerima `product_id`/`qty`/`stock_after` per item (tidak ada nama produk),
      tambahkan parameter/field nama produk ke payload yang dikirim dari kedua caller
      (`createPosTransaction` dan `finalizeCustomerOrder`) — bisa lewat memperluas
      shape `itemsData` yang sudah dibangun di `prepareTransactionPayload` (line
      583-591, tambahkan `product_name` di sana, sudah ada `product.name` dalam scope)
      supaya tidak perlu query ulang produk di dalam `applyInventorySale`.
- [ ] BE-3: Pastikan `prepareTransactionPayload` (line ~529-634) tetap melakukan
      fail-fast check stock (line 601-605) sebagai early feedback SEBELUM
      `$transaction` dibuka — TIDAK dihapus, cukup didokumentasikan lewat komentar
      singkat di kode bahwa check ini best-effort/non-atomic dan keputusan final ada
      di `applyInventorySale` (BE-1) supaya reviewer/future-dev tidak salah paham ini
      cukup sebagai satu-satunya guard.
- [ ] BE-4: Update kedua call site pemanggil `applyInventorySale`:
      - `createPosTransaction` (line ~417-424)
      - `finalizeCustomerOrder` (line ~483-490)
      Sesuaikan argumen yang dikirim dengan signature baru dari BE-1/BE-2 (mis. field
      tambahan nama produk di `itemsData`), pastikan exception yang dilempar dari
      dalam callback `$transaction` (line 381 dan 482) tetap propagate ke controller
      tanpa ditangkap secara tidak sengaja (tidak ada try/catch yang menelan error di
      sekitar pemanggilan ini saat ini — pastikan tetap begitu).
- [ ] BE-5: Tambahkan/ubah unit atau integration test di module `transactions`
      (ikuti lokasi test existing, mis. `apps/api/src/transactions/*.spec.ts` kalau
      ada — kalau belum ada test file untuk service ini, buat baru mengikuti konvensi
      test module lain di `apps/api/src`) yang membuktikan:
      - Dua panggilan `createPosTransaction`/`applyInventorySale` konkuren (via
        `Promise.all` atau simulasi lock) untuk produk+outlet yang sama dengan stock
        cuma cukup untuk satu qty → satu resolve sukses, satu reject dengan
        `BadRequestException` insufficient stock.
      - Setelah kedua percobaan selesai, `outlet_product_inventory.stock_qty` akhir
        di DB test TIDAK negatif dan sama dengan `stock_qty_awal - qty_yang_berhasil`.
      - `inventory_movements.stock_after` yang tercatat untuk transaksi yang sukses
        cocok dengan `stock_qty` aktual pasca-decrement (bukan nilai stale).

## Frontend Tasks
(none — task ini backend-only, tidak ada perubahan store/service/page di apps/web)

## Shared Types Tasks
(none — tidak ada perubahan kontrak type publik; shape error response tetap
`{ success: false, message, code }` sesuai existing)

## Docs Tasks
(none — tidak ada endpoint baru atau perubahan schema database; kontrak
`docs/api/api-contract.md` dan `docs/database/database-design.md` tidak berubah)

## Skip Agents
- documentation: tidak ada endpoint baru, schema change, atau kontrak API yang
  berubah — perbaikan murni di internal service logic (query ordering + atomic
  guard), tidak ada yang perlu didokumentasikan ulang di `docs/api/api-contract.md`
  atau `docs/database/database-design.md`.
