export interface NotificationItem {
  id: string;
  title: string;
  body: string;
  type: 'INFO' | 'WARNING' | 'SUCCESS' | 'ERROR';
  isRead: boolean;
  actionUrl: string | null;
  createdAt: string;
}
