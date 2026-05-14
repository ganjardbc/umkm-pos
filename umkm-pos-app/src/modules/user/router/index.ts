import {
  PREFIX_ROUTE_PATH,
  PREFIX_ROUTE_NAME,
} from '@/modules/user/services/constants.ts';

import {
  READ,
  CREATE,
  UPDATE,
} from '@/modules/user/services/rbac.ts';

export default [
  {
    path: PREFIX_ROUTE_PATH,
    name: PREFIX_ROUTE_NAME,
    component: () => import('@/modules/user/pages/index.vue'),
    meta: {
      title: 'User',
      layout: 'default',
      permission: [READ],
      breadcrumbs: [
        {
          label: 'Home',
          route: '/landing',
          isActive: false,
        },
        {
          label: 'User',
          route: PREFIX_ROUTE_PATH,
          isActive: true,
        },
      ]
    }
  },
  {
    path: `${PREFIX_ROUTE_PATH}/create`,
    name: `${PREFIX_ROUTE_NAME}-create`,
    component: () => import('@/modules/user/pages/create.vue'),
    meta: {
      title: 'User',
      layout: 'default',
      permission: [CREATE],
      breadcrumbs: [
        {
          label: 'Home',
          route: '/landing',
          isActive: false,
        },
        {
          label: 'User',
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
  {
    path: `${PREFIX_ROUTE_PATH}/:id/edit`,
    name: `${PREFIX_ROUTE_NAME}-edit`,
    component: () => import('@/modules/user/pages/edit.vue'),
    meta: {
      title: 'User',
      layout: 'default',
      permission: [UPDATE],
      breadcrumbs: [
        {
          label: 'Home',
          route: '/landing',
          isActive: false,
        },
        {
          label: 'User',
          route: PREFIX_ROUTE_PATH,
          isActive: false,
        },
        {
          label: 'Edit',
          route: `${PREFIX_ROUTE_PATH}/:id/edit`,
          isActive: true,
        },
      ]
    }
  },
  {
    path: `${PREFIX_ROUTE_PATH}/:id`,
    name: `${PREFIX_ROUTE_NAME}-detail`,
    component: () => import('@/modules/user/pages/detail.vue'),
    meta: {
      title: 'User',
      layout: 'default',
      permission: [READ],
      breadcrumbs: [
        {
          label: 'Home',
          route: '/landing',
          isActive: false,
        },
        {
          label: 'User',
          route: PREFIX_ROUTE_PATH,
          isActive: false,
        },
        {
          label: 'Detail',
          route: `${PREFIX_ROUTE_PATH}/:id`,
          isActive: true,
        },
      ]
    }
  },
];
