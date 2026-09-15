<template>
  <component
    :is="item?.menus ? 'div' : 'router-link'"
    :to="item?.route"
    class="relative"
  >
    <div
      class="group sidebar-menu-item sidebar-menu-item--dark"
      :class="{
        'sidebar-menu-item--active': isActive,
        'sidebar-menu-item--inactive': !isActive,
        'sidebar-menu-item--collapsed': isCollapsed,
      }"
      @click="item?.menus ? submenuCollapsed = !submenuCollapsed : emit('navigate')"
    >
      <i
        class="sidebar-menu-item__icon"
        :class="[
          item?.icon,
          isCollapsed ? 'sidebar-menu-item__icon--collapsed' : 'sidebar-menu-item__icon--expanded',
        ]"
      />
      <span
        v-if="!isCollapsed"
        class="sidebar-menu-item__label"
      >
        {{ item?.label }}
      </span>
      <i
        v-if="item?.menus && !isCollapsed"
        class="pi pi-chevron-right sidebar-menu-item__chevron"
        :class="{
          'sidebar-menu-item__chevron--open': submenuCollapsed,
        }"
      />
    </div>

    <div
      v-if="item?.menus && submenuCollapsed"
    >
      <slot />
    </div>
  </component>
</template>

<script lang="ts" setup>
interface MenuItem {
  label: string;
  route?: string;
  icon?: string;
  menus?: MenuItem[];
}

defineProps({
  item: {
    type: Object as () => MenuItem,
    required: true,
  },
  isCollapsed: {
    type: Boolean,
    default: false,
  },
  isActive: {
    type: Boolean,
    default: false,
  },
});

const submenuCollapsed = defineModel({
  type: Boolean,
  default: false,
});

const emit = defineEmits(['navigate']);
</script>

<style scoped>
@import "tailwindcss";
@import "@/assets/styles/themes.css";

.sidebar-menu-item {
  @apply flex items-center gap-2 rounded-lg px-4 py-3 cursor-pointer transition-colors duration-200 border-l-3 border-transparent;
}

.sidebar-menu-item--dark {
  @apply dark:text-dark;
}

.sidebar-menu-item--active {
  @apply bg-primary-50 text-primary-500 hover:bg-primary-50 hover:text-primary-500 border-primary;
}

.sidebar-menu-item--active.sidebar-menu-item--dark {
  @apply dark:bg-dark dark:text-primary-400 dark:hover:bg-dark dark:hover:text-primary-300;
}

.sidebar-menu-item--inactive {
  @apply bg-transparent text-gray-500 hover:bg-gray-100 hover:text-gray-900;
}

.sidebar-menu-item--inactive.sidebar-menu-item--dark {
  @apply dark:text-gray-500 dark:hover:bg-dark dark:hover:text-gray-400;
}

.sidebar-menu-item--collapsed {
  @apply justify-center py-2! h-12!;
}

.sidebar-menu-item__icon {
  @apply min-w-6;
}

.sidebar-menu-item__icon--collapsed {
  @apply text-lg! text-center!;
}

.sidebar-menu-item__icon--expanded {
  @apply text-base! text-left!;
}

.sidebar-menu-item__label {
  @apply text-sm overflow-hidden truncate flex-1 font-semibold;
}

.sidebar-menu-item__chevron {
  @apply text-[8px]! transition-transform duration-200;
}

.sidebar-menu-item__chevron--open {
  @apply rotate-90;
}
</style>
