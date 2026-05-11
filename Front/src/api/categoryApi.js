import axiosInstance from './axiosInstance';

export const categoryApi = {
  getCategories: async (params) => {
    return axiosInstance.get('/api/Category', { params });
  },
};
