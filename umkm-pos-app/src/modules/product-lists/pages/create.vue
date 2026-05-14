<template>
  <UiCard class="max-w-2xl mx-auto">
    <template #header>
      <h1 class="text-xl font-semibold">
        Add Product
      </h1>
    </template>

    <Form
      v-slot="$form"
      :resolver="resolver"
      :initialValues="initialValues"
      class="flex flex-col gap-4 w-full"
      @submit="onFormSubmit"
    >
      <div class="w-full space-y-4">
        <UiFormGroup label="Name" variant="vertical">
          <InputText
            name="name"
            type="text"
            placeholder=""
            fluid
            @update:modelValue="(value: any) => onNameChange(value, $form)"
          />
          <Message
            v-if="$form.name?.invalid"
            severity="error"
            size="small"
            variant="simple"
          >
            {{ $form.name.error?.message }}
          </Message>
        </UiFormGroup>
        <UiFormGroup label="Slug" variant="vertical">
          <InputText
            name="slug"
            type="text"
            placeholder=""
            fluid
            readonly
            disabled
          />
          <Message
            v-if="$form.slug?.invalid"
            severity="error"
            size="small"
            variant="simple"
          >
            {{ $form.slug.error?.message }}
          </Message>
        </UiFormGroup>
        <UiFormGroup label="Category" variant="vertical">
          <Dropdown
            :options="listOfCategories"
            name="category_id"
            option-label="name"
            option-value="id"
            placeholder="Choose a user"
            class="w-full"
            :loading="loadingCategory"
          />
          <Message
            v-if="$form.category_id?.invalid"
            severity="error"
            size="small"
            variant="simple"
          >
            {{ $form.category_id.error?.message }}
          </Message>
        </UiFormGroup>
        <UiFormGroup label="Price" variant="vertical">
          <InputNumber
            name="price"
            placeholder=""
            fluid
            :min="0"
            mode="currency"
            currency="IDR"
            locale="id-ID"
          />
          <Message
            v-if="$form.price?.invalid"
            severity="error"
            size="small"
            variant="simple"
          >
            {{ $form.price.error?.message }}
          </Message>
        </UiFormGroup>
        <UiFormGroup label="Cost" variant="vertical">
          <InputNumber
            name="cost"
            placeholder=""
            fluid
            :min="0"
            mode="currency"
            currency="IDR"
            locale="id-ID"
          />
          <Message
            v-if="$form.cost?.invalid"
            severity="error"
            size="small"
            variant="simple"
          >
            {{ $form.cost.error?.message }}
          </Message>
        </UiFormGroup>
        <UiFormGroup label="Stock Quantity" variant="vertical">
          <InputNumber
            name="stock_qty"
            placeholder=""
            fluid
            :min="0"
          />
          <Message
            v-if="$form.stock_qty?.invalid"
            severity="error"
            size="small"
            variant="simple"
          >
            {{ $form.stock_qty.error?.message }}
          </Message>
        </UiFormGroup>
        <UiFormGroup label="Minimum Stock" variant="vertical">
          <InputNumber
            name="min_stock"
            placeholder=""
            fluid
            :min="0"
          />
          <Message
            v-if="$form.min_stock?.invalid"
            severity="error"
            size="small"
            variant="simple"
          >
            {{ $form.min_stock.error?.message }}
          </Message>
        </UiFormGroup>
        <UiFormGroup label="Active Status" variant="vertical">
          <Checkbox
            name="is_active"
            binary
          />
          <Message
            v-if="$form.is_active?.invalid"
            severity="error"
            size="small"
            variant="simple"
          >
            {{ $form.is_active.error?.message }}
          </Message>
        </UiFormGroup>
        <UiFormGroup label="Product Image" variant="vertical">
          <div class="flex items-start gap-4">
            <div
              v-if="imagePreview"
              class="w-28 h-28 rounded-lg overflow-hidden border border-gray-200 flex-shrink-0"
            >
              <img
                :src="imagePreview"
                alt="Preview"
                class="w-full h-full object-cover"
              />
            </div>
            <div
              v-else
              class="w-28 h-28 rounded-lg border-2 border-dashed border-gray-300 flex items-center justify-center flex-shrink-0"
            >
              <i class="pi pi-image text-3xl text-gray-400" />
            </div>
            <div class="flex flex-col gap-2">
              <FileUpload
                mode="basic"
                accept="image/*"
                :chooseLabel="imagePreview ? 'Change Image' : 'Choose Image'"
                customUpload
                @select="onUploadImage"
              />
              <Button
                v-if="imagePreview"
                severity="danger"
                variant="outlined"
                size="small"
                label="Remove"
                icon="pi pi-trash"
                @click="onRemoveImage"
              />
              <p class="text-xs text-gray-400">
                Allowed: JPG, PNG, WebP. Max 5MB.
              </p>
            </div>
          </div>
        </UiFormGroup>
      </div>

      <div class="w-full flex justify-end gap-4">
        <Button
          severity="secondary"
          label="Cancel"
          size="medium"
          class="w-full md:w-[128px]"
          @click="onCancel"
        />
        <Button
          type="submit"
          label="Save"
          size="medium"
          class="w-full md:w-[128px]"
        />
      </div>
    </Form>
  </UiCard>
