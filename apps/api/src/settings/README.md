# Settings Module

The Settings module provides user account and application settings management endpoints with full RBAC support.

## Features

### 1. Profile Management
- Get user profile information
- Update profile (name, phone, avatar, bio)
- Email is read-only (use email change endpoint)

**Endpoints:**
- `GET /settings/profile` - Get user profile
- `PUT /settings/profile` - Update user profile

**Permissions:**
- `settings.profile.read` - Read profile
- `settings.profile.update` - Update profile

### 2. Password Management
- Change password with current password verification
- Password strength validation (8+ chars, uppercase, lowercase, number)
- Confirmation password matching

**Endpoints:**
- `PUT /settings/password` - Change password

**Permissions:**
- `settings.password.update` - Change password

### 3. Email Management
- Two-step email verification process
- Request verification code
- Update email with verification code
- Email uniqueness validation

**Endpoints:**
- `POST /settings/email/verify` - Request verification code
- `PUT /settings/email` - Update email with verification code

**Permissions:**
- `settings.email.update` - Update email

### 4. Account Management
- Deactivate account with password confirmation
- Soft delete (mark as inactive)

**Endpoints:**
- `POST /settings/account/deactivate` - Deactivate account

**Permissions:**
- `settings.account.deactivate` - Deactivate account

### 5. Site Settings
- Get site settings (dark mode, language, timezone, notifications)
- Update site settings

**Endpoints:**
- `GET /settings/site` - Get site settings
- `PUT /settings/site` - Update site settings

**Permissions:**
- `settings.site.update` - Update site settings

## Project Structure

```
settings/
├── dto/
│   ├── change-password.dto.ts
│   ├── change-email.dto.ts
│   ├── deactivate-account.dto.ts
│   ├── update-profile.dto.ts
│   ├── update-site-settings.dto.ts
│   └── verify-email.dto.ts
├── settings.controller.ts
├── settings.service.ts
├── settings.module.ts
└── README.md
```

## API Endpoints

### Profile

#### Get Profile
```
GET /settings/profile
Authorization: Bearer <token>
Permission: settings.profile.read

Response:
{
  "id": "user-id",
  "name": "John Doe",
  "email": "john@example.com",
  "phone": "08123456789",
  "avatar": "https://example.com/avatar.jpg",
  "bio": "Software Developer",
  "created_at": "2024-01-01T00:00:00Z",
  "updated_at": "2024-01-01T00:00:00Z"
}
```

#### Update Profile
```
PUT /settings/profile
Authorization: Bearer <token>
Permission: settings.profile.update

Request:
{
  "name": "Jane Doe",
  "phone": "08987654321",
  "avatar": "https://example.com/new-avatar.jpg",
  "bio": "Senior Developer"
}

Response:
{
  "id": "user-id",
  "name": "Jane Doe",
  "email": "john@example.com",
  "phone": "08987654321",
  "avatar": "https://example.com/new-avatar.jpg",
  "bio": "Senior Developer",
  "updated_at": "2024-01-02T00:00:00Z"
}
```

### Password

#### Change Password
```
PUT /settings/password
Authorization: Bearer <token>
Permission: settings.password.update

Request:
{
  "currentPassword": "OldPassword123",
  "newPassword": "NewPassword123",
  "confirmPassword": "NewPassword123"
}

Response:
{
  "id": "user-id",
  "email": "john@example.com",
  "updated_at": "2024-01-02T00:00:00Z"
}

Errors:
- 400: Passwords do not match
- 400: New password must be different from current password
- 400: Current password is incorrect
- 404: User not found
```

### Email

#### Request Email Verification
```
POST /settings/email/verify
Authorization: Bearer <token>
Permission: settings.email.update

Request:
{
  "email": "newemail@example.com"
}

Response:
{
  "success": true,
  "message": "Verification code sent to email"
}

Errors:
- 404: User not found
- 409: Email already in use
```

#### Update Email
```
PUT /settings/email
Authorization: Bearer <token>
Permission: settings.email.update

Request:
{
  "newEmail": "newemail@example.com",
  "verificationCode": "123456"
}

Response:
{
  "id": "user-id",
  "email": "newemail@example.com",
  "updated_at": "2024-01-02T00:00:00Z"
}

Errors:
- 400: Verification code not found or expired
- 400: Verification code expired
- 400: Invalid verification code
- 404: User not found
- 409: Email already in use
```

### Account

