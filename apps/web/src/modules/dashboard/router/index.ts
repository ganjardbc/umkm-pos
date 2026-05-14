import {
  PREFIX_ROUTE_PATH,
  PREFIX_ROUTE_NAME,
} from '@/modules/dashboard/services/constants.ts';
import {
  READ,
} from '@/modules/dashboard/services/rbac.ts';

export default [
  {
    path: PREFIX_ROUTE_PATH,
    name: `${PREFIX_ROUTE_NAME}`,
    component: () => import('@/modules/dashboard/pages/index.vue'),
    meta: {
      title: 'Dashboard',
      layout: 'default',
      permission: [READ],
      breadcrumbs: [
        {
          label: 'Home',
          route: '/landing',
        },
        {
          label: 'Dashboard',
          route: PREFIX_ROUTE_PATH,
          isActive: true,
        },
      ]
    }
  }
];
