<template>
  <div class="w-full flex flex-col gap-4">
    <!-- One block per run of items sharing a `group`; ungrouped items form a headerless block -->
    <div
      v-for="(section, sectionIndex) in sections"
      :key="`${section.label ?? 'none'}-${sectionIndex}`"
      class="w-full flex flex-col gap-1"
    >
      <SectionHeader
        v-if="section.label"
        :label="section.label"
        :is-collapsed="isCollapsed"
        :is-first="sectionIndex === 0"
      />

      <!-- Menu Items -->
      <MenuItem
        v-for="(item, index) in section.items"
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
import MenuItem from './UiSidebarMenuItem.vue';
import SubmenuContainer from './UiSidebarSubmenuContainer.vue';
import SectionHeader from './UiSidebarMenuSectionHeader.vue';

interface SidebarItem {
  label: string;
  route?: string;
  icon?: string;
  permissions: string[];
  featureFlag: boolean;
  // Section header this item sits under (e.g. "Penjualan"). Consecutive items with the
  // same group share one header; a group with no visible item shows no header.
  group?: string;
  menus?: SidebarItem[];
}

// The menu tree and the permission check are app-specific, so they come in as
// props rather than being imported from an app module.
const props = withDefaults(
  defineProps<{
    menus: SidebarItem[];
    hasPermission: (permission: string) => boolean;
    isCollapsed?: boolean;
  }>(),
  { isCollapsed: false },
);

defineEmits<{ navigate: [] }>();

const route = useRoute();

const filteredSidebars = computed(() =>
  props.menus.filter(
    (item) =>
      item.permissions.some((permission) => props.hasPermission(permission)) &&
      item.featureFlag
  )
);

// Group after filtering by permission, so an empty group never leaves a lonely header.
const sections = computed(() => {
  const result: { label?: string; items: SidebarItem[] }[] = [];
  for (const item of filteredSidebars.value) {
    const last = result[result.length - 1];
    if (last && last.label === item.group) last.items.push(item);
    else result.push({ label: item.group, items: [item] });
  }
  return result;
});

const isActive = (path: string): boolean => {
  const routePath = path.split('/')[1];
  const routeName = route.path.split('/')[1];
  if (routePath !== routeName) return false;
  // Items with a sub-path (e.g. /reports/shifts) must match it too, else siblings all light up.
  const subPath = path.split('/')[2];
  return !subPath || subPath === route.path.split('/')[2];
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