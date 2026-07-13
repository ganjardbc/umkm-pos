<template>
  <InputGroup class="h-[42px]">
    <InputText
      v-model="modelValue"
      :placeholder="placeholder"
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

<script setup lang="ts">
const modelValue = defineModel<string>({
  required: true,
});

defineProps({
  placeholder: {
    type: String,
    required: false,
    default: 'Search...',
  },
});
</script>