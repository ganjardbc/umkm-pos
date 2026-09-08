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
      title: 'Kategori',
      layout: 'default',
      permission: [READ],
      breadcrumbs: [
        {
          label: 'Beranda',
          route: '/landing',
          isActive: false,
        },
        {
          label: 'Kategori',
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
      title: 'Tambah Kategori',
      layout: 'default',
      permission: [CREATE],
      breadcrumbs: [
        {
          label: 'Beranda',
          route: '/landing',
          isActive: false,
        },
        {
          label: 'Kategori',
          route: `${PRP_PRODUCT}?tab=categories`,
          isActive: false,
        },
        {
          label: 'Tambah',
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
      title: 'Ubah Kategori',
      layout: 'default',
      permission: [UPDATE],
      breadcrumbs: [
        {
          label: 'Beranda',
          route: '/landing',
          isActive: false,
        },
        {
          label: 'Kategori',
          route: `${PRP_PRODUCT}?tab=categories`,
          isActive: false,
        },
        {
          label: 'Ubah',
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
      title: 'Detail Kategori',
      layout: 'default',
      permission: [CREATE],
      breadcrumbs: [
        {
          label: 'Beranda',
          route: '/landing',
          isActive: false,
        },
        {
          label: 'Kategori',
          route: `${PRP_PRODUCT}?tab=categories`,
          isActive: false,
        },
        {
          label: 'Detail',
          isActive: true,
        },
      ]
    }
  },
];
