## 1. Setup & Dependencies

- [x] 1.1 Install `@aws-sdk/client-s3` and `@aws-sdk/s3-request-presigner` npm packages
- [x] 1.2 Add S3 configuration env vars to `.env.example`: `AWS_REGION`, `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`, `S3_BUCKET_NAME`, `S3_ENDPOINT`, `MAX_FILE_SIZE`, `ALLOWED_MIME_TYPES`

## 2. Database Schema

- [x] 2.1 Create `uploads` Prisma model with fields: id, originalName, mimeType, size, s3Key, bucket, uploadedById, createdAt, updatedAt
- [x] 2.2 Add optional `imageUploadId` field to Product model linking to uploads
- [x] 2.3 Generate and run Prisma migration

## 3. Uploads Module Core

- [x] 3.1 Create `S3ConfigService` to load and validate S3 configuration from env
- [x] 3.2 Create `UploadsService` with methods: upload, findById, generateSignedUrl, delete
- [x] 3.3 Create Multer config with file type and size validation
- [x] 3.4 Create DTOs: `CreateUploadDto`, `UploadResponseDto`, `SignedUrlResponseDto`
- [x] 3.5 Create `UploadsController` with endpoints: POST /uploads, GET /uploads/:id, GET /uploads/:id/signed-url, DELETE /uploads/:id
- [x] 3.6 Create `UploadsModule` and register in AppModule

## 4. Product Image Association

- [x] 4.1 Add PATCH /products/:id/image endpoint to accept uploadId and set product image
- [x] 4.2 Add DELETE /products/:id/image endpoint to remove product image
- [x] 4.3 Update product response DTO to include image URL
- [x] 4.4 Wire image endpoints into existing ProductsModule

## 5. Integrations & Cleanup

- [x] 5.1 Add permission checks for upload delete and product image operations in RBAC
- [x] 5.2 Add S3 config validation on startup (fail fast if misconfigured)
- [x] 5.3 Run lint and tests to verify no regressions
