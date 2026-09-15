export default [
  {
    path: '/404',
    name: '404',
    component: () => import('@/modules/error/pages/404.vue'),
    meta: {
      title: '404 Halaman Tidak Ditemukan',
      layout: 'default',
    }
  },
  {
    path: '/403',
    name: '403',
    component: () => import('@/modules/error/pages/403.vue'),
    meta: {
      title: '403 Akses Ditolak',
      layout: 'default',
    }
  }
];