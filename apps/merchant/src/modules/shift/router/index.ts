import {
  PREFIX_ROUTE_PATH,
  PREFIX_ROUTE_NAME,
} from '@/modules/shift/services/constants.ts';

import {
  PERMISSIONS,
} from '@/modules/shift/services/rbac.ts';

export default [
  {
    path: PREFIX_ROUTE_PATH,
    name: PREFIX_ROUTE_NAME,
    component: () => import('@/modules/shift/pages/index.vue'),
    meta: {
      title: 'Shift',
      layout: 'default',
      permission: PERMISSIONS,
      breadcrumbs: [
        {
          label: 'Beranda',
          route: '/landing',
          isActive: false,
        },
        {
          label: 'Shift',
          route: PREFIX_ROUTE_PATH,
          isActive: true,
        },
      ]
    }
  },
  {
    path: `${PREFIX_ROUTE_PATH}/detail/:id`,
    name: `${PREFIX_ROUTE_NAME}-detail`,
    component: () => import('@/modules/shift/pages/detail.vue'),
    meta: {
      title: 'Shift',
      layout: 'default',
      permission: PERMISSIONS,
      breadcrumbs: [
        {
          label: 'Beranda',
          route: '/landing',
          isActive: false,
        },
        {
          label: 'Shift',
          route: PREFIX_ROUTE_PATH,
          isActive: true,
        },
      ]
    }
  },
];
