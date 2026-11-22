<template>
  <UiCard class="max-w-2xl mx-auto">
    <template #header>
      <h1 class="text-xl font-semibold">
        PIN Persetujuan
      </h1>
    </template>

    <form
      class="flex flex-col gap-4 w-full"
      @submit.prevent="onSubmit"
    >
      <p class="text-sm text-gray-500">
        PIN 6 digit dipakai manager atau owner untuk menyetujui pembatalan transaksi oleh kasir.
        Menyimpan PIN baru akan menggantikan PIN lama.
      </p>

      <UiFormGroup label="Kata Sandi Saat Ini" variant="vertical">
        <Password
          v-model="currentPassword"
          placeholder="Masukkan kata sandi saat ini"
          :feedback="false"
          fluid
        />
      </UiFormGroup>

      <UiFormGroup label="PIN Baru (6 digit)" variant="vertical">
        <InputText
          v-model="pin"
          type="password"
          inputmode="numeric"
          maxlength="6"
          autocomplete="off"
          placeholder="••••••"
          class="w-full"
        />
      </UiFormGroup>

      <UiFormGroup label="Konfirmasi PIN" variant="vertical">
        <InputText
          v-model="confirmPin"
          type="password"
          inputmode="numeric"
          maxlength="6"
          autocomplete="off"
          placeholder="••••••"
          class="w-full"
        />
        <Message
          v-if="confirmPin && pin !== confirmPin"
          severity="error"
          size="small"
          variant="simple"
        >
          PIN tidak cocok.
        </Message>
      </UiFormGroup>

      <div class="w-full flex justify-end gap-4">
        <Button
          severity="secondary"
          label="Batal"
          class="w-full md:w-32"
          @click="router.back()"
        />
        <Button
          type="submit"
          label="Simpan PIN"
          class="w-full md:w-48"
          :disabled="!isValid"
        />
      </div>
    </form>
  </UiCard>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import { useRouter } from 'vue-router';
import { getErrorMessage } from '@umkm-pos/ui/helpers/utils';
import { showToast } from '@umkm-pos/ui/helpers/toast';
import { showLoading, hideLoading } from '@umkm-pos/ui/helpers/loading';
import UiCard from '@umkm-pos/ui/components/UiCard.vue';
import UiFormGroup from '@umkm-pos/ui/components/UiFormGroup.vue';
import Password from 'primevue/password';
import Message from 'primevue/message';
import { setApprovalPin } from '@/modules/settings/services/api.ts';

const router = useRouter();

const currentPassword = ref('');
const pin = ref('');
const confirmPin = ref('');

const isValid = computed(
  () => currentPassword.value !== '' && /^\d{6}$/.test(pin.value) && pin.value === confirmPin.value,
);

const onSubmit = async () => {
  if (!isValid.value) return;
  try {
    showLoading();
    const response = await setApprovalPin({
      currentPassword: currentPassword.value,
      pin: pin.value,
    });
    if (response?.data?.success) {
      showToast({ type: 'success', title: 'Berhasil', message: 'PIN persetujuan disimpan.' });
      router.push({ name: 'settings' });
    }
  } catch (error) {
    showToast({
      type: 'error',
      title: 'Gagal',
      message: getErrorMessage(error) || 'Gagal menyimpan PIN.',
    });
  } finally {
    hideLoading();
  }
};
</script>
