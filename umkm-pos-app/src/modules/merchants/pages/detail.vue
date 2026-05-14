<template>
  <div class="w-full space-y-4">
    <div class="flex gap-4 items-center">
      <Button
        severity="secondary"
        icon="pi pi-arrow-left"
        size="small"
        @click="onBack"
      />
      <h1 class="text-lg font-semibold">
        Merchant Detail
      </h1>
    </div>

    <UiCard v-if="merchantDetail">
      <template #header>  
        <div class="w-full flex gap-4 items-center justify-between">
          <h1 class="text-lg font-semibold">
            Merchant Information
          </h1>
          <Button
            icon="pi pi-pencil"
            label="Edit Merchant"
            size="small"
            :disabled="!isCanUpdate"
            @click="onEdit"
          />
        </div>
      </template>

      <div class="space-y-4">
        <div v-if="merchantDetail.logo" class="flex justify-center md:justify-start">
          <img :src="merchantDetail.logo" alt="Merchant Logo"
               class="w-32 h-32 rounded-lg object-cover border border-gray-200" />
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label class="text-sm font-medium text-gray-500">Name</label>
            <p class="text-base mt-1">{{ merchantDetail.name }}</p>
          </div>
          <div>
            <label class="text-sm font-medium text-gray-500">Slug</label>
            <p class="text-base mt-1">{{ merchantDetail.slug }}</p>
          </div>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label class="text-sm font-medium text-gray-500">Phone</label>
            <p class="text-base mt-1">{{ merchantDetail.phone }}</p>
          </div>
        </div>

        <div>
          <label class="text-sm font-medium text-gray-500">Address</label>
          <p class="text-base mt-1">{{ merchantDetail.address }}</p>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label class="text-sm font-medium text-gray-500">Created At</label>
            <p class="text-base mt-1">{{ formatDateTime(merchantDetail.created_at) }}</p>
          </div>
          <div>
            <label class="text-sm font-medium text-gray-500">Updated At</label>
            <p class="text-base mt-1">{{ formatDateTime(merchantDetail.updated_at) }}</p>
          </div>
        </div>
      </div>
    </UiCard>
  </div>
</template>
<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { getErrorMessage, formatDateTime } from '@/helpers/utils.ts';
import { showToast } from '@/helpers/toast.ts';
import { isHasPermission } from '@/helpers/auth.ts';
import { getDetailMerchants } from '@/modules/merchants/services/api.ts';
import { PREFIX_ROUTE_NAME } from '@/modules/merchants/services/constants.ts';
import { UPDATE } from '@/modules/merchants/services/rbac.ts';
import UiCard from '@/components/UiCard.vue';

const route = useRoute();
const router = useRouter();
const merchantID = computed(() => route.params.id as string);

// RBAC
const isCanUpdate = computed(() => isHasPermission(UPDATE));

// Fetch Detail
const merchantDetail = ref<any>(null);

const fetchDetail = async () => {
  try {
    const response = await getDetailMerchants(merchantID.value);
    const { data } = response?.data || {};

    merchantDetail.value = data || null;
  } catch (error) {
    showToast({
      type: 'error',
      title: 'Failed to fetch data.',
      message: getErrorMessage(error) || 'There was an error.',
    });
  }
};

// Methods
const onBack = () => {
  router.back();
};

const onEdit = () => {
  router.push({
    name: `${PREFIX_ROUTE_NAME}-edit`,
    params: {
      id: merchantID.value,
    }
  });
};

onMounted(() => {
  fetchDetail();
});
</script>
