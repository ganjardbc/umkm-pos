---
to: "src/modules/<%=h.changeCase.param(name)%>/components/HelloWorld.vue"
---
<template>
  <div>
    <h1>Hello <%= name %> Feature!</h1>
    <p>{{ message }}</p>
  </div>
</template>
<script setup lang="ts">
import { ref } from 'vue';
import { use<%=h.changeCase.pascal(name)%>Store } from '@/modules/<%=h.changeCase.param(name)%>/stores';

const <%=h.changeCase.camel(name)%>Store = use<%=h.changeCase.pascal(name)%>Store();
const message = ref(<%=h.changeCase.camel(name)%>Store.message);
</script>

<style scoped>
h1 {
  color: red;
}
</style>

