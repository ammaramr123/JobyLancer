import axiosInstance from './axiosInstance';

export const reviewApi = {
  createReview: async (data) => {
    return axiosInstance.post('/api/Review', data);
  },
  getReviewById: async (id) => {
    return axiosInstance.get(`/api/Review/${id}`);
  },
  getServiceReviews: async (serviceId) => {
    return axiosInstance.get(`/api/Review/service/${serviceId}`);
  },
  getProviderReviews: async (providerId) => {
    return axiosInstance.get(`/api/Review/provider/${providerId}`);
  },
  getMyReviews: async () => {
    return axiosInstance.get('/api/Review/me');
  },
  updateReview: async (id, data) => {
    return axiosInstance.put(`/api/Review/${id}`, data);
  },
  deleteReview: async (id) => {
    return axiosInstance.delete(`/api/Review/${id}`);
  },
};
