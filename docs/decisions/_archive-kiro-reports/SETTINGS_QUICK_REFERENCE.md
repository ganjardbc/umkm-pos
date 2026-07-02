# Settings Feature - Quick Reference Guide

## 🚀 Quick Navigation

### Landing Page
```
URL: /settings
Route Name: settings
Permission: All settings permissions
```

### Edit Profile
```
URL: /settings/edit-profile
Route Name: settings-edit-profile
Permission: settings.profile.read, settings.profile.update
```

### Change Password
```
URL: /settings/change-password
Route Name: settings-change-password
Permission: settings.password.update
```

### Change Email
```
URL: /settings/change-email
Route Name: settings-change-email
Permission: settings.email.update
```

### Site Settings
```
URL: /settings/site-settings
Route Name: settings-site-settings
Permission: settings.site.update
```

### Deactivate Account
```
URL: /settings/deactivate-account
Route Name: settings-deactivate-account
Permission: settings.account.deactivate
```

---

## 📂 File Locations

### Pages
```
umkm-pos-app/src/modules/settings/pages/
├── index.vue                    # Landing page
├── edit-profile.vue             # Edit profile
├── change-password.vue          # Change password
├── change-email.vue             # Change email
├── deactivate-account.vue       # Deactivate account
└── site-settings.vue            # Site settings
```

### Services
```
umkm-pos-app/src/modules/settings/services/
├── api.ts                       # API calls
├── constants.ts                 # Constants
├── rbac.ts                      # Permissions
└── types.ts                     # Types
```

### Router & Store
```
umkm-pos-app/src/modules/settings/
├── router/index.ts              # Routes
└── stores/settings.ts           # Pinia store
```

---

## 🔐 RBAC Permissions Quick List

```typescript
// Profile
settings.profile.read
settings.profile.update

// Password
settings.password.update

// Email
settings.email.update

// Site
settings.site.update

// Account
settings.account.deactivate
```

---

## 🛣️ Route Navigation Examples

### Navigate to Settings Landing
```typescript
router.push({ name: 'settings' });
```

### Navigate to Edit Profile
```typescript
router.push({ name: 'settings-edit-profile' });
```

### Navigate to Change Password
```typescript
router.push({ name: 'settings-change-password' });
```

### Navigate to Change Email
```typescript
router.push({ name: 'settings-change-email' });
```

### Navigate to Site Settings
```typescript
router.push({ name: 'settings-site-settings' });
```

### Navigate to Deactivate Account
```typescript
router.push({ name: 'settings-deactivate-account' });
```

---

## 💾 Pinia Store Usage

### Import Store
```typescript
import { useSettingsStore } from '@/modules/settings/stores/settings';

const settingsStore = useSettingsStore();
```

### Initialize Settings
```typescript
settingsStore.initializeSettings();
```

### Access Settings
```typescript
settingsStore.isDarkMode              // boolean
settingsStore.language                // string
settingsStore.timezone                // string
settingsStore.notificationsEnabled    // boolean
```

### Update Settings
```typescript
settingsStore.toggleDarkMode();
settingsStore.setLanguage('id');
settingsStore.setTimezone('GMT+7');
settingsStore.toggleNotifications();
settingsStore.updateSiteSettings({ darkMode: true, language: 'en' });
```

### Reset Settings
```typescript
settingsStore.resetToDefaults();
```

---

## 🔐 RBAC Check Examples

### Check Permission
```typescript
import { isHasPermission } from '@/helpers/auth.ts';
import { PROFILE_UPDATE } from '@/modules/settings/services/rbac.ts';

if (isHasPermission(PROFILE_UPDATE)) {
  // User can update profile
}
```

### In Component
```typescript
import { computed } from 'vue';
import { isHasPermission } from '@/helpers/auth.ts';
import { PASSWORD_UPDATE } from '@/modules/settings/services/rbac.ts';

const isCanUpdate = computed(() => isHasPermission(PASSWORD_UPDATE));
```

---

## 📡 API Endpoints Quick Reference

### Profile
```
GET    /api/settings/profile              # Get profile
PUT    /api/settings/profile              # Update profile
```

### Password
```
PUT    /api/settings/password             # Change password
```

### Email
```
POST   /api/settings/email/verify         # Request verification
PUT    /api/settings/email                # Update email
```

