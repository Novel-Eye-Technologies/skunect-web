import type { Api } from '@/lib/api/schema';

// Request types from generated OpenAPI schemas
export type CreateAnnouncementRequest = Api['CreateAnnouncementRequest'];
export type UpdateAnnouncementRequest = Api['UpdateAnnouncementRequest'];

// Response type — generated schema has all fields optional, keep hand-written
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
