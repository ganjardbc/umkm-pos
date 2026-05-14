<template>
  <div>
    <h1>Hello categories Feature!</h1>
    <p>{{ message }}</p>
  </div>
</template>
<script setup lang="ts">
import { ref } from 'vue';
import { useCategoriesStore } from '@/modules/product-categories/stores';

const categoriesStore = useCategoriesStore();
const message = ref(categoriesStore.message);
</script>

<style scoped>
h1 {
  color: red;
}
</style>

