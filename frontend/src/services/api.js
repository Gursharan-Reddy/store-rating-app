import axios from 'axios';

// Determine the correct backend URL based on the environment.
// When you run `npm start` locally, process.env.NODE_ENV is 'development'.
// When Vercel builds your app for deployment, it sets process.env.NODE_ENV to 'production'.
const isProduction = process.env.NODE_ENV === 'production';

// ✅ This is the bulletproof fix.
const API_URL = isProduction 
    ? 'https://store-rating-app-i0p8.onrender.com/api' // The live URL for Vercel
    : 'http://localhost:5000/api';                     // The local URL for development

// Create the Axios instance with the dynamically chosen URL.
const api = axios.create({
    baseURL: API_URL,
});

console.log(`API is using base URL: ${API_URL}`); // This will help debug in the browser console.

// This interceptor adds the auth token to every request.
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