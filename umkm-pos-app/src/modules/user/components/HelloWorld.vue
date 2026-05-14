<template>
  <div>
    <h1>Hello user Feature!</h1>
    <p>{{ message }}</p>
  </div>
</template>
<script setup lang="ts">
import { ref } from 'vue';
import { useUserStore } from '@/modules/user/stores';

const userStore = useUserStore();
const message = ref(userStore.message);
</script>

<style scoped>
h1 {
  color: red;
}
</style>

