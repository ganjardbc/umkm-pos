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
      title: 'Merchants',
      layout: 'default',
      permission: [READ],
      breadcrumbs: [
        {
          label: 'Home',
          route: '/landing',
          isActive: false,
        },
        {
          label: 'Merchants',
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
      title: 'Create Merchant',
      layout: 'default',
      permission: [CREATE],
      breadcrumbs: [
        {
          label: 'Home',
          route: '/landing',
          isActive: false,
        },
        {
          label: 'Merchants',
          route: PREFIX_ROUTE_PATH,
          isActive: false,
        },
        {
          label: 'Create Merchant',
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
          label: 'Home',
          route: '/landing',
          isActive: false,
        },
        {
          label: 'Merchants',
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
      title: 'View Merchant',
      layout: 'default',
      permission: [READ],
      breadcrumbs: [
        {
          label: 'Home',
          route: '/landing',
          isActive: false,
        },
        {
          label: 'Merchants',
          route: PREFIX_ROUTE_PATH,
          isActive: false,
        },
        {
          label: 'View Merchant',
          route: `${PREFIX_ROUTE_PATH}/:id/view`,
          isActive: true,
        },
      ]
    }
  },
];
