## Ticket: GAN-113
## Status: PLAN

## Deskripsi
`StockService.adjust()` di `apps/api/src/stock/stock.service.ts:177-225` melakukan
check-then-act tanpa row lock: baca `stock_qty` lewat `findFirst` di luar transaction,
hitung `newStock` di application code, lalu tulis dengan `update` memakai nilai absolut
di dalam `$transaction` array. Dua request adjust konkuren pada `outlet_product_inventory`
row yang sama (kombinasi `outlet_id` + `product_id`) bisa sama-sama membaca `stock_qty`
lama, sama-sama lolos validasi "tidak boleh negatif", lalu saling overwrite (lost update).
Task ini mengganti alur tersebut menjadi atomic conditional update, konsisten dengan pola
`{ decrement: item.qty }` yang sudah dipakai di `transactions.service.ts:719-731`
(`applyInventorySale`).

## Acceptance Criteria
- [ ] `adjust()` tidak lagi menghitung `newStock` di application code lalu menulis nilai
      absolut tersebut ke `stock_qty` — write ke `stock_qty` untuk row yang SUDAH ADA harus
      berupa operasi atomic (`increment`/`decrement`) yang dieksekusi di database, bukan
      overwrite nilai yang dibaca sebelumnya.
- [ ] Untuk row `outlet_product_inventory` yang sudah ada, validasi "stock tidak boleh
      negatif setelah adjustment" dan write `stock_qty` terjadi dalam satu operasi atomic
      yang sama (mis. conditional update dengan `WHERE stock_qty + change_qty >= 0`, dicek
      lewat jumlah row terupdate) — TIDAK ada window antara baca stock dan tulis stock di
      mana request lain bisa menyisip.
- [ ] Kalau conditional update mengembalikan 0 row terupdate untuk row yang sudah ada
      (artinya validasi stok negatif gagal karena kondisi terkini, termasuk akibat race
      dengan request lain), `adjust()` harus melempar `BadRequestException` dengan pesan
      yang menjelaskan insufficient stock — behavior yang terlihat end-user tetap sama
      seperti sebelumnya (tetap ditolak), bukan silently no-op.
- [ ] `inventory_movements.stock_after` yang ditulis pada movement record harus merefleksikan
      nilai `stock_qty` hasil write atomic yang sebenarnya tersimpan di database (dibaca
      ulang dari hasil update, bukan dihitung ulang di application code sebelum write).
- [ ] Path "row belum ada, `change_qty > 0` → create row baru" tetap berfungsi seperti
      sebelumnya (tidak wajib pakai conditional update karena tidak ada row existing untuk
      di-race pada nilai stock-nya) — tapi tetap harus dalam `$transaction` yang sama dengan
      penulisan `inventory_movements`.
- [ ] Path "row belum ada, `change_qty < 0`" tetap melempar `NotFoundException` seperti
      sebelumnya.
- [ ] Test konkuren (dua `adjust()` request paralel pada row yang sama, masing-masing
      `change_qty` negatif yang bila dijumlahkan pas melewati batas stock tersedia) harus
      menghasilkan salah satu request gagal dengan `BadRequestException` dan `stock_qty`
      akhir di database tetap konsisten (tidak boleh negatif, tidak boleh salah satu update
      hilang/lost).
- [ ] Response shape `adjust()` (bentuk object `{ outlet_inventory, movement }`) tidak
      berubah — hanya cara stock dihitung/ditulis yang berubah, bukan API contract.

## Constraints
- Multi-tenant: `merchant_id` HARUS tetap dari JWT (parameter `merchantId` yang sudah ada),
  bukan dari client input — tidak berubah dari implementasi saat ini.
- Semua query lookup (product, outlet, inventory) tetap harus discope oleh `merchant_id`
  seperti kondisi existing.
- Prisma + MySQL — tidak ada tabel/kolom versioning (`version`/`updated_at` optimistic lock)
  di schema `outlet_product_inventory` saat ini; solusi harus memakai kapabilitas yang sudah
  tersedia di Prisma client (conditional `updateMany`/`update` dengan `where` clause yang
  memuat kondisi stock, atau `$transaction(async (tx) => ...)` interactive transaction) —
  TIDAK menambah kolom/migration baru untuk task ini (lihat Out of Scope).
- Pola atomic increment/decrement yang sudah ada di `transactions.service.ts:719-731`
  (`applyInventorySale`) menjadi referensi gaya — tapi kasus di `adjust()` beda karena butuh
  validasi "tidak boleh negatif" sebelum commit, sementara `applyInventorySale` tidak
  melakukan validasi tersebut di titik itu (divalidasi di tempat lain pada alur transaksi).
- Constraint unik `@@unique([outlet_id, product_id])` pada `outlet_product_inventory` tetap
  jadi kunci lookup row (dipakai di `where: { outlet_id_product_id: {...} } }`).
- Jangan ubah `CreateStockAdjustmentDto`, validasi reason (`INCREASE_REASONS`/
  `DECREASE_REASONS`), atau signature public `adjust(dto, merchantId, userId)`.

## Out of Scope
- Menambah kolom optimistic-lock (`version`) ke schema `outlet_product_inventory`.
- Mengubah pola `applyInventorySale` di `transactions.service.ts` (sudah atomic, tidak
  bagian dari bug ini).
- Menangani race condition pada path "create row inventory baru" (dua request konkuren
  create row inventory untuk kombinasi outlet+product yang sama-sama belum ada) — kasus ini
  dilindungi oleh unique constraint database (`unique_outlet_product_inventory`) yang akan
  melempar Prisma error `P2002` kalau terjadi race; menambahkan retry/catch khusus untuk
  skenario ini di luar scope ticket (bug utama ada di path row-sudah-ada).
- Perubahan endpoint/controller/route stock lainnya (`findInventory`, `findLogs`) — bug ini
  spesifik di method `adjust()`.
- Perubahan pada frontend (`apps/web`) — ticket ini backend-only, tidak ada perubahan
  request/response contract yang terlihat client.

## Dependensi
- Tidak ada dependensi task lain yang harus selesai duluan — perbaikan ini self-contained di
  dalam `StockService.adjust()`.
