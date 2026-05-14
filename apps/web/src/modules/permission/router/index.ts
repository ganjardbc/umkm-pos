import {
  PREFIX_ROUTE_PATH,
  PREFIX_ROUTE_NAME,
} from '@/modules/permission/services/constants.ts';

import {
  READ,
  CREATE,
} from '@/modules/permission/services/rbac.ts';

export default [
  {
    path: PREFIX_ROUTE_PATH,
    name: PREFIX_ROUTE_NAME,
    component: () => import('@/modules/permission/pages/index.vue'),
    meta: {
      title: 'Permission',
      layout: 'default',
      permission: [READ],
      breadcrumbs: [
        {
          label: 'Home',
          route: '/landing',
          isActive: false,
        },
        {
          label: 'Permission',
          route: PREFIX_ROUTE_PATH,
          isActive: true,
        },
      ]
    }
  },
  {
    path: `${PREFIX_ROUTE_PATH}/create`,
    name: `${PREFIX_ROUTE_NAME}-create`,
    component: () => import('@/modules/permission/pages/create.vue'),
    meta: {
      title: 'Permission',
      layout: 'default',
      permission: [CREATE],
      breadcrumbs: [
        {
          label: 'Home',
          route: '/landing',
          isActive: false,
        },
        {
          label: 'Permission',
          route: PREFIX_ROUTE_PATH,
          isActive: false,
        },
        {
          label: 'Add',
          route: `${PREFIX_ROUTE_PATH}/create`,
          isActive: true,
        },
      ]
    }
  },
];
