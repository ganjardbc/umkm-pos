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
        label="Add Permission"
        class="w-full md:w-[192px]"
        :disabled="!isCanCreate"
        @click="addPermission"
      />
    </div>

    <UiLoading
      v-if="loading"
      message="Loading permissions..."
    />

    <div v-else-if="permissions.length === 0" class="flex flex-col items-center justify-center py-16 text-gray-400">
      <i class="pi pi-inbox mb-3 text-4xl" />
      <p class="text-sm">Permissions are empty.</p>
    </div>

    <div v-else class="grid gap-4 lg:grid-cols-2 xl:grid-cols-3">
      <UiCard
        v-for="(permission, index) in permissions"
        :key="permission.id"
        class="relative overflow-hidden"
      >
        <div class="flex items-start justify-between gap-2">
          <div class="min-w-0 flex-1">
            <p class="truncate text-sm font-semibold text-slate-900 dark:text-slate-50">
              {{ permission.code }}
            </p>
            <p class="mt-0.5 text-xs text-slate-400">
              #{{ getNoTable(index, pagination.page, pagination.rows) }}
            </p>
          </div>
        </div>

        <Divider class="my-0!" />

        <div class="grid grid-cols-2 gap-y-2 text-xs">
          <span class="text-slate-400">Description</span>
          <span class="text-right text-slate-700 dark:text-slate-300 break-words">{{ permission.description || '-' }}</span>

          <span class="text-slate-400">Created At</span>
          <span class="text-right text-slate-700 dark:text-slate-300">{{ formatDateTime(permission.created_at) }}</span>
        </div>

        <Divider class="my-0!" />

        <div class="flex items-center justify-end">
          <Button
            severity="secondary"
            variant="outlined"
            icon="pi pi-trash"
            size="small"
            :disabled="!isCanDelete"
            @click="onDeletePermission(permission)"
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
</template>

<script setup lang="ts">
import { onMounted, ref, computed } from 'vue';
import { useRouter } from 'vue-router';
import { getNoTable, getErrorMessage, formatDateTime } from '@/helpers/utils.ts';
import { getListPermission, deletePermission } from '@/modules/permission/services/api.ts';
import { showToast, showConfirm } from '@/helpers/toast.ts';
import { showLoading, hideLoading } from '@/helpers/loading.ts';
import { isHasPermission } from '@/helpers/auth.ts';
import { PREFIX_ROUTE_NAME } from '@/modules/permission/services/constants.ts';
import { CREATE, DELETE } from '@/modules/permission/services/rbac.ts';
import UiCard from '@/components/UiCard.vue';
import UiSearch from '@/components/UiSearch.vue';
import UiPagination from '@/components/UiPagination.vue';
import UiLoading from '@/components/UiLoading.vue';

const router = useRouter();

// RBAC
const isCanCreate = computed(() => isHasPermission(CREATE));
const isCanDelete = computed(() => isHasPermission(DELETE));

// Fetch Data
const loading = ref(false);
const permissions = ref<any[]>([]);
const pagination = ref({
  page: 1,
  pageCount: 0,
  rows: 10,
  totalRecords: 0,
});

const fetchPermission = async () => {
  try {
    loading.value = true;
    const payload = {
      page: pagination.value.page,
      limit: pagination.value.rows,
    }
    const response = await getListPermission(payload);
    const { data, meta } = response?.data?.data || {};

    permissions.value = data || [];
    pagination.value.totalRecords = meta?.total;
    pagination.value.pageCount = meta?.totalPages;
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
  fetchPermission();
};

// Actions
const addPermission = () => {
  router.push({
    name: `${PREFIX_ROUTE_NAME}-create`,
  });
};

// Delete Process
const removePermission = async (id: string) => {
  try {
    showLoading();

    const response = await deletePermission(id);
    const { success } = response?.data || {};
    if (success) {
      showToast({
        type: 'success',
        title: 'Success',
        message: 'Permission has been deleted.'
      });
      fetchPermission();
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

const onDeletePermission = (permission: any) => {
  showConfirm({
    header: 'Delete Permission',
    message: 'Are you sure you want to delete this permission?',
    rejectLabel: 'Cancel',
    acceptLabel: 'Delete',
    type: 'warn',
    accept: () => {
      removePermission(permission?.id);
    },
  });
};

// Search
const form = ref({
  search: '',
});

const search = () => {
  console.log(form.value);
};

onMounted(() => {
  fetchPermission();
});
</script>

<style scoped>
</style>
