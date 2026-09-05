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
        label="Add Category"
        class="w-full md:w-[192px]"
        :disabled="!isCanCreate"
        @click="addCategory"
      />
    </div>

    <UiLoading
      v-if="loading"
      message="Loading categories..."
    />

    <div
      v-else-if="categories.length === 0"
      class="flex flex-col items-center justify-center py-16 text-gray-400"
    >
      <i class="pi pi-inbox mb-3 text-4xl" />
      <p class="text-sm">Categories are empty.</p>
    </div>

    <div
      v-else
      class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
    >
      <UiCard
        v-for="(category, index) in categories"
        :key="category.id"
        class="relative overflow-hidden flex flex-col justify-between"
      >
        <div class="space-y-3">
          <div class="flex items-start justify-between gap-2">
            <div class="min-w-0 flex-1">
              <p class="truncate text-base font-semibold text-slate-900 dark:text-slate-50">
                {{ category.name }}
              </p>
              <p class="mt-0.5 text-xs text-slate-400">
                #{{ getNoTable(index, pagination.page, pagination.rows) }}
              </p>
            </div>
            <div class="shrink-0">
              <Tag
                :value="category.is_active ? 'Active' : 'Inactive'"
                :severity="category.is_active ? 'success' : 'danger'"
                class="capitalize text-xs!"
              />
            </div>
          </div>

          <Divider class="my-0!" />

          <div class="space-y-2 text-xs">
            <div>
              <span class="text-slate-400 block mb-0.5">Description</span>
              <p class="text-slate-700 dark:text-slate-300 line-clamp-2">
                {{ category.description || '-' }}
              </p>
            </div>

            <div class="flex items-center justify-between">
              <span class="text-slate-400">Created At</span>
              <span class="text-slate-700 dark:text-slate-300">
                {{ formatDateTime(category.created_at) }}
              </span>
            </div>
          </div>
        </div>

        <div>
          <Divider class="my-3!" />

          <div class="flex items-center justify-end gap-2">
            <Button
              severity="secondary"
              variant="outlined"
              icon="pi pi-eye"
              size="small"
              @click="onDetailCategory(category)"
            />
            <Button
              severity="secondary"
              variant="outlined"
              icon="pi pi-pencil"
              size="small"
              :disabled="!isCanUpdate"
              @click="onEditCategory(category)"
            />
            <Button
              severity="secondary"
              variant="outlined"
              icon="pi pi-trash"
              size="small"
              :disabled="!isCanDelete"
              @click="onDeleteCategory(category)"
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
import { onMounted, onUnmounted, ref, computed } from 'vue';
import { useRouter } from 'vue-router';
import { getNoTable, getErrorMessage, formatDateTime } from '@/helpers/utils.ts';
import { getListCategories, deleteCategories } from '@/modules/product-categories/services/api';
import { showToast, showConfirm } from '@/helpers/toast.ts';
import { showLoading, hideLoading } from '@/helpers/loading.ts';
import { isHasPermission } from '@/helpers/auth.ts';
import UiCard from '@/components/UiCard.vue';
import UiSearch from '@/components/UiSearch.vue';
import UiPagination from '@/components/UiPagination.vue';
import UiLoading from '@/components/UiLoading.vue';
import { PREFIX_ROUTE_NAME } from '@/modules/product-categories/services/constants';
import { CREATE, UPDATE, DELETE } from '@/modules/product-categories/services/rbac';

const router = useRouter();

// RBAC
const isCanCreate = computed(() => isHasPermission(CREATE));
const isCanUpdate = computed(() => isHasPermission(UPDATE));
const isCanDelete = computed(() => isHasPermission(DELETE));

// Fetch Data
const loading = ref(false);
const categories = ref<any[]>([]);
const pagination = ref({
  page: 1,
  pageCount: 0,
  rows: 10,
  totalRecords: 0,
});

const fetchCategory = async () => {
  try {
    loading.value = true;

    const payload = {
      page: pagination.value.page,
      limit: pagination.value.rows,
      ...(form.value.search && { search: form.value.search }),
    }
    const response = await getListCategories(payload);
    const { data, meta } = response?.data?.data || {};

    categories.value = data || [];
    pagination.value.totalRecords = meta?.total;
    pagination.value.pageCount = meta?.totalPages;
  } catch (error) {
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
  fetchCategory();
};

// Actions
const addCategory = () => {
  router.push({ name: `${PREFIX_ROUTE_NAME}-create` });
}

const onDetailCategory = (product: any) => {
  router.push({
    name: `${PREFIX_ROUTE_NAME}-detail`,
    params: {
      id: product.id,
    },
  });
};

const onEditCategory = (product: any) => {
  router.push({
    name: `${PREFIX_ROUTE_NAME}-edit`,
    params: {
      id: product.id,
    },
  });
};

// Delete Process
const removeProduct = async (id: string) => {
  try {
    showLoading();

    const response = await deleteCategories(id);
    const { success } = response?.data || {};
    if (success) {
      showToast({
        type: 'success',
        title: 'Success',
        message: 'Category has been deleted.'
      });
      fetchCategory();
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

const onDeleteCategory = (product: any) => {
  showConfirm({
    header: 'Delete Category',
    message: 'Are you sure you want to delete this category?',
    rejectLabel: 'Cancel',
    acceptLabel: 'Delete',
    type: 'warn',
    accept: () => {
      removeProduct(product?.id);
    },
  });
};

// Search
const form = ref({
  search: '',
});

let searchDebounceTimer: ReturnType<typeof setTimeout>;
const search = () => {
  clearTimeout(searchDebounceTimer);
  searchDebounceTimer = setTimeout(() => {
    pagination.value.page = 1;
    fetchCategory();
  }, 300);
};

onMounted(() => {
  fetchCategory();
});

onUnmounted(() => {
  clearTimeout(searchDebounceTimer);
});
</script>

<style scoped></style>
