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
    label: 'Ubah Profil',
    description: 'Perbarui informasi pribadi Anda',
    route: 'settings-edit-profile',
    permission: PROFILE_READ,
    icon: 'pi pi-user',
    color: 'text-blue-500',
  },
  {
    label: 'Ubah Kata Sandi',
    description: 'Perbarui kata sandi akun Anda',
    route: 'settings-change-password',
    permission: PASSWORD_UPDATE,
    icon: 'pi pi-lock',
    color: 'text-green-500',
  },
  {
    label: 'Ubah Email',
    description: 'Perbarui alamat email akun Anda',
    route: 'settings-change-email',
    permission: EMAIL_UPDATE,
    icon: 'pi pi-envelope',
    color: 'text-purple-500',
  },
  {
    label: 'Nonaktifkan Akun',
    description: 'Nonaktifkan akun Anda secara permanen',
    route: 'settings-deactivate-account',
    permission: ACCOUNT_DEACTIVATE,
    icon: 'pi pi-exclamation-triangle',
    color: 'text-red-500',
  },
  {
    label: 'Pengaturan Situs',
    description: 'Mode gelap, bahasa, zona waktu',
    route: 'settings-site-settings',
    permission: SITE_UPDATE,
    icon: 'pi pi-palette',
    color: 'text-orange-500',
  },
];
