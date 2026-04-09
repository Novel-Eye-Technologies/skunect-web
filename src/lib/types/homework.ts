import type { Api } from '@/lib/api/schema';

// Request types from generated OpenAPI schemas
export type CreateHomeworkRequest = Api['CreateHomeworkRequest'];
export type UpdateSubmissionRequest = Api['UpdateSubmissionRequest'];

// Response types from generated OpenAPI schemas
export type HomeworkListItem = Api['HomeworkResponse'];
export type HomeworkDetail = Api['HomeworkResponse'];
export type Submission = Api['SubmissionResponse'];

export type GradeSubmissionRequest = Api['UpdateSubmissionRequest'];

// No generated schema — keep hand-written
export interface HomeworkAttachment {
  id: string;
  name: string;
  url: string;
  type: string;
  size: number;
}

export interface UpdateHomeworkRequest extends Partial<CreateHomeworkRequest> {
  status?: 'ACTIVE' | 'CLOSED' | 'DRAFT';
}
