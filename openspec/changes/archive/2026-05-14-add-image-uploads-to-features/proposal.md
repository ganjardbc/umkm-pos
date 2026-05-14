## Why

Currently only the product feature supports proper image upload with a two-step flow (upload then associate) and file picker UI. Merchants, outlets, users, and profile features have `logo`/`avatar` fields as plain URL strings with no file upload UI — the types define the field but users must enter a URL manually. This creates an inconsistent UX and forces workarounds for managing logos and avatars.

## What Changes

**Backend (umkm-pos-api)**:
- Add `logo_upload_id` FK column to `merchants` and `outlets` tables, `avatar_upload_id` FK to `users` table, referencing `uploads.id`
- Add dedicated image endpoints (`PATCH /:id/image`, `DELETE /:id/image`) to merchants and outlets modules (following the product pattern)
- Add dedicated avatar endpoints (`PATCH /:id/avatar`, `DELETE /:id/avatar`) to users module
- Update merchant, outlet, user services to auto-populate `logo`/`avatar` URL from upload FK

**Frontend (umkm-pos-app)**:
- Create reusable `useFileUpload` composable extracting upload logic currently duplicated in product create/edit pages
- Create reusable `UiFileUpload` UI component wrapping PrimeVue `<FileUpload>` with preview, placeholder, remove button, and validation hints
- Move shared upload API functions out of product-lists into a shared service
- Integrate image upload into merchant create/edit pages
- Integrate image upload into outlet create/edit pages
- Integrate avatar upload into user create/edit pages
- Integrate avatar upload into profile edit page

## Capabilities

### New Capabilities
- `reusable-upload-infrastructure`: Shared composable (`useFileUpload`), UI component (`UiFileUpload`), and API service for file upload across features
- `feature-image-uploads`: Backend image/avatar endpoints and frontend integration for merchants, outlets, users, and profile

### Modified Capabilities
- *(none)*

## Impact

**API changes**:
- `PATCH /api/v1/merchants/:id/image` — new endpoint
- `DELETE /api/v1/merchants/:id/image` — new endpoint
- `PATCH /api/v1/outlets/:id/image` — new endpoint
- `DELETE /api/v1/outlets/:id/image` — new endpoint
- `PATCH /api/v1/users/:id/avatar` — new endpoint
- `DELETE /api/v1/users/:id/avatar` — new endpoint

**Database changes**:
- `merchants`: add `logo_upload_id` FK → `uploads(id)`
- `outlets`: add `logo_upload_id` FK → `uploads(id)`
- `users`: add `avatar_upload_id` FK → `uploads(id)`

**Frontend changes**:
- New: `src/composables/useFileUpload.ts`
- New: `src/components/UiFileUpload.vue`
- New/updated API services for merchants, outlets, users, profile
- Updated pages: merchant create/edit, outlet create/edit, user create/edit, profile edit

**No breaking changes** — existing endpoints remain backward compatible.
