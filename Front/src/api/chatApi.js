import axiosInstance from './axiosInstance';
export const chatApi = {
  getInbox: async () => {
    return axiosInstance.get('/api/Chat/inbox');
  },
  getChatHistory: async (requestId) => {
    return axiosInstance.get(`/api/Chat/${requestId}/history`);
  },
  markAsRead: async (requestId) => {
    return axiosInstance.put(`/api/Chat/${requestId}/read`);
  },
};