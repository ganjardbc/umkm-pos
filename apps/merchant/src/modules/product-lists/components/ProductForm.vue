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
                Informasi produk
              </h2>
              <p class="text-xs text-gray-400">
                Nama dan kategori yang dilihat kasir dan pelanggan.
              </p>
            </div>
          </template>

          <div class="space-y-4">
            <UiFormGroup label="Nama produk" variant="vertical">
              <InputText
                name="name"
                type="text"
                maxlength="150"
                placeholder="Contoh: Kopi Susu"
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
                Kode produk: {{ slugify($form.name?.value ?? '') }}
              </small>
            </UiFormGroup>

            <UiFormGroup label="Kategori" variant="vertical">
              <Dropdown
                name="category_id"
                :options="categories"
                option-label="name"
                option-value="id"
                placeholder="Pilih kategori"
                class="w-full"
                show-clear
                :loading="loadingCategories"
                :empty-message="'Belum ada kategori. Tambahkan dulu di menu Kategori.'"
              />
            </UiFormGroup>
          </div>
        </UiCard>

        <UiCard>
          <template #header>
            <div>
              <h2 class="text-base font-semibold">
                Harga
              </h2>
              <p class="text-xs text-gray-400">
                Modal dipakai untuk menghitung laba, tidak tampil di kasir.
              </p>
            </div>
          </template>

          <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <UiFormGroup label="Harga jual" variant="vertical">
              <InputNumber
                name="price"
                placeholder="Rp 0"
                fluid
                :min="0"
                mode="currency"
                currency="IDR"
                locale="id-ID"
              />
              <Message
                v-if="$form.price?.invalid"
                severity="error"
                size="small"
                variant="simple"
              >
                {{ $form.price.error?.message }}
              </Message>
            </UiFormGroup>

            <UiFormGroup label="Modal" variant="vertical">
              <InputNumber
                name="cost"
                placeholder="Rp 0"
                fluid
                :min="0"
                mode="currency"
                currency="IDR"
                locale="id-ID"
              />
              <Message
                v-if="$form.cost?.invalid"
                severity="error"
                size="small"
                variant="simple"
              >
                {{ $form.cost.error?.message }}
              </Message>
            </UiFormGroup>
          </div>

          <ProfitHint
            :price="$form.price?.value"
            :cost="$form.cost?.value"
          />
        </UiCard>

        <UiCard>
          <template #header>
            <div>
              <h2 class="text-base font-semibold">
                Stok
              </h2>
              <p class="text-xs text-gray-400">
                Stok dihitung per outlet<span v-if="outletName">, saat ini <b>{{ outletName }}</b></span>.
              </p>
            </div>
          </template>

          <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <UiFormGroup
              v-if="mode === 'create'"
              label="Stok awal"
              variant="vertical"
            >
              <InputNumber
                name="stock_qty"
                fluid
                :min="0"
                placeholder="0"
              />
              <Message
                v-if="$form.stock_qty?.invalid"
                severity="error"
                size="small"
                variant="simple"
              >
                {{ $form.stock_qty.error?.message }}
              </Message>
            </UiFormGroup>
            <UiFormGroup
              v-else
              label="Stok saat ini"
              variant="vertical"
            >
              <div class="text-2xl font-bold">
                {{ currentStock ?? 0 }}
              </div>
              <small class="text-xs text-gray-400">
                Untuk menambah atau mengurangi stok, pakai "Sesuaikan Stok" di halaman produk.
              </small>
            </UiFormGroup>

            <UiFormGroup label="Batas stok menipis" variant="vertical">
              <InputNumber
                name="min_stock"
                fluid
                :min="0"
                placeholder="0"
              />
              <small class="text-xs text-gray-400">
                Produk ditandai "Stok Menipis" bila stok sama atau di bawah angka ini.
              </small>
              <Message
                v-if="$form.min_stock?.invalid"
                severity="error"
                size="small"
                variant="simple"
              >
                {{ $form.min_stock.error?.message }}
              </Message>
            </UiFormGroup>
          </div>
        </UiCard>

        <UiCard>
          <template #header>
            <div>
              <h2 class="text-base font-semibold">
                Pilihan produk
                <span class="text-xs font-normal text-gray-400">(opsional)</span>
              </h2>
              <p class="text-xs text-gray-400">
                Untuk ukuran, topping, atau tingkat gula. Pelanggan memilihnya saat memesan, dan harga tambahan ikut dihitung.
              </p>
            </div>
          </template>

          <OptionGroupsEditor v-model="optionGroups" />
        </UiCard>
      </div>

      <!-- Side column -->
      <div class="space-y-4 lg:sticky lg:top-4">
        <UiCard>
          <template #header>
            <h2 class="text-base font-semibold">
              Foto produk
            </h2>
          </template>

          <div class="aspect-square w-full overflow-hidden rounded-xl border border-dashed border-gray-300 dark:border-gray-700 flex items-center justify-center bg-gray-50 dark:bg-dark">
            <img
              v-if="imagePreview"
              :src="imagePreview"
              alt="Pratinjau foto produk"
              class="h-full w-full object-cover"
            >
            <div
              v-else
              class="flex flex-col items-center gap-2 text-gray-400"
            >
              <i class="pi pi-image text-4xl" />
              <span class="text-xs">Belum ada foto</span>
            </div>
          </div>

          <div class="flex flex-col gap-2">
            <FileUpload
              mode="basic"
              accept="image/*"
              :choose-label="imagePreview ? 'Ganti foto' : 'Pilih foto'"
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
              label="Hapus foto"
              icon="pi pi-trash"
              @click="onRemoveImage"
            />
            <p class="text-xs text-gray-400">
              JPG, PNG, atau WebP, maksimal 5 MB. Foto persegi paling pas di kartu produk.
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
              <span class="block text-sm font-semibold">Produk aktif</span>
              <span class="block text-xs text-gray-400">
                Produk nonaktif tidak bisa dijual dan disembunyikan dari menu QR pelanggan.
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

    <!-- Actions stay in reach while scrolling a long form; same buttons as the other forms -->
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
import { onMounted, ref } from 'vue';
import { z } from 'zod';
import { zodResolver } from '@primevue/forms/resolvers/zod';
import { useFileUpload } from '@umkm-pos/ui/composables/useFileUpload';
import UiCard from '@umkm-pos/ui/components/UiCard.vue';
import UiFormGroup from '@umkm-pos/ui/components/UiFormGroup.vue';
import ProfitHint from '@/modules/product-lists/components/ProfitHint.vue';
import OptionGroupsEditor from '@/modules/product-lists/components/OptionGroupsEditor.vue';
import { validateOptionGroups, type OptionGroupInput } from '@/modules/product-lists/helpers/options.ts';
import { slugify } from '@/modules/product-lists/helpers/slug.ts';
import { showToast } from '@umkm-pos/ui/helpers/toast';

