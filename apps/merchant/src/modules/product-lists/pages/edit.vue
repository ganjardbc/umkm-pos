<template>
  <div class="mx-auto w-full max-w-5xl space-y-4">
    <div class="flex items-center gap-3">
      <Button
        icon="pi pi-arrow-left"
        severity="secondary"
        text
        rounded
        aria-label="Kembali"
        @click="onCancel"
      />
      <div class="min-w-0">
        <h1 class="text-xl font-semibold">
          Ubah Produk
        </h1>
        <p
          v-if="initialValues"
          class="truncate text-sm text-gray-400"
        >
          {{ initialValues.name }}
        </p>
      </div>
    </div>

    <UiLoading
      v-if="!isLoaded"
      message="Memuat produk..."
    />

    <ProductForm
      v-else
      mode="edit"
      :initial-values="initialValues!"
      :initial-option-groups="initialOptionGroups"
      :initial-image="initialImage"
      :categories="listOfCategories"
      :loading-categories="loadingCategory"
      :outlet-name="getOutlet()?.name"
      :current-stock="currentStock"
      :submitting="submitting"
      @submit="onSubmit"
      @cancel="onCancel"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { getErrorMessage } from '@umkm-pos/ui/helpers/utils';
import { showToast } from '@umkm-pos/ui/helpers/toast';
import UiLoading from '@umkm-pos/ui/components/UiLoading.vue';
import { putProduct, getDetailProduct, setProductImage, removeProductImage } from '@/modules/product-lists/services/api';
import { toOptionGroupInputs, type OptionGroupInput } from '@/modules/product-lists/helpers/options.ts';
import { getOutlet } from '@/helpers/auth.ts';
import { getActiveCategories } from '@/modules/product-categories/services/api';
import ProductForm, {
  type ProductFormSubmit,
  type ProductFormValues,
} from '@/modules/product-lists/components/ProductForm.vue';

const route = useRoute();
const router = useRouter();
const productID = computed(() => route.params.id as string);

const isLoaded = ref(false);
const submitting = ref(false);
const initialValues = ref<ProductFormValues | null>(null);
const initialOptionGroups = ref<OptionGroupInput[]>([]);
const initialImage = ref<string | null>(null);
const existingUploadId = ref<string | null>(null);
const currentStock = ref(0);

const onSubmit = async ({ values, optionGroups, uploadId, imageCleared }: ProductFormSubmit) => {
  if (submitting.value) return;
  try {
    submitting.value = true;
    const response = await putProduct(productID.value, {
      outlet_id: getOutlet()?.id,
      name: values.name,
      category_id: values.category_id,
      price: values.price,
      cost: values.cost,
      min_stock: values.min_stock,
      is_active: values.is_active,
      // Always sent: the API replaces all groups, so removals must be explicit.
      option_groups: optionGroups,
    });
    const { success } = response?.data || {};

    if (success && uploadId) {
      await setProductImage(productID.value, uploadId);
    } else if (success && imageCleared && existingUploadId.value) {
      await removeProductImage(productID.value);
    }

    if (success) {
      showToast({ type: 'success', title: 'Perubahan disimpan', message: `${values.name} diperbarui.` });
      router.back();
    }
  } catch (error) {
    showToast({
      type: 'error',
      title: 'Gagal memperbarui produk',
      message: getErrorMessage(error) || 'Terjadi kesalahan.',
    });
  } finally {
    submitting.value = false;
  }
};

const onCancel = () => {
  router.back();
};

const fetchDetail = async () => {
  try {
    const response = await getDetailProduct(productID.value, { outlet_id: getOutlet()?.id });
    const data = response?.data?.data || {};

    initialValues.value = {
      name: data.name,
      category_id: data.category_id ?? null,
      price: Number(data.price),
      cost: Number(data.cost),
      min_stock: Number(data.min_stock),
      is_active: data.is_active,
    };
    initialOptionGroups.value = toOptionGroupInputs(data.product_option_groups);
    initialImage.value = data.thumbnail || null;
    existingUploadId.value = data.upload?.id ?? null;
    currentStock.value = Number(data.stock_qty ?? 0);

    isLoaded.value = true;
  } catch (error) {
    showToast({
      type: 'error',
      title: 'Gagal memuat produk',
      message: getErrorMessage(error) || 'Terjadi kesalahan.',
    });
  }
};

// Categories
const listOfCategories = ref<any[]>([]);
const loadingCategory = ref(false);

const fetchCategories = async () => {
  try {
    loadingCategory.value = true;
    const response = await getActiveCategories({ page: 1 });
    listOfCategories.value = response?.data?.data || [];
  } catch (err) {
    console.warn('fetch categories', err);
  } finally {
    loadingCategory.value = false;
  }
};

onMounted(() => {
  fetchDetail();
  fetchCategories();
});
</script>
