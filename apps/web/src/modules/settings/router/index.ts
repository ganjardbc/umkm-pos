import {
  PREFIX_ROUTE_PATH,
  PREFIX_ROUTE_NAME
} from '@/modules/settings/services/constants';

import {
  PERMISSIONS,
  PROFILE_READ,
  PASSWORD_UPDATE,
  EMAIL_UPDATE,
  SITE_UPDATE,
  ACCOUNT_DEACTIVATE,
} from '@/modules/settings/services/rbac';

export default [
  {
    path: PREFIX_ROUTE_PATH,
    name: PREFIX_ROUTE_NAME,
    component: () => import('@/modules/settings/pages/index.vue'),
    meta: {
      title: 'Pengaturan',
      layout: 'default',
      permission: PERMISSIONS,
      breadcrumbs: [
        {
          label: 'Beranda',
          route: '/landing',
          isActive: false,
        },
        {
          label: 'Pengaturan',
          route: PREFIX_ROUTE_PATH,
          isActive: true,
        },
      ]
    }
  },
  {
    path: `${PREFIX_ROUTE_PATH}/edit-profile`,
    name: `${PREFIX_ROUTE_NAME}-edit-profile`,
    component: () => import('@/modules/settings/pages/edit-profile.vue'),
    meta: {
      title: 'Pengaturan',
      layout: 'default',
      permission: [PROFILE_READ],
      breadcrumbs: [
        {
          label: 'Beranda',
          route: '/landing',
          isActive: false,
        },
        {
          label: 'Pengaturan',
          route: PREFIX_ROUTE_PATH,
          isActive: false,
        },
        {
          label: 'Ubah Profil',
          route: `${PREFIX_ROUTE_PATH}/edit-profile`,
          isActive: true,
        },
      ]
    }
  },
  {
    path: `${PREFIX_ROUTE_PATH}/change-password`,
    name: `${PREFIX_ROUTE_NAME}-change-password`,
    component: () => import('@/modules/settings/pages/change-password.vue'),
    meta: {
      title: 'Pengaturan',
      layout: 'default',
      permission: [PASSWORD_UPDATE],
      breadcrumbs: [
        {
          label: 'Beranda',
          route: '/landing',
          isActive: false,
        },
        {
          label: 'Pengaturan',
          route: PREFIX_ROUTE_PATH,
          isActive: false,
        },
        {
          label: 'Ubah Kata Sandi',
          route: `${PREFIX_ROUTE_PATH}/change-password`,
          isActive: true,
        },
      ]
    }
  },
  {
    path: `${PREFIX_ROUTE_PATH}/change-email`,
    name: `${PREFIX_ROUTE_NAME}-change-email`,
    component: () => import('@/modules/settings/pages/change-email.vue'),
    meta: {
      title: 'Pengaturan',
      layout: 'default',
      permission: [EMAIL_UPDATE],
      breadcrumbs: [
        {
          label: 'Beranda',
          route: '/landing',
          isActive: false,
        },
        {
          label: 'Pengaturan',
          route: PREFIX_ROUTE_PATH,
          isActive: false,
        },
        {
          label: 'Ubah Email',
          route: `${PREFIX_ROUTE_PATH}/change-email`,
          isActive: true,
        },
      ]
    }
  },
  {
    path: `${PREFIX_ROUTE_PATH}/site-settings`,
    name: `${PREFIX_ROUTE_NAME}-site-settings`,
    component: () => import('@/modules/settings/pages/site-settings.vue'),
    meta: {
      title: 'Pengaturan',
      layout: 'default',
      permission: [SITE_UPDATE],
      breadcrumbs: [
        {
          label: 'Beranda',
          route: '/landing',
          isActive: false,
        },
        {
          label: 'Pengaturan',
          route: PREFIX_ROUTE_PATH,
          isActive: false,
        },
        {
          label: 'Pengaturan Situs',
          route: `${PREFIX_ROUTE_PATH}/site-settings`,
          isActive: true,
        },
      ]
    }
  },
  {
    path: `${PREFIX_ROUTE_PATH}/deactivate-account`,
    name: `${PREFIX_ROUTE_NAME}-deactivate-account`,
    component: () => import('@/modules/settings/pages/deactivate-account.vue'),
    meta: {
      title: 'Pengaturan',
      layout: 'default',
      permission: [ACCOUNT_DEACTIVATE],
      breadcrumbs: [
        {
          label: 'Beranda',
          route: '/landing',
          isActive: false,
        },
        {
          label: 'Pengaturan',
          route: PREFIX_ROUTE_PATH,
          isActive: false,
        },
        {
          label: 'Nonaktifkan Akun',
          route: `${PREFIX_ROUTE_PATH}/deactivate-account`,
          isActive: true,
        },
      ]
    }
  },
];
