<template>
  <div class="w-full space-y-4">
    <div class="flex flex-col md:flex-row gap-4">
      <div class="flex-1">
        <UiSearch
          v-model="form.search"
          type="search"
          class="w-full"
          @input="search"
        />
      </div>
      <Dropdown
        v-model="form.category_id"
        :options="listOfCategories"
        option-label="name"
        option-value="id"
        placeholder="All Categories"
        showClear
        class="w-full md:w-64"
        :loading="loadingCategory"
        @update:modelValue="onFilterChange"
      />
      <Button
        icon="pi pi-plus"
        label="Add Product"
        class="w-full md:w-[192px]"
        :disabled="!isCanCreate"
        @click="addProduct"
      />
    </div>

    <UiLoading
      v-if="loading"
      message="Loading products..."
    />

    <div
      v-else-if="products.length === 0"
      class="flex flex-col items-center justify-center py-16 text-gray-400"
    >
      <i class="pi pi-inbox mb-3 text-4xl" />
      <p class="text-sm">Products are empty.</p>
    </div>

    <div v-else class="grid gap-4 lg:grid-cols-2 xl:grid-cols-3">
      <UiCard
        v-for="(product, index) in products"
        :key="product.id"
        class="relative overflow-hidden"
      >
        <div class="flex items-start justify-between gap-3">
          <div class="flex items-center gap-3 min-w-0 flex-1">
            <img
              v-if="product.thumbnail"
              :src="product.thumbnail"
              :alt="product.name"
              class="w-12 h-12 rounded-lg object-cover shrink-0"
            />
            <div
              v-else
              class="w-12 h-12 rounded-lg bg-gray-100 dark:bg-dark flex items-center justify-center shrink-0"
            >
              <i class="pi pi-image text-lg text-gray-400" />
            </div>

            <div class="min-w-0 flex-1">
              <h2 class="truncate text-sm font-semibold text-slate-900 dark:text-slate-50">
                {{ product.name }}
              </h2>
              <p class="truncate text-xs text-gray-400">
                {{ product.product_categories?.name || '-' }}
              </p>
              <p class="mt-0.5 text-xs text-slate-400">
                #{{ getNoTable(index, pagination.page, pagination.rows) }}
              </p>
            </div>
          </div>

          <div class="flex shrink-0">
            <Tag
              :value="product.is_active ? 'Active' : 'Inactive'"
              :severity="product.is_active ? 'success' : 'danger'"
              class="capitalize text-xs!"
            />
          </div>
        </div>

        <Divider class="my-0!" />

        <div class="grid grid-cols-2 gap-y-2 text-xs">
          <span class="text-slate-400">Price</span>
          <span class="text-right font-semibold text-primary dark:text-primary-400">
            {{ getCurrency(product.price) }}
          </span>

          <span class="text-slate-400">Cost</span>
          <span class="text-right text-slate-700 dark:text-slate-300">
            {{ getCurrency(product.cost) }}
          </span>

          <span class="text-slate-400">Min Stock</span>
          <span class="text-right text-slate-700 dark:text-slate-300">
            {{ product.min_stock }}
          </span>

          <span class="text-slate-400">Stock Qty</span>
          <span
            class="text-right font-medium"
            :class="isLowStock(product) ? 'text-orange-600 font-semibold' : 'text-slate-700 dark:text-slate-300'"
          >
            {{ product.stock_qty }}
          </span>

          <span class="text-slate-400">Created At</span>
          <span class="text-right text-slate-700 dark:text-slate-300">
            {{ formatDateTime(product.created_at) }}
          </span>
        </div>

        <Divider class="my-0!" />

        <div class="flex items-center justify-end gap-2">
          <Button
            severity="secondary"
            variant="outlined"
            icon="pi pi-cog"
            size="small"
            :disabled="!isCanAdjust"
            @click="onAddjustProduct(product)"
          />
          <Button
            severity="secondary"
            variant="outlined"
            icon="pi pi-eye"
            size="small"
            @click="onDetailProduct(product)"
          />
          <Button
            severity="secondary"
            variant="outlined"
            icon="pi pi-pencil"
            size="small"
            :disabled="!isCanUpdate"
            @click="onEditProduct(product)"
          />
          <Button
            severity="secondary"
            variant="outlined"
            icon="pi pi-trash"
            size="small"
            :disabled="!isCanDelete"
            @click="onDeleteProduct(product)"
          />
        </div>
      </UiCard>
    </div>

    <UiPagination
      v-model="pagination"
      class="px-0!"
      @page="onPageChange"
    />
  </div>

  <AdjustStockModal
    v-if="isCanAdjust"
    v-model:visibility="showAdjustStockModal"
    :product="selectedAdjustStock"
    @cancel="cancelAdjustStockModal"
    @submit="submitAdjustStockModal"
  />
</template>

<script setup lang="ts">
import { onMounted, ref, computed } from 'vue';
import { useRouter } from 'vue-router';
import { getNoTable, getErrorMessage, getCurrency, formatDateTime } from '@/helpers/utils.ts';
import { getListProduct, deleteProduct, postAdjustStock } from '@/modules/product-lists/services/api';
import { getActiveCategories } from '@/modules/product-categories/services/api';
import { getOutlet } from '@/helpers/auth.ts';
import { showToast, showConfirm } from '@/helpers/toast.ts';
import { showLoading, hideLoading } from '@/helpers/loading.ts';
import { isHasPermission } from '@/helpers/auth.ts';
import UiCard from '@/components/UiCard.vue';
import UiSearch from '@/components/UiSearch.vue';
import UiPagination from '@/components/UiPagination.vue';
import UiLoading from '@/components/UiLoading.vue';
import { PREFIX_ROUTE_NAME } from '@/modules/product-lists/services/constants';
import { CREATE, UPDATE, DELETE, ADJUST } from '@/modules/product-lists/services/rbac';
import AdjustStockModal from '@/modules/product-lists/components/AdjustStockModal.vue';
import { isLowStock } from '@/modules/product-lists/helpers/stock';

