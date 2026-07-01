import api from '../services/api';

export const fetchProducts = async () => {
  const { data } = await api.get('/products');
  return data.products || [];
};

export const fetchCart = async () => {
  const { data } = await api.get('/cart');
  return data;
};

export const addToCart = async (payload) => {
  const { data } = await api.post('/cart', payload);
  return data;
};

export const updateCartItem = async (itemId, payload) => {
  const { data } = await api.put(`/cart/${itemId}`, payload);
  return data;
};

export const removeCartItem = async (itemId) => {
  const { data } = await api.delete(`/cart/${itemId}`);
  return data;
};

export const clearCart = async () => {
  const { data } = await api.delete('/cart');
  return data;
};

export const createOrder = async (payload) => {
  const { data } = await api.post('/orders', payload);
  return data;
};

export const fetchOrders = async () => {
  const { data } = await api.get('/orders');
  return data;
};

export const createMaintenanceRequest = async (payload) => {
  const { data } = await api.post('/maintenance', payload);
  return data;
};

export const fetchMaintenanceRequests = async () => {
  const { data } = await api.get('/maintenance');
  return data;
};

export const fetchAdminStats = async () => {
  const { data } = await api.get('/admin/stats');
  return data;
};

export const fetchAdminInventory = async () => {
  const { data } = await api.get('/admin/inventory');
  return data;
};

export const fetchAdminOrders = async () => {
  const { data } = await api.get('/orders/admin/all');
  return data.orders || [];
};

export const fetchAdminMaintenance = async () => {
  const { data } = await api.get('/maintenance/admin/all');
  return data || [];
};

export const fetchMe = async () => {
  const { data } = await api.get('/auth/me');
  return data;
};