#### Deactivate Account
```
POST /settings/account/deactivate
Authorization: Bearer <token>
Permission: settings.account.deactivate

Request:
{
  "password": "password123",
  "reason": "Not using anymore"
}

Response:
{
  "id": "user-id",
  "email": "john@example.com",
  "is_active": false,
  "updated_at": "2024-01-02T00:00:00Z"
}

Errors:
- 400: Password is incorrect
- 404: User not found
```

### Site Settings

#### Get Site Settings
```
GET /settings/site
Authorization: Bearer <token>
Permission: settings.site.update

Response:
{
  "darkMode": false,
  "language": "en",
  "timezone": "UTC",
  "notificationsEnabled": true
}
```

#### Update Site Settings
```
PUT /settings/site
Authorization: Bearer <token>
Permission: settings.site.update

Request:
{
  "darkMode": true,
  "language": "id",
  "timezone": "GMT+7",
  "notificationsEnabled": false
}

Response:
{
  "success": true,
  "data": {
    "darkMode": true,
    "language": "id",
    "timezone": "GMT+7",
    "notificationsEnabled": false
  }
}

Errors:
- 404: User not found
```

## DTOs

### UpdateProfileDto
```typescript
{
  name?: string;           // Max 150 chars
  phone?: string;          // Max 50 chars
  avatar?: string;         // URL
  bio?: string;            // Max 500 chars
}
```

### ChangePasswordDto
```typescript
{
  currentPassword: string;  // Required
  newPassword: string;      // Min 8 chars, uppercase, lowercase, number
  confirmPassword: string;  // Must match newPassword
}
```

### VerifyEmailDto
```typescript
{
  email: string;  // Valid email format
}
```

### ChangeEmailDto
```typescript
{
  newEmail: string;           // Valid email format
  verificationCode: string;   // 6 digits
}
```

### DeactivateAccountDto
```typescript
{
  password: string;  // Required
  reason?: string;   // Max 500 chars
}
```

### UpdateSiteSettingsDto
```typescript
{
  darkMode?: boolean;
  language?: string;              // 'en' | 'id' | 'es' | 'fr' | 'zh'
  timezone?: string;
  notificationsEnabled?: boolean;
}
```

## RBAC Permissions

All endpoints require specific permissions:

- `settings.profile.read` - Read profile information
- `settings.profile.update` - Update profile information
- `settings.password.update` - Change password
- `settings.email.update` - Change email
- `settings.site.update` - Update site settings
- `settings.account.deactivate` - Deactivate account

## Implementation Notes

### Email Verification
- Verification codes are stored in memory (Map)
- Codes expire after 10 minutes
- In production, use Redis or database for persistence
- Implement actual email sending service

### Password Hashing
- Uses bcrypt for password hashing
- Minimum 8 characters with uppercase, lowercase, and numbers
- Current password verified before change

### Account Deactivation
- Soft delete (marks user as inactive)
- User data is preserved
- Can be reactivated by admin if needed

### Site Settings
- Currently stored in memory
- In production, create `user_preferences` table
- Implement persistence layer

## Future Enhancements

- [ ] Email service integration for verification codes
- [ ] User preferences table for site settings persistence
- [ ] Two-factor authentication
- [ ] Login history tracking
- [ ] Connected devices management
- [ ] API keys management
- [ ] Data export functionality
- [ ] Account recovery options

## Security Considerations

- All endpoints require authentication (JWT)
- RBAC checks on all endpoints
- Password strength validation
- Email verification before update
- Password confirmation for sensitive actions
- Soft delete for account deactivation
- Verification codes expire after 10 minutes
- Current password verification for password change

## Testing

### Test Cases

1. **Profile Management**
   - Get profile successfully
   - Update profile with valid data
   - Update profile with invalid data
   - Get profile for non-existent user

2. **Password Management**
   - Change password successfully
   - Change password with incorrect current password
   - Change password with mismatched confirmation
   - Change password with same as current

3. **Email Management**
   - Request verification successfully
   - Request verification for existing email
   - Update email with valid code
   - Update email with invalid code
   - Update email with expired code

4. **Account Management**
   - Deactivate account successfully
   - Deactivate account with incorrect password
   - Deactivate account for non-existent user

5. **Site Settings**
   - Get site settings
   - Update site settings with valid data
   - Update site settings with invalid language

## Dependencies

- `@nestjs/common` - NestJS core
- `@nestjs/swagger` - API documentation
- `@prisma/client` - Database ORM
- `bcrypt` - Password hashing
- `class-validator` - DTO validation
- `class-transformer` - DTO transformation

## Related Modules

- `auth` - Authentication and JWT
- `users` - User management
- `rbac` - Role-based access control
- `common` - Common utilities and decorators
