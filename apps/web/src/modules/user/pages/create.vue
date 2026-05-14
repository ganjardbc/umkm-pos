<template>
  <UiCard class="max-w-2xl mx-auto">
    <template #header>
      <h1 class="text-xl font-semibold">
        Add User
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
        <UiFormGroup label="Username" variant="vertical">
          <InputText
            name="username"
            type="text"
            placeholder=""
            fluid
          />
          <Message
            v-if="$form.username?.invalid"
            severity="error"
            size="small"
            variant="simple"
          >
            {{ $form.username.error?.message }}
          </Message>
        </UiFormGroup>

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

        <UiFormGroup label="Email" variant="vertical">
          <InputText
            name="email"
            type="email"
            placeholder=""
            fluid
          />
          <Message
            v-if="$form.email?.invalid"
            severity="error"
            size="small"
            variant="simple"
          >
            {{ $form.email.error?.message }}
          </Message>
        </UiFormGroup>

        <UiFormGroup label="Password" variant="vertical">
          <InputText
            name="password"
            type="password"
            placeholder=""
            fluid
          />
          <Message
            v-if="$form.password?.invalid"
            severity="error"
            size="small"
            variant="simple"
          >
            {{ $form.password.error?.message }}
          </Message>
        </UiFormGroup>

        <UiFileUpload
          :previewUrl="imagePreview"
          @select="onUploadImage"
          @remove="onRemoveImage"
        />

        <UiFormGroup label="Active Status" variant="vertical">
          <div class="flex items-center gap-2">
            <Checkbox
              name="is_active"
              :binary="true"
            />
            <label class="text-sm text-gray-700">User is active</label>
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
import type { FormCreate } from '@/modules/user/services/types.ts';
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { z } from 'zod';
import { zodResolver } from '@primevue/forms/resolvers/zod';
import { getErrorMessage } from '@/helpers/utils.ts';
import { showToast } from '@/helpers/toast.ts';
import { showLoading, hideLoading } from '@/helpers/loading.ts';
import { postUser } from '@/modules/user/services/api.ts';
import { setUserAvatar } from '@/services/uploads';
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

// State Form
const initialValues = ref<FormCreate>({
  username: '',
  name: '',
  email: '',
  password: '',
  avatar: '',
  is_active: true,
});

const resolver = ref(zodResolver(
  z.object({
    username: z.string().min(1, { message: 'Username is required.' }),
    name: z.string().min(1, { message: 'Name is required.' }),
    email: z.string().email({ message: 'Invalid email address.' }),
    password: z.string().min(6, { message: 'Password must be at least 6 characters.' }),
    avatar: z.string().optional(),
    is_active: z.boolean()
  })
));

// Post Create
const onFormSubmit = async ({ valid, values }: { valid: boolean; values: FormCreate }) => {
  if (valid) {
    try {
      showLoading();

      const payload = {
        username: values?.username,
        name: values?.name,
        email: values?.email,
        password: values?.password,
        avatar: values?.avatar || undefined,
        is_active: values?.is_active,
      };
      const response = await postUser(payload);
      const { success, data } = response?.data || {};

      if (success) {
        if (selectedUploadId.value) {
          await setUserAvatar(data?.id, selectedUploadId.value);
        }
        router.back();
      }
    } catch (error) {
      showToast({
        type: 'error',
        title: 'Create User Failed.',
        message: getErrorMessage(error) || 'There was an error.',
      });
    } finally {
      hideLoading();
    }
  }
};

// Methods
const onCancel = () => {
  router.back();
}
</script>
