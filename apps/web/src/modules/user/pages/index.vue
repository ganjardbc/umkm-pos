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
        label="Add User"
        class="w-full md:w-[192px]"
        :disabled="!isCanCreate"
        @click="onAddUser"
      />
    </div>

    <!-- Loading state -->
    <UiLoading v-if="loading" message="Loading users..." />

    <!-- Empty state -->
    <div
      v-else-if="users.length === 0"
      class="flex flex-col items-center justify-center py-16 text-gray-400"
    >
      <i class="pi pi-users mb-3 text-4xl" />
      <p class="text-sm">Users are empty.</p>
    </div>

    <!-- Card grid -->
    <div v-else class="grid gap-4 lg:grid-cols-2 xl:grid-cols-3">
      <UiCard
        v-for="user in users"
        :key="user.id"
        class="relative overflow-hidden"
      >
        <!-- Header: avatar + name + status tag -->
        <div class="flex items-center gap-3">
          <img
            v-if="user.avatar"
            :src="user.avatar"
            alt=""
            class="w-10 h-10 rounded-full object-cover shrink-0"
          />
          <div
            v-else
            class="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center shrink-0"
          >
            <i class="pi pi-user text-sm text-gray-400" />
          </div>
          <p class="flex-1 truncate text-sm font-semibold text-slate-900 dark:text-slate-50">
            {{ user.name }}
          </p>
          <Tag
            :value="user.is_active ? 'Active' : 'Inactive'"
            :severity="user.is_active ? 'success' : 'danger'"
            class="capitalize text-xs! shrink-0"
          />
        </div>

        <Divider class="my-0!" />

        <!-- Metadata -->
        <div class="grid grid-cols-2 gap-y-2 text-xs">
          <span class="text-slate-400">Email</span>
          <span class="text-right text-slate-700 dark:text-slate-300 truncate">{{ user.email }}</span>

          <span class="text-slate-400">Merchant</span>
          <span class="text-right text-slate-700 dark:text-slate-300">{{ user.merchants?.name }}</span>

          <span class="text-slate-400">Created At</span>
          <span class="text-right text-slate-700 dark:text-slate-300">{{ formatDateTime(user.created_at) }}</span>
        </div>

        <Divider class="my-0!" />

        <!-- Actions -->
        <div class="flex gap-2 justify-end">
          <Button
            severity="secondary"
            variant="outlined"
            icon="pi pi-eye"
            size="small"
            @click="onDetailUser(user)"
          />
          <Button
            severity="secondary"
            variant="outlined"
            icon="pi pi-pencil"
            size="small"
            :disabled="!isCanUpdate"
            @click="onEditUser(user)"
          />
          <Button
            severity="secondary"
            variant="outlined"
            icon="pi pi-trash"
            size="small"
            :disabled="!isCanDelete || !user.is_active"
            @click="onDeleteUser(user)"
          />
        </div>
      </UiCard>
    </div>

    <!-- Pagination (unchanged) -->
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
import { getErrorMessage, formatDateTime } from '@/helpers/utils.ts';
import { getListUser, deactivateUser } from '@/modules/user/services/api.ts';
import { showToast, showConfirm } from '@/helpers/toast.ts';
import { showLoading, hideLoading } from '@/helpers/loading.ts';
import { isHasPermission } from '@/helpers/auth.ts';
import { PREFIX_ROUTE_NAME } from '@/modules/user/services/constants.ts';
import { CREATE, UPDATE, DELETE } from '@/modules/user/services/rbac.ts';
import UiCard from '@/components/UiCard.vue';
import UiLoading from '@/components/UiLoading.vue';
import UiSearch from '@/components/UiSearch.vue';
import UiPagination from '@/components/UiPagination.vue';

const router = useRouter();

// RBAC
const isCanCreate = computed(() => isHasPermission(CREATE));
const isCanUpdate = computed(() => isHasPermission(UPDATE));
const isCanDelete = computed(() => isHasPermission(DELETE));

// Fetch Data
const loading = ref(false);
const users = ref<any[]>([]);
const pagination = ref({
  page: 1,
  pageCount: 0,
  rows: 10,
  totalRecords: 0,
});

const fetchUser = async () => {
  try {
    loading.value = true;
    const payload = {
      page: pagination.value.page,
      limit: pagination.value.rows,
    }
    const response = await getListUser(payload);
    const { data, meta } = response?.data?.data || {};

    users.value = data;
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
  fetchUser();
};

// Actions
const onAddUser = () => {
  router.push({
    name: `${PREFIX_ROUTE_NAME}-create`
  });
};

const onDetailUser = (user: any) => {
  router.push({
    name: `${PREFIX_ROUTE_NAME}-detail`,
    params: {
      id: user.id
    }
  });
};

const onEditUser = (user: any) => {
  router.push({
    name: `${PREFIX_ROUTE_NAME}-edit`,
    params: {
      id: user.id
    }
  });
};

// Delete Process
const deleteUser = async (id: string) => {
  try {
    showLoading();

    const response = await deactivateUser(id);
    const { success } = response?.data || {};
    if (success) {
      showToast({
        type: 'success',
        title: 'Success',
        message: 'User has been deactivated.'
      });
      fetchUser();
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

const onDeleteUser = (user: any) => {
  showConfirm({
    header: 'Deactivate User',
    message: 'Are you sure you want to deactivate this user?',
    rejectLabel: 'Cancel',
    acceptLabel: 'Deactivate',
    type: 'warn',
    accept: () => {
      deleteUser(user.id);
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
  fetchUser();
});
</script>

<style scoped>
</style>
