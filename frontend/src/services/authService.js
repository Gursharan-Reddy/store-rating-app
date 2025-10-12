import api from './api';

export const signup = (userData) => api.post('/auth/signup', userData);

export const login = (credentials) => api.post('/auth/login', credentials);

export const updatePassword = (passwordData) => api.put('/auth/update-password', passwordData);

// ✅ Add this function to call the new profile update endpoint
export const updateProfile = (profileData) => api.put('/auth/profile', profileData);