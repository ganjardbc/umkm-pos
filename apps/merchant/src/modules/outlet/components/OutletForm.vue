<template>
  <Form
    v-slot="$form"
    :resolver="resolver"
    :initial-values="initialValues"
    class="w-full"
    @submit="onSubmit"
  >
    <div class="grid grid-cols-1 gap-4 lg:grid-cols-3 lg:items-start">
      <!-- Main column -->
      <div class="space-y-4 lg:col-span-2">
        <UiCard>
          <template #header>
            <div>
              <h2 class="text-base font-semibold">
                Informasi outlet
              </h2>
              <p class="text-xs text-gray-400">
                Nama dan lokasi yang dilihat kasir dan pelanggan.
              </p>
            </div>
          </template>

          <div class="space-y-4">
            <UiFormGroup label="Nama outlet" variant="vertical">
              <InputText
                name="name"
                type="text"
                maxlength="150"
                placeholder="Contoh: Cabang Utama"
                autofocus
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
              <small
                v-else-if="mode === 'create' && slugify($form.name?.value ?? '')"
                class="text-xs text-gray-400"
              >
                Kode outlet: {{ slugify($form.name?.value ?? '') }}
              </small>
            </UiFormGroup>

            <UiFormGroup label="Lokasi" variant="vertical">
              <Textarea
                name="location"
                rows="3"
                placeholder="Alamat outlet"
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

            <UiFormGroup label="Kode rahasia pelanggan" variant="vertical">
              <InputText
                name="guest_session_secret"
                type="text"
                maxlength="50"
                placeholder="DEMO123"
                fluid
              />
              <small class="text-xs text-gray-400">
                Dipakai pelanggan untuk membuka menu QR outlet ini.
              </small>
            </UiFormGroup>
          </div>
        </UiCard>

        <UiCard>
          <template #header>
            <div>
              <h2 class="text-base font-semibold">
                Buka/tutup kasir
              </h2>
              <p class="text-xs text-gray-400">
                Atur apakah kas dicatat dan batas pengeluarannya.
              </p>
            </div>
          </template>

          <div class="space-y-4">
            <label class="flex items-start justify-between gap-4 cursor-pointer">
              <span>
                <span class="block text-sm font-semibold">Wajibkan buka/tutup kasir</span>
                <span class="block text-xs text-gray-400">
                  Bila dimatikan, kasir langsung berjualan tanpa membuka kasir dan kas tidak dicatat. Tidak bisa dimatikan selama kasir sedang buka.
                </span>
              </span>
              <Checkbox
                name="shift_required"
                binary
              />
            </label>

            <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <UiFormGroup label="Batas kas keluar harian" variant="vertical">
                <InputNumber
                  name="cash_out_daily_limit"
                  mode="currency"
                  currency="IDR"
                  locale="id-ID"
                  :min="0"
                  fluid
                  placeholder="Tanpa batas"
                />
                <small class="text-xs text-gray-400">
                  Kas keluar yang melewati batas per hari ditolak. Refund tidak dihitung.
                </small>
              </UiFormGroup>

              <UiFormGroup label="Tutup kasir otomatis" variant="vertical">
                <InputText
                  name="auto_close_time"
                  placeholder="Contoh: 23:00"
                  maxlength="5"
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
                <small v-else class="text-xs text-gray-400">
                  Jam:menit, waktu server. Kosongkan bila mati. Kasir yang masih buka ditutup tanpa kas akhir, jadi selisih tidak dihitung.
                </small>
              </UiFormGroup>
            </div>
          </div>
        </UiCard>
      </div>

      <!-- Side column -->
      <div class="space-y-4 lg:sticky lg:top-4">
        <UiCard>
          <template #header>
            <h2 class="text-base font-semibold">
              Logo outlet
            </h2>
          </template>

          <div class="aspect-square w-full overflow-hidden rounded-xl border border-dashed border-gray-300 dark:border-gray-700 flex items-center justify-center bg-gray-50 dark:bg-dark">
            <img
              v-if="imagePreview"
              :src="imagePreview"
              alt="Pratinjau logo outlet"
              class="h-full w-full object-cover"
            >
            <div
              v-else
              class="flex flex-col items-center gap-2 text-gray-400"
            >
              <i class="pi pi-image text-4xl" />
              <span class="text-xs">Belum ada logo</span>
            </div>
          </div>

          <div class="flex flex-col gap-2">
            <FileUpload
              mode="basic"
              accept="image/*"
              :choose-label="imagePreview ? 'Ganti logo' : 'Pilih logo'"
              custom-upload
              auto
              class="w-full"
              @select="onUploadImage"
            />
            <Button
              v-if="imagePreview"
              severity="danger"
              variant="text"
              size="small"
              label="Hapus logo"
              icon="pi pi-trash"
              @click="onRemoveImage"
            />
            <p class="text-xs text-gray-400">
              JPG, PNG, atau WebP, maksimal 5 MB. Logo persegi paling pas.
            </p>
          </div>
        </UiCard>

        <UiCard>
          <template #header>
            <h2 class="text-base font-semibold">
              Status
            </h2>
          </template>

          <label class="flex items-start justify-between gap-4 cursor-pointer">
            <span>
              <span class="block text-sm font-semibold">Outlet aktif</span>
              <span class="block text-xs text-gray-400">
                Outlet nonaktif tidak bisa dipakai berjualan.
              </span>
            </span>
            <Checkbox
              name="is_active"
              binary
            />
          </label>
        </UiCard>
      </div>
    </div>

    <!-- Actions stay in reach while scrolling, same as the product form -->
    <div class="sticky bottom-4 z-10 mt-4 flex justify-end gap-4 rounded-xl bg-white p-3 shadow-md dark:bg-dark-secondary dark:shadow-xl">
      <Button
        type="button"
        severity="secondary"
        label="Batal"
        size="medium"
        class="w-full md:w-[128px]"
        :disabled="submitting"
        @click="emit('cancel')"
      />
      <Button
        type="submit"
        label="Simpan"
        size="medium"
        class="w-full md:w-[128px]"
        :loading="submitting"
      />
    </div>
  </Form>
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import { z } from 'zod';
import { zodResolver } from '@primevue/forms/resolvers/zod';
import { useFileUpload } from '@umkm-pos/ui/composables/useFileUpload';
import UiCard from '@umkm-pos/ui/components/UiCard.vue';
import UiFormGroup from '@umkm-pos/ui/components/UiFormGroup.vue';
import { slugify } from '@/modules/product-lists/helpers/slug.ts';
import { showToast } from '@umkm-pos/ui/helpers/toast';

