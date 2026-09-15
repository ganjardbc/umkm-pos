<template>
  <div class="ui-loading">
    <i class="pi pi-spin pi-spinner text-4xl"></i>
    <span class="ml-2 text-sm text-center">{{ message }}</span>
  </div>
</template>

<script setup lang="ts">
defineProps({
  message: {
    type: String,
    default: 'Loading...'
  }
});
</script>

<style scoped>
.ui-loading {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100%;
}
</style>