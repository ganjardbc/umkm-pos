import {
  PREFIX_ROUTE_PATH,
  PREFIX_ROUTE_NAME,
} from '@/modules/cashier/services/constants.ts';

import {
  CREATE,
} from '@/modules/cashier/services/rbac.ts';

export default [
  {
    path: PREFIX_ROUTE_PATH,
    name: PREFIX_ROUTE_NAME,
    component: () => import('@/modules/cashier/pages/index.vue'),
    meta: {
      title: 'Kasir',
      layout: 'default',
      permission: [CREATE],
      breadcrumbs: [
        {
          label: 'Beranda',
          route: '/landing',
          isActive: false,
        },
        {
          label: 'Kasir',
          route: PREFIX_ROUTE_PATH,
          isActive: true,
        },
      ]
    }
  },
];
