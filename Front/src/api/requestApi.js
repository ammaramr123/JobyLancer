import axiosInstance from './axiosInstance';

export const requestApi = {
  createRequest: async (data) => {
    return axiosInstance.post('/api/Request', data);
  },
  getClientRequests: async (params) => {
    return axiosInstance.get('/api/Request/client', { params });
  },
  getProviderRequests: async (params) => {
    return axiosInstance.get('/api/Request/Provider', { params });
  },
  getRequestById: async (id) => {
    return axiosInstance.get(`/api/Request/${id}`);
  },
  acceptRequest: async (id) => {
    return axiosInstance.put(`/api/Request/${id}/accept`);
  },
  rejectRequest: async (id, reason) => {
    return axiosInstance.put(`/api/Request/${id}/reject`, { reason });
  },
  completeRequest: async (id) => {
    return axiosInstance.put(`/api/Request/${id}/complete`);
  },
  getAdminRequests: (params) => {
    return axiosInstance.get('/api/Request/admin', { params });
  },
};
