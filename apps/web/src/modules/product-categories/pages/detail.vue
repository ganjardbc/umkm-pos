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
        Category Detail
      </h1>
    </div>

    <UiCard v-if="categoryDetail">
      <template #header>  
        <div class="w-full flex gap-4 items-center justify-between">
          <h1 class="text-lg font-semibold">
            Category Information
          </h1>
          <Button
            icon="pi pi-pencil"
            label="Edit Category"
            size="small"
            :disabled="!isCanUpdate"
            @click="onEdit"
          />
        </div>
      </template>

      <div class="space-y-4">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label class="text-sm font-medium text-gray-500">Name</label>
            <p class="text-base mt-1">{{ categoryDetail?.name || '-' }}</p>
          </div>
          <div>
            <label class="text-sm font-medium text-gray-500">Description</label>
            <p class="text-base mt-1">{{ categoryDetail?.description || '-' }}</p>
          </div>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label class="text-sm font-medium text-gray-500">Status</label>
            <div class="mt-1">
              <Tag
                :value="categoryDetail?.is_active ? 'Active' : 'Inactive'"
                :severity="categoryDetail?.is_active ? 'success' : 'danger'"
                class="capitalize"
              />
            </div>
          </div>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label class="text-sm font-medium text-gray-500">Created At</label>
            <p class="text-base mt-1">{{ formatDateTime(categoryDetail?.created_at) }}</p>
          </div>
          <div>
            <label class="text-sm font-medium text-gray-500">Updated At</label>
            <p class="text-base mt-1">{{ formatDateTime(categoryDetail?.updated_at) }}</p>
          </div>
        </div>
      </div>
    </UiCard>
  </div>
</template>
<script lang="ts" setup>
import { ref, onMounted, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { getErrorMessage, formatDateTime } from '@/helpers/utils.ts';
import { showToast } from '@/helpers/toast.ts';
import { isHasPermission } from '@/helpers/auth.ts';
import { getDetailCategories } from '@/modules/product-categories/services/api';
import { PREFIX_ROUTE_NAME } from '@/modules/product-categories/services/constants';
import { UPDATE } from '@/modules/product-categories/services/rbac';
import UiCard from '@/components/UiCard.vue';

const route = useRoute();
const router = useRouter();
const categoryID = computed(() => route.params.id as string);

// RBAC
const isCanUpdate = computed(() => isHasPermission(UPDATE));

// Fetch Detail
const categoryDetail = ref<any>(null);

const fetchDetail = async () => {
  try {
    const response = await getDetailCategories(categoryID.value);
    const { data } = response?.data || {};

    categoryDetail.value = data || null;
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
      id: categoryID.value,
    }
  });
};

onMounted(() => {
  fetchDetail();
});
</script>
