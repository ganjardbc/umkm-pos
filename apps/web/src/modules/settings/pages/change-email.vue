<template>
  <UiCard class="max-w-2xl mx-auto">
    <template #header>
      <h1 class="text-xl font-semibold">
        Ubah Email
      </h1>
    </template>

    <!-- Step 1: Request Verification -->
    <Form
      v-if="step === 1 && isLoaded"
      v-slot="$form"
      :resolver="resolverStep1"
      :initialValues="initialValuesStep1"
      @submit="onFormSubmitStep1"
      class="flex flex-col gap-4 w-full"
    >
      <div class="w-full space-y-4">
        <Message
          severity="info"
          size="small"
          variant="simple"
        >
          Kami akan mengirimkan kode verifikasi ke alamat email baru Anda.
        </Message>

        <UiFormGroup label="Email Saat Ini" variant="vertical">
          <InputText
            :model-value="currentEmail"
            type="email"
            disabled
            fluid
          />
        </UiFormGroup>

        <UiFormGroup label="Email Baru" variant="vertical">
          <InputText
            name="newEmail"
            type="email"
            placeholder="Masukkan alamat email baru"
            fluid
          />
          <Message
            v-if="$form.newEmail?.invalid"
            severity="error"
            size="small"
            variant="simple"
          >
            {{ $form.newEmail.error?.message }}
          </Message>
        </UiFormGroup>
      </div>

      <div class="w-full flex justify-end gap-4">
        <Button
          severity="secondary"
          label="Batal"
          size="medium"
          class="w-full md:w-[128px]"
          @click="onCancel"
        />
        <Button
          type="submit"
          label="Kirim Kode"
          size="medium"
          class="w-full md:w-[128px]"
        />
      </div>
    </Form>

    <!-- Step 2: Verify Code -->
    <Form
      v-if="step === 2 && isLoaded"
      v-slot="$form"
      :resolver="resolverStep2"
      :initialValues="initialValuesStep2"
      @submit="onFormSubmitStep2"
      class="flex flex-col gap-4 w-full"
    >
      <div class="w-full space-y-4">
        <Message
          severity="success"
          size="small"
          variant="simple"
        >
          Kode verifikasi telah dikirim ke <strong>{{ newEmailForVerification }}</strong>
        </Message>

        <UiFormGroup label="Kode Verifikasi" variant="vertical">
          <InputText
            name="verificationCode"
            type="text"
            placeholder="Masukkan 6 digit kode"
            maxlength="6"
            fluid
          />
          <Message
            v-if="$form.verificationCode?.invalid"
            severity="error"
            size="small"
            variant="simple"
          >
            {{ $form.verificationCode.error?.message }}
          </Message>
        </UiFormGroup>

        <div class="text-sm">
          <button
            type="button"
            @click="requestVerificationAgain"
            :disabled="resendCountdown > 0"
            class="text-blue-600 hover:text-blue-800 disabled:text-gray-400"
          >
            {{ resendCountdown > 0 ? `Kirim ulang dalam ${resendCountdown}d` : 'Kirim Ulang Kode' }}
          </button>
        </div>
      </div>

      <div class="w-full flex justify-end gap-4">
        <Button
          severity="secondary"
          label="Kembali"
          size="medium"
          class="w-full md:w-[128px]"
          @click="step = 1"
        />
        <Button
          type="submit"
          label="Verifikasi"
          size="medium"
          class="w-full md:w-[128px]"
        />
      </div>
    </Form>
  </UiCard>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { useRouter } from 'vue-router';
import { z } from 'zod';
import { zodResolver } from '@primevue/forms/resolvers/zod';
import { isHasPermission } from '@/helpers/auth.ts';
import { getErrorMessage } from '@/helpers/utils.ts';
import { showToast } from '@/helpers/toast.ts';
import { showLoading, hideLoading } from '@/helpers/loading.ts';
import UiCard from '@/components/UiCard.vue';
import UiFormGroup from '@/components/UiFormGroup.vue';
import InputText from 'primevue/inputtext';
import Button from 'primevue/button';
import Message from 'primevue/message';
import { Form } from '@primevue/forms';
import { getProfile, verifyEmailRequest, updateEmail } from '@/modules/settings/services/api.ts';
import { EMAIL_UPDATE } from '@/modules/settings/services/rbac.ts';
import type { ChangeEmailDto, VerifyEmailDto } from '@/modules/settings/services/types';

const router = useRouter();

