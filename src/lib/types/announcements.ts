export interface Announcement {
  id: string;
  title: string;
  content: string;
  targetAudience: 'ALL' | 'TEACHERS' | 'PARENTS' | 'CLASS_SPECIFIC';
  isPublished: boolean;
  publishedAt: string | null;
  expiresAt: string | null;
  attachmentUrls?: string[];
  createdBy: string;
  createdAt: string;
}

export interface CreateAnnouncementRequest {
  title: string;
  content: string;
  targetAudience: 'ALL' | 'TEACHERS' | 'PARENTS' | 'CLASS_SPECIFIC';
  expiresAt?: string;
  attachmentUrls?: string[];
}

export interface UpdateAnnouncementRequest extends Partial<CreateAnnouncementRequest> {}
