<template>
  <div class="w-full h-dvh flex items-center justify-center px-4">
    <div class="rounded-xl bg-white p-6 shadow-lg backdrop-blur dark:bg-dark space-y-6">
      <div class="space-y-2 text-center">
        <p class="text-sm font-semibold uppercase tracking-[0.3em] text-amber-600 dark:text-amber-400">
          Menu Customer
        </p>
        <h1 class="text-2xl font-bold text-slate-900 dark:text-slate-50">
          Mulai pesan dari HP
        </h1>
        <p class="text-sm text-slate-500 dark:text-slate-300">
          Masukkan secret code outlet lalu lanjut pilih menu.
        </p>
      </div>

      <form class="space-y-6" @submit.prevent="submit">
        <div class="space-y-4">
          <UiFormGroup label="Secret Code" variant="vertical">
            <InputText v-model="form.secret_code" fluid />
          </UiFormGroup>
          <Divider />
          <UiFormGroup label="Nama" variant="vertical">
            <InputText v-model="form.customer_name" fluid />
          </UiFormGroup>
          <UiFormGroup label="No. Handphone" variant="vertical" is-optional>
            <InputText v-model="form.customer_phone" fluid />
          </UiFormGroup>
        </div>

        <Button label="Masuk ke katalog" type="submit" fluid />
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { reactive } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { startCustomerSession } from '../services/api.ts';
import { setCustomerSession } from '@/helpers/customer-session.ts';
import { getErrorMessage } from '@/helpers/utils.ts';
import { showToast } from '@/helpers/toast.ts';
import UiFormGroup from '@/components/UiFormGroup.vue';

const route = useRoute();
const router = useRouter();

const form = reactive({
  outlet_id: route.params.outletId as string,
  secret_code: '',
  customer_name: '',
  customer_phone: '',
});

const submit = async () => {
  try {
    const response = await startCustomerSession(form);
    const { data } = response.data || {};
    setCustomerSession(data);
    router.push({
      name: 'customer-catalog-home',
      params: { outletId: form.outlet_id },
    });
  } catch (error) {
    showToast({
      type: 'error',
      title: 'Gagal memulai sesi.',
      message: getErrorMessage(error) || 'Terjadi kesalahan.',
    });
  }
};
</script>
