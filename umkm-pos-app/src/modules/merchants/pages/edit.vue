<template>
  <UiCard class="max-w-2xl mx-auto">
    <template #header>
      <h1 class="text-xl font-semibold">
        Edit Merchant
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
        <UiFormGroup label="Phone" variant="vertical">
          <InputText
            name="phone"
            type="text"
            placeholder=""
            fluid
          />
          <Message
            v-if="$form.phone?.invalid"
            severity="error"
            size="small"
            variant="simple"
          >
            {{ $form.phone.error?.message }}
          </Message>
        </UiFormGroup>
        <UiFormGroup label="Address" variant="vertical">
          <Textarea
            name="address"
            placeholder=""
            fluid
          />
          <Message
            v-if="$form.address?.invalid"
            severity="error"
            size="small"
            variant="simple"
          >
            {{ $form.address.error?.message }}
          </Message>
        </UiFormGroup>
        <UiFileUpload
          :previewUrl="imagePreview"
          @select="onUploadImage"
          @remove="onRemoveImage"
        />
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
import type { FormEdit } from '@/modules/merchants/services/types.ts';
import { ref, computed, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { z } from 'zod';
import { zodResolver } from '@primevue/forms/resolvers/zod';
import { getErrorMessage } from '@/helpers/utils.ts';
import { showToast } from '@/helpers/toast.ts';
import { showLoading, hideLoading } from '@/helpers/loading.ts';
import { putMerchants, getDetailMerchants } from '@/modules/merchants/services/api.ts';
import { setMerchantImage, removeMerchantImage } from '@/services/uploads';
import { useFileUpload } from '@/composables/useFileUpload';
import UiCard from '@/components/UiCard.vue';
import UiFormGroup from '@/components/UiFormGroup.vue';

const route = useRoute();
const router = useRouter();
const merchantID = computed(() => route.params.id as string);

const isLoaded = ref(false);
const hasExistingLogo = ref(false);

const {
  selectedUploadId,
  imagePreview,
  onUploadImage,
  onRemoveImage,
} = useFileUpload();

const initialValues = ref<FormEdit>({
  name: '',
  phone: '',
  address: ''
});

const resolver = ref(zodResolver(
  z.object({
    name: z.string().min(1, { message: 'Name is required.' }),
    phone: z.string().min(1, { message: 'Phone is required.' }),
    address: z.string().min(1, { message: 'Address is required.' })
  })
));

const onFormSubmit = async ({ valid, values }: { valid: boolean; values: FormEdit }) => {
  if (valid) {
    try {
      showLoading();

      const payload = {
        name: values?.name,
        phone: values?.phone,
        address: values?.address
      };
      const response = await putMerchants(merchantID.value, payload);
      const { success } = response?.data || {};

      if (success) {
        if (selectedUploadId.value) {
          await setMerchantImage(merchantID.value, selectedUploadId.value);
        } else if (hasExistingLogo.value && !imagePreview.value) {
          await removeMerchantImage(merchantID.value);
        }
        router.back();
      }
    } catch (error) {
      showToast({
        type: 'error',
        title: 'Update Merchant Failed.',
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
    const response = await getDetailMerchants(merchantID.value);
    const { data } = response?.data || {};
    const { name, phone, address, logo } = data || {};

    initialValues.value = {
      name,
      phone,
      address
    };

    if (logo) {
      hasExistingLogo.value = true
      imagePreview.value = logo
    }
    
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
