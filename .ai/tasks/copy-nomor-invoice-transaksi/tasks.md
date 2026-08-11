## Ticket: copy-nomor-invoice-transaksi

## Backend Tasks
- (none) — tidak ada perubahan API/schema, `id` transaksi sudah ter-expose di response list & detail existing.

## Frontend Tasks
- [ ] FE-1: Buat helper `getInvoiceNumber(id: string): string` (mis. di `apps/web/src/modules/transaction/utils/receiptGenerator.ts` atau file util baru sejenis `invoice.ts` di folder `utils/`) yang mengembalikan `id.slice(0, 8).toUpperCase()` — reuse logic yang sudah ada di `generateReceiptHTML`, jangan duplikasi string literal. Dependency: tidak ada.
- [ ] FE-2: Buat composable/helper `copyToClipboard(text: string): Promise<boolean>` yang coba `navigator.clipboard.writeText`, fallback ke `document.execCommand('copy')` kalau API tidak tersedia/gagal, return boolean sukses/gagal. Taruh di `apps/web/src/modules/transaction/utils/` atau `apps/web/src/helpers/` kalau sudah ada helper serupa di modul lain (cek dulu sebelum bikin baru). Dependency: tidak ada.
- [ ] FE-3: Tambah komponen kecil (atau inline di tempat pakai) "ikon copy nomor invoice" — terima props `invoiceNumber`, render teks nomor invoice + ikon copy PrimeVue (mis. `pi pi-copy`), target sentuh 44x44px lewat padding, `@click.stop` supaya tidak trigger klik parent, panggil FE-2 lalu tampilkan toast via `useToast()` (`primevue/usetoast` — cek dulu apakah modul lain sudah pakai pola ini, ikuti kalau ada). Sembunyikan ikon kalau `invoiceNumber` falsy. Dependency: FE-1, FE-2.
- [ ] FE-4: Pasang komponen/logic dari FE-3 di `apps/web/src/modules/transaction/pages/index.vue` — tambahkan di card transaksi list, berdampingan dengan info transaksi (bukan menggantikan nomor urut baris `#{{ getNoTable(...) }}` yang sudah ada, ini elemen terpisah). Dependency: FE-3.
- [ ] FE-5: Pasang komponen/logic dari FE-3 di `apps/web/src/modules/transaction/pages/detail.vue` — tambahkan di header/info transaksi. Dependency: FE-3.
- [ ] FE-6: Pastikan toast tidak menumpuk saat klik cepat berulang — cek behavior default `useToast()` add() dengan `group`/`id` yang sama supaya toast baru menggantikan (bukan antre), atau clear toast sebelumnya sebelum add baru. Dependency: FE-3.

## Shared Types Tasks
- (none) — tidak ada perubahan tipe API, `id` sudah ada di tipe transaksi existing.

## Docs Tasks
- (none) — tidak ada perubahan `api-contract.md` (tidak ada endpoint baru) atau `database-design.md` (tidak ada schema baru).

## Skip Agents
- backend: Tidak ada perubahan apapun di `apps/api` — fitur murni konsumsi field `id` yang sudah di-expose di response existing.
- documentation: Tidak ada perubahan API contract atau database schema untuk didokumentasikan.
