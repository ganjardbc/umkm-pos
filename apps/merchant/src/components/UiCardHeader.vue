<template>
  <div class="w-full flex flex-col lg:flex-row items-center justify-between gap-4">
    <slot name="title">
      <div class="w-full flex-1 flex flex-col">
        <div class="text-lg text-gray-900 font-semibold">
          {{ title }}
        </div>
        <div
          v-if="subtitle"
          class="text-sm text-gray-500"
        >
          {{ subtitle }}
        </div>
      </div>
    </slot>

    <slot />
  </div>
</template>
<script setup>
import { defineProps } from 'vue';

defineProps({
  title: {
    type: String,
    default: '-',
  },
  subtitle: {
    type: String,
    default: '',
  },
});
</script>