export interface OutletFormValues {
  name: string;
  location: string;
  guest_session_secret?: string | null;
  is_active: boolean;
  shift_required: boolean;
  cash_out_daily_limit?: number | null;
  auto_close_time?: string | null;
}

export interface OutletFormSubmit {
  values: OutletFormValues;
  slug: string;
  uploadId: string | null;
  // true when an existing logo was removed and not replaced
  imageCleared: boolean;
}

const props = defineProps<{
  mode: 'create' | 'edit';
  initialValues: OutletFormValues;
  initialImage?: string | null;
  submitting: boolean;
}>();

const emit = defineEmits<{
  submit: [payload: OutletFormSubmit];
  cancel: [];
}>();

const resolver = zodResolver(
  z.object({
    name: z.string({ error: 'Nama outlet wajib diisi.' }).trim().min(1, { error: 'Nama outlet wajib diisi.' }).max(150),
    location: z.string({ error: 'Lokasi wajib diisi.' }).trim().min(1, { error: 'Lokasi wajib diisi.' }),
    guest_session_secret: z.string().nullable().optional(),
    is_active: z.boolean(),
    shift_required: z.boolean(),
    cash_out_daily_limit: z.number().min(0, { error: 'Batas tidak boleh negatif.' }).nullable().optional(),
    auto_close_time: z
      .string()
      .regex(/^([01]\d|2[0-3]):[0-5]\d$/, { error: 'Format jam HH:mm, mis. 23:00.' })
      .or(z.literal(''))
      .nullable()
      .optional(),
  }),
);

const { selectedUploadId, imagePreview, onUploadImage, onRemoveImage } = useFileUpload();
onMounted(() => {
  if (props.initialImage) imagePreview.value = props.initialImage;
});

const onSubmit = ({ valid, values }: { valid: boolean; values: any }) => {
  if (props.submitting) return;
  if (!valid) {
    showToast({ type: 'warn', title: 'Belum lengkap', message: 'Periksa kolom yang ditandai merah.' });
    return;
  }
  const slug = slugify(values.name ?? '');
  if (props.mode === 'create' && !slug) {
    showToast({ type: 'warn', title: 'Nama belum valid', message: 'Nama outlet harus berisi huruf atau angka.' });
    return;
  }
  emit('submit', {
    values: { ...values, name: String(values.name).trim(), location: String(values.location).trim() },
    slug,
    uploadId: selectedUploadId.value,
    imageCleared: Boolean(props.initialImage) && !imagePreview.value,
  });
};
</script>
