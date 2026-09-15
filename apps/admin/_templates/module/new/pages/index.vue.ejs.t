---
to: "src/modules/<%=h.changeCase.param(name)%>/pages/index.vue"
---
<template>
  <div>
    <h2><%= name %> Page</h2>
    <HelloWorld />
  </div>
</template>

<script setup lang="ts">
// ...existing code...
import HelloWorld from '@/modules/<%=h.changeCase.param(name)%>/components/HelloWorld.vue';
</script>

<style scoped>
h1 {
  color: blue;
}
</style>
