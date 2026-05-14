import {
  PREFIX_ROUTE_PATH,
  PREFIX_ROUTE_NAME,
} from '@/modules/transaction/services/constants.ts';

import {
  CREATE,
  READ,
} from '@/modules/transaction/services/rbac.ts';

export default [
  {
    path: PREFIX_ROUTE_PATH,
    name: PREFIX_ROUTE_NAME,
    component: () => import('@/modules/transaction/pages/index.vue'),
    meta: {
      title: 'Transactions',
      layout: 'default',
      permission: [READ],
      breadcrumbs: [
        {
          label: 'Home',
          route: '/landing',
          isActive: false,
        },
        {
          label: 'Transactions',
          route: PREFIX_ROUTE_PATH,
          isActive: true,
        },
      ]
    }
  },
  {
    path: `${PREFIX_ROUTE_PATH}/create`,
    name: `${PREFIX_ROUTE_NAME}-create`,
    component: () => import('@/modules/transaction/pages/create.vue'),
    meta: {
      title: 'Transactions',
      layout: 'default',
      permission: [CREATE],
      breadcrumbs: [
        {
          label: 'Home',
          route: '/landing',
          isActive: false,
        },
        {
          label: 'Transactions',
          route: PREFIX_ROUTE_PATH,
          isActive: false,
        },
        {
          label: 'Create',
          route: PREFIX_ROUTE_PATH,
          isActive: true,
        },
      ]
    }
  },
  {
    path: `${PREFIX_ROUTE_PATH}/detail/:id`,
    name: `${PREFIX_ROUTE_NAME}-detail`,
    component: () => import('@/modules/transaction/pages/detail.vue'),
    meta: {
      title: 'Transactions',
      layout: 'default',
      permission: [READ],
      breadcrumbs: [
        {
          label: 'Home',
          route: '/landing',
          isActive: false,
        },
        {
          label: 'Transactions',
          route: PREFIX_ROUTE_PATH,
          isActive: false,
        },
        {
          label: 'Detail',
          route: PREFIX_ROUTE_PATH,
          isActive: true,
        },
      ]
    }
  },
];
