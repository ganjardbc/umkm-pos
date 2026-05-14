<template>
  <div>
    <h1>Hello merchants Feature!</h1>
    <p>{{ message }}</p>
  </div>
</template>
<script setup lang="ts">
import { ref } from 'vue';
import { useMerchantsStore } from '@/modules/merchants/stores';

const merchantsStore = useMerchantsStore();
const message = ref(merchantsStore.message);
</script>

<style scoped>
h1 {
  color: red;
}
</style>

