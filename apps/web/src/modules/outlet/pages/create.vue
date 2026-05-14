<template>
  <UiCard class="max-w-2xl mx-auto">
    <template #header>
      <h1 class="text-xl font-semibold">
        Add Outlet
      </h1>
    </template>

    <Form
      v-slot="$form"
      :resolver="resolver"
      :initialValues="initialValues"
      @submit="onFormSubmit"
      class="flex flex-col gap-4 w-full"
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
        <UiFormGroup label="Location" variant="vertical">
          <Textarea
            name="location"
            placeholder=""
            fluid
          />
          <Message
            v-if="$form.location?.invalid"
            severity="error"
            size="small"
            variant="simple"
          >
            {{ $form.location.error?.message }}
          </Message>
        </UiFormGroup>
        <UiFileUpload
          :previewUrl="imagePreview"
          @select="onUploadImage"
          @remove="onRemoveImage"
        />
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
<script setup lang="ts">
import type { FormCreate } from '@/modules/outlet/services/types.ts';
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { z } from 'zod';
import { zodResolver } from '@primevue/forms/resolvers/zod';
import { getErrorMessage } from '@/helpers/utils.ts';
import { showToast } from '@/helpers/toast.ts';
import { showLoading, hideLoading } from '@/helpers/loading.ts';
import { postOutlet } from '@/modules/outlet/services/api.ts';
import { setOutletImage } from '@/services/uploads';
import { useFileUpload } from '@/composables/useFileUpload';
import UiCard from '@/components/UiCard.vue';
import UiFormGroup from '@/components/UiFormGroup.vue';

const router = useRouter();

const {
  selectedUploadId,
  imagePreview,
  onUploadImage,
  onRemoveImage,
} = useFileUpload();

const initialValues = ref<FormCreate>({
  slug: '',
  name: '',
  location: '',
  logo: '',
  is_active: true
});

const resolver = ref(zodResolver(
  z.object({
    slug: z.string().min(1, { message: 'Slug is required.' }),
    name: z.string().min(1, { message: 'Name is required.' }),
    location: z.string().min(1, { message: 'Location is required.' }),
    is_active: z.boolean()
  })
));

const onFormSubmit = async ({ valid, values }: { valid: boolean; values: FormCreate }) => {
  if (valid) {
    try {
      showLoading();

      const payload = {
        slug: values?.slug,
        name: values?.name,
        location: values?.location,
        logo: values?.logo,
        is_active: values?.is_active,
      };
      const response = await postOutlet(payload);
      const { success, data } = response?.data || {};

      if (success) {
        if (selectedUploadId.value) {
          await setOutletImage(data?.id, selectedUploadId.value);
        }
        router.back();
      }
    } catch (error) {
      showToast({
        type: 'error',
        title: 'Create Outlet Failed.',
        message: getErrorMessage(error) || 'There was an error.',
      });
    } finally {
      hideLoading();
    }
  }
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
}
</script>