const router = useRouter();

// RBAC
const isCanCreate = computed(() => isHasPermission(CREATE));
const isCanUpdate = computed(() => isHasPermission(UPDATE));
const isCanDelete = computed(() => isHasPermission(DELETE));
const isCanAdjust = computed(() => isHasPermission(ADJUST));

// Fetch Data
const loading = ref(false);
const products = ref<any[]>([]);
const pagination = ref({
  page: 1,
  pageCount: 0,
  rows: 10,
  totalRecords: 0,
});

const fetchProduct = async () => {
  try {
    loading.value = true;
    const outlet = getOutlet();

    const payload = {
      page: pagination.value.page,
      limit: pagination.value.rows,
      outlet_id: outlet?.id,
      ...(form.value.search && { search: form.value.search }),
      ...(form.value.category_id && { category_id: form.value.category_id }),
    }
    const response = await getListProduct(payload);
    const { data, meta } = response?.data?.data || {};

    products.value = data || [];
    pagination.value.totalRecords = meta?.total;
    pagination.value.pageCount = meta?.totalPages;
  } catch (error) {
    showToast({
      type: 'error',
      title: 'Error.',
      message: getErrorMessage(error) || 'There was an error.',
    });
  } finally {
    loading.value = false;
  }
};

const onPageChange = (event: any) => {
  pagination.value.page = event.page + 1;
  fetchProduct();
};

// Actions
const addProduct = () => {
  router.push({ name: `${PREFIX_ROUTE_NAME}-create` });
};

const onAddjustProduct = (product: any) => {
  openAdjustStockModal(product);
};

const onDetailProduct = (product: any) => {
  router.push({
    name: `${PREFIX_ROUTE_NAME}-detail`,
    params: {
      id: product.id,
    },
  });
};

const onEditProduct = (product: any) => {
  router.push({
    name: `${PREFIX_ROUTE_NAME}-edit`,
    params: {
      id: product.id,
    },
  });
};

const onDeleteProduct = (product: any) => {
  showConfirm({
    header: 'Delete Product',
    message: 'Are you sure you want to delete this product?',
    rejectLabel: 'Cancel',
    acceptLabel: 'Delete',
    type: 'warn',
    accept: () => {
      removeProduct(product?.id);
    },
  });
};

// Delete Process
const removeProduct = async (id: string) => {
  try {
    showLoading();

    const response = await deleteProduct(id);
    const { success } = response?.data || {};
    if (success) {
      showToast({
        type: 'success',
        title: 'Success',
        message: 'Product has been deleted.'
      });
      fetchProduct();
    }
  } catch (error) {
    showToast({
      type: 'error',
      title: 'Error.',
      message: getErrorMessage(error) || 'There was an error.',
    });
  } finally {
    hideLoading();
  }
};

// Adjust Stock
const showAdjustStockModal = ref(false);
const selectedAdjustStock = ref(null);

const cancelAdjustStockModal = () => {
  showAdjustStockModal.value = false;
};

const openAdjustStockModal = (payload: any) => {
  showAdjustStockModal.value = true;
  selectedAdjustStock.value = {
    ...payload,
    stock_qty: Number(payload?.stock_qty),
  };
};

const submitAdjustStockModal = async (payload: any) => {
  try {
    showLoading();

    const outlet = getOutlet();
    const response = await postAdjustStock({
      ...payload,
      outlet_id: outlet?.id,
    });
    const { success } = response?.data || {};

    if (success) {
      showToast({
        type: 'success',
        title: 'Success',
        message: 'Stock has been adjusted successfully.'
      });
      showAdjustStockModal.value = false;
      selectedAdjustStock.value = null;
      fetchProduct();
    }
  } catch (error) {
    showToast({
      type: 'error',
      title: 'Adjust Stock Failed.',
      message: getErrorMessage(error) || 'There was an error.',
    });
  } finally {
    hideLoading();
  }
};

// Search & Filter
const form = ref<{ search: string; category_id: string | null }>({
  search: '',
  category_id: null,
});

let searchDebounceTimer: ReturnType<typeof setTimeout>;
const search = () => {
  clearTimeout(searchDebounceTimer);
  searchDebounceTimer = setTimeout(() => {
    pagination.value.page = 1;
    fetchProduct();
  }, 300);
};

const onFilterChange = () => {
  pagination.value.page = 1;
  fetchProduct();
};

// Categories
const listOfCategories = ref<any[]>([]);
const loadingCategory = ref(false);

const fetchCategories = async () => {
  try {
    loadingCategory.value = true;
    const response = await getActiveCategories({ page: 1 });
    const { data } = response?.data || {};
    listOfCategories.value = data;
  } catch (err) {
    console.warn('fetch categories', err);
  } finally {
    loadingCategory.value = false;
  }
};

onMounted(() => {
  fetchProduct();
  fetchCategories();
});
</script>

<style scoped>
</style>
