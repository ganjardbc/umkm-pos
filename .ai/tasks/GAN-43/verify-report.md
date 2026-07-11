## Ticket: GAN-43
## Agent: frontend
## Status: SUCCESS

## Attempt Log
- Attempt 1: PASS

## Acceptance Criteria
- [x] FE-1: Buat status state `isSubmitting = ref(false)` di `apps/web/src/modules/outlet/pages/create.vue` — Terpenuhi di baris 134.
- [x] FE-2: Tambahkan parameter `:loading="isSubmitting"` pada tag `<Button type="submit" label="Save" ... />` di `apps/web/src/modules/outlet/pages/create.vue` — Terpenuhi di baris 107-112.
- [x] FE-3: Set `isSubmitting.value = true` di awal blok `if (valid)` pada `onFormSubmit` di `apps/web/src/modules/outlet/pages/create.vue` — Terpenuhi di baris 163.
- [x] FE-4: Set `isSubmitting.value = false` di dalam blok `finally` pada `onFormSubmit` di `apps/web/src/modules/outlet/pages/create.vue` — Terpenuhi di baris 192.
- [x] FE-5: Buat status state `isSubmitting = ref(false)` di `apps/web/src/modules/outlet/pages/edit.vue` — Terpenuhi di baris 121.
- [x] FE-6: Tambahkan parameter `:loading="isSubmitting"` pada tag `<Button type="submit" label="Save" ... />` di `apps/web/src/modules/outlet/pages/edit.vue` — Terpenuhi di baris 89-94.
- [x] FE-7: Set `isSubmitting.value = true` di awal blok `if (valid)` pada `onFormSubmit` di `apps/web/src/modules/outlet/pages/edit.vue` — Terpenuhi di baris 148.
- [x] FE-8: Set `isSubmitting.value = false` di dalam blok `finally` pada `onFormSubmit` di `apps/web/src/modules/outlet/pages/edit.vue` — Terpenuhi di baris 176.

## Quality Gate
- Typecheck: PASS
- Lint: PASS
- Build: PASS

## Files Changed
- `apps/web/src/modules/outlet/pages/create.vue`
- `apps/web/src/modules/outlet/pages/edit.vue`

## Catatan
- Perubahan loading state menggunakan state reaktif `isSubmitting` lokal pada komponen frontend.
