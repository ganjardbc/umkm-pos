<template>
  <Toast />
</template>

<script setup lang="ts">
import { watch } from 'vue';
import { useToast } from 'primevue/usetoast';
import { useGlobalToast } from '@/composables/useGlobalToast';

const toast = useToast();
const { toastQueue } = useGlobalToast();

watch(
  toastQueue,
  (queue) => {
    if (queue.length > 0) {
      const toastOptions = queue.shift();
      if (toastOptions) {
        toast.add(toastOptions);
      }
    }
  },
  { deep: true }
);
</script>
