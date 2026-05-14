<template>
  <div class="w-full flex flex-col gap-4">
    <div class="w-full flex flex-col gap-1">
      <!-- Menu Items -->
      <MenuItem
        v-for="(item, index) in filteredSidebars"
        :key="item?.label || index"
        :item="item"
        :is-collapsed="isCollapsed"
        :is-active="isActive(item?.route || '')"
        @navigate="$emit('navigate')"
      >
        <!-- Submenu Items -->
        <SubmenuContainer
          v-if="item?.menus"
          v-for="child in item.menus"
          :key="child?.label"
          :item="child"
          :is-collapsed="isCollapsed"
          :is-active="isActiveChild(child?.route || '')"
          @navigate="$emit('navigate')"
        />
      </MenuItem>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { computed } from 'vue';
import { useRoute } from 'vue-router';
import { isHasPermission } from '@/helpers/auth.ts';
import menus from '@/services/menus.ts';
import MenuItem from './UiSidebarMenuItem.vue';
import SubmenuContainer from './UiSidebarSubmenuContainer.vue';

interface SidebarItem {
  label: string;
  route?: string;
  icon?: string;
  permissions: string[];
  featureFlag: boolean;
  menus?: SidebarItem[];
}

defineProps({
  isCollapsed: {
    type: Boolean,
    default: false,
  },
});

const route = useRoute();

const sidebars = computed(() => menus as SidebarItem[]);

const filteredSidebars = computed(() =>
  sidebars.value.filter(
    (item) =>
      item.permissions.some((permission) => isHasPermission(permission)) &&
      item.featureFlag
  )
);

const isActive = (path: string): boolean => {
  const routePath = path.split('/')[1];
  const routeName = route.path.split('/')[1];
  return routePath === routeName;
};

const isActiveChild = (path: string): boolean => {
  const routePath = path.split('/')[1];
  const routeName = route.path.split('/')[1];
  const routeSubPath = path.split('/')[2];
  const routeSubName = route.path.split('/')[2];
  return routePath === routeName && routeSubPath === routeSubName;
};

defineExpose({ isActiveChild });
</script>