<template>
  <div class="grid grid-cols-2 xl:grid-cols-4 gap-4">
    <div v-for="item in items" :key="item.label" class="p-4 rounded-lg bg-gray-50 dark:bg-dark-secondary space-y-1">
      <div class="text-sm text-gray-600 dark:text-gray-400">{{ item.label }}</div>
      <div class="text-base font-semibold text-gray-900 dark:text-white">{{ item.value }}</div>
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{ items: { label: string; value: string }[] }>();
</script>
