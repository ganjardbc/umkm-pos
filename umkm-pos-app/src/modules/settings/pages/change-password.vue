<template>
  <UiCard class="max-w-2xl mx-auto">
    <template #header>
      <h1 class="text-xl font-semibold">
        Change Password
      </h1>
    </template>

    <Form
      v-if="isLoaded"
      v-slot="$form"
      :resolver="resolver"
      :initialValues="initialValues"
      @submit="onFormSubmit"
      class="flex flex-col gap-4 w-full"
    >
      <div class="w-full space-y-4">
        <UiFormGroup label="Current Password" variant="vertical">
          <Password
            name="currentPassword"
            placeholder="Enter your current password"
            :feedback="false"
            fluid
          />
          <Message
            v-if="$form.currentPassword?.invalid"
            severity="error"
            size="small"
            variant="simple"
          >
            {{ $form.currentPassword.error?.message }}
          </Message>
        </UiFormGroup>

        <UiFormGroup label="New Password" variant="vertical">
          <Password
            name="newPassword"
            placeholder="Enter your new password"
            :feedback="true"
            fluid
            @input="validatePasswordStrength"
          />
          <Message
            v-if="$form.newPassword?.invalid"
            severity="error"
            size="small"
            variant="simple"
          >
            {{ $form.newPassword.error?.message }}
          </Message>
          <Message
            severity="info"
            size="small"
            variant="simple"
          >
            Password must be at least 8 characters with uppercase, lowercase, and numbers.
          </Message>
        </UiFormGroup>

        <UiFormGroup label="Confirm Password" variant="vertical">
          <Password
            name="confirmPassword"
            placeholder="Confirm your new password"
            :feedback="false"
            fluid
          />
          <Message
            v-if="$form.confirmPassword?.invalid"
            severity="error"
            size="small"
            variant="simple"
          >
            {{ $form.confirmPassword.error?.message }}
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
          label="Update"
          size="medium"
          class="w-full md:w-[128px]"
        />
      </div>
    </Form>
  </UiCard>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { z } from 'zod';
import { zodResolver } from '@primevue/forms/resolvers/zod';
import { isHasPermission } from '@/helpers/auth.ts';
import { getErrorMessage } from '@/helpers/utils.ts';
import { showToast } from '@/helpers/toast.ts';
import { showLoading, hideLoading } from '@/helpers/loading.ts';
import UiCard from '@/components/UiCard.vue';
import UiFormGroup from '@/components/UiFormGroup.vue';
import Password from 'primevue/password';
import Button from 'primevue/button';
import Message from 'primevue/message';
import { Form } from '@primevue/forms';
import { changePassword } from '@/modules/settings/services/api.ts';
import { PASSWORD_UPDATE } from '@/modules/settings/services/rbac.ts';
import type { ChangePasswordDto } from '@/modules/settings/services/types';

const router = useRouter();

// RBAC
const isCanUpdate = computed(() => isHasPermission(PASSWORD_UPDATE));

// Form state
const isLoaded = ref(true);
const initialValues = ref({
  currentPassword: '',
  newPassword: '',
  confirmPassword: '',
});

const passwordErrors = ref({
  newPassword: '',
});

const resolver = ref(zodResolver(
  z.object({
    currentPassword: z.string().min(1, { message: 'Current password is required.' }),
    newPassword: z.string()
      .min(8, { message: 'Password must be at least 8 characters.' })
      .regex(/[A-Z]/, { message: 'Password must contain uppercase letter.' })
      .regex(/[a-z]/, { message: 'Password must contain lowercase letter.' })
      .regex(/\d/, { message: 'Password must contain number.' }),
    confirmPassword: z.string().min(1, { message: 'Confirm password is required.' }),
  }).refine((data) => data.newPassword === data.confirmPassword, {
    message: 'Passwords do not match.',
    path: ['confirmPassword'],
  }).refine((data) => data.currentPassword !== data.newPassword, {
    message: 'New password must be different from current password.',
    path: ['newPassword'],
  })
));

// Password strength validation
const validatePasswordStrength = () => {
  const password = initialValues.value.newPassword;
  const hasUppercase = /[A-Z]/.test(password);
  const hasLowercase = /[a-z]/.test(password);
  const hasNumbers = /\d/.test(password);
  const isLongEnough = password.length >= 8;

  if (!isLongEnough || !hasUppercase || !hasLowercase || !hasNumbers) {
    passwordErrors.value.newPassword = 'Password must be at least 8 characters with uppercase, lowercase, and numbers.';
  } else {
    passwordErrors.value.newPassword = '';
  }
};

// Submit
const onFormSubmit = async ({ valid, values }: { valid: boolean; values: any }) => {
  if (valid) {
    try {
      showLoading();

      const payload: ChangePasswordDto = {
        currentPassword: values.currentPassword,
        newPassword: values.newPassword,
        confirmPassword: values.confirmPassword,
      };

      const response = await changePassword(payload);
      const { success } = response?.data || {};

      if (success) {
        showToast({
          type: 'success',
          title: 'Success',
          message: 'Password changed successfully.',
        });
        router.push({ name: 'settings' });
      }
    } catch (error) {
      showToast({
        type: 'error',
        title: 'Error',
        message: getErrorMessage(error) || 'Failed to change password.',
      });
    } finally {
      hideLoading();
    }
  }
};

// Navigation
const onCancel = () => {
  router.back();
};

onMounted(() => {
  if (!isCanUpdate.value) {
    router.push({ name: 'settings' });
  }
});
</script>

<style scoped></style>
