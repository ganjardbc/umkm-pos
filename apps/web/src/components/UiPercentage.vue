<template>
  <div class="flex flex-col gap-2">
    <div class="w-full flex justify-between items-center">
      <div
        class="text-sm text-gray-500"
        :class="classPercentage"
      >
        {{ percentage }}%
      </div>
      <div
        class="text-sm text-gray-500"
        :class="classCurrentTotal"
      >
        {{ current ? `${current} /` : '' }}
        <span class="font-semibold">
          {{ total }}
        </span>
      </div>
    </div>
    <div
      class="relative w-full h-3 bg-gray-100 rounded-md"
      :class="classWrapperSlider"
    >
      <div
        class="absolute top-0 left-0 w-full h-3 bg-primary-500 rounded-md"
        :class="classContentSlider"
        :style="{ width: percentage + '%' }"
      />
    </div>
  </div>
</template>
<script setup>
import { computed } from 'vue';

const props = defineProps({
  percentage: {
    type: Number,
    required: true
  },
  current: {
    type: Number,
    required: true
  },
  total: {
    type: Number,
    required: true
  },
  classCurrentTotal: {
    type: String,
    required: true
  },
  classPercentage: {
    type: String,
    required: true
  },
  classWrapperSlider: {
    type: String,
    required: true
  },
  classContentSlider: {
    type: String,
    required: true
  }
});

const current = computed(() => props.current);
const total = computed(() => props.total);
</script>