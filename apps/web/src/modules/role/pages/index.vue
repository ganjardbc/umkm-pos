<template>
  <div class="w-full space-y-4">
    <div class="flex flex-col md:flex-row gap-4">
      <div class="flex-1 min-w-0">
        <UiSearch
          v-model="form.search"
          type="search"
          class="w-full"
          @input="search"
        />
      </div>
      <Button
        icon="pi pi-plus"
        label="Add Role"
        class="w-full md:w-[192px]"
        :disabled="!isCanCreate"
        @click="addRole"
      />
    </div>

    <UiLoading
      v-if="loading"
      message="Loading roles..."
    />

    <div v-else-if="roles.length === 0" class="flex flex-col items-center justify-center py-16 text-gray-400">
      <i class="pi pi-inbox mb-3 text-4xl" />
      <p class="text-sm">Roles are empty.</p>
    </div>

    <div v-else class="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
      <UiCard
        v-for="(role, index) in roles"
        :key="role.id"
        class="relative overflow-hidden"
      >
        <div class="flex items-start justify-between gap-2">
          <div class="min-w-0 flex-1">
            <p class="truncate text-base font-semibold text-slate-900 dark:text-slate-50">
              {{ role.name || '-' }}
            </p>
            <p class="mt-0.5 text-xs text-slate-400">
              #{{ getNoTable(index, pagination.page, pagination.rows) }}
            </p>
          </div>
        </div>

        <Divider class="my-0!" />

        <div class="space-y-2 text-xs">
          <div>
            <span class="text-slate-400 block mb-0.5">Description</span>
            <p class="text-slate-700 dark:text-slate-300 line-clamp-2">
              {{ role.description || '-' }}
            </p>
          </div>

          <div class="flex items-center justify-between">
            <span class="text-slate-400">Total Permissions</span>
            <span class="text-right font-medium text-slate-700 dark:text-slate-300">
              {{ role.role_permissions?.length || 0 }}
            </span>
          </div>

          <div class="flex items-center justify-between">
            <span class="text-slate-400">Created At</span>
            <span class="text-right text-slate-700 dark:text-slate-300">
              {{ formatDateTime(role.created_at) }}
            </span>
          </div>
        </div>

        <Divider class="my-0!" />

        <div class="flex items-center justify-end gap-2">
          <Button
            severity="secondary"
            variant="outlined"
            icon="pi pi-eye"
            size="small"
            @click="onDetailRole(role)"
          />
          <Button
            severity="secondary"
            variant="outlined"
            icon="pi pi-pencil"
            size="small"
            :disabled="!isCanUpdate"
            @click="onEditRole(role)"
          />
          <Button
            severity="secondary"
            variant="outlined"
            icon="pi pi-trash"
            size="small"
            :disabled="!isCanDelete"
            @click="onDeleteRole(role)"
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
import type { RoleDetail } from '@/modules/role/services/types.ts';
import { onMounted, ref, computed } from 'vue';
import { useRouter } from 'vue-router';
import { getNoTable, getErrorMessage, formatDateTime, useDebounce } from '@/helpers/utils.ts';
import { getListRole, deleteRole } from '@/modules/role/services/api.ts';
import { showToast, showConfirm } from '@/helpers/toast.ts';
import { isHasPermission } from '@/helpers/auth.ts';
import { showLoading, hideLoading } from '@/helpers/loading.ts';
import { PREFIX_ROUTE_NAME } from '@/modules/role/services/constants.ts';
import { CREATE, UPDATE, DELETE } from '@/modules/role/services/rbac.ts';
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
const roles = ref<RoleDetail[]>([]);
const pagination = ref({
  page: 1,
  pageCount: 0,
  rows: 10,
  totalRecords: 0,
});

const fetchRole = async () => {
  try {
    loading.value = true;
    const payload = {
      page: pagination.value.page,
      limit: pagination.value.rows,
      search: form.value.search || undefined,
    };
    const response = await getListRole(payload);
    const { data, meta } = response?.data?.data || {};

    roles.value = data || [];
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
  fetchRole();
};

// Actions
const addRole = () => {
  router.push({
    name: `${PREFIX_ROUTE_NAME}-create`,
  });
};

const onDetailRole = (role: any) => {
  router.push({
    name: `${PREFIX_ROUTE_NAME}-detail`,
    params: {
      id: role?.id,
    },
  });
};

const onEditRole = (role: any) => {
  router.push({
    name: `${PREFIX_ROUTE_NAME}-edit`,
    params: {
      id: role?.id,
    },
  });
};

// Delete Process
const removeRole = async (id: string) => {
  try {
    showLoading();

    const response = await deleteRole(id);
    const { success } = response?.data || {};
    if (success) {
      showToast({
        type: 'success',
        title: 'Success',
        message: 'Role has been deleted.',
      });
      fetchRole();
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

const onDeleteRole = (role: any) => {
  showConfirm({
    header: 'Delete Role',
    message: 'Are you sure you want to delete this role?',
    rejectLabel: 'Cancel',
    acceptLabel: 'Delete',
    type: 'warn',
    accept: () => {
      removeRole(role?.id);
    },
  });
};

// Search
const form = ref({
  search: '',
});

const search = useDebounce(() => {
  pagination.value.page = 1;
  fetchRole();
}, 400);

onMounted(() => {
  fetchRole();
});
</script>

<style scoped>
</style>
