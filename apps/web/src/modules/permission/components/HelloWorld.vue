<template>
  <div>
    <h1>Hello permission Feature!</h1>
    <p>{{ message }}</p>
  </div>
</template>
<script setup lang="ts">
import { ref } from 'vue';
import { usePermissionStore } from '@/modules/permission/stores';

const permissionStore = usePermissionStore();
const message = ref(permissionStore.message);
</script>

<style scoped>
h1 {
  color: red;
}
</style>

