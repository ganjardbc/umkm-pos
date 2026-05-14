import api from '@/plugins/axios'

export const postUpload = async (file: File, options: any = {}) => {
  const formData = new FormData()
  formData.append('file', file)
  return await api.post('/api/v1/uploads', formData, {
    ...(options || {}),
    headers: {
      'Content-Type': undefined,
      ...((options && options.headers) || {}),
    },
  })
}

export const setProductImage = async (id: string, upload_id: string, options: any = {}) => {
  return await api.patch(`/api/v1/products/${id}/image`, { upload_id }, { ...(options || {}) })
}

export const removeProductImage = async (id: string, options: any = {}) => {
  return await api.delete(`/api/v1/products/${id}/image`, { ...(options || {}) })
}

export const setMerchantImage = async (id: string, upload_id: string, options: any = {}) => {
  return await api.patch(`/api/v1/merchants/${id}/image`, { upload_id }, { ...(options || {}) })
}

export const removeMerchantImage = async (id: string, options: any = {}) => {
  return await api.delete(`/api/v1/merchants/${id}/image`, { ...(options || {}) })
}

export const setOutletImage = async (id: string, upload_id: string, options: any = {}) => {
  return await api.patch(`/api/v1/outlets/${id}/image`, { upload_id }, { ...(options || {}) })
}

export const removeOutletImage = async (id: string, options: any = {}) => {
  return await api.delete(`/api/v1/outlets/${id}/image`, { ...(options || {}) })
}

export const setUserAvatar = async (id: string, upload_id: string, options: any = {}) => {
  return await api.patch(`/api/v1/users/${id}/avatar`, { upload_id }, { ...(options || {}) })
}

export const removeUserAvatar = async (id: string, options: any = {}) => {
  return await api.delete(`/api/v1/users/${id}/avatar`, { ...(options || {}) })
}
