<template>
  <div class="mx-auto w-full max-w-5xl space-y-4">
    <div class="flex items-center gap-4">
      <Button
        severity="secondary"
        icon="pi pi-arrow-left"
        size="small"
        aria-label="Kembali"
        @click="onCancel"
      />
      <h1 class="text-lg font-semibold">
        Tambah Outlet
      </h1>
    </div>

    <OutletForm
      mode="create"
      :initial-values="initialValues"
      :submitting="submitting"
      @submit="onSubmit"
      @cancel="onCancel"
    />
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { getErrorMessage } from '@umkm-pos/ui/helpers/utils';
import { showToast } from '@umkm-pos/ui/helpers/toast';
import { postOutlet } from '@/modules/outlet/services/api.ts';
import { setOutletImage } from '@/services/uploads';
import OutletForm, {
  type OutletFormSubmit,
  type OutletFormValues,
} from '@/modules/outlet/components/OutletForm.vue';

const router = useRouter();

const initialValues: OutletFormValues = {
  name: '',
  location: '',
  guest_session_secret: '',
  is_active: true,
  shift_required: true,
  cash_out_daily_limit: null,
  auto_close_time: '',
};

const submitting = ref(false);

const onSubmit = async ({ values, slug, uploadId }: OutletFormSubmit) => {
  if (submitting.value) return;
  try {
    submitting.value = true;
    const response = await postOutlet({
      slug,
      name: values.name,
      location: values.location,
      guest_session_secret: values.guest_session_secret || undefined,
      is_active: values.is_active,
      shift_required: values.shift_required,
      cash_out_daily_limit: values.cash_out_daily_limit ?? undefined,
      auto_close_time: values.auto_close_time || undefined,
    });
    const { success, data } = response?.data || {};

    if (success && uploadId) {
      await setOutletImage(data?.id, uploadId);
    }
    if (success) {
      showToast({ type: 'success', title: 'Outlet ditambahkan', message: `${values.name} siap dipakai.` });
      router.back();
    }
  } catch (error) {
    showToast({
      type: 'error',
      title: 'Gagal menambah outlet',
      message: getErrorMessage(error) || 'Terjadi kesalahan.',
    });
  } finally {
    submitting.value = false;
  }
};

const onCancel = () => {
  router.back();
};
</script>