</template>
<script setup lang="ts">
import type { FormCreate } from '@/modules/product-lists/services/types';
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { z } from 'zod';
import { zodResolver } from '@primevue/forms/resolvers/zod';
import { getErrorMessage } from '@/helpers/utils.ts';
import { showToast } from '@/helpers/toast.ts';
import { showLoading, hideLoading } from '@/helpers/loading.ts';
import { postProduct, postUpload, setProductImage } from '@/modules/product-lists/services/api';
import { getActiveCategories } from '@/modules/product-categories/services/api';
import UiCard from '@/components/UiCard.vue';
import UiFormGroup from '@/components/UiFormGroup.vue';

const router = useRouter();

const initialValues = ref<FormCreate>({
  slug: '',
  name: '',
  category_id: null as any,
  thumbnail: '',
  upload_id: null as any,
  price: 0,
  cost: 0,
  stock_qty: 0,
  min_stock: 0,
  is_active: true
});

const imagePreview = ref<string | null>(null);
const selectedUploadId = ref<string | null>(null);

const resolver = ref(zodResolver(
  z.object({
    slug: z.string().min(1, { message: 'Slug is required.' }),
    name: z.string().min(1, { message: 'Name is required.' }),
    category_id: z.string().nullable().optional(),
    price: z.number().min(0, { message: 'Price must be at least 0.' }),
    cost: z.number().min(0, { message: 'Cost must be at least 0.' }),
    stock_qty: z.number().min(0, { message: 'Stock quantity must be at least 0.' }),
    min_stock: z.number().min(0, { message: 'Minimum stock must be at least 0.' }),
    is_active: z.boolean()
  })
));

const onFormSubmit = async ({ valid, values }: any) => {
  if (valid) {
    try {
      showLoading();

      const payload = {
        slug: values?.slug,
        name: values?.name,
        category_id: values?.category_id,
        thumbnail: imagePreview.value || '',
        price: values?.price,
        cost: values?.cost,
        stock_qty: values?.stock_qty,
        min_stock: values?.min_stock,
        is_active: values?.is_active,
      };
      const response = await postProduct(payload);
      const { success, data } = response?.data || {};

      if (success && selectedUploadId.value) {
        await setProductImage(data?.id, selectedUploadId.value);
      }

      if (success) {
        router.back();
      }
    } catch (error) {
      showToast({
        type: 'error',
        title: 'Create Product Failed.',
        message: getErrorMessage(error) || 'There was an error.',
      });
    } finally {
      hideLoading();
    }
  }
};

const onUploadImage = async (event: any) => {
  const file = event.files?.[0];
  if (!file) return;

  try {
    showLoading();
    const response = await postUpload(file);
    const { success, data } = response?.data || {};

    if (success) {
      selectedUploadId.value = data?.id;
      imagePreview.value = data?.url;
    }
  } catch (error) {
    showToast({
      type: 'error',
      title: 'Upload Failed.',
      message: getErrorMessage(error) || 'There was an error.',
    });
  } finally {
    hideLoading();
  }
};

const onRemoveImage = () => {
  imagePreview.value = null;
  selectedUploadId.value = null;
};

const onNameChange = (name: string, form: any) => {
  const slug = name
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
  
  form.slug.value = slug;
};

const onCancel = () => {
  router.back();
};

// Fetch Categories
const listOfCategories = ref<any[]>([]);
const loadingCategory = ref<boolean>(false);
const pagination = ref({
  page: 1,
});

const fetchCategories = async () => {
  try {
    loadingCategory.value = true;

    const payload = {
      page: pagination.value.page,
    }
    const response = await getActiveCategories(payload);
    const { data } = response?.data || {};

    listOfCategories.value = data;
  } catch (err) {
    console.warn('fetch categories', err);
  } finally {
    loadingCategory.value = false;
  }
};

onMounted(() => {
  fetchCategories();
});
</script>