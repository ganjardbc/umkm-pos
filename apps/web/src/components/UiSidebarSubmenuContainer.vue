<template>
  <div
    :class="{
      'ml-5 border-l border-gray-200 flex flex-col gap-1': !isCollapsed,
    }"
  >
    <router-link
      :key="item?.label"
      :to="item?.route || '#'"
      @click="emit('navigate')"
    >
      <div
        class="flex items-center px-3 py-1.5 cursor-pointer transition-all"
        :class="{
          'text-gray-400 hover:text-gray-900': !isActive,
          'text-primary-500 hover:text-primary-600 font-semibold': isActive,
          'justify-center py-2!': isCollapsed,
        }"
      >
        <i
          v-if="isCollapsed"
          class="min-w-6 pi pi-circle-fill"
          :class="[
            isCollapsed ? 'text-[10px]! text-center' : 'text-[8px]! text-left',
          ]"
        />
        <span
          v-if="!isCollapsed"
          class="text-xs overflow-hidden truncate flex-1"
        >
          {{ item?.label }}
        </span>
      </div>
    </router-link>
  </div>
</template>

<script lang="ts" setup>
interface SubmenuItem {
  label: string;
  route?: string;
  icon?: string;
  menus?: SubmenuItem[];
}

defineProps({
  item: {
    type: Object as () => SubmenuItem,
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

const emit = defineEmits(['navigate']);
</script>
