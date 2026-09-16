import api from '@/plugins/axios'

// Generic upload endpoints are shared; the attach/detach endpoints below are
// admin-scoped and stay here.
export { postUpload, getUploadSignedUrl } from '@umkm-pos/ui/services/uploads'

export const setMerchantImage = async (id: string, upload_id: string, options: any = {}) => {
  return await api.patch(`/api/v1/admin/merchants/${id}/image`, { upload_id }, { ...(options || {}) })
}

export const removeMerchantImage = async (id: string, options: any = {}) => {
  return await api.delete(`/api/v1/admin/merchants/${id}/image`, { ...(options || {}) })
}

export const setOutletImage = async (id: string, upload_id: string, options: any = {}) => {
  return await api.patch(`/api/v1/admin/outlets/${id}/image`, { upload_id }, { ...(options || {}) })
}

export const removeOutletImage = async (id: string, options: any = {}) => {
  return await api.delete(`/api/v1/admin/outlets/${id}/image`, { ...(options || {}) })
}

export const setUserAvatar = async (id: string, upload_id: string, options: any = {}) => {
  return await api.patch(`/api/v1/admin/users/${id}/avatar`, { upload_id }, { ...(options || {}) })
}

export const removeUserAvatar = async (id: string, options: any = {}) => {
  return await api.delete(`/api/v1/admin/users/${id}/avatar`, { ...(options || {}) })
}
