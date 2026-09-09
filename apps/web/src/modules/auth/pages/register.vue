<template>
  <UiCard class="register-page">
    <a :href="baseUrl" class="w-44">
      <Image :src="defaultLogo" alt="Image" />
    </a>

    <div class="w-full pt-2">
      <Stepper v-model:value="activeStep" :linear="true" class="w-full">
        <StepList>
          <Step :value="1">Informasi Pengguna</Step>
          <Step :value="2">Informasi Merchant</Step>
          <Step :value="3">Informasi Outlet</Step>
        </StepList>

        <StepPanels>
          <!-- Step 1: User Information -->
          <StepPanel v-slot="{ activateCallback }" :value="1">
            <Form
              v-slot="$form"
              :resolver="userResolver"
              :initialValues="userFormValues"
              @submit="(e) => onUserFormSubmit(e, activateCallback)"
              class="flex flex-col gap-4 w-full pt-4"
            >
              <UiFormGroup label="Nama Lengkap" variant="vertical">
                <InputText
                  name="name"
                  type="text"
                  placeholder="John Doe"
                  fluid
                  :disabled="loading"
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
                  placeholder="john@example.com"
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

              <UiFormGroup label="Kata Sandi" variant="vertical">
                <InputGroup>
                  <InputText
                    name="password"
                    :type="showPassword ? 'text' : 'password'"
                    placeholder="Min. 6 karakter"
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

              <div class="w-full flex gap-2 pt-2">
                <Button
                  type="button"
                  severity="secondary"
                  label="Batal"
                  class="w-full"
                  :disabled="loading"
                  @click="router.push('/')"
                />
                <Button
                  type="submit"
                  variant="primary"
                  label="Lanjut"
                  class="w-full"
                  :disabled="loading"
                />
              </div>
            </Form>
          </StepPanel>

          <!-- Step 2: Merchant Information -->
          <StepPanel v-slot="{ activateCallback }" :value="2">
            <Form
              v-slot="$form"
              :resolver="merchantResolver"
              :initialValues="merchantFormValues"
              @submit="(e) => onMerchantFormSubmit(e, activateCallback)"
              class="flex flex-col gap-4 w-full pt-4"
            >
              <UiFormGroup label="Nama Merchant" variant="vertical">
                <InputText
                  name="name"
                  type="text"
                  placeholder="Toko Saya"
                  fluid
                  :disabled="loading"
                  @update:modelValue="(value: any) => onMerchantNameChange(value, $form)"
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

              <UiFormGroup label="Slug Merchant" variant="vertical">
                <InputText
                  name="slug"
                  type="text"
                  placeholder="toko-saya"
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

              <UiFormGroup label="Nomor Telepon (Opsional)" variant="vertical">
                <InputText
                  name="phone"
                  type="text"
                  placeholder="08123456789"
                  fluid
                  :disabled="loading"
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

              <UiFormGroup label="Alamat (Opsional)" variant="vertical">
                <Textarea
                  name="address"
                  placeholder="Jl. Ahmad Yani No. 123"
                  rows="2"
                  fluid
                  :disabled="loading"
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

              <div class="w-full flex gap-2 pt-2">
                <Button
                  type="button"
                  severity="secondary"
                  label="Kembali"
                  class="w-full"
                  :disabled="loading"
                  @click="activateCallback(1)"
                />
                <Button
                  type="submit"
                  variant="primary"
                  label="Lanjut"
                  class="w-full"
                  :disabled="loading"
                />
              </div>
            </Form>
          </StepPanel>

          <!-- Step 3: Outlet Information -->
          <StepPanel v-slot="{ activateCallback }" :value="3">
            <Form
              v-slot="$form"
              :resolver="outletResolver"
              :initialValues="outletFormValues"
              @submit="onOutletFormSubmit"
              class="flex flex-col gap-4 w-full pt-4"
            >
              <UiFormGroup label="Nama Outlet" variant="vertical">
                <InputText
                  name="name"
                  type="text"
                  placeholder="Cabang Utama"
                  fluid
                  :disabled="loading"
                  @update:modelValue="(value: any) => onOutletNameChange(value, $form)"
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

              <UiFormGroup label="Slug Outlet" variant="vertical">
                <InputText
                  name="slug"
                  type="text"
                  placeholder="cabang-utama"
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

              <UiFormGroup label="Lokasi (Opsional)" variant="vertical">
                <Textarea
                  name="location"
                  placeholder="Jl. Sudirman No. 1"
                  rows="2"
                  fluid
                  :disabled="loading"
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

              <div class="w-full flex gap-2 pt-2">
                <Button
                  type="button"
                  severity="secondary"
                  label="Kembali"
                  class="w-full"
                  :disabled="loading"
                  @click="activateCallback(2)"
                />
                <Button
                  type="submit"
                  variant="primary"
                  label="Daftar"
                  class="w-full"
                  :loading="loading"
                />
              </div>
            </Form>
          </StepPanel>
        </StepPanels>
      </Stepper>

      <div class="text-base text-gray-500 dark:text-gray-400 text-center">
        Sudah punya akun?
        <router-link to="/" class="text-base text-blue-500 dark:text-blue-400 hover:underline">
          Masuk
        </router-link>
      </div>

      <div class="text-xs text-center text-gray-400 dark:text-gray-500 pt-4">
        Versi 1.0.0
      </div>
    </div>
  </UiCard>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { zodResolver } from '@primevue/forms/resolvers/zod';
