import axios from 'axios';

// Cấu hình URL cơ sở
export const API_BASE_URL = "http://localhost:8081/api";
export const ORDER_API_URL = "http://localhost:8082/api"; 
export const AI_API_URL = "http://127.0.0.1:8000";

const axiosClient = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Interceptor: Tự động đính kèm Token vào mọi request
axiosClient.interceptors.request.use((config) => {
    const token = localStorage.getItem("token");
    const sessionId = sessionStorage.getItem("sessionId");
    
    if (token) config.headers.Authorization = `Bearer ${token}`;
    if (sessionId) config.headers["X-Session-ID"] = sessionId;
    
    return config;
});

export default axiosClient;