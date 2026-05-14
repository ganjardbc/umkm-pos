<template>
  <div class="rounded-md bg-gray-50 p-1.5 flex gap-2">
    <Button
      v-for="(option, i) in options"
      :key="i"
      type="button"
      severity="secondary"
      :variant="option?.value !== active?.value ? 'text' : 'soft'"
      :label="option?.label"
      size="small"
      class="!border-none"
      :class="{
        '!bg-transparent': option?.value !== active?.value,
        '!bg-white shadow-sm': option?.value === active?.value
      }"
      @click="handleChange(option)"
    />
  </div>
</template>
<script setup lang="ts">
import { computed } from 'vue';

const props = defineProps<{
  modelValue: { label: string; value: string } | null;
  options: Array<{ label: string; value: string }>;
}>();

const emits = defineEmits<{
  (e: 'update:modelValue', value: { label: string; value: string }): void;
  (e: 'change', value: { label: string; value: string }): void;
}>();

const active = computed(() => props.modelValue);
const options = computed(() => props.options);

const handleChange = (option: { label: string; value: string }) => {
  emits('update:modelValue', option);
  emits('change', option);
};

</script>