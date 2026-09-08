# Requirements: GAN-53 - [SECURITY] Tenant isolation leak on product image association (setImage)

## Status: PLAN

## Overview
Ticket GAN-53 addresses an IDOR / tenant isolation vulnerability discovered in `ProductsService.setImage` (`apps/api/src/products/products.service.ts`). When associating an uploaded image to a product, the service previously only verified that the product belonged to the requesting merchant and that the upload record existed by ID, but failed to verify whether the upload file was uploaded by a user belonging to the same merchant.

This allowed a user from Merchant A to link files/images uploaded by Merchant B to their own products if they knew or guessed the `upload_id`.

## Scope
- `apps/api/src/products/products.service.ts`: Enforce tenant isolation check when setting a product image in `setImage()`.
- (Optional / Alternative helper) `apps/api/src/uploads/uploads.service.ts`: Add `validateUploadOwnership(uploadId: string, merchantId: string)` helper if preferred for reusability.
- `apps/api/src/products/products.service.spec.ts`: Unit tests verifying tenant isolation in `setImage`.

## Acceptance Criteria
1. **Upload Ownership Validation**:
   - `setImage(id, uploadId, merchantId, userId)` must verify that the upload record exists.
   - It must verify that the user who uploaded the file (`uploads.uploaded_by_id`) belongs to the active `merchantId` (i.e. `uploader.merchant_id === merchantId`).
   - If the upload does not exist, throw `BadRequestException('Upload not found')` or `NotFoundException('Upload not found')`.
   - If the upload belongs to a different merchant, throw `ForbiddenException('You do not have access to this upload')` (or equivalent `ForbiddenException`).
2. **Product Image Association**:
   - When the upload belongs to the current merchant, `setImage` updates `image_upload_id`, `thumbnail` (via signed URL), `updated_by`, and `updated_at` as expected.
3. **Automated Unit Testing**:
   - Unit tests in `products.service.spec.ts` must test:
     - Setting product image succeeds when the upload belongs to the same merchant.
     - Setting product image throws `BadRequestException` when upload does not exist.
     - Setting product image throws `ForbiddenException` when upload belongs to another merchant.
     - Setting product image fails if the product does not belong to the merchant (handled by `findOne`).
4. **Code Quality**:
   - All tests pass (`pnpm --filter umkm-pos-api test`).
   - Typecheck and lint pass without errors.
