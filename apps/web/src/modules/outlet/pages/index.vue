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
        label="Add Outlet"
        class="w-full md:w-48"
        :disabled="!isCanCreate"
        @click="addOutlet"
      />
    </div>

    <UiLoading
      v-if="loading"
      message="Loading outlets..."
    />

    <div
      v-else-if="filteredOutlets.length === 0"
      class="flex flex-col items-center justify-center py-16 text-gray-400"
    >
      <i class="pi pi-inbox mb-3 text-4xl" />
      <p class="text-sm">Outlets are empty.</p>
    </div>

    <div v-else class="grid gap-4 lg:grid-cols-2 xl:grid-cols-3">
      <UiCard
        v-for="(outlet, index) in filteredOutlets"
        :key="outlet.id"
        class="relative overflow-hidden"
      >
        <div class="flex items-start justify-between gap-3">
          <div class="flex items-center gap-3 min-w-0 flex-1">
            <img
              v-if="outlet.logo"
              :src="outlet.logo"
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
              <p class="truncate text-sm font-semibold text-slate-900 dark:text-slate-50">
                {{ outlet.name }}
              </p>
              <p class="mt-0.5 text-xs text-slate-400">
                #{{ getNoTable(index, pagination.page, pagination.rows) }}
              </p>
            </div>
          </div>
          <div class="shrink-0">
            <Tag
              :value="outlet.is_active ? 'Active' : 'Inactive'"
              :severity="outlet.is_active ? 'success' : 'danger'"
              class="capitalize text-xs!"
            />
          </div>
        </div>

        <Divider class="my-0!" />

        <div class="grid grid-cols-2 gap-y-2 text-xs">
          <span class="text-slate-400">Merchant</span>
          <span class="text-right truncate text-slate-700 dark:text-slate-300">
            {{ outlet.merchants?.name || '-' }}
          </span>

          <span class="text-slate-400">Location</span>
          <span class="text-right truncate text-slate-700 dark:text-slate-300">
            {{ outlet.location || '-' }}
          </span>

          <span class="text-slate-400">Created At</span>
          <span class="text-right text-slate-700 dark:text-slate-300">
            {{ formatDateTime(outlet.created_at) }}
          </span>
        </div>

        <Divider class="my-0!" />

        <div class="flex items-center justify-end">
          <div class="flex gap-1">
            <Button
              severity="secondary"
              variant="outlined"
              icon="pi pi-eye"
              size="small"
              @click="onDetailOutlet(outlet)"
            />
            <Button
              severity="secondary"
              variant="outlined"
              icon="pi pi-pencil"
              size="small"
              :disabled="!isCanUpdate"
              @click="onEditOutlet(outlet)"
            />
            <Button
              severity="danger"
              variant="outlined"
              icon="pi pi-trash"
              size="small"
              :disabled="!isCanDelete"
              @click="onDeleteOutlet(outlet)"
            />
          </div>
        </div>
      </UiCard>
    </div>

    <UiPagination
      v-model="pagination"
      class="px-0!"
      @page="onPageChange"
    />
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref, computed } from 'vue';
import { useRouter } from 'vue-router';
import { getNoTable, getErrorMessage, formatDateTime } from '@/helpers/utils.ts';
import { getListOutlet, deleteOutlet } from '@/modules/outlet/services/api.ts';
import { showToast, showConfirm } from '@/helpers/toast.ts';
import { showLoading, hideLoading } from '@/helpers/loading.ts';
import { isHasPermission } from '@/helpers/auth.ts';
import { PREFIX_ROUTE_NAME } from '@/modules/outlet/services/constants.ts';
import { CREATE, UPDATE, DELETE } from '@/modules/outlet/services/rbac.ts';
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
const outlets = ref<any[]>([]);
const pagination = ref({
  page: 1,
  pageCount: 0,
  rows: 10,
  totalRecords: 0,
});

const fetchOutlet = async () => {
  try {
    loading.value = true;
    const payload = {
      page: pagination.value.page,
      limit: pagination.value.rows,
    };
    const response = await getListOutlet(payload);
    const { data, meta } = response?.data?.data || {};

    outlets.value = data || [];
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
  fetchOutlet();
};

// Actions
const addOutlet = () => {
  router.push({ name: `${PREFIX_ROUTE_NAME}-create` });
};

const onDetailOutlet = (outlet: any) => {
  router.push({
    name: `${PREFIX_ROUTE_NAME}-detail`,
    params: { id: outlet.id },
  });
};

const onEditOutlet = (outlet: any) => {
  router.push({
    name: `${PREFIX_ROUTE_NAME}-edit`,
    params: { id: outlet.id },
  });
};

// Delete Process
const removeOutlet = async (id: string) => {
  try {
    showLoading();

    const response = await deleteOutlet(id);
    const { success } = response?.data || {};
    if (success) {
      showToast({
        type: 'success',
        title: 'Success',
        message: 'Outlet has been deleted.',
      });
      fetchOutlet();
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

const onDeleteOutlet = (outlet: any) => {
  showConfirm({
    header: 'Delete Outlet',
    message: 'Are you sure you want to delete this outlet?',
    rejectLabel: 'Cancel',
    acceptLabel: 'Delete',
    type: 'warn',
    accept: () => {
      removeOutlet(outlet?.id);
    },
  });
};

// Search & Filter
const form = ref({
  search: '',
});

const filteredOutlets = computed(() => {
  if (!form.value.search) return outlets.value;
  const keyword = form.value.search.toLowerCase().trim();
  return outlets.value.filter((outlet: any) => {
    return (
      outlet.name?.toLowerCase().includes(keyword) ||
      outlet.location?.toLowerCase().includes(keyword) ||
      outlet.merchants?.name?.toLowerCase().includes(keyword)
    );
  });
});

const search = () => {
  // Client-side search filters the current page or search query
};

onMounted(() => {
  fetchOutlet();
});
</script>

<style scoped>
</style>
