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
      <div>
        <h1 class="text-xl font-semibold">
          Tambah Produk
        </h1>
        <p class="text-sm text-gray-400">
          Isi nama dan harga dulu, sisanya bisa dilengkapi nanti.
        </p>
      </div>
    </div>

    <ProductForm
      mode="create"
      :initial-values="initialValues"
      :categories="listOfCategories"
      :loading-categories="loadingCategory"
      :outlet-name="getOutlet()?.name"
      :submitting="submitting"
      @submit="onSubmit"
      @cancel="onCancel"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { getErrorMessage } from '@umkm-pos/ui/helpers/utils';
import { showToast } from '@umkm-pos/ui/helpers/toast';
import { getOutlet } from '@/helpers/auth.ts';
import { postProduct, setProductImage } from '@/modules/product-lists/services/api';
import { getActiveCategories } from '@/modules/product-categories/services/api';
import ProductForm, {
  type ProductFormSubmit,
  type ProductFormValues,
} from '@/modules/product-lists/components/ProductForm.vue';

const router = useRouter();

const initialValues: ProductFormValues = {
  name: '',
  category_id: null,
  price: null,
  cost: null,
  stock_qty: 0,
  min_stock: 0,
  is_active: true,
};

const submitting = ref(false);

const onSubmit = async ({ values, slug, optionGroups, uploadId, imagePreview }: ProductFormSubmit) => {
  if (submitting.value) return;
  try {
    submitting.value = true;
    const response = await postProduct({
      outlet_id: getOutlet()?.id,
      slug,
      name: values.name,
      category_id: values.category_id,
      thumbnail: imagePreview || '',
      price: values.price,
      cost: values.cost,
      stock_qty: values.stock_qty,
      min_stock: values.min_stock,
      is_active: values.is_active,
      option_groups: optionGroups,
    });
    const { success, data } = response?.data || {};

    if (success && uploadId) {
      await setProductImage(data?.id, uploadId);
    }
    if (success) {
      showToast({ type: 'success', title: 'Produk ditambahkan', message: `${values.name} siap dijual.` });
      router.back();
    }
  } catch (error: any) {
    showToast({
      type: 'error',
      title: 'Gagal menambahkan produk',
      message:
        error?.response?.status === 409
          ? 'Sudah ada produk dengan nama serupa. Ubah namanya sedikit.'
          : getErrorMessage(error) || 'Terjadi kesalahan.',
    });
  } finally {
    submitting.value = false;
  }
};

const onCancel = () => {
  router.back();
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

onMounted(fetchCategories);
</script>
