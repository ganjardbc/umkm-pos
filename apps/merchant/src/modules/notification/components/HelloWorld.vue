<template>
  <div>
    <h1>Hello notification Feature!</h1>
    <p>{{ message }}</p>
  </div>
</template>
<script setup lang="ts">
import { ref } from 'vue';
import { useNotificationStore } from '@/modules/notification/stores';

const notificationStore = useNotificationStore();
const message = ref(notificationStore.message);
</script>

<style scoped>
h1 {
  color: red;
}
</style>

