import api from './api';
export const getStoresForUser = (params) => api.get('/users/stores', { params });
export const submitRating = (ratingData) => api.post('/users/ratings', ratingData);