export interface Broadcast {
  id: string;
  schoolId: string;
  title: string;
  content: string;
  targetType: string;
  targetValue: string | null;
  sentBy: string;
  sentByName: string;
  recipientCount: number;
  createdAt: string;
}

export interface CreateBroadcastRequest {
  title: string;
  content: string;
  targetType: string;
  targetValue?: string;
}
