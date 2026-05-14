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
        Transaction Detail
      </h1>
    </div>

    <!-- Transaction Information Card -->
    <UiCard v-if="transactionDetail">
      <template #header>  
        <div class="w-full flex flex-col md:flex-row gap-2 items-center justify-between">
          <div class="w-full flex items-center justify-between">
            <h1 class="flex-1 text-lg font-semibold">
              Transaction Information
            </h1>
            <Tag
              :value="transactionDetail?.is_cancelled ? 'Cancelled' : 'Active'"
              :severity="transactionDetail?.is_cancelled ? 'danger' : 'success'"
              class="capitalize"
            />
          </div>
          <div class="w-full md:w-auto flex justify-end gap-2">
            <Button
              severity="secondary" 
              variant="outlined"
              icon="pi pi-print"
              label="Receipt"
              size="small"
              class="w-full"
              :disabled="!isCanPrint || transactionDetail?.is_cancelled"
              @click="openPrintReceipt(transactionDetail)"
            />
            <Button
              severity="danger" 
              variant="outlined"
              icon="pi pi-times"
              label="Cancel"
              size="small"
              class="w-full"
              :disabled="!isCanCancel || transactionDetail?.is_cancelled"
              @click="onCancelTransaction(transactionDetail)"
            />
          </div>
        </div>
      </template>

      <div class="space-y-4">
        <!-- Transaction ID and Outlet -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label class="text-sm font-medium text-gray-500">Transaction ID</label>
            <p class="text-base mt-1 font-mono">{{ transactionDetail.id }}</p>
          </div>
          <div>
            <label class="text-sm font-medium text-gray-500">Device ID</label>
            <p class="text-base mt-1 font-mono">{{ transactionDetail.device_id || '-' }}</p>
          </div>
          <div>
            <label class="text-sm font-medium text-gray-500">Payment Method</label>
            <p class="text-base mt-1 capitalize">{{ transactionDetail.payment_method }}</p>
          </div>
          <div>
            <label class="text-sm font-medium text-gray-500">Offline Mode</label>
            <div class="mt-1">
              <Tag
                :value="transactionDetail.is_offline ? 'Yes' : 'No'"
                :severity="transactionDetail.is_offline ? 'warning' : 'info'"
              />
            </div>
          </div>
          <div>
            <label class="text-sm font-medium text-gray-500">Created At</label>
            <p class="text-base mt-1">{{ formatDateTime(transactionDetail.created_at) }}</p>
          </div>
          <div>
            <label class="text-sm font-medium text-gray-500">Updated At</label>
            <p class="text-base mt-1">{{ formatDateTime(transactionDetail.updated_at) }}</p>
          </div>
        </div>
      </div>
    </UiCard>

    <!-- Transaction Items -->
    <UiCard v-if="transactionDetail && transactionDetail.transaction_items">
      <template #header>
        <h1 class="text-lg font-semibold">
          Transaction Items
        </h1>
      </template>

      <div class="space-y-4">
        <DataTable :value="transactionDetail.transaction_items" tableStyle="min-width: 50rem">
          <template #empty>
            <span class="w-full text-center flex justify-center">
              No items in this transaction.
            </span>
          </template>
          <Column field="no" header="NO" class="w-18">
            <template #body="slotProps">
              {{ slotProps.index + 1 }}
            </template>
          </Column>
          <Column field="product_name_snapshot" header="Product Name">
            <template #body="slotProps">
              {{ slotProps.data.product_name_snapshot }}
            </template>
          </Column>
          <Column field="price_snapshot" header="Price">
            <template #body="slotProps">
              {{ getCurrency(slotProps.data.price_snapshot) }}
            </template>
          </Column>
          <Column field="qty" header="Qty">
            <template #body="slotProps">
              {{ slotProps.data.qty }}
            </template>
          </Column>
          <Column field="subtotal" header="Subtotal" class="min-w-28">
            <template #body="slotProps">
              {{ getCurrency(slotProps.data.subtotal) }}
            </template>
          </Column>
        </DataTable>

        <div class="bg-gray-50 dark:bg-dark! p-3 rounded">
          <div class="flex flex-col gap-4 justify-start">
            <div class="flex gap-4 items-center">
              <label class="flex-1 text-sm font-medium text-gray-500">
                Total Qty :
              </label>
              <div class="text-base">
                {{ getProductTotalQuantity(transactionDetail.transaction_items) }}
              </div>
            </div>
            <div class="flex gap-4 items-center">
              <label class="flex-1 text-sm font-medium text-gray-500">
                Total Amount :
              </label>
              <div class="text-base">
                {{ formatPrice(getProductTotalAmount(transactionDetail.transaction_items)) }}
              </div>
            </div>
          </div>
        </div>
      </div>
    </UiCard>
  </div>

  <ReceiptModal
    v-if="isCanPrint"
    v-model:visibility="showReceiptModal"
    :selected="selectedTransaction"
    @cancel="cancelReceiptModal"
  />
