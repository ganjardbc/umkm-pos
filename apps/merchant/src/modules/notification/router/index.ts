import {
  PREFIX_ROUTE_PATH,
  PREFIX_ROUTE_NAME,
} from '@/modules/notification/services/constants.ts';
import { READ } from '@/modules/notification/services/rbac.ts';

export default [
  {
    path: PREFIX_ROUTE_PATH,
    name: PREFIX_ROUTE_NAME,
    component: () => import('@/modules/notification/pages/index.vue'),
    meta: {
      title: 'Notifikasi',
      layout: 'default',
      breadcrumbs: [
        {
          label: 'Beranda',
          route: '/landing',
          isActive: false,
        },
        {
          label: 'Notifikasi',
          route: PREFIX_ROUTE_PATH,
          isActive: true,
        },
      ],
      permission: [READ],
    }
  },
];
