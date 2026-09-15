import {
  PREFIX_ROUTE_PATH,
  PREFIX_ROUTE_NAME
} from '@/modules/merchants/services/constants.ts';
import {
  READ,
  UPDATE,
} from '@/modules/merchants/services/rbac.ts';

// Tenants only view and edit their own merchant (taken from the logged-in
// session), so routes carry no :id. Listing/creating merchants is apps/admin.
export default [
  {
    path: PREFIX_ROUTE_PATH,
    name: `${PREFIX_ROUTE_NAME}-detail`,
    component: () => import('@/modules/merchants/pages/detail.vue'),
    meta: {
      title: 'Detail Merchant',
      layout: 'default',
      permission: [READ],
      breadcrumbs: [
        {
          label: 'Beranda',
          route: '/landing',
          isActive: false,
        },
        {
          label: 'Merchant',
          route: PREFIX_ROUTE_PATH,
          isActive: true,
        },
      ]
    }
  },
  {
    path: `${PREFIX_ROUTE_PATH}/edit`,
    name: `${PREFIX_ROUTE_NAME}-edit`,
    component: () => import('@/modules/merchants/pages/edit.vue'),
    meta: {
      title: 'Edit Merchant',
      layout: 'default',
      permission: [UPDATE],
      breadcrumbs: [
        {
          label: 'Beranda',
          route: '/landing',
          isActive: false,
        },
        {
          label: 'Merchant',
          route: PREFIX_ROUTE_PATH,
          isActive: false,
        },
        {
          label: 'Edit Merchant',
          route: `${PREFIX_ROUTE_PATH}/edit`,
          isActive: true,
        },
      ]
    }
  },
];
