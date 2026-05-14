## Why

The UMKM POS API currently has no file upload capability. Businesses need to upload product images, receipt attachments, and other media. Storing files locally on the server is not scalable for multi-outlet deployments. Adding S3-compatible object storage provides durable, scalable file storage accessible across all outlets.

## What Changes

- Add a new `uploads` feature module in the API with endpoints for file upload and retrieval
- Integrate AWS S3 SDK for object storage
- Add configuration for S3 credentials and bucket settings
- Support image uploads for products and general file attachments
- Generate signed URLs for secure file access
- Add file type and size validation

## Capabilities

### New Capabilities
- `file-upload`: Upload, retrieve, and delete files via S3-compatible object storage with validation, signed URLs, and product image association

### Modified Capabilities
None — this is a new capability, no existing specs are changing.

## Impact

- New NestJS module: `src/uploads/` with controller, service, DTOs
- New dependency: `@aws-sdk/client-s3` and `@aws-sdk/s3-request-presigner`
- New env vars: `AWS_REGION`, `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`, `S3_BUCKET_NAME`, `S3_ENDPOINT` (optional, for compatible services)
- Prisma schema update to add `file_url` or similar fields on relevant models (e.g., `Product` image)
- Existing product creation/update flows may optionally accept file uploads
