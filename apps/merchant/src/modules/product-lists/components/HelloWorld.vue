<template>
  <div>
    <h1>Hello product Feature!</h1>
    <p>{{ message }}</p>
  </div>
</template>
<script setup lang="ts">
import { ref } from 'vue';

const message = ref('Hello product Feature!');
</script>

<style scoped>
h1 {
  color: red;
}
</style>