export interface ProductFormValues {
  name: string;
  category_id: string | null;
  price: number | null;
  cost: number | null;
  stock_qty?: number | null;
  min_stock: number | null;
  is_active: boolean;
}

export interface ProductFormSubmit {
  values: ProductFormValues;
  slug: string;
  optionGroups: OptionGroupInput[];
  uploadId: string | null;
  // true when an existing photo was removed and not replaced
  imageCleared: boolean;
  imagePreview: string | null;
}

const props = defineProps<{
  mode: 'create' | 'edit';
  initialValues: ProductFormValues;
  initialOptionGroups?: OptionGroupInput[];
  initialImage?: string | null;
  categories: any[];
  loadingCategories: boolean;
  outletName?: string;
  currentStock?: number;
  submitting: boolean;
}>();

const emit = defineEmits<{
  submit: [payload: ProductFormSubmit];
  cancel: [];
}>();

const money = (label: string) =>
  z.number({ error: `${label} wajib diisi.` }).min(0, { error: `${label} tidak boleh negatif.` });
const whole = z.number().int().min(0, { error: 'Tidak boleh negatif.' }).nullable().optional();

const resolver = zodResolver(
  z.object({
    name: z.string({ error: 'Nama produk wajib diisi.' }).trim().min(1, { error: 'Nama produk wajib diisi.' }).max(150),
    category_id: z.string().nullable().optional(),
    price: money('Harga jual'),
    cost: z.number().min(0, { error: 'Modal tidak boleh negatif.' }).nullable().optional(),
    stock_qty: whole,
    min_stock: whole,
    is_active: z.boolean(),
  }),
);

const optionGroups = ref<OptionGroupInput[]>(
  JSON.parse(JSON.stringify(props.initialOptionGroups ?? [])),
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
    showToast({ type: 'warn', title: 'Nama belum valid', message: 'Nama produk harus berisi huruf atau angka.' });
    return;
  }
  const optionError = validateOptionGroups(optionGroups.value);
  if (optionError) {
    showToast({ type: 'warn', title: 'Pilihan produk belum lengkap', message: optionError });
    return;
  }
  emit('submit', {
    values: {
      ...values,
      name: String(values.name).trim(),
      price: values.price ?? 0,
      cost: values.cost ?? 0,
      stock_qty: values.stock_qty ?? 0,
      min_stock: values.min_stock ?? 0,
    },
    slug,
    optionGroups: optionGroups.value,
    uploadId: selectedUploadId.value,
    imageCleared: Boolean(props.initialImage) && !imagePreview.value,
    imagePreview: imagePreview.value,
  });
};
</script>
