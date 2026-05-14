import {
  PREFIX_ROUTE_PATH,
  PREFIX_ROUTE_NAME,
} from '@/modules/product-categories/services/constants';

import {
  PREFIX_ROUTE_PATH as PRP_PRODUCT,
} from '@/modules/product/services/constants';

import {
  READ,
  CREATE,
  UPDATE,
} from '@/modules/product-categories/services/rbac';

export default [
  {
    path: PREFIX_ROUTE_PATH,
    name: PREFIX_ROUTE_NAME,
    component: () => import('@/modules/product-categories/pages/index.vue'),
    meta: {
      title: 'Categories',
      layout: 'default',
      permission: [READ],
      breadcrumbs: [
        {
          label: 'Home',
          route: '/landing',
          isActive: false,
        },
        {
          label: 'Categories',
          route: `${PRP_PRODUCT}?tab=categories`,
          isActive: false,
        },
      ]
    }
  },
  {
    path: `${PREFIX_ROUTE_PATH}/create`,
    name: `${PREFIX_ROUTE_NAME}-create`,
    component: () => import('@/modules/product-categories/pages/create.vue'),
    meta: {
      title: 'Categories',
      layout: 'default',
      permission: [CREATE],
      breadcrumbs: [
        {
          label: 'Home',
          route: '/landing',
          isActive: false,
        },
        {
          label: 'Categories',
          route: `${PRP_PRODUCT}?tab=categories`,
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
    path: `${PREFIX_ROUTE_PATH}/edit/:id`,
    name: `${PREFIX_ROUTE_NAME}-edit`,
    component: () => import('@/modules/product-categories/pages/edit.vue'),
    meta: {
      title: 'Categories',
      layout: 'default',
      permission: [UPDATE],
      breadcrumbs: [
        {
          label: 'Home',
          route: '/landing',
          isActive: false,
        },
        {
          label: 'Categories',
          route: `${PRP_PRODUCT}?tab=categories`,
          isActive: false,
        },
        {
          label: 'Edit',
          route: `${PREFIX_ROUTE_PATH}/edit`,
          isActive: true,
        },
      ]
    }
  },
  {
    path: `${PREFIX_ROUTE_PATH}/detail/:id`,
    name: `${PREFIX_ROUTE_NAME}-detail`,
    component: () => import('@/modules/product-categories/pages/detail.vue'),
    meta: {
      title: 'Categories',
      layout: 'default',
      permission: [CREATE],
      breadcrumbs: [
        {
          label: 'Home',
          route: '/landing',
          isActive: false,
        },
        {
          label: 'Categories',
          route: `${PRP_PRODUCT}?tab=categories`,
          isActive: false,
        },
        {
          label: 'Detail',
          route: `${PREFIX_ROUTE_PATH}/create`,
          isActive: true,
        },
      ]
    }
  },
];
