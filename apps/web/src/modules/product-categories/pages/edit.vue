<template>
  <UiCard class="max-w-2xl mx-auto">
    <template #header>
      <h1 class="text-xl font-semibold">
        Edit Category
      </h1>
    </template>

    <Form
      v-if="isLoaded"
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
        <UiFormGroup label="Description" variant="vertical">
          <Textarea
            name="description"
            placeholder=""
            fluid
          />
          <Message
            v-if="$form.description?.invalid"
            severity="error"
            size="small"
            variant="simple"
          >
            {{ $form.description.error?.message }}
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
<script lang="ts" setup>
import type { FormCreate } from '@/modules/product-categories/services/types';
import { ref, computed, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { z } from 'zod';
import { zodResolver } from '@primevue/forms/resolvers/zod';
import { getErrorMessage } from '@/helpers/utils.ts';
import { showToast } from '@/helpers/toast.ts';
import { showLoading, hideLoading } from '@/helpers/loading.ts';
import { putCategories, getDetailCategories } from '@/modules/product-categories/services/api';
import UiCard from '@/components/UiCard.vue';
import UiFormGroup from '@/components/UiFormGroup.vue';

const route = useRoute();
const router = useRouter();
const categoryID = computed(() => route.params.id as string);

const isLoaded = ref(false);
const initialValues = ref<FormCreate>({
  name: '',
  description: '',
  is_active: true
});

const resolver = ref(zodResolver(
  z.object({
    name: z.string().min(1, 'Name is required'),
    description: z.string(),
    is_active: z.boolean()
  })
));

// Submit Edit
const onFormSubmit = async ({ valid, values }: any) => {
  console.log('onFormSubmit', valid, values);
  if (valid) {
    try {
      showLoading();

      const payload = {
        name: values?.name,
        description: values?.description,
        is_active: values?.is_active,
      };
      const response = await putCategories(categoryID.value, payload);
      const { success } = response?.data || {};

      if (success) {
        router.back();
      }
    } catch (error) {
      showToast({
        type: 'error',
        title: 'Create Category Failed.',
        message: getErrorMessage(error) || 'There was an error.',
      });
    } finally {
      hideLoading();
    }
  }
};

const onCancel = () => {
  router.back();
};

// Fetch Detail
const fetchDetail = async () => {
  try {
    const response = await getDetailCategories(categoryID.value);
    const { data } = response?.data || {};
    const { name, description, is_active } = data || {};

    initialValues.value = {
      name,
      description,
      is_active
    };
    
    isLoaded.value = true;
  } catch (error) {
    showToast({
      type: 'error',
      title: 'Failed to fetch data.',
      message: getErrorMessage(error) || 'There was an error.',
    });
  }
};

onMounted(() => {
  fetchDetail();
});
</script>
