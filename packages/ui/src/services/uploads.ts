import { getApiClient } from '../http';

/** Upload a raw file and get back an upload record. */
export const postUpload = async (file: File, options: any = {}) => {
  const formData = new FormData();
  formData.append('file', file);
  return await getApiClient().post('/api/v1/uploads', formData, {
    ...(options || {}),
    headers: {
      'Content-Type': undefined,
      ...((options && options.headers) || {}),
    },
  });
};

/** Exchange an upload id for a time-limited URL the browser can render. */
export const getUploadSignedUrl = async (id: string, options: any = {}) => {
  return await getApiClient().get(`/api/v1/uploads/${id}/signed-url`, { ...(options || {}) });
};
