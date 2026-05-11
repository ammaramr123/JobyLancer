import axiosInstance from './axiosInstance';

export const clientApi = {
  getMyProfile: () => axiosInstance.get('/api/Client/me'),
  updateProfile: (formData) => axiosInstance.put('/api/Client/me', formData),
  deleteAccount: () => axiosInstance.delete('/api/Client/me'),
};
