## Ticket: GAN-113

## Backend Tasks
- [ ] BE-1: Di `apps/api/src/stock/stock.service.ts`, ubah `adjust()` (line ~140-263) agar
      lookup product dan outlet (line 160-175) tetap dilakukan di luar transaction seperti
      sekarang (read-only validasi eksistensi, tidak race-sensitive), tapi bagian
      read-stock-then-write (line 177-225) dipindah ke DALAM satu
      `this.prisma.$transaction(async (tx) => { ... })` interactive transaction (ganti dari
      array-style `$transaction([...])` yang dipakai sekarang di line 228-253).
- [ ] BE-2: Di dalam interactive transaction tersebut, untuk kasus row
      `outlet_product_inventory` SUDAH ADA (`inventory` truthy dari `findFirst` awal —
      lookup awal ini boleh tetap dipakai untuk decide create-vs-update branch, tapi bukan
      sumber nilai `stock_qty` yang dipakai untuk hitung `newStock` final): panggil
      `tx.outlet_product_inventory.updateMany({ where: { outlet_id, product_id, merchant_id,
      stock_qty: { gte: -dto.change_qty } }, data: { stock_qty: { increment: dto.change_qty
      }, updated_by: userId, updated_at: new Date() } })`. Catatan: kondisi
      `stock_qty: { gte: -dto.change_qty }` valid untuk `change_qty` negatif maupun positif
      (untuk positif, `-dto.change_qty` negatif, jadi kondisi `gte` otomatis selalu true
      selama `stock_qty >= 0`, yang memang selalu benar) — pastikan implementasi memakai
      bentuk WHERE yang setara dengan "stock_qty + change_qty >= 0" seperti disebut di
      ticket asli, bukan hardcode logic terpisah untuk cabang positif/negatif.
- [ ] BE-3: Cek `result.count` dari `updateMany` di BE-2. Kalau `count === 0` (berarti baik
      row hilang di antara read awal dan transaction, atau kondisi stock tidak lagi
      mencukupi karena race dengan request lain) → lempar `BadRequestException` dengan pesan
      insufficient stock (boleh pertahankan format pesan yang mirip line 194-198 existing,
      tapi TANPA menyebut `currentStock` yang sudah stale — reword supaya tidak menjanjikan
      angka "Current: X" yang mungkin sudah tidak akurat, atau baca ulang stock_qty terkini
      di dalam tx sebelum melempar error untuk pesan yang akurat).
- [ ] BE-4: Setelah `updateMany` sukses (`count === 1`), baca ulang row terbaru via
      `tx.outlet_product_inventory.findUniqueOrThrow({ where: { outlet_id_product_id: {
      outlet_id: dto.outlet_id, product_id: dto.product_id } } })` untuk mendapatkan
      `stock_qty` aktual pasca-update (jangan reuse variabel `newStock` yang dihitung di
      application code sebelum transaction) — nilai ini yang dipakai untuk
      `inventory_movements.stock_after` dan untuk response `outlet_inventory.stock_qty`.
- [ ] BE-5: Untuk kasus row `outlet_product_inventory` BELUM ADA (`inventory` falsy) dan
      `dto.change_qty > 0` (branch create, line 214-225 existing): pertahankan logic create
      seperti sekarang (`stock_qty: dto.change_qty` langsung, karena tidak ada existing value
      untuk di-race), tapi pindahkan pemanggilan `tx.outlet_product_inventory.create(...)` ke
      dalam interactive transaction yang sama di BE-1, dan gunakan hasil `stock_qty` dari
      hasil create tersebut untuk `stock_after` (sama seperti BE-4, jangan pakai variabel
      `newStock` lama).
- [ ] BE-6: Di dalam transaction yang sama, panggil
      `tx.inventory_movements.create({ data: { ..., stock_after: <nilai dari BE-4/BE-5> } })`
      dengan payload yang sama seperti line 230-252 existing (merchant_id, outlet_id,
      product_id, change_qty, reason, ref_type: 'manual_adjustment', ref_id: null, note,
      created_by, updated_by, include products+outlets select seperti sekarang).
- [ ] BE-7: Return value `adjust()` tetap `{ outlet_inventory: { outlet_id, product_id,
      stock_qty }, movement }` — sesuaikan sumber `stock_qty` dan `movement` ke hasil dari tx
      (BE-4/BE-5/BE-6), pastikan shape object sama persis dengan sebelumnya (tidak menambah
      atau menghapus field).
- [ ] BE-8: Pastikan validasi `change_qty === 0`, validasi reason terhadap
      `INCREASE_REASONS`/`DECREASE_REASONS` (line 145-157), lookup `product` (line 160-168),
      dan lookup `outlet` (line 170-175) tetap di luar/sebelum interactive transaction persis
      seperti urutan existing — tidak perlu dipindah ke dalam tx karena bukan bagian dari
      race window stock_qty.
- [ ] BE-9: Tambah/update unit test di `apps/api/src/stock/stock.service.spec.ts` (kalau file
      belum ada, buat baru mengikuti pola test service lain di `apps/api/src/**/*.spec.ts`):
      (a) test bahwa `adjust()` sukses untuk row existing dan `stock_after` di movement sesuai
      hasil increment; (b) test bahwa `adjust()` melempar `BadRequestException` ketika
      conditional update gagal (mock `updateMany` mengembalikan `count: 0`); (c) test bahwa
      path create-row-baru untuk `change_qty > 0` masih bekerja; (d) test bahwa path row
      belum ada + `change_qty < 0` masih melempar `NotFoundException`.
- [ ] BE-10 (opsional, kalau infra test mendukung test terhadap MySQL nyata bukan hanya
      mock Prisma client): tambahkan integration/concurrency test yang menjalankan dua
      `adjust()` paralel (`Promise.all`) pada row yang sama dengan `change_qty` negatif yang
      totalnya melebihi stock tersedia, assert salah satu gagal dengan `BadRequestException`
      dan `stock_qty` akhir di DB tidak negatif serta konsisten dengan jumlah adjustment yang
      benar-benar berhasil.

## Frontend Tasks
(none — bug ini murni di backend service layer, tidak ada perubahan request/response
contract yang terlihat client; lihat requirements.md section Out of Scope)

## Shared Types Tasks
(none — tidak ada perubahan DTO atau tipe request/response)

## Docs Tasks
(none — tidak ada perubahan endpoint/schema publik; `api-contract.md` dan
`database-design.md` tetap akurat karena request/response shape `adjust()` tidak berubah)

## Skip Agents
- documentation: tidak ada perubahan API contract atau schema database yang perlu
  didokumentasikan ulang — perbaikan murni internal ke logic `StockService.adjust()`.
