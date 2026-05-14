## Context

The API already has a working upload system: `UploadsModule` with `POST /uploads` (multer memory storage, 5MB limit, JPG/PNG/WebP/PDF), two storage drivers (local disk + S3), and a Prisma `uploads` table. The product feature is the only consumer — it stores `image_upload_id` FK and `thumbnail` URL. The frontend has inline upload logic duplicated across product create/edit pages with no reusable composable or component.

Merchants, outlets, and users have `logo`/`avatar` as nullable text fields storing raw URLs with no file upload UI and no FK relation to the uploads table.

## Goals / Non-Goals

**Goals:**
- Add FK columns (logo_upload_id / avatar_upload_id) to merchants, outlets, users linking to uploads.id
- Add PATCH/DELETE image endpoints for merchants, outlets, and users following the same pattern as products
- Create a shared `useFileUpload` composable and `UiFileUpload` component
- Integrate image/avatar upload into merchant, outlet, user, and profile edit/create pages

**Non-Goals:**
- No changes to the existing `POST /uploads` endpoint or storage drivers
- No multi-file upload support
- No image cropping/resizing before upload
- No changes to the product feature's upload flow (it will use the same composable/component once migrated, but that's a future refactor)
- No changes to permission codes — existing `product.update`, `merchants.update`, `outlet.update`, `user.update` permissions are sufficient

## Decisions

### 1. Two-step upload pattern (upload then link) — keep existing approach
Products use a two-step flow: `POST /uploads` returns an ID, then `PATCH /resource/:id/image` links that ID. This decouples file storage from entity association and is already proven. We follow the same pattern for merchants, outlets, and users rather than introducing direct file upload in each endpoint.
- **Alternatives considered:** Single-step upload (multipart directly in PATCH endpoint) — rejected because it would require duplicating multer config, storage logic, and upload validation across modules.

### 2. Prisma FK vs. plain URL column
Add `logo_upload_id` (merchants, outlets) and `avatar_upload_id` (users) as nullable FK columns referencing `uploads(id)` with `onDelete: SetNull`. The existing `logo`/`avatar` text columns remain as denormalized URL caches (auto-populated by the service).
- **Alternatives considered:** Remove the `logo`/`avatar` text columns entirely — rejected because existing API consumers may read these fields directly, and keeping them as cached URLs avoids breaking changes.

### 3. Service method signature — mirror product pattern
Each service gets `setImage(entityId, uploadId, merchantId, userId)` and `removeImage(entityId, merchantId, userId)`. The implementation:
1. Verify entity exists and belongs to the merchant (ownership scope)
2. Look up the upload record (throw if not found)
3. Call `uploadsService.generateSignedUrl(uploadId)` to get the URL
4. Update the entity's FK + URL field
- Auth is already handled by the `PermissionGuard` + `@RequirePermission` decorator at the controller level.

### 4. Composable API design — simple, not over-abstracted
The `useFileUpload` composable exposes:
```ts
const { selectedUploadId, imagePreview, onUploadImage, onRemoveImage, resetUpload } = useFileUpload()
```
- `onUploadImage(event)` — extracts file from PrimeVue FileUpload event, calls `postUpload`, sets `selectedUploadId` and `imagePreview`
- `onRemoveImage()` — clears both refs
- `resetUpload()` — full reset (for form cancellation)
- No tight coupling to any entity — the composable only handles file upload + preview. The caller decides when/how to persist the upload_id (on form submit).

### 5. UiFileUpload component — presentational only
The component receives `modelValue` (uploadId) and `previewUrl` from the parent via v-model or props. It renders the FileUpload, preview image, placeholder, and remove button. Validation hints are baked in (JPG/PNG/WebP, max 5MB).
- Follows existing `UiFormGroup`, `UiCard` conventions in the project.

### 6. Shared API service location
Create `src/services/uploads.ts` containing:
- `postUpload(file)` — moved from product-lists/services/api.ts
- `setMerchantImage(id, uploadId)`
- `removeMerchantImage(id)`
- `setOutletImage(id, uploadId)`
- `removeOutletImage(id)`
- `setUserAvatar(id, uploadId)`
- `removeUserAvatar(id)`

This avoids circular deps and keeps API functions accessible across modules.

### 7. Profile avatar — reuse user avatar endpoint
The profile edit page calls the same `PATCH /api/v1/users/:id/avatar` endpoint (using the logged-in user's ID from auth context). No separate profile avatar endpoint needed.

## Risks / Trade-offs

- **[Risk] Existing `logo`/`avatar` text columns may contain stale URLs after the FK is updated** → Mitigation: the service always regenerates the URL from the upload FK. Legacy data with a non-null `logo` but null `logo_upload_id` will continue to work (backward compat).
- **[Risk] Deleting an upload that's still referenced by a merchant/outlet/user** → Mitigation: FK uses `onDelete: SetNull`. If someone deletes the upload record, the FK becomes null but the `logo`/`avatar` URL field persists (potentially stale). This matches the product behavior.
- **[Risk] No cleanup of orphaned upload records when image is removed** → This matches existing product behavior — `DELETE /:id/image` only unlinks, it doesn't delete the upload. Acceptable for now.
- **[Risk] Large images impact form UX** → Mitigation: 5MB file size limit enforced at multer level, client side shows loading state during upload.
