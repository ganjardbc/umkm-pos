# Settings Feature Implementation Plan

## Overview
Create a comprehensive settings module with a landing page containing 5 main menu items, each with dedicated pages and RBAC implementation following the product module pattern.

## Project Structure

```
umkm-pos-app/src/modules/settings/
├── components/
│   ├── SettingsMenu.vue          # Landing page menu component
│   └── SettingsSidebar.vue       # Optional sidebar navigation
├── pages/
│   ├── index.vue                 # Landing page with menu
│   ├── edit-profile.vue          # Edit Profile page
│   ├── change-password.vue       # Change Password page
│   ├── change-email.vue          # Change Email page
│   ├── deactivate-account.vue    # Deactivate Account page
│   └── site-settings.vue         # Site Settings (dark mode, language)
├── router/
│   └── index.ts                  # Route configuration with RBAC
├── services/
│   ├── api.ts                    # API calls for settings
│   ├── rbac.ts                   # Permission definitions
│   ├── constants.ts              # Route constants
│   └── types.ts                  # TypeScript interfaces
└── stores/
    └── settings.ts               # Pinia store for settings state
```

## Feature Details

### 1. Landing Page (index.vue)
- Display menu with 5 options
- Each menu item links to its dedicated page
- Card-based or list-based UI layout
- Icons for each menu item

### 2. Edit Profile Page
- **Route**: `/settings/edit-profile`
- **Route Name**: `settings-edit-profile`
- **Permission**: `settings.profile.update`
- **Fields**: Name, Email, Phone, Avatar, Bio
- **Actions**: Save, Cancel

### 3. Change Password Page
- **Route**: `/settings/change-password`
- **Route Name**: `settings-change-password`
- **Permission**: `settings.password.update`
- **Fields**: Current Password, New Password, Confirm Password
- **Validation**: Password strength, confirmation match
- **Actions**: Update, Cancel

### 4. Change Email Page
- **Route**: `/settings/change-email`
- **Route Name**: `settings-change-email`
- **Permission**: `settings.email.update`
- **Fields**: Current Email (read-only), New Email, Verification Code
- **Flow**: Request verification → Enter code → Confirm
- **Actions**: Send Code, Verify, Cancel

### 5. Deactivate Account Page
- **Route**: `/settings/deactivate-account`
- **Route Name**: `settings-deactivate-account`
- **Permission**: `settings.account.deactivate`
- **Warning**: Clear deactivation consequences
- **Confirmation**: Require password confirmation
- **Actions**: Deactivate, Cancel

### 6. Site Settings Page
- **Route**: `/settings/site-settings`
- **Route Name**: `settings-site-settings`
- **Permission**: `settings.site.update`
- **Options**:
  - Dark Mode Toggle
  - Language Selection (EN, ID, etc.)
  - Timezone Selection
  - Notification Preferences
- **Storage**: LocalStorage + Pinia store
- **Actions**: Save, Reset to Default

## RBAC Permissions

```typescript
// settings/services/rbac.ts
export const PROFILE_READ = 'settings.profile.read';
export const PROFILE_UPDATE = 'settings.profile.update';
export const PASSWORD_UPDATE = 'settings.password.update';
export const EMAIL_UPDATE = 'settings.email.update';
export const ACCOUNT_DEACTIVATE = 'settings.account.deactivate';
export const SITE_UPDATE = 'settings.site.update';

export const PERMISSIONS = [
  PROFILE_READ,
  PROFILE_UPDATE,
  PASSWORD_UPDATE,
  EMAIL_UPDATE,
  ACCOUNT_DEACTIVATE,
  SITE_UPDATE,
];
```

## Route Configuration Pattern

Each route will follow this structure:
```typescript
{
  path: '/settings/page-name',
  name: 'settings-page-name',
  component: () => import('@/modules/settings/pages/page-name.vue'),
  meta: {
    title: 'Settings - Page Name',
    layout: 'default',
    permission: PERMISSIONS,
    breadcrumbs: [
      { label: 'Home', route: '/landing', isActive: false },
      { label: 'Settings', route: '/settings', isActive: false },
      { label: 'Page Name', route: '/settings/page-name', isActive: true },
    ]
  }
}
```

## Component Pattern

Each page will follow this structure:
```vue
<template>
  <div class="w-full space-y-4">
    <h1 class="text-lg font-semibold">Page Title</h1>
    <!-- Page content -->
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { isHasPermission } from '@/helpers/auth.ts';
import { PERMISSION_NAME } from '@/modules/settings/services/rbac.ts';

// RBAC
const isCanAccess = computed(() => isHasPermission(PERMISSION_NAME));

// Component logic
</script>
```

## API Endpoints (Backend)

```
PUT    /api/settings/profile          # Update profile
PUT    /api/settings/password         # Change password
POST   /api/settings/email/verify     # Request email verification
PUT    /api/settings/email            # Update email
POST   /api/settings/account/deactivate # Deactivate account
PUT    /api/settings/site             # Update site settings
GET    /api/settings/profile          # Get current profile
GET    /api/settings/site             # Get site settings
```

## Implementation Steps

1. **Create RBAC & Constants**
   - Define permissions in `rbac.ts`
   - Define route paths and names in `constants.ts`

2. **Create Types**
   - Define TypeScript interfaces in `types.ts`

3. **Create API Service**
   - Implement API calls in `api.ts`

4. **Create Pages** (in order)
   - Landing page with menu
   - Edit Profile
   - Change Password
   - Change Email
   - Deactivate Account
   - Site Settings

5. **Create Components**
   - Settings Menu component
   - Optional sidebar navigation

6. **Update Router**
   - Add all routes with RBAC
   - Update breadcrumbs

7. **Create Pinia Store**
   - Manage settings state
   - Handle dark mode, language, etc.

## Key Features to Implement

- ✅ RBAC permission checks on each page
- ✅ Form validation
- ✅ Loading states
- ✅ Toast notifications (success/error)
- ✅ Confirmation dialogs (for sensitive actions)
- ✅ Breadcrumb navigation
- ✅ Responsive design
- ✅ Error handling
- ✅ LocalStorage persistence (for site settings)

## Styling & Components

- Use existing UI components from the project
- Follow the same design patterns as product module
- Use PrimeVue components (Button, Card, InputText, etc.)
- Maintain consistent spacing and typography

## Testing Considerations

- Test RBAC permissions for each page
- Test form validation
- Test API error handling
- Test navigation between pages
- Test localStorage persistence for site settings
