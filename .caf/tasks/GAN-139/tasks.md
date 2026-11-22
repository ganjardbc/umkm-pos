# Tasks: GAN-139 - Slug Otomatis Merchant/Outlet Bisa Ditolak API dan Tidak Bisa Diedit

## Frontend Tasks

- [x] (packages/ui) Tambahkan fungsi helper `slugify(text: string): string` di `packages/ui/src/helpers/utils.ts` untuk membersihkan string menjadi format slug yang valid (`[a-z0-9-]` tanpa leading/trailing hyphen dan tanpa underscore).
- [x] (packages/ui) Pastikan `slugify` diekspor dengan benar dari `packages/ui/src/index.ts` (melalui re-export `utils`).
- [x] (apps/admin) Update `apps/admin/src/modules/merchants/pages/create.vue`:
  - Hapus atribut `readonly` dan `disabled` pada komponen `InputText` untuk field `slug`.
  - Gunakan `slugify` dari `@umkm-pos/ui` di dalam `onNameChange`.
  - Tambahkan validasi regex `/^[a-z0-9-]+$/` pada Zod schema resolver untuk field `slug`.
- [x] (apps/admin) Update `apps/admin/src/modules/outlet/pages/create.vue`:
  - Hapus atribut `readonly` dan `disabled` pada komponen `InputText` untuk field `slug`.
  - Gunakan `slugify` dari `@umkm-pos/ui` di dalam `onNameChange`.
  - Tambahkan validasi regex `/^[a-z0-9-]+$/` pada Zod schema resolver untuk field `slug`.
- [x] (apps/merchant) Update `apps/merchant/src/modules/outlet/pages/create.vue`:
  - Hapus atribut `readonly` dan `disabled` pada komponen `InputText` untuk field `slug`.
  - Gunakan `slugify` dari `@umkm-pos/ui` di dalam `onNameChange`.
  - Tambahkan validasi regex `/^[a-z0-9-]+$/` pada Zod schema resolver untuk field `slug`.
- [x] (packages/ui) Jalankan typecheck: `pnpm --filter @umkm-pos/ui run typecheck`.
- [x] (apps/admin) Jalankan build: `pnpm --filter @umkm-pos/admin run build`.
- [x] (apps/merchant) Jalankan build: `pnpm --filter @umkm-pos/merchant run build`.
