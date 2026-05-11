import axiosInstance from './axiosInstance';

export const providerApi = {
  getProfile: async (id) => {
    return axiosInstance.get(`/api/Provider/profile/${id}`);
  },
  getMyProfile: async () => {
    return axiosInstance.get('/api/Provider/me');
  },
  updateProfile: async (data) => {
    return axiosInstance.put('/api/Provider/me', data);
  },
  deleteAccount: async () => {
    return axiosInstance.delete('/api/Provider/me');
  },
  createService: async (data) => {
    return axiosInstance.post('/api/Services', data);
  },
  updateService: async (id, data) => {
    return axiosInstance.put(`/api/Services/${id}`, data);
  },
  deleteService: async (id) => {
    return axiosInstance.delete(`/api/Services/${id}`);
  },
};
