<template>
  <div
    class="relative rounded-full flex items-center justify-center"
    :class="[ bgColor, iconColor ]"
    :style="{ width: size, height: size }"
  >
    <i :class="icon" />
  </div>
</template>
<script setup>
import { computed, defineProps } from 'vue';

const props = defineProps({
  icon: {
    type: String,
    required: true
  },
  size: {
    type: String,
    default: '48px'
  },
  bgColor: {
    type: String,
    default: 'bg-primary-600'
  },
  iconColor: {
    type: String,
    default: 'text-gray-100'
  }
});

const icon = computed(() => props.icon);
const size = computed(() => props.size);
const bgColor = computed(() => props.bgColor);
const iconColor = computed(() => props.iconColor);
</script>