import { ref } from 'vue'
import { postUpload } from '@/services/uploads'
import { showLoading, hideLoading } from '@/helpers/loading'
import { showToast } from '@/helpers/toast'

export function useFileUpload() {
  const selectedUploadId = ref<string | null>(null)
  const imagePreview = ref<string | null>(null)
  const isUploading = ref(false)

  const onUploadImage = async (event: any) => {
    const file = event.files?.[0]
    if (!file) return

    showLoading()
    isUploading.value = true

    try {
      const response = await postUpload(file)
      const { success, data } = response?.data || {}
      if (success) {
        selectedUploadId.value = data?.id
        imagePreview.value = data?.url
      }
    } catch (error: any) {
      showToast({
        type: 'error',
        title: 'Upload Failed',
        message: error?.response?.data?.message || error?.message || 'Failed to upload file',
      })
    } finally {
      hideLoading()
      isUploading.value = false
    }
  }

  const onRemoveImage = () => {
    selectedUploadId.value = null
    imagePreview.value = null
  }

  const resetUpload = () => {
    selectedUploadId.value = null
    imagePreview.value = null
    isUploading.value = false
  }

  return {
    selectedUploadId,
    imagePreview,
    isUploading,
    onUploadImage,
    onRemoveImage,
    resetUpload,
  }
}
