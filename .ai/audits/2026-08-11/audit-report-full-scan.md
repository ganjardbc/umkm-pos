## Audit: 2026-08-11
## Agent: audit-scan (command)
## Scope: (kosong) — full-scan seluruh modul aplikasi

## Ringkasan

Struktur workspace terverifikasi dari `pnpm-workspace.yaml` (`apps/*`, `packages/*`): `apps/api` (NestJS, 24 service, 152 file TS), `apps/web` (Vue 3, 21 modul, 321 file), `apps/landing`, plus 3 package shared. Kondisi umum: layering controller/service dan enforcement `merchant_id` sudah konsisten diterapkan di sebagian besar modul, tapi ada beberapa lubang nyata — tabel `roles`/`permissions` tidak punya kolom tenant sama sekali, laporan penjualan tidak mengecualikan transaksi batal, dan pengurangan stok dijalankan tanpa proteksi konkurensi. Ditemukan 28 temuan prioritas (7 Critical, 21 Moderate) dan 12 temuan minor.

## Temuan Prioritas

### Modul Transactions & Stock

### 1. [BUG] Validasi stok dibaca di luar transaksi DB — oversell saat konkuren
- **Lokasi:** `apps/api/src/transactions/transactions.service.ts:568-620` (baca) dan `apps/api/src/transactions/transactions.service.ts:718-731` (tulis)
- **Kategori:** `BUG`
- **Severity:** Critical
- **Masalah:** `prepareTransactionPayload()` membaca `outlet_product_inventory` lewat `this.prisma` (koneksi di luar `$transaction`), lalu memvalidasi `outletInventory.stock_qty < item.qty` pada baris 601. Penulisan baru terjadi kemudian di dalam `$transaction` (`applyInventorySale`) dengan `stock_qty: { decrement: item.qty }` tanpa pengecekan ulang dan tanpa row lock. Dua kasir yang menjual produk terakhir secara bersamaan sama-sama lolos validasi.
- **Dampak:** `stock_qty` bisa jadi negatif, oversell ke pelanggan. Lebih parah, `stock_after` di `inventory_movements` (baris 617 → 739) dihitung dari snapshot lama, jadi audit trail inventory mencatat angka yang tidak pernah benar-benar terjadi — rekonsiliasi stok tidak bisa dipercaya.
- **Usulan:** Pindahkan pembacaan + validasi stok ke dalam `$transaction` yang sama dengan penulisan, pakai conditional update (`updateMany` dengan `where: { stock_qty: { gte: qty } }` lalu cek `count`) atau `SELECT ... FOR UPDATE`, dan ambil `stock_after` dari nilai balikan update, bukan dari hitungan di memori.

### 2. [BUG] `shift_id` tidak divalidasi terhadap outlet transaksi
- **Lokasi:** `apps/api/src/transactions/transactions.service.ts:675-704`, `apps/api/src/shifts/shifts.service.ts:1074-1086`
- **Kategori:** `BUG`
- **Severity:** Moderate
- **Masalah:** `resolveCashierForPos()` memvalidasi shift open (`validateShiftOpen`) dan keanggotaan user (`isActiveParticipant`), lalu memvalidasi outlet milik merchant — tapi tidak pernah membandingkan `shift.outlet_id` dengan `dto.outlet_id`. `validateShiftOpen` sendiri query `shifts.findFirst({ where: { id: shiftId } })` tanpa scoping apapun. Kasir yang jadi participant shift di Outlet A bisa membuat transaksi di Outlet B sambil melampirkan `shift_id` Outlet A.
- **Dampak:** Transaksi tercatat pada shift outlet lain. Laporan tutup shift, hitungan kas, dan metrik per-participant (`metrics.service.ts`) jadi salah lintas outlet.
- **Usulan:** Buat `validateShiftOpen` mengembalikan shift dan verifikasi `shift.outlet_id === dto.outlet_id` di `resolveCashierForPos`; tambahkan juga scoping merchant di query shift-nya.

### 3. [BUG] Filter `lowStockOnly` diterapkan setelah pagination
- **Lokasi:** `apps/api/src/stock/stock.service.ts:49-72`
- **Kategori:** `BUG`
- **Severity:** Moderate
- **Masalah:** Query mengambil satu halaman (`skip`/`take`) tanpa kondisi low-stock, baru `data.filter((row) => row.stock_qty <= row.min_stock)` di baris 66. `total` di meta tetap hitungan tanpa filter.
- **Dampak:** Halaman low-stock bisa tampil kosong padahal ada item low-stock di halaman lain, dan jumlah total yang ditampilkan salah. Fitur alert stok menipis praktis tidak bisa diandalkan.
- **Usulan:** Pindahkan kondisi ke `where` di level query. Karena Prisma tidak mendukung perbandingan antar kolom di `where`, opsi realistis: tambahkan kolom flag `is_low_stock` yang di-maintain saat update stok, atau pakai `$queryRaw` khusus untuk mode ini.

