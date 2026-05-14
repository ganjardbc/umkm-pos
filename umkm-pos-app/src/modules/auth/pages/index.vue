<template>
  <UiCard class="login-page">
    <Image :src="defaultLogo" alt="Image" class="w-44" />

    <Form
      v-slot="$form"
      :resolver="resolver"
      :initialValues="initialValues"
      @submit="onFormSubmit"
      class="flex flex-col gap-4 w-full pt-2"
    >
      <UiFormGroup label="Email" variant="vertical">
        <InputText
          name="email"
          type="email"
          placeholder=""
          fluid
          :disabled="loading"
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
        <InputGroup>
          <InputText
            name="password"
            :type="showPassword ? 'text' : 'password'"
            placeholder=""
            fluid
            :disabled="loading"
          />
          <InputGroupAddon>
            <Button
              :icon="showPassword ? 'pi pi-eye-slash' : 'pi pi-eye'"
              severity="secondary"
              variant="text"
              class="w-full"
              @click="showPassword = !showPassword"
            />
          </InputGroupAddon>
        </InputGroup>
        <Message
          v-if="$form.password?.invalid"
          severity="error"
          size="small"
          variant="simple"
        >
          {{ $form.password.error?.message }}
        </Message>
      </UiFormGroup>
      <div class="w-full flex">
        <Button
          type="submit"
          severity="primary"
          label="Login"
          class="w-full"
          :loading="loading"
        />
      </div>

      <div class="text-base text-gray-500 dark:text-gray-400 text-center">
        Don't have an account?
        <router-link to="/register" class="text-base text-blue-500 dark:text-blue-400 hover:underline">
          Register
        </router-link>
      </div>

      <div class="text-xs text-center text-gray-400 dark:text-gray-500">
        Version 1.0.0
      </div>
    </Form>
  </UiCard>
</template>

<script lang="ts" setup>
import type { LoginPayload } from '@/modules/auth/services/types.ts';

import { ref } from 'vue';
import { zodResolver } from '@primevue/forms/resolvers/zod';
import { useRouter } from 'vue-router';
import { z } from 'zod';

import defaultLogo from '@/assets/insell-logo.png';

import { setAuth } from '@/helpers/auth.ts';
import { getErrorMessage } from '@/helpers/utils.ts';
import { showToast } from '@/helpers/toast.ts';
import { postLogin } from '@/modules/auth/services/api.ts';

import UiFormGroup from '@/components/UiFormGroup.vue';
import UiCard from '@/components/UiCard.vue';

import { PREFIX_ROUTE_PATH as PRP_LANDING } from '@/modules/landing/services/constants';

const router = useRouter();
const initialValues = ref({
  email: '',
  password: ''
});
const showPassword = ref(false);
const loading = ref(false);

const resolver = ref(zodResolver(
  z.object({
    email: z.string().email({ message: 'Please enter a valid email address.' }).min(1, { message: 'Email is required.' }),
    password: z.string().min(1, { message: 'Password is required.' })
  })
));

const onFormSubmit = async ({ valid, values }: { valid: boolean; values: any }) => {
  if (valid) {
    loading.value = true;

    try {
      const payload: LoginPayload = {
        email: values.email,
        password: values.password,
      };
      const response = await postLogin(payload);
      const { success, data} = response?.data;

      
      if (success) {
        setAuth(data);

        router.push(PRP_LANDING);
        showToast({
          type: 'success',
          title: 'Login Success',
        });
      }
    } catch (error) {
      showToast({
        type: 'error',
        title: 'Login Failed.',
        message: getErrorMessage(error) || 'There was an error.',
      });
    } finally {
      loading.value = false;
    }
  }
};
</script>
<style scoped>
@import 'tailwindcss';
@import '@/assets/styles/themes.css';

.login-page {
  @apply relative w-100 flex flex-col items-center justify-center m-4 py-8;
}
</style>
