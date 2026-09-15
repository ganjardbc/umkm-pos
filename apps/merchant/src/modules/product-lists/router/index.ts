import {
  PREFIX_ROUTE_PATH,
  PREFIX_ROUTE_NAME,
} from '@/modules/product-lists/services/constants';

import {
  PREFIX_ROUTE_PATH as PRP_PRODUCT,
} from '@/modules/product/services/constants';

import {
  READ,
  CREATE,
  UPDATE,
} from '@/modules/product-lists/services/rbac';

export default [
  {
    path: PREFIX_ROUTE_PATH,
    name: PREFIX_ROUTE_NAME,
    component: () => import('@/modules/product-lists/pages/index.vue'),
    meta: {
      title: 'Produk',
      layout: 'default',
      permission: [READ],
      breadcrumbs: [
        {
          label: 'Beranda',
          route: '/landing',
          isActive: false,
        },
        {
          label: 'Produk',
          route: `${PRP_PRODUCT}?tab=products`,
          isActive: true,
        },
      ]
    }
  },
  {
    path: `${PREFIX_ROUTE_PATH}/create`,
    name: `${PREFIX_ROUTE_NAME}-create`,
    component: () => import('@/modules/product-lists/pages/create.vue'),
    meta: {
      title: 'Tambah Produk',
      layout: 'default',
      permission: [CREATE],
      breadcrumbs: [
        {
          label: 'Beranda',
          route: '/landing',
          isActive: false,
        },
        {
          label: 'Produk',
          route: `${PRP_PRODUCT}?tab=products`,
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
    component: () => import('@/modules/product-lists/pages/edit.vue'),
    meta: {
      title: 'Ubah Produk',
      layout: 'default',
      permission: [UPDATE],
      breadcrumbs: [
        {
          label: 'Beranda',
          route: '/landing',
          isActive: false,
        },
        {
          label: 'Produk',
          route: `${PRP_PRODUCT}?tab=products`,
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
    component: () => import('@/modules/product-lists/pages/detail.vue'),
    meta: {
      title: 'Detail Produk',
      layout: 'default',
      permission: [READ],
      breadcrumbs: [
        {
          label: 'Beranda',
          route: '/landing',
          isActive: false,
        },
        {
          label: 'Produk',
          route: `${PRP_PRODUCT}?tab=products`,
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