### 4. [BUG] `stock.adjust` read-then-write dengan nilai absolut di luar transaksi
- **Lokasi:** `apps/api/src/stock/stock.service.ts:177-253`
- **Kategori:** `BUG`
- **Severity:** Moderate
- **Masalah:** `inventory` dibaca di baris 177, `newStock = currentStock + dto.change_qty` dihitung di memori (baris 193), lalu ditulis sebagai nilai absolut `stock_qty: newStock` (baris 209). Query baca berada di luar `$transaction` (yang baru dimulai di baris 228).
- **Dampak:** Lost update — dua penyesuaian stok bersamaan, atau penyesuaian yang bersamaan dengan penjualan (temuan #1), membuat salah satu perubahan hilang total. `stock_after` di `inventory_movements` juga ikut salah.
- **Usulan:** Bungkus baca+tulis dalam satu `$transaction` interaktif dan gunakan operasi relatif (`increment`/`decrement`), bukan set absolut; ambil `stock_after` dari hasil update.

### 5. [PERFORMANCE] Dua query per item di dalam transaksi penjualan
- **Lokasi:** `apps/api/src/transactions/transactions.service.ts:718-747`, dan pola sama di `apps/api/src/transactions/transactions.service.ts:310-341` (cancel)
- **Kategori:** `PERFORMANCE`
- **Severity:** Moderate
- **Masalah:** `applyInventorySale` melakukan `update` + `create` berurutan di dalam `for` loop per item transaksi. Keranjang 20 item = 40 round-trip DB, semuanya di dalam satu transaksi terbuka.
- **Dampak:** Durasi transaksi DB memanjang seiring ukuran keranjang → lock ditahan lebih lama, throughput POS turun, risiko transaction timeout saat jam ramai.
- **Usulan:** Pertahankan update stok per baris (butuh atomicity), tapi gabungkan penulisan `inventory_movements` jadi satu `createMany` setelah loop update selesai.

### Modul Reports

### 6. [BUG] Laporan pendapatan tidak mengecualikan transaksi yang dibatalkan
- **Lokasi:** `apps/api/src/reports/reports.service.ts:129-137` (top products), `:175-183` (outlet comparison), `:238-246` (export CSV)
- **Kategori:** `BUG`
- **Severity:** Critical
- **Masalah:** Ketiga `txWhere` hanya berisi `outlet_id` dan rentang tanggal. Tidak ada `is_cancelled: false`, padahal kolom itu ada di model `transactions` (`prisma/schema.prisma:380`) dan dipakai konsisten di `metrics.service.ts` serta `shifts.service.ts`.
- **Dampak:** Transaksi yang sudah dibatalkan (stoknya sudah dikembalikan) tetap dihitung sebagai penjualan di Top Products, Outlet Comparison, dan Dashboard. Angka pendapatan yang dilihat pemilik usaha lebih besar dari kenyataan — ini output yang dipakai untuk keputusan bisnis.
- **Usulan:** Tambahkan `is_cancelled: false` ke `txWhere` di ketiga tempat; untuk export CSV, pertahankan baris batal tapi beri kolom penanda seperti sekarang, atau jadikan opsi query.

### 7. [BUG] `date_to` di-parse ke tengah malam sehingga hari terakhir hilang
- **Lokasi:** `apps/api/src/reports/reports.service.ts:44-46`, dipakai di `:132-137`, `:178-183`, `:241-246`
- **Kategori:** `BUG`
- **Severity:** Moderate
- **Masalah:** `parseDate('2026-08-11')` menghasilkan `2026-08-11T00:00:00Z`, lalu dipakai sebagai `created_at: { lte: dateTo }`. Semua transaksi pada tanggal itu setelah pukul 00:00 tidak ikut terhitung.
- **Dampak:** Laporan rentang tanggal secara sistematis kehilangan satu hari penuh di ujung akhir. Filter "hari ini" mengembalikan nol.
- **Usulan:** Normalisasi `date_to` ke akhir hari (`lt` hari berikutnya) khusus untuk perbandingan terhadap kolom timestamp; `daily_reports.report_date` yang bertipe date tidak terpengaruh dan bisa tetap seperti sekarang.

### 8. [PERFORMANCE] `getTopProducts` memuat seluruh ID transaksi ke memori
- **Lokasi:** `apps/api/src/reports/reports.service.ts:139-156`
- **Kategori:** `PERFORMANCE`
- **Severity:** Critical
- **Masalah:** Query mengambil `id` semua transaksi merchant dalam rentang tanggal tanpa `take`, memetakannya jadi array, lalu mengirimnya sebagai `transaction_id: { in: txIds }` ke `groupBy`.
- **Dampak:** Merchant dengan ratusan ribu transaksi menghasilkan array besar di memori Node dan klausa `IN` raksasa. MySQL punya batas `max_allowed_packet`; sebelum itu tercapai, latensi dan konsumsi memori sudah melonjak. Tanpa filter tanggal (parameter opsional), ini menyapu seluruh riwayat merchant.
- **Usulan:** Ganti dua langkah ini dengan satu agregasi yang melakukan join langsung — `$queryRaw` yang menggabungkan `transaction_items` ke `transactions` dengan filter outlet/tanggal, atau tambahkan denormalisasi `outlet_id`/`created_at` ke `transaction_items` supaya `groupBy` Prisma bisa memfilter sendiri.

### 9. [PERFORMANCE] Agregasi di JavaScript dan endpoint list tanpa batas
- **Lokasi:** `apps/api/src/reports/reports.service.ts:68-78` (summary), `:112-116` (daily reports), `:248-258` (export)
- **Kategori:** `PERFORMANCE`
- **Severity:** Moderate
- **Masalah:** `getSummary` menarik seluruh baris `daily_reports` lalu menjumlahkan dengan `reduce` padahal `prisma.aggregate` bisa melakukannya di DB. `getDailyReports` — yang komentarnya sendiri menyebut "paginated rows" (baris 93-94) — tidak memiliki `skip`/`take` sama sekali. `exportTransactionsToCsv` menarik seluruh transaksi beserta relasi outlet tanpa batas.
- **Dampak:** Konsumsi memori naik linier terhadap umur data merchant; export bisa membuat proses API kehabisan heap. Komentar "paginated" yang tidak sesuai kode juga menyesatkan pembaca berikutnya.
- **Usulan:** Pakai `aggregate` untuk summary; tambahkan pagination nyata di `getDailyReports` (atau perbaiki komentarnya bila memang disengaja); untuk export, streaming per batch (cursor) alih-alih memuat sekaligus.

### Modul RBAC & Auth

### 10. [BUG] `roles` dan `permissions` global tanpa kolom tenant
- **Lokasi:** `apps/api/prisma/schema.prisma:229-237` (roles), `:106-115` (permissions), `apps/api/src/rbac/rbac.service.ts:22-102`, `:108-160`
- **Kategori:** `BUG`
- **Severity:** Critical
- **Masalah:** Kedua model tidak punya `merchant_id`, dan `name`/`code` di-unique secara global. Konsekuensinya seluruh operasi RBAC di service tidak bisa di-scope: `createRole` menolak nama yang sudah dipakai merchant lain, `findAllRoles` mengembalikan role semua tenant, `updateRole`/`removeRole` menerima `id` apapun tanpa cek kepemilikan. Ini bertentangan langsung dengan ADR-001 dan `apps/api/CLAUDE.md` § Multi-Tenant Enforcement ("All queries must scope by `merchant_id`").
- **Dampak:** Merchant yang punya permission `role.update`/`role.delete` dapat mengubah atau menghapus role yang dipakai seluruh tenant lain — `user_roles` punya `onDelete: Cascade` ke `roles` (`schema.prisma:459`), jadi menghapus satu role akan mencabut akses pengguna di semua merchant.
- **Usulan:** Keputusan arsitektur (lihat § Catatan): tentukan apakah role bersifat template global read-only + role kustom per merchant, atau sepenuhnya per-tenant. Apapun pilihannya butuh migrasi kolom `merchant_id` dan penyesuaian unique key jadi `[merchant_id, name]` / `[merchant_id, code]`.

### 11. [BUG] Endpoint RBAC tanpa permission guard dan tanpa scoping merchant
- **Lokasi:** `apps/api/src/rbac/rbac.controller.ts:209-217` (`GET /rbac/users/:userId/roles`), `:51-52` (`GET /rbac/roles`), `:109-110` (`GET /rbac/permissions`); service di `apps/api/src/rbac/rbac.service.ts:294-313`
- **Kategori:** `BUG`
- **Severity:** Critical
- **Masalah:** Tiga endpoint punya `@RequirePermission` yang dikomentari (`// @RequirePermission('role.read')` di baris 52 dan 110) atau tidak ada sama sekali (baris 210). `getUserRoles(userId)` query `user_roles` hanya dengan `user_id` — tanpa parameter `merchantId` sama sekali. Diperkenalkan di commit `fc36c30` (14 Mei 2026) dan tidak pernah ditindaklanjuti.
- **Dampak:** Pengguna terautentikasi dari merchant manapun bisa membaca role + daftar permission lengkap pengguna merchant lain hanya dengan menebak/mengetahui UUID-nya, plus mengenumerasi seluruh katalog role dan permission sistem.
- **Usulan:** Aktifkan kembali `@RequirePermission` pada ketiga endpoint dan tambahkan parameter `merchantId` dari `@CurrentUser` ke `getUserRoles`, dengan filter `users: { merchant_id: merchantId }`.

### 12. [BUG] Login mencari user hanya berdasarkan email padahal email unik per merchant
- **Lokasi:** `apps/api/src/auth/auth.service.ts:32-45`, kontras dengan `apps/api/prisma/schema.prisma:492` (`@@unique([merchant_id, email])`)
- **Kategori:** `BUG`
- **Severity:** Moderate
- **Masalah:** Skema sengaja membuat email unik *per merchant*, tapi `login()` memakai `findFirst({ where: { email: dto.email } })` — mengambil baris pertama yang cocok tanpa deterministic ordering. Komentar di baris 30-31 mengakui masalah ini tapi tetap dibiarkan.
- **Dampak:** Begitu dua merchant punya user dengan email sama, hanya satu yang bisa login; yang lain selalu gagal verifikasi password tanpa pesan yang menjelaskan. `register()` (baris 117-123) menambal gejalanya dengan menolak email duplikat lintas merchant — yang justru meniadakan manfaat unique key per-merchant dan memblokir pendaftaran yang seharusnya sah.
- **Usulan:** Putuskan satu model: (a) email global unik → tambahkan unique index global dan sederhanakan skema, atau (b) email per-merchant → login harus menyertakan identifier merchant (slug/subdomain) dan cek duplikat saat register dibatasi ke merchant terkait.

### 13. [BUG] Response transaksi menyertakan baris `users` utuh termasuk `password_hash`
- **Lokasi:** `apps/api/src/transactions/transactions.service.ts:69-77` (`findAll`), `:95-103` (`findOne`)
- **Kategori:** `BUG`
- **Severity:** Critical
- **Masalah:** Kedua query memakai `include: { users: true, cashier: true }` tanpa `select`. Model `users` memuat `password_hash` (`prisma/schema.prisma:476`). `TransformInterceptor` hanya membungkus `{success, data}` dan tidak melakukan sanitasi field. Ini menyimpang dari pola yang sudah benar di modul lain — `users.service.ts:52,73,115` membuang `password_hash` secara eksplisit, dan `shifts.service.ts` konsisten memakai `select: { id, name, username }`.
- **Dampak:** Setiap pemanggilan daftar transaksi mengirim bcrypt hash milik kasir dan pembuat transaksi ke klien. Selain itu payload membengkak: satu halaman 10 transaksi ikut membawa baris `outlets`, `shifts`, `customer_sessions`, dan dua baris `users` utuh.
- **Usulan:** Ganti `users`/`cashier` jadi `select: { id: true, name: true, username: true }` seperti pola di `shifts.service.ts`, dan persempit relasi lain ke kolom yang benar-benar dipakai frontend.

### Modul Shifts

### 14. [BUG] `closeShift` menjalankan tiga penulisan tanpa transaksi
- **Lokasi:** `apps/api/src/shifts/shifts.service.ts:396-459`
- **Kategori:** `BUG`
- **Severity:** Moderate
- **Masalah:** Update status shift (baris 421), penandaan seluruh participant sebagai removed (baris 431), dan penulisan audit log (baris 442) dijalankan sebagai tiga operasi `this.prisma` terpisah. Bandingkan dengan `openShift` (baris 271-306), `addParticipant` (688), `removeParticipant` (794), dan `handoffShift` (987) di file yang sama yang semuanya sudah memakai `$transaction`. `apps/api/CLAUDE.md` § Domain Rules mensyaratkan commit atomik.
- **Dampak:** Kegagalan di tengah menyisakan shift berstatus `closed` dengan participant yang masih aktif, atau tanpa entri audit log — padahal audit log inilah yang dipakai `validateAuditTrail` untuk merekonstruksi keadaan shift.
- **Usulan:** Bungkus ketiganya dalam `this.prisma.$transaction(async (tx) => ...)` mengikuti pola method lain di file yang sama. Sekalian ganti `console.error` (baris 456) dengan `Logger` Nest.

### 15. [BUG] Kunci `action_details` audit log tidak cocok antara penulis dan pembaca
- **Lokasi:** penulis `apps/api/src/shifts/shifts.service.ts:698-707` dan `:804-813`; pembaca `apps/api/src/audit-logs/audit-logs.service.ts:109-118`
- **Kategori:** `BUG`
- **Severity:** Moderate
- **Masalah:** `addParticipant` menulis `action_details: { added_user_id: userId }` dan `removeParticipant` menulis `{ removed_user_id: userId }`, tapi `validateAuditTrail` membaca `details?.user_id` untuk kedua action tersebut. Kondisi `if (details?.user_id)` selalu `undefined` sehingga blok di dalamnya tidak pernah jalan.
- **Dampak:** `reconstructed_participants` hanya pernah berisi pemilik shift. Fungsi yang tujuannya memverifikasi konsistensi audit trail selalu melaporkan hasil yang salah — dan karena tidak pernah melempar error, kegagalannya senyap.
- **Usulan:** Samakan kunci di satu tempat. Karena `AuditLogsService.createAuditLog` (baris 11-31) sudah ada tapi tidak dipakai oleh `shifts.service.ts`, rutekan semua penulisan audit log lewat helper itu dengan bentuk payload yang didefinisikan sekali.

### 16. [PERFORMANCE] N+1 count pada daftar shift dan participant
- **Lokasi:** `apps/api/src/shifts/shifts.service.ts:542-568` (`queryShifts`), `:347-366` (`getShift`), `:609-628` (`getShiftParticipants`)
- **Kategori:** `PERFORMANCE`
- **Severity:** Moderate
- **Masalah:** `queryShifts` menjalankan dua `count` (participant + transaksi) per shift di dalam `Promise.all(shifts.map(...))`. `getShift` dan `getShiftParticipants` menjalankan satu `count` transaksi per participant.
- **Dampak:** Halaman 10 shift = 21 query. Halaman shift adalah layar yang sering dibuka manajer outlet, jadi bebannya berulang.
- **Usulan:** Ganti loop count dengan `groupBy` tunggal (`transactions.groupBy({ by: ['shift_id'] })` dan `shift_participants.groupBy({ by: ['shift_id'] })`) lalu petakan hasilnya lewat `Map` — pola ini sudah dipakai di `outlets.service.ts` untuk `product_count`.

### 17. [TECH_DEBT] Blok resolusi `outletIds` per merchant diduplikasi di 7 service
- **Lokasi:** 18 kemunculan; antara lain `apps/api/src/shifts/shifts.service.ts:34-38, 64-68, 99-103, 205-209, 316-320, 399-403, 489-493, 583-587, 641-645, 750-754, 828-832, 949-953`, `apps/api/src/audit-logs/audit-logs.service.ts:43-47`, `apps/api/src/metrics/metrics.service.ts:18-22`, `apps/api/src/transactions/transactions.service.ts:750-757`, `apps/api/src/reports/reports.service.ts:36-40`
- **Kategori:** `TECH_DEBT`
- **Severity:** Moderate
- **Masalah:** Potongan `outlets.findMany({ where: { merchant_id }, select: { id: true } })` → `.map(o => o.id)` disalin apa adanya di seluruh service. `reports.service.ts` sudah memiliki versi yang lebih baik (`resolveOutletIds`, baris 22-41) yang menangani validasi outlet opsional sekaligus — tapi tetap privat dan tidak dipakai ulang.
- **Dampak:** Batas tenant — invariant paling penting di sistem ini per ADR-001 — di-enforce di 18 tempat berbeda. Satu saja terlewat saat menambah service baru berarti kebocoran lintas merchant, dan tidak ada satu titik untuk menambahkan test atau caching.
- **Usulan:** Angkat jadi satu shared provider (mis. `MerchantScopeService.resolveOutletIds(merchantId, outletId?)`) di `src/common/services/`, mengadopsi bentuk yang ada di `reports.service.ts`, lalu ganti seluruh pemanggilan. Catat sebagai golden-example di `docs/golden-examples/`.

### Modul Products & Uploads

### 18. [BUG] Pembuatan produk dan baris inventory tidak atomik
- **Lokasi:** `apps/api/src/products/products.service.ts:191-228` (create), `:283-306` (update)
- **Kategori:** `BUG`
- **Severity:** Moderate
- **Masalah:** `products.create` (baris 191) dan `outlet_product_inventory.upsert` (baris 207) adalah dua panggilan terpisah tanpa `$transaction`. Pada `update`, urutannya malah terbalik: inventory di-upsert lebih dulu (baris 283) baru produk di-update (baris 306).
- **Dampak:** Kegagalan di antara keduanya menghasilkan produk tanpa baris inventory — dan produk tanpa baris inventory akan selalu ditolak saat penjualan (`transactions.service.ts:596-600` melempar `NotFoundException`). Pada `update`, stok bisa sudah berubah sementara perubahan produknya gagal.
- **Usulan:** Bungkus kedua pasangan operasi dalam `$transaction` interaktif.

### 19. [PERFORMANCE] Signed URL mengambil ulang baris upload yang sudah ikut di-include
- **Lokasi:** `apps/api/src/products/products.service.ts:23-32` + `:63-65`; hulu di `apps/api/src/uploads/uploads.service.ts:72-76`; pola sama di `apps/api/src/outlets/outlets.service.ts:60-65` dan `apps/api/src/auth/auth.service.ts:320-350`
- **Kategori:** `PERFORMANCE`
- **Severity:** Moderate
- **Masalah:** `findAll` sudah memakai `include: { upload: true }` (baris 55), jadi baris upload lengkap tersedia di memori. Tapi `attachSignedUrl` tetap memanggil `uploadsService.generateSignedUrl(id)` yang di dalamnya menjalankan `findById` → `prisma.uploads.findUnique` sekali lagi, per produk, di dalam `Promise.all`.
- **Dampak:** Satu halaman 10 produk = 10 query `uploads` yang seluruhnya redundan. Di `auth.service.getUserRbac` pola yang sama berjalan per role assignment saat login. Bila `STORAGE_DRIVER=s3`, setiap panggilan juga menghasilkan operasi signing terpisah.
- **Usulan:** Tambahkan overload yang menerima `s3_key` langsung (mis. `generateSignedUrlFromKey(key)`) dan gunakan `product.upload.s3_key` yang sudah ada, sehingga tidak ada query tambahan.

### 20. [PERFORMANCE] Relasi `merchants` di-include penuh pada setiap baris produk
- **Lokasi:** `apps/api/src/products/products.service.ts:55`, `:118`, `:203`, `:313`, `:350`, `:365`
- **Kategori:** `PERFORMANCE`
- **Severity:** Moderate
- **Masalah:** Setiap query produk memakai `include: { merchants: true, ... }`. Karena semua produk dalam satu response pasti milik merchant yang sama (di-scope oleh `merchant_id` pemanggil), baris merchant yang identik diulang di setiap elemen array.
- **Dampak:** Payload daftar produk membengkak sebanding jumlah baris tanpa memberi informasi baru; data merchant sudah tersedia di frontend dari `APP_MERCHANT` hasil login.
- **Usulan:** Hapus `merchants` dari `include` pada endpoint list, atau persempit ke `select: { id: true, name: true, slug: true }` bila memang ada konsumen yang memerlukannya.

### Modul Customer Catalog

### 21. [BUG] Filter stok tersedia diterapkan setelah pagination
- **Lokasi:** `apps/api/src/customer-catalog/customer-catalog.service.ts:171-190`
- **Kategori:** `BUG`
- **Severity:** Moderate
- **Masalah:** Produk diambil per halaman (baris 165-166), baru difilter `.filter((product) => product.stock_qty > 0)` di baris 180, sementara `total` di meta (baris 187) berasal dari `count` tanpa filter. Kelas masalah yang sama dengan temuan #3.
- **Dampak:** Halaman katalog yang dilihat pelanggan bisa tampil kosong atau hanya berisi 2 dari 10 item padahal masih ada produk tersedia di halaman berikutnya, dan `totalPages` menyesatkan. Ini permukaan yang dilihat langsung pelanggan akhir.
- **Usulan:** Pindahkan kondisi stok ke `where` lewat relasi: `outlet_product_inventory: { some: { outlet_id, is_active: true, stock_qty: { gt: 0 } } }`, sehingga `count` dan `findMany` memakai kriteria yang sama.

### 22. [BUG] Response sesi pelanggan membawa `guest_session_secret` outlet
- **Lokasi:** `apps/api/src/customer-catalog/customer-catalog.service.ts:276-303` (`resolveSession`), dikembalikan lewat `:61-79` (`getSession`) dan `:42-56` (`startSession`)
- **Kategori:** `BUG`
- **Severity:** Critical
- **Masalah:** `resolveSession` memakai `include: { outlets: true }` tanpa `select`, dan hasilnya dikembalikan apa adanya oleh `getSession`. Model `outlets` memuat `guest_session_secret` (`prisma/schema.prisma:60`) — kode rahasia yang justru menjadi satu-satunya syarat untuk membuka sesi pelanggan baru (dicek di baris 35-40). Endpoint katalog bersifat publik (hanya butuh header session token).
- **Dampak:** Siapapun yang berhasil memulai satu sesi pelanggan langsung menerima secret outlet dalam response, dan bisa membuat sesi tanpa batas atau membagikannya. Baris 48 juga menyimpan ulang `secret_code` dalam bentuk plaintext di tabel `customer_sessions`.
- **Usulan:** Ganti ke `select` eksplisit berisi kolom outlet yang memang dibutuhkan frontend katalog (`id`, `name`, `slug`, `logo`). Penanganan penyimpanan/rotasi secret-nya sendiri sebaiknya jadi bahasan security review terpisah — lihat § Catatan.

### Frontend (apps/web)

### 23. [BUG] Penanganan 401 tidak jadi logout bila konfirmasi dibatalkan
- **Lokasi:** `apps/web/src/plugins/axios.ts:41-52`
- **Kategori:** `BUG`
- **Severity:** Moderate
- **Masalah:** Interceptor memanggil `window.confirm(...)` dan hanya menjalankan `removeAuth()` + redirect bila pengguna menekan OK. Bila menekan Cancel, token yang sudah kedaluwarsa tetap tersimpan dan `APP_IS_LOGIN` tetap `'true'`.
- **Dampak:** Aplikasi terjebak di keadaan setengah login: setiap request berikutnya 401 dan memunculkan dialog konfirmasi lagi. Router guard (`global-routes.ts:47-60`) tetap menganggap pengguna login sehingga tidak pernah diarahkan ke halaman login.
- **Usulan:** Selalu jalankan `removeAuth()` saat 401; jadikan dialog sekadar pemberitahuan, bukan syarat. Tambahkan juga penjaga agar dialog tidak muncul berkali-kali saat beberapa request gagal bersamaan.

### 24. [BUG] `getListOutlet` mengembalikan objek kosong untuk nilai yang seharusnya array
- **Lokasi:** `apps/web/src/helpers/auth.ts:65-68`
- **Kategori:** `BUG`
- **Severity:** Moderate
- **Masalah:** Nilai yang disimpan selalu array (`setAuth` baris 27-36 memakai `flatMap`), tapi fallback saat localStorage kosong adalah `{}` — bukan `[]`. Bandingkan `getPermissions` (baris 92-95) yang fallback-nya sudah benar `[]`.
- **Dampak:** Kode pemanggil yang melakukan `.map()`/`.length`/`v-for` atas hasilnya akan melempar TypeError begitu `APP_LIST_OUTLET` hilang — kondisi yang persis terjadi setelah `removeAuth()` atau saat localStorage dibersihkan, yaitu jalur pemulihan yang paling butuh tahan banting.
- **Usulan:** Ubah fallback jadi `[]`.

### Dokumentasi & Konvensi

### 25. [TECH_DEBT] Dokumentasi model stok tidak sesuai implementasi
- **Lokasi:** `CLAUDE.md` § Core Data Relationships, `apps/api/CLAUDE.md` § Domain Rules; kode di `apps/api/src/products/products.service.ts:197-198`, `apps/api/src/stock/stock.service.ts:76`; skema `apps/api/prisma/schema.prisma:297-310`
- **Kategori:** `TECH_DEBT`
- **Severity:** Moderate
- **Masalah:** Kedua CLAUDE.md menyatakan "`products.stock_qty` = current; `stock_logs` = audit trail". Kenyataannya stok live ada di `outlet_product_inventory.stock_qty` dan jejak audit di `inventory_movements`. Tabel `stock_logs` tidak pernah dibaca maupun ditulis oleh kode manapun — satu-satunya sisa adalah komentar usang di `stock.service.ts:76` yang menyebut "List all stock_logs" pada method yang sebenarnya query `inventory_movements`. `products.stock_qty` di-hardcode `0` saat create (baris 197) dan tidak pernah diperbarui.
- **Dampak:** Dokumen yang jadi acuan utama agent maupun developer baru menunjuk ke tabel yang mati. Lebih berisiko lagi, `products.stock_qty` yang selalu bernilai 0 tetap ikut di setiap response produk — konsumen yang mempercayai dokumentasi akan membaca field itu dan menampilkan stok nol.
- **Usulan:** Perbarui kedua CLAUDE.md agar menyebut `outlet_product_inventory` + `inventory_movements`; putuskan nasib tabel `stock_logs` (drop lewat migrasi atau catat sebagai deprecated); pertimbangkan menghapus `products.stock_qty`/`min_stock` dari response bila tidak lagi bermakna.

### Test Coverage

### 26. [COVERAGE] Modul API dengan risiko tertinggi tidak punya unit test
- **Lokasi:** tidak ada `*.spec.ts` untuk `apps/api/src/reports/`, `apps/api/src/auth/`, `apps/api/src/customer-catalog/`, `apps/api/src/settings/`, `apps/api/src/users/`, `apps/api/src/outlets/`, `apps/api/src/merchants/`, `apps/api/src/metrics/`
- **Kategori:** `COVERAGE`
- **Severity:** Moderate
- **Masalah:** Dari 24 service hanya 8 yang punya spec. Yang tidak tercakup mencakup `reports` (sumber temuan #6-#9, menghasilkan angka finansial), `auth` (login dan penerbitan token, temuan #12), dan `customer-catalog` (permukaan publik tanpa autentikasi, temuan #21-#22).
- **Dampak:** Bug seperti transaksi batal yang ikut terhitung sebagai pendapatan bisa bertahan berapa rilis pun tanpa terdeteksi. Perbaikan atas temuan di laporan ini juga tidak punya jaring pengaman regresi.
- **Usulan:** Prioritaskan spec untuk `reports.service` (filter `is_cancelled` dan batas rentang tanggal) dan `customer-catalog.service` (pagination + kolom yang boleh keluar), mengikuti pola mock Prisma yang sudah dipakai di `transactions.service.spec.ts`.

### 27. [COVERAGE] Frontend hanya punya test di satu modul dari 21
- **Lokasi:** `apps/web/src/modules/dashboard/**/__tests__/` (7 file); 20 modul lain tidak punya test sama sekali
- **Kategori:** `COVERAGE`
- **Severity:** Moderate
- **Masalah:** Modul `transaction`/`pos` (alur kasir), `shift`, `stock`, dan `auth` — termasuk helper `helpers/auth.ts` dan `plugins/axios.ts` yang jadi sumber temuan #23 dan #24 — tidak memiliki test.
- **Dampak:** Logika sensitif seperti pemetaan RBAC di `setAuth` dan penanganan 401 hanya terverifikasi lewat pengujian manual.
- **Usulan:** Mulai dari unit test murni untuk `helpers/auth.ts` (`setAuth`/`getListOutlet`/`isHasPermission`) — tanpa kebutuhan mount komponen, jadi biayanya rendah — lalu naik ke store POS.

### 28. [TECH_DEBT] Angka konkurensi POS tidak punya test yang menjaganya
- **Lokasi:** `apps/api/src/transactions/transactions.service.spec.ts`, `apps/api/src/stock/stock.service.spec.ts`
- **Kategori:** `COVERAGE`
- **Severity:** Moderate
- **Masalah:** Spec yang ada memakai mock Prisma sehingga menguji alur happy path dan validasi input, tapi tidak ada yang menyentuh perilaku di bawah konkurensi — persis area temuan #1 dan #4. `shifts.service.properties.spec.ts` menunjukkan property-based testing sudah dikenal di repo ini, tapi belum diterapkan ke stok.
- **Dampak:** Perbaikan atas #1/#4 tidak akan bisa dibuktikan benar oleh test suite saat ini, dan regresi ke pola read-then-write akan lolos review.
- **Usulan:** Tambahkan test integrasi terhadap database nyata (bukan mock) yang menjalankan dua penjualan bersamaan atas produk dengan stok 1 dan mengharapkan tepat satu yang berhasil.

## Temuan Non-Prioritas (dicatat, tidak diusulkan jadi task)

- `TECH_DEBT`, `apps/web/src/helpers/auth.ts:117-126`, Minor — `removeAuth()` tidak menghapus `APP_BEARER` yang di-set di baris 14.
- `TECH_DEBT`, `apps/web/src/helpers/auth.ts:86-90`, Minor — `isUserNotAdmin()` tidak dipakai di mana pun dan memeriksa nama role `admin`/`superadmin`, bertentangan dengan konvensi permission-code; masih didokumentasikan di `apps/web/CLAUDE.md`.
- `TECH_DEBT`, `apps/web/src/helpers/auth.ts:98`, Minor — `defaultOfPermissions: ['dashboard.view', 'reports.view']`; kedua kode itu tidak ada di seed permission (yang dipakai `report.read`), jadi efektif dead code yang menyesatkan.
- `TECH_DEBT`, `apps/web/src/modules/auth/services/mockapi.ts`, Minor — mock login beserta permission format lama (`dashboard:view` dengan titik dua) masih ada di source.
- `BUG`, `apps/api/src/shifts/shifts.service.ts:174-186`, Minor — komentar menyatakan mencegah shift kedua "in the same outlet", tapi query difilter `shift_owner_id` sehingga hanya per-user.
- `TECH_DEBT`, `apps/api/src/shifts/shifts.service.ts:456`, Minor — `console.error` alih-alih `Logger` Nest.
- `TECH_DEBT`, `apps/api/src/shifts/shifts.service.ts:1088-1090`, Minor — komentar JSDoc `handoffShift` menggantung di akhir class tanpa method.
- `BUG`, `apps/api/src/auth/auth.service.ts:361-365`, Minor — `catch` tanpa log pada `resolveSignedUrl`; kegagalan S3 jadi senyap.
- `TECH_DEBT`, `apps/api/src/audit-logs/audit-logs.service.ts:11-31`, Minor — `createAuditLog` tidak pernah dipanggil; semua penulisan audit log di-inline di `shifts.service.ts` (terkait temuan #15).
- `TECH_DEBT`, `apps/api/src/products/products.service.ts:317-324`, Minor — `remove()` melakukan hard delete; `transaction_items.product_id` memakai FK sehingga penghapusan produk yang pernah terjual akan gagal di level DB, bukan ditangkap sebagai error domain.
- `PERFORMANCE`, `apps/api/src/metrics/metrics.service.ts:52-60`, Minor — count, sum, dan average dihitung lewat tiga query terpisah padahal satu `aggregate` mencukupi.
- `TECH_DEBT`, `apps/api/src/rbac/rbac.service.ts:22`, `:76`, Minor — parameter `_createdBy`/`_updatedBy` diterima tapi tidak disimpan, sehingga perubahan role tidak punya jejak pelaku.

## Catatan

**Butuh keputusan arsitektur (temuan #10).** Menambahkan `merchant_id` ke `roles`/`permissions` bukan perubahan lokal: menyentuh skema, seed (`prisma/seed.ts:817-837`), ADR-003, dan alur registrasi (`auth.service.ts:181-201` mencari role `owner` secara global). Perlu keputusan manusia lebih dulu tentang modelnya — role template global read-only plus role kustom per merchant, atau sepenuhnya per-tenant — sebelum ini bisa dipecah jadi ticket. Temuan #12 (identitas login lintas merchant) sebaiknya diputuskan bersamaan karena keduanya menyangkut definisi batas tenant.

**Indikasi security di luar scope Auditor CAF.** Beberapa hal ditemukan secara insidental dan sengaja tidak dijadikan temuan prioritas — diserahkan ke security review terpisah sesuai CAF.md § Klaster 4:
- `guest_session_secret` disimpan sebagai plaintext di kolom `outlets` dan disalin lagi ke `customer_sessions.secret_code` (`customer-catalog.service.ts:48`), tanpa mekanisme rotasi maupun rate limit pada endpoint `startSession`.
- Endpoint katalog publik (`listProducts`, `listTables`, `listCategories`) menerima `outlet_id` mentah tanpa autentikasi, sehingga katalog dan denah meja outlet manapun bisa dienumerasi bila UUID diketahui.
- Konsekuensi dari #11 dan #13 punya dimensi security (pembacaan RBAC lintas tenant, kebocoran `password_hash`), tapi keduanya tetap dilaporkan sebagai temuan prioritas karena akar masalahnya adalah bug scoping dan bentuk payload yang bisa diperbaiki lewat jalur normal.

**Cakupan scan.** Full-scan ini menelusuri seluruh service `apps/api` (24 file) beserta skema Prisma, dan pada `apps/web` menyasar lapisan lintas modul (`core/`, `helpers/`, `plugins/`) plus penelusuran kontrak API frontend↔backend — 40 path `/api/v1/*` yang dipanggil frontend semuanya cocok dengan route controller yang ada, tidak ditemukan drift kontrak. Isi 21 modul Vue tidak dibaca satu per satu; audit terfokus per modul frontend (khususnya `transaction`/`pos` dan `shift`) layak dijalankan terpisah lewat `/audit-scan apps/web/src/modules/<nama>`.

**Verifikasi.** Semua temuan didasarkan pada pembacaan kode statis. Klaim performa (#5, #8, #9, #16, #19, #20) berasal dari pola query, bukan profiling runtime — besaran dampaknya perlu diukur dengan volume data produksi sebelum dijadikan prioritas relatif.
