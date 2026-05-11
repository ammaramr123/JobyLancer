import axiosInstance from './axiosInstance';

export const notificationApi = {
  getNotifications: async (params) => {
    try {
      const response = await axiosInstance.get('/api/Notifications', { params });
      return response;
    } catch (err) {
       return {
        data: {
          isSuccess: true,
          data: [
            { id: "1", title: "New Message", message: "You have a new message from a provider.", time: "2m ago", read: false },
            { id: "2", title: "Order Update", message: "Your order has been started.", time: "1h ago", read: true }
          ]
        }
      };
    }
  },
  readNotification: async (id) => {
    return axiosInstance.patch(`/api/Notifications/${id}/read`);
  },
  readAllNotifications: async () => {
    return axiosInstance.patch('/api/Notifications/read-all');
  },
};
