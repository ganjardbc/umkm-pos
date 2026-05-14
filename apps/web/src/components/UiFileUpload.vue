<template>
  <UiFormGroup label="Image" variant="vertical">
    <div class="flex items-start gap-4">
      <div
        v-if="previewUrl"
        class="w-28 h-28 rounded-lg overflow-hidden border border-gray-200 flex-shrink-0"
      >
        <img
          :src="previewUrl"
          alt="Preview"
          class="w-full h-full object-cover"
        />
      </div>
      <div
        v-else
        class="w-28 h-28 rounded-lg border-2 border-dashed border-gray-300 flex items-center justify-center flex-shrink-0"
      >
        <i class="pi pi-image text-3xl text-gray-400" />
      </div>
      <div class="flex flex-col gap-2">
        <FileUpload
          mode="basic"
          accept="image/*"
          :chooseLabel="previewUrl ? 'Change Image' : 'Choose Image'"
          customUpload
          @select="onSelect"
        />
        <Button
          v-if="previewUrl"
          severity="danger"
          variant="outlined"
          size="small"
          label="Remove"
          icon="pi pi-trash"
          @click="onRemove"
        />
        <p class="text-xs text-gray-400">
          Allowed: JPG, PNG, WebP. Max 5MB.
        </p>
      </div>
    </div>
  </UiFormGroup>
</template>

<script setup lang="ts">
const props = defineProps<{
  previewUrl: string | null
}>()

const emit = defineEmits<{
  select: [event: any]
  remove: []
}>()

const onSelect = (event: any) => {
  emit('select', event)
}

const onRemove = () => {
  emit('remove')
}
</script>
