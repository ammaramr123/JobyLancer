import axiosInstance from './axiosInstance';

export const adminApi = {
  getProviders: (params) => axiosInstance.get('/api/Admin/providers', { params }),
  getClients: (params) => axiosInstance.get('/api/Admin/clients', { params }),
  approveProvider: (id) =>
  axiosInstance.patch(`/api/Admin/providers/${id}/approve`),

rejectProvider: (id) =>
  axiosInstance.patch(`/api/Admin/providers/${id}/reject`)
};
