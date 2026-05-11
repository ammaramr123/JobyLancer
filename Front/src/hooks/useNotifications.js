import { useEffect, useState, useRef, useCallback } from 'react';
import * as signalR from '@microsoft/signalr';
import { useAuthStore } from '@/store/authStore';
import { notificationApi } from '@/api/notificationApi';
import { toast } from 'sonner';

const useNotifications = () => {
  const { user, token } = useAuthStore();
  const [notifications, setNotifications] = useState([]);
  const [isConnected, setIsConnected] = useState(false);
  const connectionRef = useRef(null);

  const fetchNotifications = useCallback(async () => {
    if (!user) return;
    try {
      const res = await notificationApi.getNotifications({ PageSize: 20 });
      const data = res?.data?.data?.data || res?.data?.data || [];
      setNotifications(data);
    } catch (err) {
      console.error('Failed to fetch notifications:', err);
    }
  }, [user]);

  useEffect(() => {
    if (!user || !token) {
      setNotifications([]);
      setIsConnected(false);
      return;
    }

    fetchNotifications();

    const hubUrl = import.meta.env.VITE_API_URL
      ? `${import.meta.env.VITE_API_URL}/notificationHub`
      : '/notificationHub';

    const connection = new signalR.HubConnectionBuilder()
      .withUrl(hubUrl, {
        accessTokenFactory: () => token,
      })
      .withAutomaticReconnect()
      .configureLogging(signalR.LogLevel.Information)
      .build();

    connectionRef.current = connection;

    const startConnection = async () => {
      try {
        await connection.start();
        setIsConnected(true);
        console.log('SignalR Connected.');

        try {
          await connection.invoke('JoinAdminGroup');
        } catch (e) {
          console.warn('JoinAdminGroup not implemented on server.');
        }
      } catch (err) {
        console.error('SignalR Connection Error:', err);
        setIsConnected(false);
      }
    };

    connection.on('ReceiveNotification', async (notification) => {
      await fetchNotifications();

      toast.info(notification.subject || 'Notification', {
        description: notification.body,
        duration: 5000,
      });

      window.dispatchEvent(new CustomEvent('new-notification', { detail: notification }));
    });

    startConnection();

    const pollInterval = setInterval(() => {
      if (!isConnected) {
        fetchNotifications();
      }
    }, 30000);

    return () => {
      if (connectionRef.current) {
        connectionRef.current.off('ReceiveNotification');
        connectionRef.current.stop();
      }
      clearInterval(pollInterval);
    };
  }, [user, token, isConnected, fetchNotifications]);

  const markAsRead = async (id) => {
    try {
      await notificationApi.readNotification(id);
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
    } catch (err) {
      console.error('Failed to mark notification as read:', err);
    }
  };

  const markAllAsRead = async () => {
    try {
      await notificationApi.readAllNotifications();
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
    } catch (err) {
      console.error('Failed to mark all as read:', err);
    }
  };

  return {
    notifications: Array.isArray(notifications) ? notifications : [],
    isConnected,
    refresh: fetchNotifications,
    markAsRead,
    markAllAsRead
  };
};

export default useNotifications;