<template>
  <div class="w-full space-y-4">
    <div class="flex gap-4 items-center">
      <Button
        severity="secondary"
        icon="pi pi-arrow-left"
        size="small"
        @click="onBack"
      />
      <h1 class="text-lg font-semibold">
        Product Detail
      </h1>
    </div>

    <UiCard v-if="productDetail">
      <template #header>  
        <div class="w-full flex gap-4 items-center justify-between">
          <h1 class="text-lg font-semibold">
            Product Information
          </h1>
          <Button
            icon="pi pi-pencil"
            label="Edit Product"
            size="small"
            :disabled="!isCanUpdate"
            @click="onEdit"
          />
        </div>
      </template>

      <div class="space-y-4">
        <div v-if="productDetail.thumbnail" class="flex justify-center md:justify-start">
          <img
            :src="productDetail.thumbnail"
            alt="Product Image"
            class="w-40 h-40 rounded-lg object-cover border border-gray-200"
          />
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label class="text-sm font-medium text-gray-500">Name</label>
            <p class="text-base mt-1">{{ productDetail.name }}</p>
          </div>
          <div>
            <label class="text-sm font-medium text-gray-500">Slug</label>
            <p class="text-base mt-1">{{ productDetail.slug }}</p>
          </div>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label class="text-sm font-medium text-gray-500">Category</label>
            <p class="text-base mt-1">{{ productDetail.product_categories?.name || '-' }}</p>
          </div>
          <div>
            <label class="text-sm font-medium text-gray-500">Merchant</label>
            <p class="text-base mt-1">{{ productDetail.merchants?.name || '-' }}</p>
          </div>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label class="text-sm font-medium text-gray-500">Price</label>
            <p class="text-base mt-1">{{ getCurrency(productDetail.price) }}</p>
          </div>
          <div>
            <label class="text-sm font-medium text-gray-500">Cost</label>
            <p class="text-base mt-1">{{ getCurrency(productDetail.cost) }}</p>
          </div>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label class="text-sm font-medium text-gray-500">Stock Quantity</label>
            <p class="text-base mt-1">{{ productDetail.stock_qty }}</p>
          </div>
          <div>
            <label class="text-sm font-medium text-gray-500">Minimum Stock</label>
            <p class="text-base mt-1">{{ productDetail.min_stock }}</p>
          </div>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label class="text-sm font-medium text-gray-500">Status</label>
            <div class="mt-1">
              <Tag
                :value="productDetail.is_active ? 'Active' : 'Inactive'"
                :severity="productDetail.is_active ? 'success' : 'danger'"
                class="capitalize"
              />
            </div>
          </div>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label class="text-sm font-medium text-gray-500">Created At</label>
            <p class="text-base mt-1">{{ formatDateTime(productDetail.created_at) }}</p>
          </div>
          <div>
            <label class="text-sm font-medium text-gray-500">Updated At</label>
            <p class="text-base mt-1">{{ formatDateTime(productDetail.updated_at) }}</p>
          </div>
        </div>
      </div>
    </UiCard>

    <UiCard>
      <template #header>
        <div class="w-full flex gap-4 items-center justify-between">
          <h1 class="text-lg font-semibold">
            Stock History
          </h1>
          <Button
            icon="pi pi-plus"
            label="Adjust Stock"
            size="small"
            :disabled="!isCanAdjust"
            @click="openAdjustStockModal"
          />
        </div>
      </template>

      <div class="space-y-4">
        <UiSearch
          v-model="stockForm.search"
          type="search"
          class="w-full"
          @input="searchStock"
        />

        <div class="overflow-hidden">
          <DataTable :value="stockLogs" tableStyle="min-width: 50rem">
            <template #empty>
              <span class="w-full text-center flex justify-center">
                Stock histories are empty.
              </span>
            </template>
            <Column field="no" header="NO" class="w-18">
              <template #body="slotProps">
                {{ getNoTable(slotProps.index, stockPagination.page, stockPagination.rows) }}
              </template>
            </Column>
            <Column field="change_qty" header="Change Qty">
              <template #body="slotProps">
                <span :class="slotProps.data.change_qty > 0 ? 'text-green-600' : 'text-red-600'">
                  {{ slotProps.data.change_qty > 0 ? '+' : '' }}{{ slotProps.data.change_qty }}
                </span>
              </template>
            </Column>
            <Column field="stock_qty" header="Stock After">
              <template #body="slotProps">
                {{ slotProps.data.products?.stock_qty }}
              </template>
            </Column>
            <Column field="reason" header="Reason">
              <template #body="slotProps">
                {{ slotProps.data.reason || '-' }}
              </template>
            </Column>
            <Column field="created_at" header="Created At">
              <template #body="slotProps">
                {{ formatDateTime(slotProps.data.created_at) }}
              </template>
            </Column>
          </DataTable>
          <UiPagination
            v-model="stockPagination"
            @page="onStockPageChange"
          />
        </div>
      </div>
    </UiCard>
  </div>

  <AdjustStockModal
    v-model:visibility="showAdjustStockModal"
    :product="selectedAdjustStock"
    @cancel="cancelAdjustStockModal"
    @submit="submitAdjustStockModal"
  />
