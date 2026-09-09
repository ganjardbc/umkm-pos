<template>
  <UiCard class="max-w-2xl mx-auto">
    <template #header>
      <h1 class="text-xl font-semibold">
        Nonaktifkan Akun
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
        <Message
          severity="warn"
          size="small"
          variant="simple"
        >
          <strong>Peringatan:</strong> Tindakan ini tidak dapat dibatalkan. Akun Anda akan dinonaktifkan secara permanen dan seluruh data Anda akan dihapus setelah 30 hari.
        </Message>

        <UiFormGroup variant="vertical">
          <div class="flex items-center gap-2">
            <Checkbox
              name="confirmDeactivation"
              :binary="true"
              input-id="confirm-deactivation"
            />
            <label for="confirm-deactivation" class="text-sm">
              Saya memahami bahwa tindakan ini permanen dan tidak dapat dibatalkan
            </label>
          </div>
          <Message
            v-if="$form.confirmDeactivation?.invalid"
            severity="error"
            size="small"
            variant="simple"
          >
            {{ $form.confirmDeactivation.error?.message }}
          </Message>
        </UiFormGroup>

        <UiFormGroup label="Kata Sandi untuk Konfirmasi" variant="vertical">
          <Password
            name="password"
            placeholder="Masukkan kata sandi untuk konfirmasi"
            :feedback="false"
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

        <UiFormGroup label="Alasan Penonaktifan (Opsional)" variant="vertical">
          <Textarea
            name="reason"
            placeholder="Ceritakan alasan Anda menonaktifkan akun"
            rows="3"
            fluid
          />
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
          severity="danger"
          label="Nonaktifkan Akun"
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
import { showToast, showConfirm } from '@/helpers/toast.ts';
import { showLoading, hideLoading } from '@/helpers/loading.ts';
import UiCard from '@/components/UiCard.vue';
import UiFormGroup from '@/components/UiFormGroup.vue';
import Password from 'primevue/password';
import Textarea from 'primevue/textarea';
import Checkbox from 'primevue/checkbox';
import Button from 'primevue/button';
import Message from 'primevue/message';
import { Form } from '@primevue/forms';
import { deactivateAccount } from '@/modules/settings/services/api.ts';
import { ACCOUNT_DEACTIVATE } from '@/modules/settings/services/rbac.ts';
import type { DeactivateAccountDto } from '@/modules/settings/services/types';

const router = useRouter();

// RBAC
const isCanDeactivate = computed(() => isHasPermission(ACCOUNT_DEACTIVATE));

// Form state
const isLoaded = ref(true);
const initialValues = ref({
  confirmDeactivation: false,
  password: '',
  reason: '',
});

const resolver = ref(zodResolver(
  z.object({
    confirmDeactivation: z.boolean().refine((val) => val === true, {
      message: 'Anda harus mengonfirmasi untuk menonaktifkan akun Anda.',
    }),
    password: z.string().min(1, { message: 'Kata sandi wajib diisi untuk mengonfirmasi penonaktifan.' }),
    reason: z.string().optional(),
  })
));

// Submit
const onFormSubmit = async ({ valid, values }: { valid: boolean; values: any }) => {
  if (valid) {
    showConfirm({
      header: 'Nonaktifkan Akun',
      message: 'Apakah Anda benar-benar yakin? Tindakan ini tidak dapat dibatalkan. Akun Anda akan dinonaktifkan secara permanen.',
      rejectLabel: 'Batal',
      acceptLabel: 'Ya, Nonaktifkan',
      type: 'warn',
      accept: () => {
        submitDeactivation(values);
      },
    });
  }
};

// Submit deactivation
const submitDeactivation = async (values: any) => {
  try {
    showLoading();

    const payload: DeactivateAccountDto = {
      password: values.password,
      reason: values.reason || undefined,
    };

    const response = await deactivateAccount(payload);
    const { success } = response?.data || {};

    if (success) {
      showToast({
        type: 'success',
        title: 'Akun Dinonaktifkan',
        message: 'Akun Anda telah dinonaktifkan. Anda akan dialihkan keluar.',
      });
      // Redirect to login after a short delay
      setTimeout(() => {
        router.push({ name: 'login' });
      }, 2000);
    }
  } catch (error) {
    showToast({
      type: 'error',
      title: 'Gagal',
      message: getErrorMessage(error) || 'Gagal menonaktifkan akun.',
    });
  } finally {
    hideLoading();
  }
};

// Navigation
const onCancel = () => {
  router.back();
};

onMounted(() => {
  if (!isCanDeactivate.value) {
    router.push({ name: 'settings' });
  }
});
</script>

<style scoped></style>