import { useRouter } from 'vue-router';
import { z } from 'zod';

import defaultLogo from '@/assets/insell-logo.png';

import { setAuth } from '@/helpers/auth.ts';
import { getErrorMessage } from '@/helpers/utils.ts';
import { showToast } from '@/helpers/toast.ts';
import { postRegister } from '@/modules/auth/services/api.ts';

import UiFormGroup from '@/components/UiFormGroup.vue';
import UiCard from '@/components/UiCard.vue';

import { PREFIX_ROUTE_PATH as PRP_LANDING } from '@/modules/landing/services/constants';

const baseUrl = import.meta.env.VITE_WEB_BASE_URL || '';
const router = useRouter();
const showPassword = ref(false);
const loading = ref(false);
const activeStep = ref(1);

const slugPattern = /^[a-z0-9-]+$/;

// Helper function to generate slug from name
const generateSlug = (name: string): string => {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
};

// Step 1: User Information
const userFormValues = ref({
  name: '',
  email: '',
  password: ''
});

const userResolver = ref(zodResolver(
  z.object({
    name: z.string().min(1, { message: 'Nama lengkap wajib diisi.' }),
    email: z.string().email({ message: 'Masukkan alamat email yang valid.' }).min(1, { message: 'Email wajib diisi.' }),
    password: z.string().min(6, { message: 'Kata sandi minimal 6 karakter.' })
  })
));

const onUserFormSubmit = ({ valid, values }: { valid: boolean; values: any }, activateCallback: (step: number) => void) => {
  if (valid) {
    userFormValues.value = values;
    activateCallback(2);
  }
};

// Step 2: Merchant Information
const merchantFormValues = ref({
  name: '',
  slug: '',
  phone: '',
  address: ''
});

const merchantResolver = ref(zodResolver(
  z.object({
    name: z.string().min(1, { message: 'Nama merchant wajib diisi.' }),
    slug: z.string()
      .min(1, { message: 'Slug merchant wajib diisi.' })
      .regex(slugPattern, { message: 'Slug hanya boleh berisi huruf kecil, angka, dan tanda hubung.' }),
    phone: z.string().optional(),
    address: z.string().optional()
  })
));

const onMerchantNameChange = (name: string, form: any) => {
  const slug = generateSlug(name);
  form.slug.value = slug;
};

const onMerchantFormSubmit = ({ valid, values }: { valid: boolean; values: any }, activateCallback: (step: number) => void) => {
  if (valid) {
    merchantFormValues.value = values;
    activateCallback(3);
  }
};

// Step 3: Outlet Information
const outletFormValues = ref({
  name: '',
  slug: '',
  location: ''
});

const outletResolver = ref(zodResolver(
  z.object({
    name: z.string().min(1, { message: 'Nama outlet wajib diisi.' }),
    slug: z.string()
      .min(1, { message: 'Slug outlet wajib diisi.' })
      .regex(slugPattern, { message: 'Slug hanya boleh berisi huruf kecil, angka, dan tanda hubung.' }),
    location: z.string().optional()
  })
));

const onOutletNameChange = (name: string, form: any) => {
  const slug = generateSlug(name);
  form.slug.value = slug;
};

const onOutletFormSubmit = async ({ valid, values }: { valid: boolean; values: any }) => {
  if (valid) {
    outletFormValues.value = values;
    await submitRegistration();
  }
};

// Final Registration
const submitRegistration = async () => {
  loading.value = true;

  try {
    const payload = {
      name: userFormValues.value.name,
      email: userFormValues.value.email,
      password: userFormValues.value.password,
      merchant: {
        slug: merchantFormValues.value.slug,
        name: merchantFormValues.value.name,
        phone: merchantFormValues.value.phone || undefined,
        address: merchantFormValues.value.address || undefined
      },
      outlets: [
        {
          slug: outletFormValues.value.slug,
          name: outletFormValues.value.name,
          location: outletFormValues.value.location || undefined
        }
      ]
    };

    const response = await postRegister(payload);
    const { success, data } = response?.data;

    if (success) {
      setAuth(data);

      router.push(PRP_LANDING);
      showToast({
        type: 'success',
        title: 'Pendaftaran Berhasil',
        message: 'Akun Anda berhasil dibuat.',
      });
    }
  } catch (error) {
    showToast({
      type: 'error',
      title: 'Pendaftaran Gagal.',
      message: getErrorMessage(error) || 'Terjadi kesalahan.',
    });
  } finally {
    loading.value = false;
  }
};
</script>
<style>
@import 'tailwindcss';

.register-page {
  @apply relative w-150 flex flex-col items-center h-screen md:h-auto overflow-y-auto py-8! px-2! rounded-none! md:rounded-lg!;
}

.register-page .p-step-title {
  @apply hidden! lg:block!;
}

/* Dark mode styling for StepPanel */
.dark .p-steppanel {
  background-color: var(--dark-bg);
  color: var(--dark-text);
}

.dark .p-steppanel-content {
  background-color: var(--dark-bg);
  color: var(--dark-text);
}
</style>
