# Requirements: GAN-139 - Slug Otomatis Merchant/Outlet Bisa Ditolak API dan Tidak Bisa Diedit

## Status: PLAN

## Summary
Saat pembuatan merchant atau outlet di `apps/admin` (dan `apps/merchant`), fungsi pembuat slug `onNameChange` menggunakan regex `/[^\w\s-]/g` yang mempertahankan karakter underscore (`_`), tidak membersihkan leading/trailing hyphens, dan dapat menghasilkan slug kosong jika nama hanya terdiri dari simbol. Di saat yang sama, API (`apps/api`) memvalidasi format slug dengan aturan ketat `/^[a-z0-9-]+$/`. Selain itu, input field slug diset `readonly disabled`, sehingga pengguna tidak dapat memperbaiki slug yang ditolak API atau menyelesaikan konflik slug tanpa mengubah nama.

Solusi:
1. Menyediakan helper function pembuat slug terpusat (`slugify`) di `@umkm-pos/ui` (`packages/ui/src/helpers/utils.ts`) yang menghasilkan string yang sesuai format `^[a-z0-9-]+$`.
2. Menghapus atribut `readonly` dan `disabled` pada field input slug di halaman form pembuatan merchant dan outlet (`apps/admin` dan `apps/merchant`) agar pengguna dapat mengedit slug secara manual.
3. Menambahkan validasi Zod schema untuk field slug pada form merchant dan outlet agar regex `/^[a-z0-9-]+$/` divalidasi langsung di sisi frontend sebelum dikirim ke API.

## Problem Statement
1. **Karakter Terlarang Tidak Terfilter**: `\w` mempertahankan `_` (underscore). Contoh input nama `Toko_Sari` menghasilkan slug `toko_sari`, yang langsung ditolak oleh backend DTO (`apps/api/src/merchants/dto/create-merchant.dto.ts:18`, `apps/api/src/outlets/dto/create-outlet.dto.ts:19`) dengan error HTTP 400 "slug must only contain lowercase letters, numbers and hyphens".
2. **Leading / Trailing Hyphens & Edge Cases**: Input nama dengan spasi di awal/akhir atau simbol menghasilkan slug seperti `-toko-` atau string kosong.
3. **Field Slug Terkunci (`readonly disabled`)**: Input field slug di `apps/admin/src/modules/merchants/pages/create.vue:35-42`, `apps/admin/src/modules/outlet/pages/create.vue:55-62`, dan `apps/merchant/src/modules/outlet/pages/create.vue:35-42` diset `readonly disabled`, sehingga pengguna tidak memiliki opsi manual untuk membetulkan slug atau mengatasi tabrakan slug unik.
4. **Duplikasi Kode Slug Generator**: Logika pembuatan slug diduplikasi di beberapa file komponen halaman.

## Acceptance Criteria

### 1. Shared Slug Helper (`packages/ui`)
- `packages/ui/src/helpers/utils.ts` mengekspor fungsi `slugify(text: string): string` (dan diekspor melalui `packages/ui/src/index.ts`).
- Fungsi `slugify`:
  - Mengubah karakter ke huruf kecil (`toLowerCase()`).
  - Menghapus karakter selain `a-z`, `0-9`, spasi, dan `-` (menghapus underscore `_` dan simbol lainnya).
  - Mengganti spasi atau whitespace berturut-turut dengan satu tanda hubung `-`.
  - Menggabungkan tanda hubung berturut-turut menjadi satu `-`.
  - Menghapus tanda hubung di awal dan di akhir string (trim hyphens `^-+|-+$`).
- Contoh pengujian fungsi:
  - `slugify('Toko_Sari')` -> `'tokosari'`
  - `slugify('  Kopi & Senja - Outlet #1  ')` -> `'kopi-senja-outlet-1'`
  - `slugify('---hello---world---')` -> `'hello-world'`
  - `slugify('!@#$%')` -> `''`

### 2. Form Tambah Merchant di Admin (`apps/admin`)
- `apps/admin/src/modules/merchants/pages/create.vue`:
  - Input field `slug` tidak lagi memiliki atribut `readonly` dan `disabled`.
  - Menggunakan helper `slugify` dari `@umkm-pos/ui` pada event `onNameChange`.
  - Validasi Zod resolver memvalidasi bahwa `slug` wajib diisi dan sesuai regex `/^[a-z0-9-]+$/` dengan pesan error yang jelas (misal: "Slug hanya boleh berisi huruf kecil, angka, dan tanda hubung (-).").

### 3. Form Tambah Outlet di Admin (`apps/admin`)
- `apps/admin/src/modules/outlet/pages/create.vue`:
  - Input field `slug` tidak lagi memiliki atribut `readonly` dan `disabled`.
  - Menggunakan helper `slugify` dari `@umkm-pos/ui` pada event `onNameChange`.
  - Validasi Zod resolver memvalidasi bahwa `slug` wajib diisi dan sesuai regex `/^[a-z0-9-]+$/` dengan pesan error yang jelas.

### 4. Form Tambah Outlet di Merchant App (`apps/merchant`)
- `apps/merchant/src/modules/outlet/pages/create.vue`:
  - Input field `slug` tidak lagi memiliki atribut `readonly` dan `disabled`.
  - Menggunakan helper `slugify` dari `@umkm-pos/ui` pada event `onNameChange`.
  - Validasi Zod resolver memvalidasi bahwa `slug` wajib diisi dan sesuai regex `/^[a-z0-9-]+$/` dengan pesan error yang jelas.

### 5. Build & Typecheck Verification
- `pnpm --filter @umkm-pos/ui run typecheck` berhasil tanpa error.
- `pnpm --filter @umkm-pos/admin run build` berhasil tanpa error.
- `pnpm --filter @umkm-pos/merchant run build` berhasil tanpa error.

## Out of Scope
- Perubahan skema backend database atau backend API DTO validation (`apps/api`), karena validasi backend sudah sesuai aturan spesifikasi.
- Fitur auto-check ketersediaan slug unik secara asynchronous (real-time availability check) — error dari API saat submit jika slug duplikat sudah ditangani oleh handler error bawaan form.

## References
- `apps/admin/src/modules/merchants/pages/create.vue`
- `apps/admin/src/modules/outlet/pages/create.vue`
- `apps/merchant/src/modules/outlet/pages/create.vue`
- `packages/ui/src/helpers/utils.ts`
- `apps/api/src/merchants/dto/create-merchant.dto.ts`
- `apps/api/src/outlets/dto/create-outlet.dto.ts`
