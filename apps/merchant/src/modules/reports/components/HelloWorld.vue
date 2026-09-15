<template>
  <div>
    <h1>Hello reports Feature!</h1>
    <p>{{ message }}</p>
  </div>
</template>
<script setup lang="ts">
import { ref } from 'vue';
import { useReportsStore } from '@/modules/reports/stores';

const reportsStore = useReportsStore();
const message = ref(reportsStore.message);
</script>

<style scoped>
h1 {
  color: red;
}
</style>

