<template>
  <div class="max-w-2xl mx-auto space-y-4">
    <!-- Loading State -->
    <UiCard v-if="!merchantDetail">
      <div class="flex justify-center items-center py-8">
        <i class="pi pi-spin pi-spinner text-2xl text-gray-400"></i>
      </div>
    </UiCard>

    <!-- Merchant Information -->
    <UiCard v-if="merchantDetail">
      <div class="space-y-4">
        <div class="flex justify-between items-center gap-4">
          <div class="space-y-2 min-w-0">
            <h1 class="text-xl font-semibold truncate">{{ merchantDetail.name }}</h1>
            <Button
              v-if="isCanUpdate"
              severity="secondary"
              variant="outlined"
              icon="pi pi-pencil"
              size="small"
              label="Edit Merchant"
              @click="onEdit"
            />
          </div>
          <Avatar
            :image="merchantDetail.logo || undefined"
            :label="merchantDetail.logo ? undefined : merchantDetail.name?.charAt(0)"
            size="xlarge"
            shape="circle"
            class="merchant-logo shrink-0"
          />
        </div>

        <Divider />

        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label class="text-sm font-medium text-gray-500">Nama Merchant</label>
            <p class="text-base mt-1">{{ merchantDetail.name }}</p>
          </div>
          <div>
            <label class="text-sm font-medium text-gray-500">Slug</label>
            <p class="text-base mt-1">{{ merchantDetail.slug }}</p>
          </div>
          <div>
            <label class="text-sm font-medium text-gray-500">Nomor Telepon</label>
            <p class="text-base mt-1">{{ merchantDetail.phone || '-' }}</p>
          </div>
          <div>
            <label class="text-sm font-medium text-gray-500">Alamat</label>
            <p class="text-base mt-1">{{ merchantDetail.address || '-' }}</p>
          </div>
          <div>
            <label class="text-sm font-medium text-gray-500">Dibuat Pada</label>
            <p class="text-base mt-1">{{ formatDateTime(merchantDetail.created_at) }}</p>
          </div>
          <div>
            <label class="text-sm font-medium text-gray-500">Diperbarui Pada</label>
            <p class="text-base mt-1">{{ formatDateTime(merchantDetail.updated_at) }}</p>
          </div>
        </div>
      </div>
    </UiCard>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { useRouter } from 'vue-router';
import { getErrorMessage, formatDateTime } from '@/helpers/utils.ts';
import { showToast } from '@/helpers/toast.ts';
import { getMerchant, isHasPermission } from '@/helpers/auth.ts';
import { getDetailMerchants } from '@/modules/merchants/services/api.ts';
import { PREFIX_ROUTE_NAME } from '@/modules/merchants/services/constants.ts';
import { UPDATE } from '@/modules/merchants/services/rbac.ts';
import UiCard from '@/components/UiCard.vue';

const router = useRouter();

// The logged-in user's own merchant; the API rejects any other merchant id.
const merchantID = computed(() => getMerchant()?.id as string);

// RBAC
const isCanUpdate = computed(() => isHasPermission(UPDATE));

// Merchant
const merchantDetail = ref<any>(null);

const fetchDetail = async () => {
  try {
    const response = await getDetailMerchants(merchantID.value);
    const { data } = response?.data || {};

    merchantDetail.value = data || null;
  } catch (error) {
    showToast({
      type: 'error',
      title: 'Gagal memuat merchant.',
      message: getErrorMessage(error) || 'Terjadi kesalahan.',
    });
  }
};

const onEdit = () => {
  router.push({ name: `${PREFIX_ROUTE_NAME}-edit` });
};

onMounted(() => {
  fetchDetail();
});
</script>

<style scoped>
.merchant-logo:deep(img) {
  object-fit: cover;
}
</style>
