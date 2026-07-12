## Ticket: GAN-43

## Backend Tasks
*Tidak ada task backend untuk tiket ini.*

## Frontend Tasks
- [x] FE-1: Buat status state `isSubmitting = ref(false)` di `apps/web/src/modules/outlet/pages/create.vue`.
- [x] FE-2: Tambahkan parameter `:loading="isSubmitting"` pada tag `<Button type="submit" label="Save" ... />` di `apps/web/src/modules/outlet/pages/create.vue`.
- [x] FE-3: Set `isSubmitting.value = true` di awal blok `if (valid)` pada `onFormSubmit` di `apps/web/src/modules/outlet/pages/create.vue`.
- [x] FE-4: Set `isSubmitting.value = false` di dalam blok `finally` pada `onFormSubmit` di `apps/web/src/modules/outlet/pages/create.vue`.
- [x] FE-5: Buat status state `isSubmitting = ref(false)` di `apps/web/src/modules/outlet/pages/edit.vue`.
- [x] FE-6: Tambahkan parameter `:loading="isSubmitting"` pada tag `<Button type="submit" label="Save" ... />` di `apps/web/src/modules/outlet/pages/edit.vue`.
- [x] FE-7: Set `isSubmitting.value = true` di awal blok `if (valid)` pada `onFormSubmit` di `apps/web/src/modules/outlet/pages/edit.vue`.
- [x] FE-8: Set `isSubmitting.value = false` di dalam blok `finally` pada `onFormSubmit` di `apps/web/src/modules/outlet/pages/edit.vue`.

## Shared Types Tasks
*Tidak ada perubahan shared-types untuk tiket ini.*

## Docs Tasks
*Tidak ada update dokumentasi arsitektur/database/API contract untuk tiket ini.*
