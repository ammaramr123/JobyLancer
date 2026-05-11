import axiosInstance from './axiosInstance';

export const servicesApi = {
  getServices: async (params) => {
    return axiosInstance.get('/api/Services', { params });
  },
  getServiceById: async (id) => {
    return axiosInstance.get(`/api/Services/${id}`);
  },
  getProviderServices: async (providerId, params) => {
    return axiosInstance.get(`/api/Services/provider/${providerId}`, { params });
  },
  createService: async (formData) => {
    return axiosInstance.post('/api/Services', formData);
  },
  updateService: async (id, data) => {
    return axiosInstance.put(`/api/Services/${id}`, data);
  },
  deleteService: async (id) => {
    return axiosInstance.delete(`/api/Services/${id}`);
  },
  updateServiceStatus: (id, data) => {
    return axiosInstance.patch(`/api/Services/${id}/status`, data);
  },
};
