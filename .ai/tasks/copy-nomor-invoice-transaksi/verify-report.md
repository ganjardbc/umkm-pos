## Ticket: copy-nomor-invoice-transaksi
## Agent: frontend
## Status: SUCCESS

## Attempt Log
- Attempt 1: PASS — `pnpm --filter umkm-pos-app build` passed (vue-tsc -b + vite build) after implementing FE-1 s/d FE-6.

## Acceptance Criteria
- [x] Setiap baris di riwayat transaksi menampilkan nomor invoice + ikon copy inline, target sentuh minimal 44x44px — `apps/web/src/modules/transaction/components/CopyInvoiceNumber.vue` (`min-h-11 min-w-11` = 44x44px), dipasang di `apps/web/src/modules/transaction/pages/index.vue` di dalam card transaksi (baris baru setelah header card).
- [x] Halaman detail transaksi menampilkan nomor invoice + ikon copy di header, tampilan sama — dipasang di `apps/web/src/modules/transaction/pages/detail.vue` di header card "Transaction Information", reuse komponen yang sama (`CopyInvoiceNumber.vue`).
- [x] Klik ikon copy di list TIDAK ikut trigger navigasi/klik parent — `@click.stop="onCopy"` di `CopyInvoiceNumber.vue`.
- [x] Copy berhasil → toast sukses non-blocking, auto-dismiss ~2-3 detik — `showToast({ type: 'success', ..., life: 2500 })` via `@/helpers/toast.ts` (pola existing di seluruh modul, dipakai konsisten, bukan pola baru `useToast()` langsung).
- [x] Copy gagal → toast error + fallback tetap memungkinkan user dapat nomor invoice — `copyToClipboard()` di `apps/web/src/modules/transaction/utils/clipboard.ts` fallback ke `document.execCommand('copy')` kalau Clipboard API tidak tersedia/gagal; teks nomor invoice juga `select-text` (bisa di-select manual) dan ikut disertakan di pesan toast error sebagai fallback terakhir.
- [x] Klik copy cepat berulang tidak menumpuk toast — guard lokal `isCopying` di `CopyInvoiceNumber.vue` (early-return + reset via `setTimeout` 500ms) mencegah invocation ganda dari double-tap memicu toast berulang.
- [x] Nomor invoice kosong/null → ikon copy disembunyikan — `v-if="invoiceNumber"` di root `<button>` `CopyInvoiceNumber.vue`; `getInvoiceNumber()` (di `receiptGenerator.ts`) return string kosong kalau `id` falsy sehingga `v-if` menyembunyikan tombol.
- [x] Berfungsi di desktop dan mobile web — implementasi murni CSS Tailwind + Clipboard API standar Web (dengan fallback `execCommand`), tidak ada dependency platform-specific.

## Quality Gate
- Typecheck: PASS (bagian dari `vue-tsc -b` di build)
- Lint: SKIPPED (sesuai instruksi — `apps/web` belum punya script `lint` sendiri, tidak jalankan `pnpm lint` tanpa filter karena memicu turbo di semua workspace termasuk `apps/api`)
- Build: PASS

## Files Changed
- apps/web/src/modules/transaction/utils/receiptGenerator.ts — tambah export `getInvoiceNumber(id)`, refactor `generateReceiptHTML` supaya reuse helper ini (bukan lagi inline `id.slice(0,8).toUpperCase()`).
- apps/web/src/modules/transaction/utils/clipboard.ts (baru) — `copyToClipboard(text)`: coba `navigator.clipboard.writeText`, fallback ke `document.execCommand('copy')` via textarea sementara, return boolean.
- apps/web/src/modules/transaction/components/CopyInvoiceNumber.vue (baru) — komponen kecil: terima prop `invoiceNumber`, render teks + ikon `pi-copy`, target sentuh 44x44px, `@click.stop`, panggil `copyToClipboard` lalu `showToast`, guard anti double-tap, sembunyikan diri kalau `invoiceNumber` falsy.
- apps/web/src/modules/transaction/pages/index.vue — import `getInvoiceNumber` + `CopyInvoiceNumber`, pasang komponen di card transaksi list (elemen terpisah dari nomor urut baris `#{{ getNoTable(...) }}` yang sudah ada).
- apps/web/src/modules/transaction/pages/detail.vue — import `getInvoiceNumber` + `CopyInvoiceNumber`, pasang komponen di header card "Transaction Information" di samping judul.

## Catatan
- Task tasks.md FE-3 menyebut opsi pakai `useToast()` (`primevue/usetoast`) langsung. Dicek dulu: tidak ada satupun modul lain di `apps/web/src/modules` yang memanggil `useToast()` langsung — semua konsisten pakai wrapper `showToast()` dari `@/helpers/toast.ts` (yang secara internal jalan lewat `useGlobalToast` -> `UiToast.vue` -> `useToast()`). Mengikuti instruksi requirements.md ("cek dulu sebelum tambah pola baru") dan constraint tasks.md sendiri, saya pakai `showToast()` existing untuk konsistensi lintas modul, bukan `useToast()` langsung.
- Untuk syarat "toast tidak menumpuk saat klik cepat" (FE-6), solusi yang dipilih adalah guard lokal di komponen (`isCopying` flag, early-return selama proses copy + reset window 500ms) — bukan mengubah `group`/dedup logic di `UiToast.vue` global, karena itu infra toast yang dipakai seluruh aplikasi dan mengubahnya di luar scope ticket ini (risiko regresi ke modul lain). Guard lokal cukup untuk mencegah rapid double-tap memicu invocation ganda tanpa menyentuh infra global.
- Tidak menyentuh `bluetoothPrinter.ts` maupun `ReceiptPreview.vue` yang juga punya representasi serupa (`id.slice(0,8).toUpperCase()`) — scope ticket eksplisit hanya minta reuse logic di `receiptGenerator.ts` (`generateReceiptHTML`), bukan refactor semua tempat yang punya pola sama. Di luar scope, bisa jadi technical-debt cleanup terpisah kalau diinginkan.
- Tidak ada perubahan di `apps/api` atau `packages/shared-types` — sesuai scope.
