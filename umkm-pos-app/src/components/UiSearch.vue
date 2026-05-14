<template>
  <InputGroup class="h-[42px]">
    <InputText
      v-model="props.modelValue"
      :placeholder="props.placeholder"
      size="medium"
      class="w-full"
    />
    <InputGroupAddon>
      <Button
        icon="pi pi-search"
        severity="secondary"
        variant="text"
      />
    </InputGroupAddon>
  </InputGroup>
</template>
<script setup>
import { defineProps } from 'vue';

const props = defineProps({
  modelValue: {
    type: String,
    required: true
  },
  placeholder: {
    type: String,
    required: false,
    default: 'Search...'
  }
});
</script>