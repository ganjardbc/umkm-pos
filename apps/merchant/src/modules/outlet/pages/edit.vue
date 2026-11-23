<template>
  <UiCard class="max-w-2xl mx-auto">
    <template #header>
      <h1 class="text-xl font-semibold">
        Edit Outlet
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
        <UiFormGroup label="Nama" variant="vertical">
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
        <UiFormGroup label="Lokasi" variant="vertical">
          <Textarea
            name="location"
            placeholder=""
            fluid
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
        <UiFormGroup label="Kode Rahasia Pelanggan" variant="vertical">
          <InputText
            name="guest_session_secret"
            type="text"
            placeholder="DEMO123"
            fluid
          />
        </UiFormGroup>
        <UiFileUpload
          :previewUrl="imagePreview"
          @select="onUploadImage"
          @remove="onRemoveImage"
        />
        <UiFormGroup label="Status Aktif" variant="vertical">
          <div class="flex items-center gap-2">
            <Checkbox
              name="is_active"
              binary
            />
            <label class="text-sm text-gray-700">Outlet aktif</label>
          </div>
          <Message
            v-if="$form.is_active?.invalid"
            severity="error"
            size="small"
            variant="simple"
          >
            {{ $form.is_active.error?.message }}
          </Message>
        </UiFormGroup>
        <UiFormGroup label="Buka/tutup kasir" variant="vertical">
          <div class="flex items-center gap-2">
            <Checkbox
              name="shift_required"
              binary
            />
            <label class="text-sm text-gray-700">Wajibkan buka/tutup kasir</label>
          </div>
          <p class="text-xs text-gray-500">
            Bila dimatikan, kasir langsung berjualan tanpa membuka kasir dan kas tidak dicatat. Tidak bisa dimatikan selama kasir sedang buka.
          </p>
        </UiFormGroup>
        <UiFormGroup label="Batas kas keluar harian" variant="vertical">
          <InputNumber
            name="cash_out_daily_limit"
            mode="currency"
            currency="IDR"
            locale="id-ID"
            :min="0"
            fluid
            placeholder="Kosongkan bila tanpa batas"
          />
          <p class="text-xs text-gray-500">
            Kas keluar yang melewati batas ini per hari ditolak. Refund tidak dihitung.
          </p>
        </UiFormGroup>
        <UiFormGroup label="Tutup kasir otomatis" variant="vertical">
          <InputText
            name="auto_close_time"
            placeholder="Contoh: 23:00 (kosongkan bila mati)"
            fluid
          />
          <Message
            v-if="$form.auto_close_time?.invalid"
            severity="error"
            size="small"
            variant="simple"
          >
            {{ $form.auto_close_time.error?.message }}
          </Message>
          <p class="text-xs text-gray-500">
            Format jam:menit (waktu server). Kasir yang masih buka ditutup otomatis tanpa kas akhir, jadi selisihnya tidak dihitung.
          </p>
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
          label="Simpan"
          size="medium"
          class="w-full md:w-[128px]"
          :loading="isSubmitting"
        />
      </div>
    </Form>
  </UiCard>
</template>
<script setup lang="ts">
import type { FormEdit } from '@/modules/outlet/services/types.ts';
import { ref, computed, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { z } from 'zod';
import { zodResolver } from '@primevue/forms/resolvers/zod';
import { getErrorMessage } from '@umkm-pos/ui/helpers/utils';
import { showToast } from '@umkm-pos/ui/helpers/toast';
import { showLoading, hideLoading } from '@umkm-pos/ui/helpers/loading';
import { putOutlet, getDetailOutlet } from '@/modules/outlet/services/api.ts';
import { setOutletImage, removeOutletImage } from '@/services/uploads';
import { useFileUpload } from '@umkm-pos/ui/composables/useFileUpload';
import UiCard from '@umkm-pos/ui/components/UiCard.vue';
import UiFormGroup from '@umkm-pos/ui/components/UiFormGroup.vue';

const route = useRoute();
const router = useRouter();
const outletID = computed(() => route.params.id as string);

const isLoaded = ref(false);
const hasExistingLogo = ref(false);
const isSubmitting = ref(false);

const {
  selectedUploadId,
  imagePreview,
  onUploadImage,
  onRemoveImage,
} = useFileUpload();

const initialValues = ref<FormEdit>({
  name: '',
  location: '',
  guest_session_secret: '',
  is_active: true,
  shift_required: true,
  cash_out_daily_limit: null,
  auto_close_time: ''
});

const resolver = ref(zodResolver(
  z.object({
    name: z.string().min(1, { message: 'Nama wajib diisi.' }),
    location: z.string().min(1, { message: 'Lokasi wajib diisi.' }),
    guest_session_secret: z.string().optional(),
    is_active: z.boolean(),
    shift_required: z.boolean(),
    cash_out_daily_limit: z.number().min(0).nullable().optional(),
    auto_close_time: z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/, { message: 'Format jam HH:mm, mis. 23:00.' }).or(z.literal('')).nullable().optional()
  })
));

const onFormSubmit = async (event: any) => {
  const { valid, values } = event as { valid: boolean; values: any };
  if (valid) {
    isSubmitting.value = true;
    try {
      showLoading();

      const payload = {
        name: values?.name,
        location: values?.location,
        guest_session_secret: values?.guest_session_secret,
        is_active: values?.is_active,
        shift_required: values?.shift_required,
        // null clears the setting
        cash_out_daily_limit: values?.cash_out_daily_limit ?? null,
        auto_close_time: values?.auto_close_time || null,
      };
      const response = await putOutlet(outletID.value, payload);
      const { success } = response?.data || {};

      if (success) {
        if (selectedUploadId.value) {
          await setOutletImage(outletID.value, selectedUploadId.value);
        } else if (hasExistingLogo.value && !imagePreview.value) {
          await removeOutletImage(outletID.value);
        }
        router.back();
      }
    } catch (error) {
      showToast({
        type: 'error',
        title: 'Gagal Memperbarui Outlet.',
        message: getErrorMessage(error) || 'Terjadi kesalahan.',
      });
    } finally {
      hideLoading();
      isSubmitting.value = false;
    }
  }
};

const onCancel = () => {
  router.back();
};

// Fetch Detail
const fetchDetail = async () => {
  try {
    const response = await getDetailOutlet(outletID.value);
    const { data } = response?.data || {};
    const { name, location, guest_session_secret, is_active, shift_required, logo, cash_out_daily_limit, auto_close_time } = data || {};

    initialValues.value = {
      name,
      location,
      guest_session_secret,
      is_active,
      shift_required: shift_required !== false,
      cash_out_daily_limit: cash_out_daily_limit == null ? null : Number(cash_out_daily_limit),
      auto_close_time: auto_close_time || ''
    };

    if (logo) {
      hasExistingLogo.value = true
      imagePreview.value = logo
    }

    isLoaded.value = true;
  } catch (error) {
    showToast({
      type: 'error',
      title: 'Gagal memuat data.',
      message: getErrorMessage(error) || 'Terjadi kesalahan.',
    });
  }
};

onMounted(() => {
  fetchDetail();
});
</script>
