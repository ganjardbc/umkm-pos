<template>
  <div class="flex items-center justify-center" style="min-height: 300px">
    <div class="flex flex-col items-center gap-4 text-center">
      <i class="pi pi-exclamation-triangle text-5xl text-red-500"></i>
      <p class="text-gray-700 font-medium">{{ error }}</p>
      <Button
        @click="$emit('retry')"
        label="Retry"
        icon="pi pi-refresh"
        severity="secondary"
        size="small"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
interface Props {
  error: string;
}

defineProps<Props>();

defineEmits<{
  retry: [];
}>();
</script>
