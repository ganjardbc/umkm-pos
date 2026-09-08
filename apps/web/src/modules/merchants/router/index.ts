import {
  PREFIX_ROUTE_PATH,
  PREFIX_ROUTE_NAME
} from '@/modules/merchants/services/constants.ts';
import {
  READ,
  CREATE,
  UPDATE,
} from '@/modules/merchants/services/rbac.ts';

export default [
  {
    path: PREFIX_ROUTE_PATH,
    name: PREFIX_ROUTE_NAME,
    component: () => import('@/modules/merchants/pages/index.vue'),
    meta: {
      title: 'Merchant',
      layout: 'default',
      permission: [READ],
      breadcrumbs: [
        {
          label: 'Beranda',
          route: '/landing',
          isActive: false,
        },
        {
          label: 'Merchant',
          route: PREFIX_ROUTE_PATH,
          isActive: true,
        },
      ]
    }
  },
  {
    path: `${PREFIX_ROUTE_PATH}/create`,
    name: `${PREFIX_ROUTE_NAME}-create`,
    component: () => import('@/modules/merchants/pages/create.vue'),
    meta: {
      title: 'Tambah Merchant',
      layout: 'default',
      permission: [CREATE],
      breadcrumbs: [
        {
          label: 'Beranda',
          route: '/landing',
          isActive: false,
        },
        {
          label: 'Merchant',
          route: PREFIX_ROUTE_PATH,
          isActive: false,
        },
        {
          label: 'Tambah Merchant',
          route: `${PREFIX_ROUTE_PATH}/create`,
          isActive: true,
        },
      ]
    }
  },
  {
    path: `${PREFIX_ROUTE_PATH}/edit/:id`,
    name: `${PREFIX_ROUTE_NAME}-edit`,
    component: () => import('@/modules/merchants/pages/edit.vue'),
    meta: {
      title: 'Edit Merchant',
      layout: 'default',
      permission: [UPDATE],
      breadcrumbs: [
        {
          label: 'Beranda',
          route: '/landing',
          isActive: false,
        },
        {
          label: 'Merchant',
          route: PREFIX_ROUTE_PATH,
          isActive: false,
        },
        {
          label: 'Edit Merchant',
          route: `${PREFIX_ROUTE_PATH}/:id/edit`,
          isActive: true,
        },
      ]
    }
  },

  {
    path: `${PREFIX_ROUTE_PATH}/detail/:id`,
    name: `${PREFIX_ROUTE_NAME}-detail`,
    component: () => import('@/modules/merchants/pages/detail.vue'),
    meta: {
      title: 'Detail Merchant',
      layout: 'default',
      permission: [READ],
      breadcrumbs: [
        {
          label: 'Beranda',
          route: '/landing',
          isActive: false,
        },
        {
          label: 'Merchant',
          route: PREFIX_ROUTE_PATH,
          isActive: false,
        },
        {
          label: 'Detail Merchant',
          route: `${PREFIX_ROUTE_PATH}/:id/view`,
          isActive: true,
        },
      ]
    }
  },
];
