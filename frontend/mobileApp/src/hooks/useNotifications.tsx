// src/hooks/useNotifications.ts
import { useState, useEffect, useCallback } from 'react';
import { NotificationData } from '../types/queue.types';
import { mockNotificationService } from '../services/mockNotificationService';

export const useNotifications = () => {
  const [notifications, setNotifications] = useState<NotificationData[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [unreadCount, setUnreadCount] = useState<number>(0);

  const fetchNotifications = useCallback(async () => {
    try {
      const data = await mockNotificationService.getNotifications();
      setNotifications(data);
      setUnreadCount(data.filter(n => !n.read).length);
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  const markAsRead = useCallback(async (notificationId: string) => {
    try {
      await mockNotificationService.markAsRead(notificationId);
      setNotifications(prev =>
        prev.map(notification =>
          notification.id === notificationId
            ? { ...notification, read: true }
            : notification
        )
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
    }
  }, []);

  const addNotification = useCallback(async (notification: Omit<NotificationData, 'id' | 'createdAt'>) => {
    try {
      await mockNotificationService.addNotification(notification);
      await fetchNotifications();
    } catch (error) {
      console.error('Failed to add notification:', error);
    }
  }, [fetchNotifications]);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  return {
    notifications,
    loading,
    unreadCount,
    markAsRead,
    addNotification,
    refetch: fetchNotifications,
  };
};
