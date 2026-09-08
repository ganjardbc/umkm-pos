# Tasks: GAN-53 - [SECURITY] Tenant isolation leak on product image association (setImage)

## Backend Tasks
- [x] (apps/api) Implement tenant isolation and upload ownership validation in `ProductsService.setImage` (`apps/api/src/products/products.service.ts`) by validating that the uploader of `upload_id` belongs to the requesting `merchantId`.
- [x] (apps/api) Add unit tests for `setImage` in `apps/api/src/products/products.service.spec.ts` covering success case, missing upload case, and cross-tenant ForbiddenException case.
- [x] (apps/api) Run tests and linting to ensure zero regressions in `apps/api`.
