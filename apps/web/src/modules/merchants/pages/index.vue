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
        label="Add Merchant"
        class="w-full md:w-[192px]"
        :disabled="!isCanCreate"
        @click="addMerchant"
      />
    </div>

    <UiLoading
      v-if="loading"
      message="Loading merchants..."
    />

    <div
      v-else-if="merchants.length === 0"
      class="flex flex-col items-center justify-center py-16 text-gray-400"
    >
      <i class="pi pi-inbox mb-3 text-4xl" />
      <p class="text-sm">Merchants are empty.</p>
    </div>

    <div v-else class="space-y-4">
      <div class="grid gap-4 lg:grid-cols-2 xl:grid-cols-3">
        <UiCard
          v-for="(merchant, index) in merchants"
          :key="merchant.id"
          class="relative overflow-hidden"
        >
          <div class="flex items-start justify-between gap-3">
            <div class="flex items-center gap-3 min-w-0 flex-1">
              <img
                v-if="merchant.logo"
                :src="merchant.logo"
                alt=""
                class="w-12 h-12 rounded-lg object-cover shrink-0"
              />
              <div
                v-else
                class="w-12 h-12 rounded-lg bg-gray-100 dark:bg-gray-800 flex items-center justify-center shrink-0"
              >
                <i class="pi pi-image text-lg text-gray-400" />
              </div>
              <div class="min-w-0 flex-1">
                <p class="truncate text-base font-semibold text-slate-900 dark:text-slate-50">
                  {{ merchant.name }}
                </p>
                <p class="mt-0.5 text-xs text-slate-400">
                  #{{ getNoTable(index, pagination.page, pagination.rows) }}
                </p>
              </div>
            </div>
          </div>

          <Divider class="my-0!" />

          <div class="grid grid-cols-2 gap-y-2 text-xs">
            <span class="text-slate-400">Created At</span>
            <span class="text-right text-slate-700 dark:text-slate-300">
              {{ formatDateTime(merchant.created_at) }}
            </span>
          </div>

          <Divider class="my-0!" />

          <div class="flex items-center justify-end gap-2">
            <Button
              severity="secondary"
              variant="outlined"
              icon="pi pi-eye"
              size="small"
              @click="onDetailMerchant(merchant)"
            />
            <Button
              severity="secondary"
              variant="outlined"
              icon="pi pi-pencil"
              size="small"
              :disabled="!isCanUpdate"
              @click="onEditMerchant(merchant)"
            />
            <Button
              severity="secondary"
              variant="outlined"
              icon="pi pi-trash"
              size="small"
              :disabled="!isCanDelete"
              @click="onDeleteMerchant(merchant)"
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
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref, computed } from 'vue';
import { useRouter } from 'vue-router';
import { getNoTable, getErrorMessage, formatDateTime } from '@/helpers/utils.ts';
import { showToast, showConfirm } from '@/helpers/toast.ts';
import { showLoading, hideLoading } from '@/helpers/loading.ts';
import { isHasPermission } from '@/helpers/auth.ts';
import { getListMerchants, deleteMerchants } from '@/modules/merchants/services/api.ts';
import { PREFIX_ROUTE_NAME } from '@/modules/merchants/services/constants.ts';
import { CREATE, UPDATE, DELETE } from '@/modules/merchants/services/rbac.ts';
import UiCard from '@/components/UiCard.vue';
import UiSearch from '@/components/UiSearch.vue';
import UiPagination from '@/components/UiPagination.vue';
import UiLoading from '@/components/UiLoading.vue';

const router = useRouter();

// RBAC
const isCanCreate = computed(() => isHasPermission(CREATE));
const isCanUpdate = computed(() => isHasPermission(UPDATE));
const isCanDelete = computed(() => isHasPermission(DELETE));

// Fetch Data
const loading = ref(false);
const merchants = ref<any[]>([]);
const pagination = ref({
  page: 1,
  pageCount: 0,
  rows: 10,
  totalRecords: 0,
});

const fetchMerchants = async () => {
  try {
    loading.value = true;
    const payload = {
      page: pagination.value.page,
      limit: pagination.value.rows,
      ...(form.value.search ? { search: form.value.search } : {}),
    };
    const response = await getListMerchants(payload);
    const { data, meta } = response?.data?.data || {};

    merchants.value = data || [];
    pagination.value.totalRecords = meta?.total || 0;
    pagination.value.pageCount = meta?.totalPages || 0;
  } catch (error) {
    console.log(error);
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
  fetchMerchants();
};

// Actions
const addMerchant = () => {
  router.push({ name: `${PREFIX_ROUTE_NAME}-create` });
};

const onDetailMerchant = (merchant: any) => {
  router.push({
    name: `${PREFIX_ROUTE_NAME}-detail`,
    params: { id: merchant.id }
  });
};

const onEditMerchant = (merchant: any) => {
  router.push({
    name: `${PREFIX_ROUTE_NAME}-edit`,
    params: { id: merchant.id }
  });
};

const onDeleteMerchant = (merchant: any) => {
  showConfirm({
    header: 'Delete Merchant',
    message: 'Are you sure you want to delete this merchant?',
    rejectLabel: 'Cancel',
    acceptLabel: 'Delete',
    type: 'warn',
    accept: () => {
      removeMerchant(merchant?.id);
    },
  });
};

// Delete Process
const removeMerchant = async (id: string) => {
  try {
    showLoading();

    const response = await deleteMerchants(id);
    const { success } = response?.data || {};
    if (success) {
      showToast({
        type: 'success',
        title: 'Success',
        message: 'Merchant has been deleted.'
      });
      fetchMerchants();
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

// Search
const form = ref({
  search: '',
});

let searchDebounceTimer: ReturnType<typeof setTimeout>;
const search = () => {
  clearTimeout(searchDebounceTimer);
  searchDebounceTimer = setTimeout(() => {
    pagination.value.page = 1;
    fetchMerchants();
  }, 300);
};

onMounted(() => {
  fetchMerchants();
});
</script>

<style scoped>
</style>
