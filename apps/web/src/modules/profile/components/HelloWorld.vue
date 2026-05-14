<template>
  <div>
    <h1>Hello profile Feature!</h1>
    <p>{{ message }}</p>
  </div>
</template>
<script setup lang="ts">
import { ref } from 'vue';
import { useProfileStore } from '@/modules/profile/stores';

const profileStore = useProfileStore();
const message = ref(profileStore.message);
</script>

<style scoped>
h1 {
  color: red;
}
</style>

