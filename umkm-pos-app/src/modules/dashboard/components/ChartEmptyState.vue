<template>
  <div class="flex items-center justify-center py-4">
    <div class="flex flex-col items-center gap-3 text-gray-500">
      <i :class="`pi ${icon} text-4xl!`"></i>
      <p>{{ message }}</p>
    </div>
  </div>
</template>

<script setup lang="ts">
interface Props {
  message?: string;
  icon?: string;
}

withDefaults(defineProps<Props>(), {
  message: 'No data available',
  icon: 'pi-chart-line',
});
</script>
