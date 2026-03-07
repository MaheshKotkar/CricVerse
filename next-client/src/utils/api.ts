import axios from 'axios';

const api = axios.create({
    baseURL: '/api',
    headers: { 'Content-Type': 'application/json' },
});

// Attach JWT token to every request automatically
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('cricverse_token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// Handle 401 — auto logout
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            localStorage.removeItem('cricverse_token');
            localStorage.removeItem('cricverse_user');
            window.location.href = '/auth';
        }
        return Promise.reject(error);
    }
);

export default api;
