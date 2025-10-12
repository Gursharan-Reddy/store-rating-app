import api from './api';

export const getDashboardStats = () => api.get('/admin/dashboard-stats');
export const getUsers = (params) => api.get('/admin/users', { params });
export const getStores = (params) => api.get('/admin/stores', { params });

// ✅ Add this function
export const createUser = (userData) => api.post('/admin/users', userData);