import {
  PROFILE_READ,
  PASSWORD_UPDATE,
  EMAIL_UPDATE,
  SITE_UPDATE,
  ACCOUNT_DEACTIVATE,
} from '@/modules/settings/services/rbac.ts';

export const FEATURE_NAME = 'settings';
export const MODULE_VERSION = '1.0.0';

export const PREFIX_ROUTE_PATH = '/settings';
export const PREFIX_ROUTE_NAME = 'settings';

export const LIST_MENU = [
  {
    label: 'Edit Profile',
    description: 'Update your personal information',
    route: 'settings-edit-profile',
    permission: PROFILE_READ,
    icon: 'pi pi-user',
    color: 'text-blue-500',
  },
  {
    label: 'Change Password',
    description: 'Update your password',
    route: 'settings-change-password',
    permission: PASSWORD_UPDATE,
    icon: 'pi pi-lock',
    color: 'text-green-500',
  },
  {
    label: 'Change Email',
    description: 'Update your email address',
    route: 'settings-change-email',
    permission: EMAIL_UPDATE,
    icon: 'pi pi-envelope',
    color: 'text-purple-500',
  },
  {
    label: 'Deactivate Account',
    description: 'Permanently deactivate your account',
    route: 'settings-deactivate-account',
    permission: ACCOUNT_DEACTIVATE,
    icon: 'pi pi-exclamation-triangle',
    color: 'text-red-500',
  },
  {
    label: 'Site Settings',
    description: 'Dark mode, language, timezone',
    route: 'settings-site-settings',
    permission: SITE_UPDATE,
    icon: 'pi pi-palette',
    color: 'text-orange-500',
  },
];
