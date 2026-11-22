import {
  PREFIX_ROUTE_PATH,
  PREFIX_ROUTE_NAME,
} from '@/modules/stock/services/constants.ts';

import {
  PERMISSIONS,
  ADJUST,
} from '@/modules/stock/services/rbac.ts';

export default [
  {
    path: PREFIX_ROUTE_PATH,
    name: PREFIX_ROUTE_NAME,
    component: () => import('@/modules/stock/pages/index.vue'),
    meta: {
      title: 'Stok',
      layout: 'default',
      permission: PERMISSIONS,
      breadcrumbs: [
        {
          label: 'Beranda',
          route: '/landing',
          isActive: false,
        },
        {
          label: 'Stok',
          route: PREFIX_ROUTE_PATH,
          isActive: true,
        },
      ]
    }
  },
  {
    path: `${PREFIX_ROUTE_PATH}/opname`,
    name: `${PREFIX_ROUTE_NAME}-opname`,
    component: () => import('@/modules/stock/pages/opname.vue'),
    meta: {
      title: 'Stok Opname',
      layout: 'default',
      permission: [ADJUST],
      breadcrumbs: [
        {
          label: 'Beranda',
          route: '/landing',
          isActive: false,
        },
        {
          label: 'Stok',
          route: PREFIX_ROUTE_PATH,
          isActive: false,
        },
        {
          label: 'Stok Opname',
          route: `${PREFIX_ROUTE_PATH}/opname`,
          isActive: true,
        },
      ]
    }
  },
];
