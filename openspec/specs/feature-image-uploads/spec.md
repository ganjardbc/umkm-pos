## ADDED Requirements

### Requirement: Merchant logo upload
The system SHALL allow uploading and associating a logo image with a merchant record, storing the upload FK and generating a logo URL.

#### Scenario: Set merchant logo
- **WHEN** a user with `merchants.update` permission calls `PATCH /api/v1/merchants/:id/image` with `{ upload_id }`
- **AND** the merchant exists and belongs to the user's merchant scope
- **AND** the upload record exists
- **THEN** the merchant's `logo_upload_id` is set to the upload ID
- **AND** the merchant's `logo` field is updated to the signed URL of the upload

#### Scenario: Set merchant logo with invalid upload ID
- **WHEN** a user calls `PATCH /api/v1/merchants/:id/image` with an upload_id that does not exist
- **THEN** the system SHALL return a 400 Bad Request with message "Upload not found"

#### Scenario: Set merchant logo on non-existent merchant
- **WHEN** a user calls `PATCH /api/v1/merchants/:id/image` with an id that does not exist
- **THEN** the system SHALL return a 404 Not Found

#### Scenario: Remove merchant logo
- **WHEN** a user with `merchants.update` permission calls `DELETE /api/v1/merchants/:id/image`
- **AND** the merchant exists and belongs to the user's merchant scope
- **THEN** the merchant's `logo_upload_id` is set to null
- **AND** the merchant's `logo` field is set to null

### Requirement: Outlet logo upload
The system SHALL allow uploading and associating a logo image with an outlet record, storing the upload FK and generating a logo URL.

#### Scenario: Set outlet logo
- **WHEN** a user with `outlet.update` permission calls `PATCH /api/v1/outlets/:id/image` with `{ upload_id }`
- **AND** the outlet exists and belongs to the user's merchant scope
- **AND** the upload record exists
- **THEN** the outlet's `logo_upload_id` is set to the upload ID
- **AND** the outlet's `logo` field is updated to the signed URL of the upload

#### Scenario: Set outlet logo with invalid upload ID
- **WHEN** a user calls `PATCH /api/v1/outlets/:id/image` with an upload_id that does not exist
- **THEN** the system SHALL return a 400 Bad Request with message "Upload not found"

#### Scenario: Remove outlet logo
- **WHEN** a user with `outlet.update` permission calls `DELETE /api/v1/outlets/:id/image`
- **AND** the outlet exists and belongs to the user's merchant scope
- **THEN** the outlet's `logo_upload_id` is set to null
- **AND** the outlet's `logo` field is set to null

### Requirement: User avatar upload
The system SHALL allow uploading and associating an avatar image with a user record, storing the upload FK and generating an avatar URL.

#### Scenario: Set user avatar
- **WHEN** a user with `user.update` permission calls `PATCH /api/v1/users/:id/avatar` with `{ upload_id }`
- **AND** the user exists and belongs to the same merchant
- **AND** the upload record exists
- **THEN** the user's `avatar_upload_id` is set to the upload ID
- **AND** the user's `avatar` field is updated to the signed URL of the upload

#### Scenario: Set user avatar with invalid upload ID
- **WHEN** a user calls `PATCH /api/v1/users/:id/avatar` with an upload_id that does not exist
- **THEN** the system SHALL return a 400 Bad Request with message "Upload not found"

#### Scenario: Remove user avatar
- **WHEN** a user with `user.update` permission calls `DELETE /api/v1/users/:id/avatar`
- **AND** the user exists and belongs to the same merchant
- **THEN** the user's `avatar_upload_id` is set to null
- **AND** the user's `avatar` field is set to null

### Requirement: Frontend merchant logo upload integration
The merchant create and edit pages SHALL include the shared `UiFileUpload` component for logo selection, and submit the upload_id when saving.

#### Scenario: Create merchant with logo
- **WHEN** a user creates a merchant via the create page
- **AND** they upload a logo image using the file upload component
- **THEN** the form SHALL submit `POST /api/v1/merchants` with merchant data
- **AND** if a logo was uploaded, SHALL call `PATCH /api/v1/merchants/:id/image` with the upload_id after creation

#### Scenario: Edit merchant logo
- **WHEN** a user edits an existing merchant
- **AND** the merchant already has a logo
- **THEN** the existing logo preview SHALL be displayed
- **AND** the user can replace it with a new upload or remove it

#### Scenario: Remove merchant logo on edit
- **WHEN** a user removes the logo on the edit page and saves
- **THEN** SHALL call `DELETE /api/v1/merchants/:id/image`

### Requirement: Frontend outlet logo upload integration
The outlet create and edit pages SHALL include the shared `UiFileUpload` component for logo selection, and submit the upload_id when saving.

#### Scenario: Create outlet with logo
- **WHEN** a user creates an outlet via the create page
- **AND** they upload a logo image using the file upload component
- **THEN** the form SHALL submit `POST /api/v1/outlets` with outlet data
- **AND** if a logo was uploaded, SHALL call `PATCH /api/v1/outlets/:id/image` with the upload_id after creation

#### Scenario: Edit outlet logo
- **WHEN** a user edits an existing outlet
- **AND** the outlet already has a logo
- **THEN** the existing logo preview SHALL be displayed
- **AND** the user can replace it with a new upload or remove it

### Requirement: Frontend user avatar upload integration
The user create and edit pages SHALL include the shared `UiFileUpload` component for avatar selection, and submit the upload_id when saving.

#### Scenario: Create user with avatar
- **WHEN** a user creates a user via the create page
- **AND** they upload an avatar using the file upload component
- **THEN** the form SHALL submit `POST /api/v1/users` with user data
- **AND** if an avatar was uploaded, SHALL call `PATCH /api/v1/users/:id/avatar` with the upload_id after creation

#### Scenario: Edit user avatar
- **WHEN** a user edits an existing user
- **AND** the user already has an avatar
- **THEN** the existing avatar preview SHALL be displayed
- **AND** the user can replace it with a new upload or remove it

### Requirement: Profile avatar upload integration
The profile edit page SHALL include the shared `UiFileUpload` component for avatar upload, using the current user's ID.

#### Scenario: Update profile avatar
- **WHEN** a user uploads an avatar on the profile edit page and saves
- **THEN** SHALL call `PATCH /api/v1/users/:currentUserId/avatar` with the upload_id
- **AND** the profile avatar preview SHALL update immediately

#### Scenario: Remove profile avatar
- **WHEN** a user removes the avatar on the profile edit page and saves
- **THEN** SHALL call `DELETE /api/v1/users/:currentUserId/avatar`
