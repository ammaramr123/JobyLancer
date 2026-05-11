import axiosInstance from './axiosInstance';

export const authApi = {
  login: async (credentials) => {
    return axiosInstance.post('/api/Auth/login', credentials);
  },
  register: async (userData) => {
    return axiosInstance.post('/api/Auth/register', userData);
  },
  forgotPassword: async (email) => {
    return axiosInstance.post('/api/Auth/forgot-password', { email });
  },
  verifyOtp: async (data) => {
    return axiosInstance.post('/api/Auth/verify-otp', data);
  },
  resetPassword: async (data) => {
    return axiosInstance.post('/api/Auth/reset-password', data);
  },
};
