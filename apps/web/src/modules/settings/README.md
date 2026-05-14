# Settings Module

The Settings module provides comprehensive user account and application settings management with full RBAC support.

## Features

### 1. Edit Profile
- Update user personal information (name, phone, bio)
- Read-only email field (use Change Email page to update)
- Form validation
- Success/error notifications

**Route**: `/settings/edit-profile`
**Permission**: `settings.profile.read`, `settings.profile.update`

### 2. Change Password
- Secure password update with validation
- Password strength requirements:
  - Minimum 8 characters
  - At least one uppercase letter
  - At least one lowercase letter
  - At least one number
- Confirmation password matching
- Current password verification

**Route**: `/settings/change-password`
**Permission**: `settings.password.update`

### 3. Change Email
- Two-step verification process
- Step 1: Request verification code
- Step 2: Enter verification code and confirm
- Resend code functionality with countdown timer
- Email validation

**Route**: `/settings/change-email`
**Permission**: `settings.email.update`

### 4. Site Settings
- Dark mode toggle
- Language selection (EN, ID, ES, FR, ZH)
- Timezone selection
- Notification preferences toggle
- LocalStorage persistence
- Reset to defaults option

**Route**: `/settings/site-settings`
**Permission**: `settings.site.update`

### 5. Deactivate Account
- Clear warning about permanent deactivation
- Confirmation checkbox
- Password confirmation required
- Optional reason for deactivation
- Irreversible action with confirmation dialog

**Route**: `/settings/deactivate-account`
**Permission**: `settings.account.deactivate`

## Project Structure

```
settings/
├── components/          # Reusable components
├── pages/              # Page components
│   ├── index.vue                    # Landing page with menu
│   ├── edit-profile.vue             # Edit profile page
│   ├── change-password.vue          # Change password page
│   ├── change-email.vue             # Change email page
│   ├── deactivate-account.vue       # Deactivate account page
│   └── site-settings.vue            # Site settings page
├── router/
│   └── index.ts                     # Route configuration
├── services/
│   ├── api.ts                       # API calls
│   ├── constants.ts                 # Route constants
│   ├── rbac.ts                      # Permission definitions
│   └── types.ts                     # TypeScript interfaces
├── stores/
│   └── settings.ts                  # Pinia store for settings state
└── README.md                        # This file
```

## RBAC Permissions

All settings pages require specific permissions:

- `settings.profile.read` - Read profile information
- `settings.profile.update` - Update profile information
- `settings.password.update` - Change password
- `settings.email.update` - Change email
- `settings.site.update` - Update site settings
- `settings.account.deactivate` - Deactivate account

## API Endpoints

The module expects the following backend endpoints:

```
GET    /api/settings/profile              # Get current profile
PUT    /api/settings/profile              # Update profile
PUT    /api/settings/password             # Change password
POST   /api/settings/email/verify         # Request email verification
PUT    /api/settings/email                # Update email
GET    /api/settings/site                 # Get site settings
PUT    /api/settings/site                 # Update site settings
POST   /api/settings/account/deactivate   # Deactivate account
```

## Usage

### Navigation to Settings

```typescript
import { useRouter } from 'vue-router';

const router = useRouter();

// Navigate to settings landing page
router.push({ name: 'settings' });

// Navigate to specific settings page
router.push({ name: 'settings-edit-profile' });
router.push({ name: 'settings-change-password' });
router.push({ name: 'settings-change-email' });
router.push({ name: 'settings-site-settings' });
router.push({ name: 'settings-deactivate-account' });
```

### Using Settings Store

```typescript
import { useSettingsStore } from '@/modules/settings/stores/settings';

const settingsStore = useSettingsStore();

// Initialize settings from localStorage
settingsStore.initializeSettings();

// Access settings
console.log(settingsStore.isDarkMode);
console.log(settingsStore.language);
console.log(settingsStore.timezone);

// Update settings
settingsStore.toggleDarkMode();
settingsStore.setLanguage('id');
settingsStore.setTimezone('GMT+7');
settingsStore.toggleNotifications();

// Reset to defaults
settingsStore.resetToDefaults();
```

### RBAC Checks

```typescript
import { isHasPermission } from '@/helpers/auth.ts';
import { PROFILE_UPDATE, PASSWORD_UPDATE } from '@/modules/settings/services/rbac.ts';

// Check if user can update profile
if (isHasPermission(PROFILE_UPDATE)) {
  // Allow profile update
}

// Check if user can change password
if (isHasPermission(PASSWORD_UPDATE)) {
  // Allow password change
}
```

## Form Validation

All pages include comprehensive form validation:

- **Edit Profile**: Name is required
- **Change Password**: 
  - Current password required
  - New password strength validation
  - Password confirmation matching
  - Different from current password
- **Change Email**:
  - Valid email format
  - Different from current email
  - 6-digit verification code
- **Deactivate Account**:
  - Confirmation checkbox required
  - Password confirmation required

## Error Handling

All pages include error handling with:
- Toast notifications for errors
- Form-level error messages
- Loading states during API calls
- Graceful fallbacks

## LocalStorage

Site settings are persisted to localStorage with key: `umkm_site_settings`

```json
{
  "darkMode": false,
  "language": "en",
  "timezone": "UTC",
  "notificationsEnabled": true
}
```

## Security Considerations

- Password changes require current password verification
- Email changes require verification code
- Account deactivation requires password confirmation
- Sensitive actions show confirmation dialogs
- All API calls include proper error handling
- RBAC checks prevent unauthorized access

## Future Enhancements

- Two-factor authentication settings
- Connected devices management
- Login history
- API keys management
- Privacy settings
- Data export functionality