</template>
<script lang="ts" setup>
import { type ReceiptData } from '../utils/receiptGenerator';
import { ref, onMounted, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { getErrorMessage, getCurrency, formatDateTime, formatPrice } from '@/helpers/utils.ts';
import { showToast, showConfirm } from '@/helpers/toast.ts';
import { showLoading, hideLoading } from '@/helpers/loading.ts';
import { isHasPermission } from '@/helpers/auth.ts';
import { getDetailTransaction, postCancelTransaction } from '@/modules/transaction/services/api.ts';
import { PRINT, CANCEL } from '@/modules/transaction/services/rbac.ts';
import ReceiptModal from '@/modules/transaction/components/ReceiptModal.vue';

import UiCard from '@/components/UiCard.vue';
import DataTable from 'primevue/datatable';
import Column from 'primevue/column';
import Tag from 'primevue/tag';
import Button from 'primevue/button';

const route = useRoute();
const router = useRouter();
const transactionID = computed(() => route.params.id as string);

// RBAC
const isCanPrint = computed(() => isHasPermission(PRINT));
const isCanCancel = computed(() => isHasPermission(CANCEL));

// Receipt Modal
const showReceiptModal = ref(false);
const selectedTransaction = ref({} as ReceiptData);

const cancelReceiptModal = () => {
  showReceiptModal.value = false;
};

const openPrintReceipt = (transaction: any) => {
  selectedTransaction.value = transaction;
  showReceiptModal.value = true;
};

// Fetch Detail
const transactionDetail = ref<any>(null);

const fetchDetail = async () => {
  try {
    const response = await getDetailTransaction(transactionID.value);
    const { data } = response?.data || {};

    transactionDetail.value = data || null;
  } catch (error) {
    showToast({
      type: 'error',
      title: 'Failed to fetch data.',
      message: getErrorMessage(error) || 'There was an error.',
    });
  }
};

// Actions
const cancelTransaction = async (id: string) => {
  try {
    showLoading();

    const response = await postCancelTransaction(id);
    const { success } = response?.data || {};
    if (success) {
      showToast({
        type: 'success',
        title: 'Success',
        message: 'Transaction has been cancelled and stock has been restored.'
      });
      fetchDetail();
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

const onCancelTransaction = (transaction: any) => {
  showConfirm({
    header: 'Cancel Transaction',
    message: 'Are you sure you want to cancel this transaction? Stock will be restored.',
    rejectLabel: 'No',
    acceptLabel: 'Yes, Cancel',
    type: 'warn',
    accept: () => {
      cancelTransaction(transaction?.id);
    },
  });
};

// Helpers
const getProductTotalQuantity = (items: any[] ) => {
  return items?.reduce((total, item) => total + (item.qty || 0), 0) || 0;
};

const getProductTotalAmount = (items: any[]) => {
  return items?.reduce((total, item) => total + (Number.parseInt(item.subtotal) || 0), 0) || 0;
};

// Navigation
const onBack = () => {
  router.back();
};

onMounted(() => {
  fetchDetail();
});
</script>