import { createRouter, createWebHistory } from 'vue-router';
import type { Router } from 'vue-router';
import { isHasPermission } from '@/helpers/auth.ts';

const modules = import.meta.glob('../modules/**/router/index.ts',{ eager: true });

const entireModules = Object.entries(modules)
  .map((fileModule: any) => {
    return fileModule[1].default
  })
  .flat();

// middleware route guard for permission check
entireModules.forEach((route) => {
  const { meta } = route;
  if (meta && meta.permission) {
    route.beforeEnter = (_: any, __: any, next: any) => {
      const hasPermission = meta.permission.some((permission: string) => isHasPermission(permission))
      if (hasPermission !== false) {
        next();
      } else {
        next({ name: '403' });
      }
    };
  }
});

// 404 route
entireModules.push({
  path: '/:catchAll(.*)',
  name: '404',
  meta: {
    title: '404 Not Found',
    layout: 'default',
  },
  component: () => import('@/modules/error/pages/404.vue'),
});

// setup router
export function setupRouter(): Router {
	return createRouter({
		history: createWebHistory(),
		routes: entireModules,
	});
}
