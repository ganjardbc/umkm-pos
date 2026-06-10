<template>
  <div class="w-full space-y-4">
    <div class="flex flex-col gap-3 md:flex-row md:items-end">
      <div class="flex-1">
        <InputText v-model="search" fluid placeholder="Cari menu..." />
      </div>
      <div class="md:w-64">
        <Select
          v-model="selectedCategory"
          :options="categoryOptions"
          optionLabel="name"
          optionValue="id"
          placeholder="Kategori"
          class="w-full"
        />
      </div>
    </div>

    <div class="grid gap-4 sm:grid-cols-2 md:grid-cols-3">
      <ProductCard
        v-for="product in products"
        :key="product.id"
        :product="product"
        :disabled="!catalogStore.isShiftOpen"
        @add="handleAddToCart"
      />
    </div>

    <UiCard v-if="!loading && products.length === 0">
      <div class="flex flex-col items-center justify-center py-8 text-center text-gray-500">
        <i class="pi pi-box mb-3 text-3xl" />
        <p class="text-sm">Menu tidak ditemukan.</p>
      </div>
    </UiCard>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue';
import { useRoute } from 'vue-router';
import { getErrorMessage } from '@/helpers/utils.ts';
import { showToast } from '@/helpers/toast.ts';
import UiCard from '@/components/UiCard.vue';
import ProductCard from '../components/ProductCard.vue';
import { useCatalogStore } from '../stores/index.ts';
import { getCatalogCategories, getCatalogProducts } from '../services/api.ts';

const route = useRoute();
const outletId = route.params.outletId as string;
const catalogStore = useCatalogStore();

const categories = ref<any[]>([]);
const products = ref<any[]>([]);
const selectedCategory = ref('');
const search = ref('');
const loading = ref(false);

const categoryOptions = computed(() => [
  { id: '', name: 'All Categories' },
  ...categories.value,
]);

const loadProducts = async () => {
  try {
    loading.value = true;
    const response = await getCatalogProducts({
      outlet_id: outletId,
      category_id: selectedCategory.value || undefined,
      search: search.value || undefined,
      limit: 100,
    });
    products.value = response.data?.data?.data || [];
  } catch (error) {
    showToast({
      type: 'error',
      title: 'Gagal memuat menu.',
      message: getErrorMessage(error) || 'Terjadi kesalahan.',
    });
  } finally {
    loading.value = false;
  }
};

const handleAddToCart = (product: any) => {
  if (!catalogStore.isShiftOpen) {
    showToast({
      type: 'warn',
      title: 'Shift belum dibuka',
      message: 'Outlet belum menerima pesanan saat ini.',
    });
    return;
  }

  if (product.stock_qty <= 0) {
    showToast({
      type: 'warn',
      title: 'Stok habis',
      message: `${product.name} sedang tidak tersedia.`,
    });
    return;
  }
  catalogStore.addToCart(product);
};

watch([selectedCategory, search], loadProducts);

onMounted(async () => {
  try {
    const categoriesResponse = await getCatalogCategories(outletId);
    categories.value = categoriesResponse.data?.data || [];
    await loadProducts();
  } catch (error) {
    showToast({
      type: 'error',
      title: 'Gagal memuat katalog.',
      message: getErrorMessage(error) || 'Terjadi kesalahan.',
    });
  }
});
</script>
