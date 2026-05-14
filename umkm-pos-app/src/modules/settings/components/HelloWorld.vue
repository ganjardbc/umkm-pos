<template>
  <div>
    <h1>Hello settings Feature!</h1>
    <p>{{ message }}</p>
  </div>
</template>
<script setup lang="ts">
import { ref } from 'vue';
import { useSettingsStore } from '@/modules/settings/stores';

const settingsStore = useSettingsStore();
const message = ref(settingsStore.message);
</script>

<style scoped>
h1 {
  color: red;
}
</style>

