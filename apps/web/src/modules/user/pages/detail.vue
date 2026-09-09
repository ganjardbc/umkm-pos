<template>
  <div class="w-full space-y-4">
    <div class="flex items-center gap-4">
      <Button
        severity="secondary"
        icon="pi pi-arrow-left"
        size="small"
        @click="onBack"
      />
      <h1 class="text-lg font-semibold">
        Detail Pengguna
      </h1>
    </div>

    <!-- User Information -->
    <UiCard v-if="userDetail">
      <template #header>
        <div class="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <h2 class="text-lg font-semibold">
            Informasi Pengguna
          </h2>
          <Button
            v-if="isCanUpdate"
            icon="pi pi-pencil"
            label="Edit Pengguna"
            size="small"
            @click="onEdit"
          />
        </div>
      </template>

      <div class="space-y-4">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label class="text-sm font-medium text-gray-500">Username</label>
            <p class="text-base mt-1">{{ userDetail?.username }}</p>
          </div>
          <div>
            <label class="text-sm font-medium text-gray-500">Nama</label>
            <p class="text-base mt-1">{{ userDetail?.name }}</p>
          </div>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label class="text-sm font-medium text-gray-500">Email</label>
            <p class="text-base mt-1">{{ userDetail?.email }}</p>
          </div>
          <div>
            <label class="text-sm font-medium text-gray-500">Status</label>
            <p class="text-base mt-1">
              <Tag :severity="userDetail?.is_active ? 'success' : 'danger'" :value="userDetail?.is_active ? 'Aktif' : 'Tidak Aktif'" />
            </p>
          </div>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label class="text-sm font-medium text-gray-500">Merchant</label>
            <p class="text-base mt-1">{{ userDetail?.merchants?.name }}</p>
          </div>
          <div>
            <div v-if="userDetail?.avatar" class="flex gap-2 items-center">
              <label class="text-sm font-medium text-gray-500">Avatar</label>
              <div class="mt-2">
                <img :src="userDetail?.avatar" alt="User Avatar" class="w-20 h-20 rounded-full object-cover" />
              </div>
            </div>
          </div>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label class="text-sm font-medium text-gray-500">Dibuat Pada</label>
            <p class="text-base mt-1">{{ formatDateTime(userDetail?.created_at) }}</p>
          </div>
          <div>
            <label class="text-sm font-medium text-gray-500">Diperbarui Pada</label>
            <p class="text-base mt-1">{{ formatDateTime(userDetail?.updated_at) }}</p>
          </div>
        </div>
      </div>
    </UiCard>

    <!-- Your Jobs -->
    <UiCard class="p-0! gap-0! overflow-hidden!">
      <template #header>
        <div class="flex flex-col md:flex-row md:items-center justify-between gap-4 pt-4 px-4">
          <h2 class="text-lg font-semibold">
            Informasi Outlet
          </h2>
          <Button
            v-if="isCanUpdate"
            icon="pi pi-plus"
            label="Tetapkan Outlet"
            size="small"
            :disabled="!userDetail?.is_active"
            @click="onAssignOutlet"
          />
        </div>
      </template>

      <div class="p-4">
        <div v-if="loadingUserRoles" class="flex justify-center py-8">
          <i class="pi pi-spin pi-spinner text-2xl text-gray-400"></i>
        </div>
        <div v-else-if="!userRoles.length" class="w-full text-center flex justify-center py-8 text-gray-500">
          Belum ada outlet yang ditugaskan.
        </div>
        <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <UiCard
            v-for="(role, index) in userRoles"
            :key="index"
            class="rounded-xl border border-gray-200 dark:border-dark! dark:bg-dark! p-3 flex flex-col gap-2"
          >
            <div class="flex items-center justify-between">
              <h3 class="font-semibold text-base">{{ role.outlets.name }}</h3>
              <Tag :value="role.roles.name" />
            </div>
            <div class="flex items-center justify-between text-sm text-gray-500">
              <span>Hak Akses</span>
              <span>{{ role.roles.role_permissions.length || '0' }}</span>
            </div>
            <Button
              v-if="isCanUpdate"
              severity="secondary"
              variant="outlined"
              label="Cabut"
              icon="pi pi-times"
              size="small"
              fluid
              :disabled="!userDetail?.is_active"
              @click="onCheckRole(role)"
            />
          </UiCard>
        </div>
      </div>
    </UiCard>
  </div>
  <AssignOutletModal
    v-model:visibility="showAssignOutletModal"
    @cancel="cancelAssignOutletModal"
    @submit="submitAssignOutletModal"
  />
