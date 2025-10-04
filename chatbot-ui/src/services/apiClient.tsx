// src/api/apiClient.ts
import axios, { AxiosInstance } from 'axios';
import { navigateTo } from './navigationService'; // Import the navigation service

// Tạo một Axios instance với cấu hình chung
const apiClient: AxiosInstance = axios.create({
  baseURL:'http://localhost:5000/api',
  timeout: 30000,                 // Thời gian chờ tối đa (milliseconds) - tăng lên 30s cho AI assessment
  headers: {
    'Content-Type': 'application/json',
    'ngrok-skip-browser-warning': 'true'  // Chỉ cần dòng này

    // Thêm các header mặc định khác nếu cần thiết (ví dụ: Authorization)
  },
});

// Interceptor cho request (tùy chọn)
apiClient.interceptors.request.use(
  (config) => {
    // Ví dụ: Thêm token vào header trước khi gửi request
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

apiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    console.error('API Error:', error);

    if (error.response && (error.response.status === 401 || error.response.status === 403)) {
      localStorage.removeItem('user')
      localStorage.removeItem('token');

      // Only redirect if not already on the welcome page
      if (window.location.pathname !== '/welcome') {
        navigateTo('/welcome'); // Use the navigation service
      }
    }

    return Promise.reject(error);
  }
);

export default apiClient;