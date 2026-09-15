<template>
  <div class="w-full flex flex-col justify-center items-center py-16">
    <div class="text-center">
      <slot name="icon">
        <i
          class="text-6xl! text-gray-400 mb-4 block"
          :class="icon || 'pi pi-info-circle'"
        ></i>
      </slot>
      
      <slot name="title">
        <h2 class="text-xl font-bold mb-2">{{ title }}</h2>
      </slot>
      
      <slot name="description">
        <p class="text-sm text-gray-400">{{ description }}</p>
      </slot>
      
      <slot name="actions"></slot>
    </div>
  </div>
</template>

<script setup lang="ts">
interface Props {
  icon?: string;
  title?: string;
  description?: string;
}

withDefaults(defineProps<Props>(), {
  title: 'Tidak ada data',
  description: 'Belum ada data yang tersedia untuk ditampilkan.',
});
</script>

<style scoped>
/* Empty state styling */
</style>
