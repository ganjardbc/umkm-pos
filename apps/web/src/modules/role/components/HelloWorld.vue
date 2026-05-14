<template>
  <div>
    <h1>Hello role Feature!</h1>
    <p>{{ message }}</p>
  </div>
</template>
<script setup lang="ts">
import { ref } from 'vue';
import { useRoleStore } from '@/modules/role/stores';

const roleStore = useRoleStore();
const message = ref(roleStore.message);
</script>

<style scoped>
h1 {
  color: red;
}
</style>

