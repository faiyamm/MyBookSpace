import axios from 'axios';
const API_BASE_URL = 'http://127.0.0.1:5000/api';

const apiClient = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// interceptor to add jwt token to all requests
apiClient.interceptors.request.use((config) => {
    const token = localStorage.getItem('jwt_token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// interceptor to handle responses
apiClient.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            // invalid or expired token
            localStorage.removeItem('jwt_token');
            localStorage.removeItem('user_role');
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

export default apiClient;