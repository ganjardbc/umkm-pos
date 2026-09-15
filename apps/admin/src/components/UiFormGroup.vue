<template>
  <div
    class="w-full flex-1 flex flex-col gap-2"
    :class="{
      'flex-col xl:flex-row': props.variant !== 'vertical',
      'flex-col': props.variant === 'vertical',
    }"
  >
    <div
      class="flex flex-col gap-0.5"
      :class="{
        'w-full xl:w-95': props.variant !== 'vertical',
        'w-full': props.variant === 'vertical',
      }"
    >
      <slot name="label">
        <label for="name" class="text-sm text-gray-500 font-semibold">
          {{ props.label || '-' }}

          <span v-if="props.isOptional" class="text-sm font-normal">
            (Optional)
          </span>
        </label>
      </slot>

      <slot
        v-if="props.hint || $slots.hint"
        name="hint"
      >
        <div class="text-xs text-gray-400">
          {{ props.hint }}
        </div>
      </slot>
    </div>

    <div class="flex-1 flex flex-col gap-2">
      <slot />

      <slot
        v-if="props.error || $slots.error"
        name="error"
      >
        <div class="text-xs text-red-500">
          {{ props.error }}
        </div>
      </slot>
    </div>
  </div>
</template>
<script setup lang="ts">
const props = defineProps<{
  label?: string;
  error?: string;
  hint?: string;
  isOptional?: boolean;
  isRequired?: boolean;
  variant?: string;
}>();
</script>
