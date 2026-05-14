import api from '@/plugins/axios.ts';

export const getListShift = async (data: any, options: any = {}) => {
  return await api.get(
    '/api/v1/shifts',
    { params: data, ...(options || {}) },
  );
};

export const getDetailShift = async (id: string | number, options: any = {}) => {
  return await api.get(
    `/api/v1/shifts/${id}`,
    { ...(options || {}) },
  );
};

export const getUserShift = async (userId: string | number, options: any = {}) => {
  return await api.get(
    `/api/v1/shifts/user/${userId}`,
    { ...(options || {}) },
  );
};

export const getOutletShift = async (outletId: string | number, options: any = {}) => {
  return await api.get(
    `/api/v1/shifts/outlet/${outletId}`,
    { ...(options || {}) },
  );
};

export const openShift = async (data: any, options: any = {}) => {
  return await api.post(
    `/api/v1/shifts`,
    data,
    { ...(options || {}) },
  );
};

export const closeShift = async (id: string | number, options: any = {}) => {
  return await api.patch(
    `/api/v1/shifts/${id}/close`,
    { ...(options || {}) },
  );
};

export const getShiftParticipants = async (shiftId: string | number, options: any = {}) => {
  return await api.get(
    `/api/v1/shifts/${shiftId}/participants`,
    { ...(options || {}) },
  );
};

export const addParticipant = async (shiftId: string | number, data: any, options: any = {}) => {
  return await api.post(
    `/api/v1/shifts/${shiftId}/participants`,
    data,
    { ...(options || {}) },
  );
};

export const removeParticipant = async (shiftId: string | number, userId: string | number, options: any = {}) => {
  return await api.delete(
    `/api/v1/shifts/${shiftId}/participants/${userId}`,
    { ...(options || {}) },
  );
};

export const restoreParticipant = async (shiftId: string | number, userId: string | number, options: any = {}) => {
  return await api.patch(
    `/api/v1/shifts/${shiftId}/participants/${userId}/restore`,
    {},
    { ...(options || {}) },
  );
};

export const handoffShift = async (shiftId: string | number, data: any, options: any = {}) => {
  return await api.post(
    `/api/v1/shifts/${shiftId}/handoff`,
    data,
    { ...(options || {}) },
  );
};

export const getShiftAuditLog = async (shiftId: string | number, params: any = {}, options: any = {}) => {
  return await api.get(
    `/api/v1/shifts/${shiftId}/audit-log`,
    { params, ...(options || {}) },
  );
};

export const getParticipantMetrics = async (shiftId: string | number, userId: string | number, options: any = {}) => {
  return await api.get(
    `/api/v1/shifts/${shiftId}/participants/${userId}/metrics`,
    { ...(options || {}) },
  );
};
