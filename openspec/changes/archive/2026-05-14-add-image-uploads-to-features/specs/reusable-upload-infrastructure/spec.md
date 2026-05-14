## ADDED Requirements

### Requirement: Shared file upload composable
The system SHALL provide a reusable `useFileUpload` composable that wraps the file upload API call and manages upload state (selectedUploadId, imagePreview) for use across feature modules.

#### Scenario: Upload a file via composable
- **WHEN** a component calls `onUploadImage(event)` with a PrimeVue FileUpload event containing a file
- **THEN** the composable calls `POST /api/v1/uploads` with the file as multipart/form-data
- **AND** stores the returned `id` in `selectedUploadId` and `url` in `imagePreview`

#### Scenario: Remove selected upload
- **WHEN** a component calls `onRemoveImage()`
- **THEN** `selectedUploadId` is set to `null` and `imagePreview` is set to `null`

#### Scenario: Reset upload state
- **WHEN** a component calls `resetUpload()`
- **THEN** both `selectedUploadId` and `imagePreview` are reset to their initial `null` values

### Requirement: Reusable file upload UI component
The system SHALL provide a `UiFileUpload` component that renders a file upload area with image preview, placeholder, remove button, and validation hints, accepting `selectedUploadId` and `previewUrl` as v-model.

#### Scenario: Display placeholder when no file selected
- **WHEN** `previewUrl` is null
- **THEN** the component SHALL display a dashed-border box with an image icon and the text "Click to upload"

#### Scenario: Display image preview after upload
- **WHEN** `previewUrl` is a non-null URL
- **THEN** the component SHALL display an `<img>` tag with that URL as the src

#### Scenario: Show remove button only when image exists
- **WHEN** `previewUrl` is non-null
- **THEN** the component SHALL display a red "Remove" button

#### Scenario: Hide remove button when no image
- **WHEN** `previewUrl` is null
- **THEN** the component SHALL NOT display the remove button

#### Scenario: Validate file type on selection
- **WHEN** a user selects a file with a MIME type other than image/jpeg, image/png, or image/webp
- **THEN** the component SHALL show an error toast and NOT upload the file

#### Scenario: Enforce file size limit
- **WHEN** a user selects a file larger than 5 MB
- **THEN** the component SHALL show an error toast and NOT upload the file

### Requirement: Shared upload API service
The system SHALL provide a shared `src/services/uploads.ts` module with functions for uploading files and associating uploads with merchants, outlets, and users.

#### Scenario: Upload file via shared service
- **WHEN** `postUpload(file)` is called
- **THEN** it SHALL POST multipart/form-data to `/api/v1/uploads` and return the response data

#### Scenario: Set merchant image
- **WHEN** `setMerchantImage(id, uploadId)` is called
- **THEN** it SHALL PATCH `/api/v1/merchants/${id}/image` with `{ upload_id }`

#### Scenario: Remove merchant image
- **WHEN** `removeMerchantImage(id)` is called
- **THEN** it SHALL DELETE `/api/v1/merchants/${id}/image`

#### Scenario: Set outlet image
- **WHEN** `setOutletImage(id, uploadId)` is called
- **THEN** it SHALL PATCH `/api/v1/outlets/${id}/image` with `{ upload_id }`

#### Scenario: Remove outlet image
- **WHEN** `removeOutletImage(id)` is called
- **THEN** it SHALL DELETE `/api/v1/outlets/${id}/image`

#### Scenario: Set user avatar
- **WHEN** `setUserAvatar(id, uploadId)` is called
- **THEN** it SHALL PATCH `/api/v1/users/${id}/avatar` with `{ upload_id }`

#### Scenario: Remove user avatar
- **WHEN** `removeUserAvatar(id)` is called
- **THEN** it SHALL DELETE `/api/v1/users/${id}/avatar`
