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
        Ubah Outlet
      </h1>
    </div>

    <UiLoading
      v-if="!isLoaded"
      message="Memuat outlet..."
    />

    <OutletForm
      v-else
      mode="edit"
      :initial-values="initialValues!"
      :initial-image="initialImage"
      :submitting="submitting"
      @submit="onSubmit"
      @cancel="onCancel"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { getErrorMessage } from '@umkm-pos/ui/helpers/utils';
import { showToast } from '@umkm-pos/ui/helpers/toast';
import UiLoading from '@umkm-pos/ui/components/UiLoading.vue';
import { getDetailOutlet, putOutlet } from '@/modules/outlet/services/api.ts';
import { setOutletImage, removeOutletImage } from '@/services/uploads';
import OutletForm, {
  type OutletFormSubmit,
  type OutletFormValues,
} from '@/modules/outlet/components/OutletForm.vue';

const route = useRoute();
const router = useRouter();
const outletID = computed(() => route.params.id as string);

const isLoaded = ref(false);
const submitting = ref(false);
const initialValues = ref<OutletFormValues | null>(null);
const initialImage = ref<string | null>(null);

const onSubmit = async ({ values, uploadId, imageCleared }: OutletFormSubmit) => {
  if (submitting.value) return;
  try {
    submitting.value = true;
    const response = await putOutlet(outletID.value, {
      name: values.name,
      location: values.location,
      guest_session_secret: values.guest_session_secret,
      is_active: values.is_active,
      shift_required: values.shift_required,
      // null clears the setting
      cash_out_daily_limit: values.cash_out_daily_limit ?? null,
      auto_close_time: values.auto_close_time || null,
    });
    const { success } = response?.data || {};

    if (success) {
      if (uploadId) {
        await setOutletImage(outletID.value, uploadId);
      } else if (imageCleared) {
        await removeOutletImage(outletID.value);
      }
      showToast({ type: 'success', title: 'Outlet diperbarui', message: `${values.name} tersimpan.` });
      router.back();
    }
  } catch (error) {
    showToast({
      type: 'error',
      title: 'Gagal memperbarui outlet',
      message: getErrorMessage(error) || 'Terjadi kesalahan.',
    });
  } finally {
    submitting.value = false;
  }
};

const onCancel = () => {
  router.back();
};

const fetchDetail = async () => {
  try {
    const response = await getDetailOutlet(outletID.value);
    const { data } = response?.data || {};
    initialValues.value = {
      name: data?.name ?? '',
      location: data?.location ?? '',
      guest_session_secret: data?.guest_session_secret ?? '',
      is_active: data?.is_active ?? true,
      shift_required: data?.shift_required !== false,
      cash_out_daily_limit: data?.cash_out_daily_limit == null ? null : Number(data.cash_out_daily_limit),
      auto_close_time: data?.auto_close_time || '',
    };
    initialImage.value = data?.logo || null;
    isLoaded.value = true;
  } catch (error) {
    showToast({
      type: 'error',
      title: 'Gagal memuat data.',
      message: getErrorMessage(error) || 'Terjadi kesalahan.',
    });
  }
};

onMounted(fetchDetail);
</script>
