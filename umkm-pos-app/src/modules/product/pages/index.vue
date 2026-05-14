<template>
  <div class="w-full space-y-4">
    <!-- Tabs Shift Management -->
    <Tabs v-model:value="activeTab">
      <TabList class="bg-transparent!">
        <Tab value="products">Products</Tab>
        <Tab value="categories">Categories</Tab>
      </TabList>
    </Tabs>

    <ProductList v-if="activeTab === 'products'" />
    <CategoriesList v-if="activeTab === 'categories'" />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import ProductList from '@/modules/product-lists/pages/index.vue';
import CategoriesList from '@/modules/product-categories/pages/index.vue';

const route = useRoute();
const router = useRouter();

const activeTab = computed({
  get: () => (route.query.tab as string) || 'products',
  set: (value: string) => {
    router.push({ query: { ...route.query, tab: value } });
  },
});
</script>

<style scoped>
</style>
