### Requirement: Upload file to S3
The system SHALL accept file uploads via multipart/form-data and store them in an S3-compatible object storage bucket.

#### Scenario: Successful file upload
- **WHEN** a client sends a POST request to `/api/v1/uploads` with a valid file in multipart/form-data
- **THEN** the system SHALL upload the file to the configured S3 bucket and return a 201 response with the file metadata (id, original name, mime type, size, url)

#### Scenario: Upload with invalid file type
- **WHEN** a client uploads a file with an extension not in the allowed list (e.g., .exe)
- **THEN** the system SHALL reject the upload with a 400 Bad Request error

#### Scenario: Upload exceeds maximum file size
- **WHEN** a client uploads a file larger than the configured maximum size
- **THEN** the system SHALL reject the upload with a 413 Payload Too Large error

#### Scenario: Upload without authentication
- **WHEN** an unauthenticated client sends a file upload request
- **THEN** the system SHALL return a 401 Unauthorized error

### Requirement: Retrieve file metadata
The system SHALL allow authenticated clients to retrieve file metadata by ID.

#### Scenario: Get file metadata
- **WHEN** a client sends a GET request to `/api/v1/uploads/:id`
- **THEN** the system SHALL return the file metadata (id, original name, mime type, size, created at)

#### Scenario: Get non-existent file
- **WHEN** a client sends a GET request to `/api/v1/uploads/:id` with a non-existent ID
- **THEN** the system SHALL return a 404 Not Found error

### Requirement: Generate signed URL for file access
The system SHALL generate time-limited signed URLs for secure direct file access.

#### Scenario: Generate signed URL
- **WHEN** a client sends a GET request to `/api/v1/uploads/:id/signed-url`
- **THEN** the system SHALL return a pre-signed S3 URL with a configurable expiration time

### Requirement: Delete file from S3
The system SHALL allow authenticated clients with appropriate permissions to delete files.

#### Scenario: Successful file deletion
- **WHEN** an authorized client sends a DELETE request to `/api/v1/uploads/:id`
- **THEN** the system SHALL delete the file from S3 and the metadata from the database, returning a 200 response

#### Scenario: Delete without permission
- **WHEN** a client without delete permission sends a DELETE request
- **THEN** the system SHALL return a 403 Forbidden error

### Requirement: Associate upload with product
The system SHALL allow associating an uploaded file with a product as its image.

#### Scenario: Set product image
- **WHEN** a client sends a PATCH request to `/api/v1/products/:id/image` with an upload ID
- **THEN** the system SHALL update the product's image reference and return the updated product

#### Scenario: Remove product image
- **WHEN** a client sends a DELETE request to `/api/v1/products/:id/image`
- **THEN** the system SHALL remove the product's image reference
