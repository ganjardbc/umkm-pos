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
      <Button
        icon="pi pi-plus"
        label="Add Product"
        class="w-full md:w-[192px]"
        :disabled="!isCanCreate"
        @click="addProduct"
      />
    </div>

    <UiCard class="p-0! gap-0! overflow-hidden!">
      <DataTable :value="products" tableStyle="min-width: 50rem">
        <template #empty>
          <span class="w-full text-center flex justify-center">
            Products are empty.
          </span>
        </template>
        <Column field="no" header="NO" class="w-18">
          <template #body="slotProps">
            {{ getNoTable(slotProps.index, pagination.page, pagination.rows) }}
          </template>
        </Column>
        <Column field="thumbnail" header="Image" class="w-20">
          <template #body="slotProps">
            <img
              v-if="slotProps.data.thumbnail"
              :src="slotProps.data.thumbnail"
              alt=""
              class="w-10 h-10 rounded-lg object-cover"
            />
            <div
              v-else
              class="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center"
            >
              <i class="pi pi-image text-sm text-gray-400" />
            </div>
          </template>
        </Column>
        <Column field="name" header="Name" class="min-w-68">
          <template #body="slotProps">
            <h2>
              {{ slotProps.data.name }}
            </h2>
            <div class="text-xs text-gray-400">
              {{ slotProps.data.product_categories?.name || '-' }}
            </div>
          </template>
        </Column>
        <Column field="price" header="Price" class="min-w-48">
          <template #body="slotProps">
            {{ getCurrency(slotProps.data.price) }}
          </template>
        </Column>
        <Column field="cost" header="Cost" class="min-w-48">
          <template #body="slotProps">
            {{ getCurrency(slotProps.data.cost) }}
          </template>
        </Column>
        <Column field="min_stock" header="Min Stock" class="min-w-38">
          <template #body="slotProps">
            {{ slotProps.data.min_stock }}
          </template>
        </Column>
        <Column field="stock_qty" header="Qty" class="min-w-28">
          <template #body="slotProps">
            {{ slotProps.data.stock_qty }}
          </template>
        </Column>
        <Column field="created_at" header="Created At" class="min-w-48">
          <template #body="slotProps">
            {{ formatDateTime(slotProps.data.created_at) }}
          </template>
        </Column>
        <Column field="is_active" header="Status">
          <template #body="slotProps">
            <Tag
              :value="slotProps.data.is_active ? 'Active' : 'Inactive'"
              :severity="slotProps.data.is_active ? 'success' : 'danger'"
              class="capitalize"
            />
          </template>
        </Column>
        <Column field="action" header="#" class="w-[184px]">
          <template #body="slotProps">
            <div class="flex gap-2">
              <Button
                severity="secondary" 
                variant="outlined"
                icon="pi pi-plus"
                size="small"
                :disabled="!isCanAdjust"
                @click="onAddjustProduct(slotProps.data)"
              />
              <Button
                severity="secondary" 
                variant="outlined"
                icon="pi pi-eye"
                size="small"
                @click="onDetailProduct(slotProps.data)"
              />
              <Button
                severity="secondary" 
                variant="outlined"
                icon="pi pi-pencil"
                size="small"
                :disabled="!isCanUpdate"
                @click="onEditProduct(slotProps.data)"
              />
              <Button
                severity="secondary" 
                variant="outlined"
                icon="pi pi-trash"
                size="small"
                :disabled="!isCanDelete"
                @click="onDeleteProduct(slotProps.data)"
              />
            </div>
          </template>
        </Column>
      </DataTable>
      <UiPagination
        v-model="pagination"
        @page="onPageChange"
      />
    </UiCard>
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
import { showToast, showConfirm } from '@/helpers/toast.ts';
import { showLoading, hideLoading } from '@/helpers/loading.ts';
import { isHasPermission } from '@/helpers/auth.ts';
import UiCard from '@/components/UiCard.vue';
import UiSearch from '@/components/UiSearch.vue';
import UiPagination from '@/components/UiPagination.vue';
import { PREFIX_ROUTE_NAME } from '@/modules/product-lists/services/constants';
import { CREATE, UPDATE, DELETE, ADJUST } from '@/modules/product-lists/services/rbac';
import AdjustStockModal from '@/modules/product-lists/components/AdjustStockModal.vue';

const router = useRouter();

// RBAC
const isCanCreate = computed(() => isHasPermission(CREATE));
const isCanUpdate = computed(() => isHasPermission(UPDATE));
const isCanDelete = computed(() => isHasPermission(DELETE));
const isCanAdjust = computed(() => isHasPermission(ADJUST));

// Fetch Data
const products = ref([]);
const pagination = ref({
  page: 1,
  pageCount: 0,
  rows: 10,
  totalRecords: 0,
});

const fetchProduct = async () => {
  try {
    const payload = {
      page: pagination.value.page,
      limit: pagination.value.rows,
    }
    const response = await getListProduct(payload);
    const { data, meta } = response?.data?.data || {};

    products.value = data;
    pagination.value.totalRecords = meta?.total;
    pagination.value.pageCount = meta?.totalPages;
  } catch (error) {
    showToast({
      type: 'error',
      title: 'Error.',
      message: getErrorMessage(error) || 'There was an error.',
    });
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

// Search
const form = ref({
  search: '',
});

const search = () => {
  console.log(form.value);
};

onMounted(() => {
  fetchProduct();
});
</script>

<style scoped>
</style>
