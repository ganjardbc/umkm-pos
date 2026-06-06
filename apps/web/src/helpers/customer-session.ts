const CUSTOMER_SESSION_KEY = 'CUSTOMER_SESSION';

export const getCustomerSession = () => {
  const value = localStorage.getItem(CUSTOMER_SESSION_KEY);
  return value ? JSON.parse(value) : null;
};

export const setCustomerSession = (session: any) => {
  localStorage.setItem(CUSTOMER_SESSION_KEY, JSON.stringify(session));
};

export const clearCustomerSession = () => {
  localStorage.removeItem(CUSTOMER_SESSION_KEY);
};

export const getCustomerSessionToken = () => {
  return getCustomerSession()?.session_token || '';
};
