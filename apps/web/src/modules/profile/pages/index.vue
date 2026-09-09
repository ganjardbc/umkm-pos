<template>
  <div class="max-w-2xl mx-auto space-y-4">
    <!-- Loading State -->
    <UiCard v-if="!profile">
      <div class="flex justify-center items-center py-8">
        <i class="pi pi-spin pi-spinner text-2xl text-gray-400"></i>
      </div>
    </UiCard>

    <!-- Profile Information -->
    <UiCard v-if="profile">
      <div class="space-y-4">
        <div class="flex justify-between items-center">
          <div class="space-y-2">
            <h1 class="text-xl font-semibold">{{ profile?.name }}</h1>
            <router-link :to="PRP_SETTINGS" class="block">
              <Button
                severity="secondary"
                variant="outlined"
                icon="pi pi-cog"
                size="small"
                label="Pengaturan"
              />
            </router-link>
          </div>
          <OverlayBadge :severity="profile?.is_active ? 'success' : 'danger'">
            <Avatar
              :image="profile?.avatar"
              :label="profile?.avatar ? undefined : profile?.name?.charAt(0)"
              size="xlarge"
              shape="circle"
              class="profile-avatar"
            />
          </OverlayBadge>
        </div>

        <Divider />

        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label class="text-sm font-medium text-gray-500">Nama Pengguna</label>
            <p class="text-base mt-1">{{ profile?.username }}</p>
          </div>
          <div>
            <label class="text-sm font-medium text-gray-500">Nama Lengkap</label>
            <p class="text-base mt-1">{{ profile?.name }}</p>
          </div>
          <div>
            <label class="text-sm font-medium text-gray-500">Email</label>
            <p class="text-base mt-1">{{ profile?.email }}</p>
          </div>
          <div>
            <label class="text-sm font-medium text-gray-500">Merchant</label>
            <p class="text-base mt-1">{{ profile?.merchants?.name }}</p>
          </div>
          <div>
            <label class="text-sm font-medium text-gray-500">Dibuat Pada</label>
            <p class="text-base mt-1">{{ formatDateTime(profile?.created_at) }}</p>
          </div>
          <div>
            <label class="text-sm font-medium text-gray-500">Diperbarui Pada</label>
            <p class="text-base mt-1">{{ formatDateTime(profile?.updated_at) }}</p>
          </div>
        </div>
      </div>
    </UiCard>

    <Divider />

    <Button
      severity="secondary"
      variant="outlined"
      icon="pi pi-power-off"
      size="small"
      label="Keluar"
      fluid
      @click="handleLogout"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { removeAuth } from '@/helpers/auth.ts';
import { PREFIX_ROUTE_PATH as PRP_AUTH } from '@/modules/auth/services/constants.ts';
import { PREFIX_ROUTE_PATH as PRP_SETTINGS } from '@/modules/settings/services/constants.ts';
import { getDetailprofile } from '@/modules/profile/services/api.ts';
import { getErrorMessage, formatDateTime } from '@/helpers/utils.ts';
import { showConfirm, showToast } from '@/helpers/toast.ts';
import UiCard from '@/components/UiCard.vue';

const router = useRouter();

// Profile
const profile = ref<any>(null);

const fetchProfile = async () => {
  try {
    const response = await getDetailprofile();
    const { data } = response?.data || {};

    profile.value = data || null;
  } catch (error) {
    showToast({
      type: 'error',
      title: 'Gagal memuat profil.',
      message: getErrorMessage(error) || 'Terjadi kesalahan.',
    });
  }
};

const handleLogout = () => {
  showConfirm({
    header: 'Keluar dari Akun?',
    rejectLabel: 'Batal',
    acceptLabel: 'Ya, Lanjutkan',
    type: 'warn',
    accept: () => {
      removeAuth();

      showToast({
        type: 'success',
        title: 'Berhasil Keluar',
      });
      router.push(PRP_AUTH);
    }
  });
}

onMounted(() => {
  fetchProfile();
});
</script>

<style scoped>
.profile-avatar:deep(img) {
  object-fit: cover;
}
</style>
