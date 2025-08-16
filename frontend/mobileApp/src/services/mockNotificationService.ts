// src/services/mockNotificationService.ts
export interface NotificationData {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'warning' | 'success' | 'error';
  timestamp: Date;
  read: boolean;
}

class MockNotificationService {
  private notifications: NotificationData[] = [
    {
      id: '1',
      title: 'Queue Update',
      message: 'Your position in queue has been updated',
      type: 'info',
      timestamp: new Date(),
      read: false,
    },
    {
      id: '2',
      title: 'Document Required',
      message: 'Please upload your ID document',
      type: 'warning',
      timestamp: new Date(Date.now() - 3600000),
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

  async addNotification(notification: Omit<NotificationData, 'id'>): Promise<void> {
    const newNotification: NotificationData = {
      ...notification,
      id: Date.now().toString(),
    };
    this.notifications.unshift(newNotification);
    return Promise.resolve();
  }
}

export const mockNotificationService = new MockNotificationService();
