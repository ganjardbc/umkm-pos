<template>
  <div>
    <h1>Hello notification Feature!</h1>
    <p>Unread notifications: {{ notificationStore.unreadCount }}</p>
  </div>
</template>
<script setup lang="ts">
import { useNotificationStore } from '@/modules/notification/stores';

const notificationStore = useNotificationStore();
</script>

<style scoped>
h1 {
  color: red;
}
</style>
