## Ticket: GAN-43
## Status: PLAN

## Deskripsi
Menambahkan indikator loading (spinner) dan disabled state pada tombol "Simpan" di halaman tambah outlet (`apps/web/src/modules/outlet/pages/create.vue`) dan halaman edit outlet (`apps/web/src/modules/outlet/pages/edit.vue`) saat proses submit form sedang berlangsung untuk mencegah double submit oleh user.

## Acceptance Criteria
- [ ] Tombol submit ("Save") menampilkan spinner (PrimeVue `:loading` prop) saat `isSubmitting = true`.
- [ ] Status `isSubmitting` di-set `true` segera setelah form dinyatakan valid pada fungsi `onFormSubmit`.
- [ ] Status `isSubmitting` di-set `false` setelah proses API call selesai (baik sukses maupun gagal) di dalam blok `finally`.
- [ ] Tombol kembali ke kondisi normal setelah status loading selesai.
- [ ] Tidak ada perubahan fungsionalitas atau alur logika submit/API call yang sudah ada.

## Constraints
- Hanya merubah file frontend (`create.vue` dan `edit.vue` di `apps/web/src/modules/outlet/pages/`).
- Murni UI state, tidak mengubah logic backend atau response handler.

## Out of Scope
- Perubahan pada API endpoint `/outlets` atau server-side handling.
- Perubahan loading state di halaman atau modul lain di luar outlet.

## Dependensi
- Modul outlet frontend sudah ada dan dapat berjalan.
