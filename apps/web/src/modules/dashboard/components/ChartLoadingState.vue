<template>
  <div class="flex items-center justify-center" style="min-height: 300px">
    <div class="flex flex-col items-center gap-3">
      <i class="pi pi-spin pi-spinner text-4xl text-blue-500"></i>
      <p class="text-gray-400">{{ message }}</p>
    </div>
  </div>
</template>

<script setup lang="ts">
interface Props {
  message?: string;
}

withDefaults(defineProps<Props>(), {
  message: 'Loading data...',
});
</script>
