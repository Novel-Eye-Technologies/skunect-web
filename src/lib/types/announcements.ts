export interface Announcement {
  id: string;
  title: string;
  content: string;
  targetAudience: 'ALL' | 'TEACHERS' | 'PARENTS' | 'STUDENTS';
  priority: 'LOW' | 'NORMAL' | 'HIGH' | 'URGENT';
  status: 'DRAFT' | 'PUBLISHED';
  publishedAt: string | null;
  expiresAt: string | null;
  attachmentUrls?: string[];
  createdBy: string;
  createdAt: string;
}

export interface CreateAnnouncementRequest {
  title: string;
  content: string;
  targetAudience: 'ALL' | 'TEACHERS' | 'PARENTS' | 'STUDENTS';
  priority: 'LOW' | 'NORMAL' | 'HIGH' | 'URGENT';
  expiresAt?: string;
  attachmentUrls?: string[];
}

export interface UpdateAnnouncementRequest extends Partial<CreateAnnouncementRequest> {}
