<template>
  <div>
    <h1>Hello product Feature!</h1>
    <p>{{ message }}</p>
  </div>
</template>
<script setup lang="ts">
import { ref } from 'vue';
import { useProductStore } from '@/modules/product-lists/stores';

const productStore = useProductStore();
const message = ref(productStore.message);
</script>

<style scoped>
h1 {
  color: red;
}
</style>

