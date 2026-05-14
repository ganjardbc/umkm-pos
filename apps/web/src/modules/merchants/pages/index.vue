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

    <UiCard class="p-0! gap-0! overflow-hidden!">
      <DataTable :value="merchants" tableStyle="min-width: 50rem">
        <template #empty>
          <span class="w-full text-center flex justify-center">
            Merchants are empty.
          </span>
        </template>
        <Column field="no" header="NO" class="w-18">
          <template #body="slotProps">
            {{ getNoTable(slotProps.index, pagination.page, pagination.rows) }}
          </template>
        </Column>
        <Column field="logo" header="Logo" class="w-20">
          <template #body="slotProps">
            <img
              v-if="slotProps.data.logo"
              :src="slotProps.data.logo"
              alt=""
              class="w-10 h-10 rounded-lg object-cover"
            />
            <div v-else class="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center">
              <i class="pi pi-image text-sm text-gray-400" />
            </div>
          </template>
        </Column>
        <Column field="name" header="Name"></Column>
        <Column field="created_at" header="Created At">
          <template #body="slotProps">
            {{ formatDateTime(slotProps.data.created_at) }}
          </template>
        </Column>
        <Column field="action" header="#" class="w-full md:w-[128px]">
          <template #body="slotProps">
            <div class="flex gap-2">
              <Button
                severity="secondary" 
                variant="outlined"
                icon="pi pi-eye"
                size="small"
                @click="onDetailMerchant(slotProps.data)"
              />
              <Button
                severity="secondary" 
                variant="outlined"
                icon="pi pi-pencil"
                size="small"
                :disabled="!isCanUpdate"
                @click="onEditMerchant(slotProps.data)"
              />
              <Button
                severity="secondary" 
                variant="outlined"
                icon="pi pi-trash"
                size="small"
                :disabled="!isCanDelete"
                @click="onDeleteMerchant(slotProps.data)"
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

const router = useRouter();

// RBAC
const isCanCreate = computed(() => isHasPermission(CREATE));
const isCanUpdate = computed(() => isHasPermission(UPDATE));
const isCanDelete = computed(() => isHasPermission(DELETE));

// Fetch Data
const merchants = ref([]);
const pagination = ref({
  page: 1,
  pageCount: 0,
  rows: 10,
  totalRecords: 0,
});

const fetchMerchants = async () => {
  try {
    const payload = {
      page: pagination.value.page,
      limit: pagination.value.rows,
    }
    const response = await getListMerchants(payload);
    const { data, meta } = response?.data?.data || {};

    merchants.value = data;
    pagination.value.totalRecords = meta?.total;
    pagination.value.pageCount = meta?.totalPages;
  } catch (error) {
    console.log(error);
    showToast({
        type: 'error',
        title: 'Error.',
        message: getErrorMessage(error) || 'There was an error.',
    });
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

const search = () => {
  console.log(form.value);
};

onMounted(() => {
  fetchMerchants();
});
</script>

<style scoped>
</style>