</template>
<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { getErrorMessage, formatDateTime } from '@/helpers/utils.ts';
import { showToast, showConfirm } from '@/helpers/toast.ts';
import { showLoading, hideLoading } from '@/helpers/loading.ts';
import { isHasPermission } from '@/helpers/auth.ts';
import { getDetailUser, getUserRole, assignRoleToUser, revokeRoleFromUser } from '@/modules/user/services/api.ts';
import { PREFIX_ROUTE_NAME } from '@/modules/user/services/constants.ts';
import { UPDATE } from '@/modules/user/services/rbac.ts';
import UiCard from '@/components/UiCard.vue';
import AssignOutletModal from '@/modules/user/components/AssignOutletModal.vue';

const route = useRoute();
const router = useRouter();
const userID = computed(() => route.params.id as string);

// RBAC
const isCanUpdate = computed(() => isHasPermission(UPDATE));

// Fetch Detail
const userDetail = ref<any>(null);

const fetchDetail = async () => {
  try {
    const response = await getDetailUser(userID.value);
    const { data } = response?.data || {};

    userDetail.value = data || null;
  } catch (error) {
    showToast({
      type: 'error',
      title: 'Gagal memuat data.',
      message: getErrorMessage(error) || 'Terjadi kesalahan.',
    });
  }
};

// Fetch User Role
const userRoles = ref<any[]>([]);
const loadingUserRoles = ref(false);

const fetchUserRole = async () => {
  try {
    loadingUserRoles.value = true;
    const response = await getUserRole(userID.value);
    const { data } = response?.data || {};

    userRoles.value = data || [];
  } catch (error) {
    showToast({
      type: 'error',
      title: 'Gagal memuat data.',
      message: getErrorMessage(error) || 'Terjadi kesalahan.',
    });
  } finally {
    loadingUserRoles.value = false;
  }
};

// Assign Outlet
const showAssignOutletModal = ref(false);

const onAssignOutlet = () => {
  showAssignOutletModal.value = !showAssignOutletModal.value;
};

// Assign Roles from User
const assignRole = async (userId: string, roleId: string, outletId: string) => {
  try {
    showLoading();
    const payload = {
      role_id: roleId,
      user_id: userId,
      outlet_id: outletId,
    };
    const response = await assignRoleToUser(payload);

    showAssignOutletModal.value = false;

    fetchUserRole();
    showToast({
      type: 'success',
      title: 'Berhasil.',
      message: response?.data?.message || 'Role berhasil ditetapkan.',
    });
  } catch (error) {
    showToast({
      type: 'error',
      title: 'Gagal menetapkan role.',
      message: getErrorMessage(error) || 'Terjadi kesalahan.',
    });
  } finally {
    hideLoading();
  }
};

const cancelAssignOutletModal = () => {
  showAssignOutletModal.value = false;
}

const submitAssignOutletModal = (payload: any) => {
  assignRole(
    userID.value,
    payload?.role?.id,
    payload?.outlet?.id
  );
};

// Revoke Roles from User
const revokeRole = async (userId: string, roleId: string, outletId: string) => {
  try {
    showLoading();
    const payload = {
      user_id: userId,
      role_id: roleId,
      outlet_id: outletId,
    };
    const response = await revokeRoleFromUser(payload);

    fetchUserRole();
    showToast({
      type: 'success',
      title: 'Berhasil.',
      message: response?.data?.message || 'Role berhasil dicabut.',
    });
  } catch (error) {
    showToast({
      type: 'error',
      title: 'Gagal mencabut role.',
      message: getErrorMessage(error) || 'Terjadi kesalahan.',
    });
  } finally {
    hideLoading();
  }
};

const onCheckRole = (role: any) => {
  showConfirm({
    header: 'Cabut Role',
    message: 'Tindakan ini akan mencabut role pengguna dari outlet ini.',
    rejectLabel: 'Batal',
    acceptLabel: 'Cabut',
    type: 'danger',
    accept: () => {
      revokeRole(
        role?.user_id,
        role?.role_id,
        role?.outlet_id
      );
    },
  });
};

// Methods
const onBack = () => {
  router.back();
};

const onEdit = () => {
  router.push({
    name: `${PREFIX_ROUTE_NAME}-edit`,
    params: {
      id: userID.value,
    }
  });
};

onMounted(() => {
  fetchDetail();
  fetchUserRole();
  // fetchRole();
  // fetchOutlet();
});
</script>
