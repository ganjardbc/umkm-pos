## Context

The UMKM POS API needs file upload capability for product images and general attachments. Currently there is no file storage — the `.env.example` has commented-out local upload config (`MAX_FILE_SIZE`, `UPLOAD_PATH`). We'll use S3-compatible object storage instead of local disk for scalability across multi-outlet deployments. The API is built with NestJS + Prisma + MySQL.

## Goals / Non-Goals

**Goals:**
- Create a reusable `UploadsModule` with CRUD operations for file metadata
- Integrate AWS S3 SDK for object storage (compatible with S3-compatible providers like MinIO, DigitalOcean Spaces)
- Enforce file type and size validation at the API layer
- Generate pre-signed URLs for secure time-limited file access
- Add product image association (file → product)
- Store file metadata in a new `uploads` database table

**Non-Goals:**
- Image processing/resizing (future concern)
- Bulk upload (future concern)
- File versioning
- CDN integration

## Decisions

| Decision | Choice | Rationale |
|---|---|---|
| Storage backend | S3-compatible object storage | Scalable, cost-effective, accessible across outlets. S3 API is the industry standard. |
| SDK | `@aws-sdk/client-s3` + `@aws-sdk/s3-request-presigner` | Official AWS SDK, well-maintained, supports S3-compatible providers via custom endpoint. |
| File validation | `class-validator` + multer file filter | Consistent with existing NestJS validation patterns using `class-validator`. |
| Metadata storage | Database table (`uploads`) | Enables querying, RBAC, and audit trails. S3 is pure object storage — no query capability. |
| File access | Pre-signed URLs | No public bucket needed. Secure, time-limited access controlled server-side. |
| Product image association | Store `imageUploadId` on Product model | Simple foreign key relationship. Avoids denormalizing file URL onto product row. |

**Alternatives considered:**
- *Local disk storage*: Rejected — not scalable across outlets, adds backup complexity.
- *Base64 in database*: Rejected — bloats DB, poor performance, no CDN potential.
- *Public S3 bucket*: Rejected — security risk, no access control.

## Risks / Trade-offs

- [S3 credentials exposure] → Mitigation: use IAM roles or env vars, never expose to client
- [S3 provider outage] → Mitigation: uploads fail gracefully with clear error messages
- [Signed URL expiration] → Mitigation: reasonable default TTL (15 min), configurable via env
- [Storage costs at scale] → Mitigation: track in metrics module, set bucket lifecycle policies

## Migration Plan

1. Add `@aws-sdk/client-s3` and `@aws-sdk/s3-request-presigner` dependencies
2. Create Prisma migration for `uploads` table and `Product.imageUploadId` column
3. Implement `UploadsModule` with controller, service, DTOs
4. Add env vars to `.env.example` and `ConfigModule`
5. Update `ProductsModule` to wire product-image association endpoints
6. Add comprehensive specs

## Open Questions

- Should we support S3-compatible providers that don't support pre-signed URLs? (unlikely)
- Do we need file upload for other entities beyond products (e.g., receipts, avatar)?
