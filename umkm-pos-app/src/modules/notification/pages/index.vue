<template>
  <div class="w-full flex flex-col justify-center items-center" style="height: calc(100vh - 90px);">
    <UiEmptyState
      icon="pi pi-bell"
      title="There is no notifications"
      description="You don't have new notifications for now."
    />
  </div>
</template>

<script setup lang="ts">
import UiEmptyState from '@/components/UiEmptyState.vue';
</script>

<style scoped></style>