### Account
```
POST   /api/settings/account/deactivate   # Deactivate account
```

### Site Settings
```
GET    /api/settings/site                 # Get settings
PUT    /api/settings/site                 # Update settings
```

---

## 🎨 UI Components Used

```typescript
// PrimeVue Components
InputText              // Text input
Password               // Password input
Textarea               // Multi-line text
Dropdown               // Select dropdown
ToggleButton           // Toggle switch
Checkbox               // Checkbox
Button                 // Button

// Custom Components
UiCard                 // Card container
```

---

## 📝 Form Validation Rules

### Edit Profile
- Name: Required, non-empty

### Change Password
- Current Password: Required
- New Password: 8+ chars, uppercase, lowercase, number
- Confirm Password: Must match new password

### Change Email
- New Email: Valid email format, different from current
- Verification Code: 6 digits

### Deactivate Account
- Confirmation Checkbox: Must be checked
- Password: Required

### Site Settings
- No validation (all optional)

---

## 🔄 LocalStorage

### Key
```
umkm_site_settings
```

### Format
```json
{
  "darkMode": false,
  "language": "en",
  "timezone": "UTC",
  "notificationsEnabled": true
}
```

---

## 🐛 Common Issues & Solutions

### Routes Not Working
```
✓ Ensure routes are imported in main router
✓ Check route names match navigation calls
✓ Verify lazy loading syntax
```

### RBAC Not Working
```
✓ Ensure permissions are configured in auth system
✓ Check isHasPermission() helper is working
✓ Verify user has required permissions
```

### API Calls Failing
```
✓ Ensure backend endpoints are implemented
✓ Check API base URL is correct
✓ Verify authentication headers are included
```

### Store Not Persisting
```
✓ Ensure localStorage is enabled
✓ Check browser console for errors
✓ Verify store initialization on app load
```

---

## 📚 Documentation Files

```
SETTINGS_FEATURE_PLAN.md              # Implementation plan
SETTINGS_IMPLEMENTATION_SUMMARY.md    # Summary
SETTINGS_INTEGRATION_CHECKLIST.md     # Integration checklist
SETTINGS_FEATURE_COMPLETE.md          # Complete guide
SETTINGS_QUICK_REFERENCE.md           # This file
SETTINGS_BUILD_REPORT.txt             # Build report
umkm-pos-app/src/modules/settings/README.md  # Module docs
```

---

## ✅ Integration Checklist

- [ ] Routes registered in main router
- [ ] Pinia store registered
- [ ] RBAC permissions configured
- [ ] Backend APIs implemented
- [ ] Tested with different user roles
- [ ] No console errors
- [ ] No TypeScript errors
- [ ] Responsive design verified
- [ ] Ready for deployment

---

## 🎯 Key Features Summary

| Feature | Route | Permission | Status |
|---------|-------|-----------|--------|
| Landing Page | /settings | All | ✅ |
| Edit Profile | /settings/edit-profile | profile.read/update | ✅ |
| Change Password | /settings/change-password | password.update | ✅ |
| Change Email | /settings/change-email | email.update | ✅ |
| Site Settings | /settings/site-settings | site.update | ✅ |
| Deactivate Account | /settings/deactivate-account | account.deactivate | ✅ |

---

## 🚀 Getting Started

1. **Register Routes**
   ```typescript
   import settingsRoutes from '@/modules/settings/router';
   routes.push(...settingsRoutes);
   ```

2. **Register Store**
   ```typescript
   import { useSettingsStore } from '@/modules/settings/stores/settings';
   ```

3. **Configure RBAC**
   - Add 6 permissions to your auth system

4. **Implement APIs**
   - Implement 8 backend endpoints

5. **Test**
   - Navigate to /settings
   - Test all features

6. **Deploy**
   - Push to production

---

## 📞 Support Resources

- Module README: `umkm-pos-app/src/modules/settings/README.md`
- Implementation Summary: `SETTINGS_IMPLEMENTATION_SUMMARY.md`
- Integration Checklist: `SETTINGS_INTEGRATION_CHECKLIST.md`
- Complete Guide: `SETTINGS_FEATURE_COMPLETE.md`
- Product Module: `umkm-pos-app/src/modules/product/` (reference)

---

## 🎉 You're All Set!

The settings feature is fully implemented and ready to integrate with your backend. Follow the integration checklist and you'll be good to go!
