// src/services/mockNotificationService.ts
import { NotificationData } from '../types/queue.types';

class MockNotificationService {
  private notifications: NotificationData[] = [
    {
      id: '1',
      title: 'Queue Update',
      message: 'Your position in queue has been updated',
      type: 'queue_update',
      createdAt: new Date(),
      read: false,
    },
    {
      id: '2',
      title: 'Document Required',
      message: 'Please upload your ID document',
      type: 'document_status',
      createdAt: new Date(Date.now() - 3600000),
      read: true,
    },
  ];

  async getNotifications(): Promise<NotificationData[]> {
    return Promise.resolve(this.notifications);
  }

  async markAsRead(id: string): Promise<void> {
    const notification = this.notifications.find(n => n.id === id);
    if (notification) {
      notification.read = true;
    }
    return Promise.resolve();
  }

  async markAllAsRead(): Promise<void> {
    this.notifications.forEach(n => n.read = true);
    return Promise.resolve();
  }

  async addNotification(notification: Omit<NotificationData, 'id' | 'createdAt'>): Promise<void> {
    const newNotification: NotificationData = {
      ...notification,
      id: Date.now().toString(),
      createdAt: new Date(),
    };
    this.notifications.unshift(newNotification);
    return Promise.resolve();
  }
}

export const mockNotificationService = new MockNotificationService();
