import customerApi from '@/plugins/customer-api.ts';

export const startCustomerSession = async (data: any) => {
  return customerApi.post('/api/v1/customer-sessions/start', data);
};

export const getCustomerSessionMe = async () => {
  return customerApi.get('/api/v1/catalog/session/me');
};

export const getCustomerSessionStatus = async () => {
  return customerApi.get('/api/v1/catalog/session/status');
};

export const getCatalogShiftStatus = async (outletId: string) => {
  return customerApi.get('/api/v1/catalog/shift-status', {
    params: { outlet_id: outletId },
  });
};

export const getCatalogCategories = async (outletId: string) => {
  return customerApi.get('/api/v1/catalog/categories', {
    params: { outlet_id: outletId },
  });
};

export const getCatalogProducts = async (params: any) => {
  return customerApi.get('/api/v1/catalog/products', { params });
};

export const getCatalogTables = async (outletId: string) => {
  return customerApi.get('/api/v1/catalog/tables', {
    params: { outlet_id: outletId },
  });
};

export const postCatalogOrder = async (data: any) => {
  return customerApi.post('/api/v1/catalog/orders', data);
};

export const getCatalogOrder = async (orderId: string) => {
  return customerApi.get(`/api/v1/catalog/orders/${orderId}`);
};