// RBAC
const isCanUpdate = computed(() => isHasPermission(EMAIL_UPDATE));

// Form state
const step = ref(1);
const isLoaded = ref(false);
const currentEmail = ref('');
const newEmailForVerification = ref('');
const resendCountdown = ref(0);
let resendTimer: ReturnType<typeof setInterval> | null = null;

const initialValuesStep1 = ref({
  newEmail: '',
});

const initialValuesStep2 = ref({
  verificationCode: '',
});

const resolverStep1 = ref(zodResolver(
  z.object({
    newEmail: z.string()
      .email({ message: 'Masukkan alamat email yang valid.' })
      .refine((email) => email !== currentEmail.value, {
        message: 'Email baru harus berbeda dari email saat ini.',
      }),
  })
));

const resolverStep2 = ref(zodResolver(
  z.object({
    verificationCode: z.string()
      .length(6, { message: 'Kode verifikasi harus 6 digit.' })
      .regex(/^\d+$/, { message: 'Kode verifikasi hanya boleh berisi angka.' }),
  })
));

// Fetch current email
const fetchCurrentEmail = async () => {
  try {
    const response = await getProfile();
    const { data } = response?.data || {};
    if (data) {
      currentEmail.value = data.email || '';
    }
    isLoaded.value = true;
  } catch (error) {
    showToast({
      type: 'error',
      title: 'Gagal',
      message: getErrorMessage(error) || 'Gagal memuat profil.',
    });
  }
};

// Request verification
const onFormSubmitStep1 = async ({ valid, values }: { valid: boolean; values: any }) => {
  if (valid) {
    try {
      showLoading();

      const payload: VerifyEmailDto = {
        email: values.newEmail,
      };

      const response = await verifyEmailRequest(payload);
      const { success } = response?.data || {};

      if (success) {
        showToast({
          type: 'success',
          title: 'Berhasil',
          message: 'Kode verifikasi berhasil dikirim ke email baru Anda.',
        });
        newEmailForVerification.value = values.newEmail;
        step.value = 2;
        startResendCountdown();
      }
    } catch (error) {
      showToast({
        type: 'error',
        title: 'Gagal',
        message: getErrorMessage(error) || 'Gagal mengirim kode verifikasi.',
      });
    } finally {
      hideLoading();
    }
  }
};

// Verify code and update email
const onFormSubmitStep2 = async ({ valid, values }: { valid: boolean; values: any }) => {
  if (valid) {
    try {
      showLoading();

      const payload: ChangeEmailDto = {
        newEmail: newEmailForVerification.value,
        verificationCode: values.verificationCode,
      };

      const response = await updateEmail(payload);
      const { success } = response?.data || {};

      if (success) {
        showToast({
          type: 'success',
          title: 'Berhasil',
          message: 'Email berhasil diperbarui.',
        });
        router.push({ name: 'settings' });
      }
    } catch (error) {
      showToast({
        type: 'error',
        title: 'Gagal',
        message: getErrorMessage(error) || 'Gagal memperbarui email.',
      });
    } finally {
      hideLoading();
    }
  }
};

// Resend code
const requestVerificationAgain = async () => {
  try {
    showLoading();

    const payload: VerifyEmailDto = {
      email: newEmailForVerification.value,
    };

    const response = await verifyEmailRequest(payload);
    const { success } = response?.data || {};

    if (success) {
      showToast({
        type: 'success',
        title: 'Berhasil',
        message: 'Kode verifikasi telah dikirim ulang.',
      });
      startResendCountdown();
    }
  } catch (error) {
    showToast({
      type: 'error',
      title: 'Gagal',
      message: getErrorMessage(error) || 'Gagal mengirim ulang kode.',
    });
  } finally {
    hideLoading();
  }
};

// Resend countdown
const startResendCountdown = () => {
  resendCountdown.value = 60;
  if (resendTimer) clearInterval(resendTimer);
  resendTimer = setInterval(() => {
    resendCountdown.value--;
    if (resendCountdown.value <= 0) {
      if (resendTimer) clearInterval(resendTimer);
    }
  }, 1000);
};

// Navigation
const onCancel = () => {
  router.back();
};

onMounted(() => {
  if (!isCanUpdate.value) {
    router.push({ name: 'settings' });
    return;
  }
  fetchCurrentEmail();
});

onUnmounted(() => {
  if (resendTimer) clearInterval(resendTimer);
});
</script>

<style scoped></style>
