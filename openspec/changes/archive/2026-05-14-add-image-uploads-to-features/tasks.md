## 1. Database — Add FK columns

- [x] 1.1 Add `logo_upload_id` nullable FK column to `merchants` table referencing `uploads(id)` with `onDelete: SetNull`
- [x] 1.2 Add `logo_upload_id` nullable FK column to `outlets` table referencing `uploads(id)` with `onDelete: SetNull`
- [x] 1.3 Add `avatar_upload_id` nullable FK column to `users` table referencing `uploads(id)` with `onDelete: SetNull`
- [x] 1.4 Add `upload` relation to `merchants`, `outlets`, `users` models in Prisma schema
- [x] 1.5 Generate and run Prisma migration

## 2. Backend — Merchant image endpoints

- [x] 2.1 Import `UploadsModule` in `MerchantsModule`
- [x] 2.2 Add `setImage(id, uploadId, merchantId, userId)` method to `MerchantsService` (verify merchant ownership, validate upload, generate URL, update FK + logo field)
- [x] 2.3 Add `removeImage(id, merchantId, userId)` method to `MerchantsService` (set FK + logo to null)
- [x] 2.4 Add `PATCH /merchants/:id/image` and `DELETE /merchants/:id/image` routes to `MerchantsController` with `merchants.update` permission
- [x] 2.5 Create `SetImageDto` with `upload_id` UUID validation (reuse pattern from products DTO)

## 3. Backend — Outlet image endpoints

- [x] 3.1 Import `UploadsModule` in `OutletsModule`
- [x] 3.2 Add `setImage(id, uploadId, merchantId, userId)` method to `OutletsService` (verify outlet ownership, validate upload, generate URL, update FK + logo field)
- [x] 3.3 Add `removeImage(id, merchantId, userId)` method to `OutletsService`
- [x] 3.4 Add `PATCH /outlets/:id/image` and `DELETE /outlets/:id/image` routes to `OutletsController` with `outlet.update` permission

## 4. Backend — User avatar endpoints

- [x] 4.1 Import `UploadsModule` in `UsersModule`
- [x] 4.2 Add `setAvatar(id, uploadId, merchantId, userId)` method to `UsersService` (verify user belongs to same merchant, validate upload, generate URL, update FK + avatar field)
- [x] 4.3 Add `removeAvatar(id, merchantId, userId)` method to `UsersService`
- [x] 4.4 Add `PATCH /users/:id/avatar` and `DELETE /users/:id/avatar` routes to `UsersController` with `user.update` permission

## 5. Frontend — Shared upload infrastructure

- [x] 5.1 Create `src/services/uploads.ts` with `postUpload(file)`, `setMerchantImage(id, uploadId)`, `removeMerchantImage(id)`, `setOutletImage(id, uploadId)`, `removeOutletImage(id)`, `setUserAvatar(id, uploadId)`, `removeUserAvatar(id)`
- [x] 5.2 Update product-lists `api.ts` to import `postUpload` from shared service (or keep re-export for backward compat)
- [x] 5.3 Create `src/composables/useFileUpload.ts` with `selectedUploadId`, `imagePreview` refs and `onUploadImage(event)`, `onRemoveImage()`, `resetUpload()` methods
- [x] 5.4 Create `src/components/UiFileUpload.vue` with PrimeVue FileUpload, image preview, placeholder, remove button, and file type/size hints
- [x] 5.5 Register `UiFileUpload` in global components auto-import (verify it's picked up by `src/core/global-components.ts`)

## 6. Frontend — Merchant pages integration

- [x] 6.1 Update `merchants/create.vue` to include `UiFileUpload` component and call `setMerchantImage` after creation
- [x] 6.2 Update `merchants/edit.vue` to include `UiFileUpload`, display existing logo preview, call `setMerchantImage` or `removeMerchantImage` on save
- [x] 6.3 Update merchant detail page to display logo image if available

## 7. Frontend — Outlet pages integration

- [x] 7.1 Update `outlet/create.vue` to include `UiFileUpload` component and call `setOutletImage` after creation
- [x] 7.2 Update `outlet/edit.vue` to include `UiFileUpload`, display existing logo preview, call `setOutletImage` or `removeOutletImage` on save
- [x] 7.3 Update outlet detail page to display logo image if available

## 8. Frontend — User pages integration

- [x] 8.1 Update `user/create.vue` to include `UiFileUpload` component and call `setUserAvatar` after creation
- [x] 8.2 Update `user/edit.vue` to include `UiFileUpload`, display existing avatar preview, call `setUserAvatar` or `removeUserAvatar` on save
- [x] 8.3 Update user list page to display avatar thumbnails

## 9. Frontend — Profile page integration

- [x] 9.1 Update `profile/edit-profile.vue` to include `UiFileUpload` for avatar, call `setUserAvatar` or `removeUserAvatar` on save
- [x] 9.2 Update profile view page to display user avatar image if available

## 10. Verification

- [x] 10.1 Run `pnpm lint && pnpm test` for umkm-pos-api (no regressions) — `pnpm build` passed clean
- [x] 10.2 Run `pnpm lint` for umkm-pos-app (no regressions) — `pnpm build` (incl. vue-tsc) passed with only pre-existing errors
- [ ] 10.3 Test merchant logo upload end-to-end via API
- [ ] 10.4 Test outlet logo upload end-to-end via API
- [ ] 10.5 Test user avatar upload end-to-end via API
- [ ] 10.6 Test profile avatar upload end-to-end via API
