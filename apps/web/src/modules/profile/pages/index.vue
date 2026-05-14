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
            <Tag 
              :severity="profile?.is_active ? 'success' : 'danger'" 
              :value="profile?.is_active ? 'Active' : 'Inactive'" 
            />
          </div>
          <Avatar
            :image="profile?.avatar"
            :label="profile?.avatar ? undefined : profile?.name?.charAt(0)"
            size="xlarge"
            shape="circle"
            class="profile-avatar"
          />
        </div>

        <Divider />

        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label class="text-sm font-medium text-gray-500">Username</label>
            <p class="text-base mt-1">{{ profile?.username }}</p>
          </div>
          <div>
            <label class="text-sm font-medium text-gray-500">Name</label>
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
            <label class="text-sm font-medium text-gray-500">Created At</label>
            <p class="text-base mt-1">{{ formatDateTime(profile?.created_at) }}</p>
          </div>
          <div>
            <label class="text-sm font-medium text-gray-500">Updated At</label>
            <p class="text-base mt-1">{{ formatDateTime(profile?.updated_at) }}</p>
          </div>
        </div>
      </div>
    </UiCard>

    <Divider v-if="listOfSettingMenus && listOfSettingMenus.length > 0" />

    <div
      v-if="listOfSettingMenus && listOfSettingMenus.length > 0"
      class="space-y-4"
    >
      <UiCard
        v-for="(menu, i) in listOfSettingMenus"
        :key="i"
        class="cursor-pointer shadow-md hover:shadow-lg transition-shadow"
        @click="navigateTo(menu?.route)"
      >
        <div class="flex items-center gap-3">
          <div class="w-10.5 text-center">
            <i
              class="text-xl!"
              :class="[
                menu?.icon,
                menu?.color,
              ]"
            />
          </div>
          <div class="flex-1">
            <h3 class="text-sm font-semibold">
              {{ menu?.label }}
            </h3>
            <p class="text-xs text-gray-500">
              {{ menu?.description }}
            </p>
          </div>
          <i class="pi pi-chevron-right text-xs!" />
        </div>
      </UiCard>
    </div>

    <Divider />

    <Button
      severity="secondary"
      variant="outlined"
      icon="pi pi-power-off"
      size="small"
      label="Logout"
      fluid
      @click="handleLogout"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { useRouter } from 'vue-router';
import { removeAuth } from '@/helpers/auth.ts';
import { PREFIX_ROUTE_PATH as PRP_AUTH } from '@/modules/auth/services/constants.ts';
import { getDetailprofile } from '@/modules/profile/services/api.ts';
import { getErrorMessage, formatDateTime } from '@/helpers/utils.ts';
import { showConfirm, showToast } from '@/helpers/toast.ts';
import { isHasPermission } from '@/helpers/auth.ts';
import UiCard from '@/components/UiCard.vue';
import { LIST_MENU } from '@/modules/settings/services/constants.ts';

const router = useRouter();

// Settings Menut
const listOfSettingMenus = computed(() => {
  return LIST_MENU.filter((item) => isHasPermission(item.permission));
});

const navigateTo = (routeName: string) => {
  router.push({ name: routeName });
};

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
      title: 'Failed to fetch profile.',
      message: getErrorMessage(error) || 'There was an error.',
    });
  }
};

const handleLogout = () => {
  showConfirm({
    header: 'Logout dari Akun ini?',
    rejectLabel: 'Batal',
    acceptLabel: 'Ok, Lanjutkan',
    type: 'warn',
    accept: () => {
      removeAuth();

      showToast({
        type: 'success',
        title: 'Logout Succesfully',
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
