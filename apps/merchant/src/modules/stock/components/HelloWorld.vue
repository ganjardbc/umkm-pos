<template>
  <div>
    <h1>Hello stock Feature!</h1>
    <p>{{ message }}</p>
  </div>
</template>
<script setup lang="ts">
import { ref } from 'vue';
import { useStockStore } from '@/modules/stock/stores';

const stockStore = useStockStore();
const message = ref(stockStore.message);
</script>

<style scoped>
h1 {
  color: red;
}
</style>

