import axios from 'axios';

const isProduction = process.env.NODE_ENV === 'production';

const API_URL = isProduction 
    ? 'https://store-rating-app-i0p8.onrender.com/api' 
    : 'http://localhost:5000/api';                    

const api = axios.create({
    baseURL: API_URL,
});

console.log(`API is using base URL: ${API_URL}`); 

api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers['Authorization'] = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

export default api;