import {
  PREFIX_ROUTE_PATH,
  PREFIX_ROUTE_NAME,
} from '@/modules/profile/services/constants.ts';

export default [
  {
    path: PREFIX_ROUTE_PATH,
    name: PREFIX_ROUTE_NAME,
    component: () => import('@/modules/profile/pages/index.vue'),
    meta: {
      title: 'Profil',
      layout: 'default',
      breadcrumbs: [
        {
          label: 'Beranda',
          route: '/landing',
          isActive: false,
        },
        {
          label: 'Profil',
          route: PREFIX_ROUTE_PATH,
          isActive: true,
        },
      ]
    }
  },
];
