import {
  PREFIX_ROUTE_PATH,
  PREFIX_ROUTE_NAME,
} from '@/modules/customers/services/constants';
import { READ } from '@/modules/customers/services/rbac';

export default [
  {
    path: PREFIX_ROUTE_PATH,
    name: PREFIX_ROUTE_NAME,
    component: () => import('@/modules/customers/pages/index.vue'),
    meta: {
      title: 'Pelanggan',
      layout: 'default',
      permission: [READ],
      breadcrumbs: [
        {
          label: 'Beranda',
          route: '/landing',
          isActive: false,
        },
        {
          label: 'Pelanggan',
          route: PREFIX_ROUTE_PATH,
          isActive: true,
        },
      ]
    }
  },
];
