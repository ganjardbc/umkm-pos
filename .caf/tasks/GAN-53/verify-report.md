# Verify Report: GAN-53 - [SECURITY] Tenant isolation leak on product image association (setImage)

Status: SUCCESS

## Changes Implemented
1. **Tenant Isolation Enforcement in `ProductsService.setImage`** (`apps/api/src/products/products.service.ts`):
   - Validated that the upload record exists; throws `BadRequestException('Upload not found')` if absent.
   - Looked up the uploader via `uploads.uploaded_by_id` and verified `uploader.merchant_id === merchantId`.
   - Throws `ForbiddenException('You do not have access to this upload')` if the uploader does not exist or belongs to a different merchant.
2. **Automated Unit Tests** (`apps/api/src/products/products.service.spec.ts`):
   - Added unit tests for `setImage`:
     - Successful image association when upload belongs to the same merchant.
     - `BadRequestException` when upload does not exist.
     - `ForbiddenException` when upload belongs to another merchant.
     - `ForbiddenException` when uploader user does not exist.
     - `NotFoundException` when product does not exist or belongs to a different merchant.
   - Added unit tests for `removeImage`:
     - Successful image removal.
     - `NotFoundException` when product does not exist.

## Verification Checklist Results
- `pnpm --filter umkm-pos-api run lint` : PASSED
- `pnpm --filter umkm-pos-api run test` : PASSED (14 test suites, 191 tests passed)
- `pnpm --filter umkm-pos-api run build` : PASSED
