export interface HomeworkListItem {
  id: string;
  title: string;
  classId: string;
  className?: string;
  subjectId: string;
  subjectName?: string;
  assignedDate?: string;
  dueDate: string;
  status?: 'ACTIVE' | 'CLOSED' | 'DRAFT';
  totalSubmissions?: number;
  totalStudents?: number;
  teacherId?: string;
  teacherName?: string;
  description?: string;
  attachmentUrls?: string[];
  createdBy?: string;
  createdAt: string;
}

export interface HomeworkDetail extends HomeworkListItem {
  description: string;
  attachments: HomeworkAttachment[];
  maxScore: number;
}

export interface HomeworkAttachment {
  id: string;
  name: string;
  url: string;
  type: string;
  size: number;
}

export interface CreateHomeworkRequest {
  title: string;
  description: string;
  classId: string;
  subjectId: string;
  assignedDate: string;
  dueDate: string;
  maxScore: number;
  attachmentUrls?: string[];
}

export interface UpdateHomeworkRequest extends Partial<CreateHomeworkRequest> {
  status?: 'ACTIVE' | 'CLOSED' | 'DRAFT';
}

export interface Submission {
  id: string;
  studentId: string;
  studentName: string;
  admissionNumber: string;
  submittedAt: string;
  attachments: HomeworkAttachment[];
  score: number | null;
  feedback: string | null;
  status: 'SUBMITTED' | 'GRADED' | 'LATE';
}

export interface GradeSubmissionRequest {
  score: number;
  feedback?: string;
}
