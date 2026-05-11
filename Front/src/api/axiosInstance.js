import axios from 'axios';

const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5186',
});

// Add a request interceptor to include the auth token
axiosInstance.interceptors.request.use(
  (config) => {
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

// Add a response interceptor to handle errors globally
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.message === 'Network Error') {
      console.error(
        'Network Error detected. This usually means the API server is not reachable. ' +
        'Check if VITE_API_URL is set correctly in your environment variables. ' +
        'Current baseURL: ' + axiosInstance.defaults.baseURL
      );
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;