</template>
<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { getErrorMessage, getCurrency, formatDateTime, getNoTable } from '@/helpers/utils.ts';
import { showToast } from '@/helpers/toast.ts';
import { showLoading, hideLoading } from '@/helpers/loading.ts';
import { isHasPermission } from '@/helpers/auth.ts';
import { getDetailProduct, getProductStock, postAdjustStock } from '@/modules/product-lists/services/api';
import { PREFIX_ROUTE_NAME } from '@/modules/product-lists/services/constants';
import { UPDATE, ADJUST } from '@/modules/product-lists/services/rbac';
import UiCard from '@/components/UiCard.vue';
import UiSearch from '@/components/UiSearch.vue';
import UiPagination from '@/components/UiPagination.vue';
import AdjustStockModal from '@/modules/product-lists/components/AdjustStockModal.vue';

const route = useRoute();
const router = useRouter();
const productID = computed(() => route.params.id as string);

// RBAC
const isCanUpdate = computed(() => isHasPermission(UPDATE));
const isCanAdjust = computed(() => isHasPermission(ADJUST));

// Fetch Detail
const productDetail = ref<any>(null);

const fetchDetail = async () => {
  try {
    const response = await getDetailProduct(productID.value);
    const { data } = response?.data || {};

    productDetail.value = data || null;
  } catch (error) {
    showToast({
      type: 'error',
      title: 'Failed to fetch data.',
      message: getErrorMessage(error) || 'There was an error.',
    });
  }
};

// Fetch Stock Logs
const stockLogs = ref([]);
const stockPagination = ref({
  page: 1,
  pageCount: 0,
  rows: 10,
  totalRecords: 0,
});

const fetchStockLogs = async () => {
  try {
    const payload = {
      page: stockPagination.value.page,
      limit: stockPagination.value.rows,
      product_id: productID.value,
      search: stockForm.value.search || undefined,
    };
    const response = await getProductStock(payload);
    const { data, meta } = response?.data?.data || {};

    stockLogs.value = data || [];
    stockPagination.value.totalRecords = meta?.total || 0;
    stockPagination.value.pageCount = meta?.totalPages || 0;
  } catch (error) {
    showToast({
      type: 'error',
      title: 'Failed to fetch stock logs.',
      message: getErrorMessage(error) || 'There was an error.',
    });
  }
};

const onStockPageChange = (event: any) => {
  stockPagination.value.page = event.page + 1;
  fetchStockLogs();
};

// Search Stock
const stockForm = ref({
  search: '',
});

const searchStock = () => {
  stockPagination.value.page = 1;
  fetchStockLogs();
};

// Adjust Stock
const showAdjustStockModal = ref(false);
const selectedAdjustStock = ref(null);

const cancelAdjustStockModal = () => {
  showAdjustStockModal.value = false;
};

const openAdjustStockModal = () => {
  const payload = productDetail.value;
  showAdjustStockModal.value = true;
  selectedAdjustStock.value = {
    ...payload,
    stock_qty: Number(payload?.stock_qty),
  };
};

const submitAdjustStockModal = async (payload: any) => {
  try {
    showLoading();

    const response = await postAdjustStock(payload);
    const { success } = response?.data || {};
    
    if (success) {
      showToast({
        type: 'success',
        title: 'Success',
        message: 'Stock has been adjusted successfully.'
      });
      showAdjustStockModal.value = false;
      selectedAdjustStock.value = null;

      fetchDetail();
      fetchStockLogs();
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

// Methods
const onBack = () => {
  router.back();
};

const onEdit = () => {
  router.push({
    name: `${PREFIX_ROUTE_NAME}-edit`,
    params: {
      id: productID.value,
    }
  });
};

onMounted(() => {
  fetchDetail();
  fetchStockLogs();
});
</script>