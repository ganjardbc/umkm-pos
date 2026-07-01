<template>
  <div>
    <h1>Hello notification Feature!</h1>
    <p>{{ message }}</p>
  </div>
</template>
<script setup lang="ts">
import { ref } from 'vue';

const message = ref('Hello notification Feature!');
</script>

<style scoped>
h1 {
  color: red;
}
</style>

