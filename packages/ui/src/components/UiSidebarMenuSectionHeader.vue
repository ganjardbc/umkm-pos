<template>
  <div>
    <div
      v-if="!isCollapsed"
      class="text-xs font-medium text-gray-400 uppercase px-3 mb-1"
    >
      {{ label }}
    </div>
    <div
      v-if="isCollapsed && !isFirst"
      class="w-1/2 mx-auto border-b border-gray-200 mb-3"
    />
  </div>
</template>

<script lang="ts" setup>
defineProps({
  label: {
    type: String,
    required: true,
  },
  isCollapsed: {
    type: Boolean,
    default: false,
  },
  isFirst: {
    type: Boolean,
    default: false,
  },
});
</script>
