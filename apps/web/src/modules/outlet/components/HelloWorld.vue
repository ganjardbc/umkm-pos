<template>
  <div>
    <h1>Hello outlet Feature!</h1>
    <p>{{ message }}</p>
  </div>
</template>
<script setup lang="ts">
import { ref } from 'vue';
import { useOutletStore } from '@/modules/outlet/stores';

const outletStore = useOutletStore();
const message = ref(outletStore.message);
</script>

<style scoped>
h1 {
  color: red;
}
</style>

