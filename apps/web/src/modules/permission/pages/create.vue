<template>
  <UiCard class="max-w-2xl mx-auto">
    <template #header>
      <h1 class="text-xl font-semibold">
        Add Permission
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
        <UiFormGroup label="Code" variant="vertical">
          <InputText
            name="code"
            type="text"
            placeholder=""
            fluid
          />
          <Message
            v-if="$form.code?.invalid"
            severity="error"
            size="small"
            variant="simple"
          >
            {{ $form.code.error?.message }}
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
import type { Form } from '@/modules/permission/services/types.ts';
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { z } from 'zod';
import { zodResolver } from '@primevue/forms/resolvers/zod';
import { getErrorMessage } from '@/helpers/utils.ts';
import { showToast } from '@/helpers/toast.ts';
import { showLoading, hideLoading } from '@/helpers/loading.ts';
import { postPermission } from '@/modules/permission/services/api.ts';
import UiCard from '@/components/UiCard.vue';
import UiFormGroup from '@/components/UiFormGroup.vue';

const router = useRouter();

const initialValues = ref<Form>({
  code: '',
  description: ''
});

const resolver = ref(zodResolver(
  z.object({
    code: z.string().min(1, { message: 'Code is required.' }),
    description: z.string().min(1, { message: 'Description is required.' })
  })
));

const onFormSubmit = async ({ valid, values }: { valid: boolean; values: Form }) => {
  if (valid) {
    try {
      showLoading();

      const payload = {
        code: values?.code,
        description: values?.description,
      };
      const response = await postPermission(payload);
      const { success } = response?.data || {};

      if (success) {
        router.back();
      }
    } catch (error) {
      showToast({
        type: 'error',
        title: 'Login Failed.',
        message: getErrorMessage(error) || 'There was an error.',
      });
    } finally {
      hideLoading();
    }
  }
};

const onCancel = () => {
  router.back();
}
</script>
