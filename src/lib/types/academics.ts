export interface Assessment {
  id: string;
  schoolId: string;
  classId: string;
  className: string;
  subjectId: string;
  subjectName: string;
  termId: string;
  termName: string;
  type: 'CA1' | 'CA2' | 'CA3' | 'EXAM';
  title: string;
  maxScore: number;
  date: string;
  createdBy: string;
  createdAt: string;
}

export interface CreateAssessmentRequest {
  classId: string;
  subjectId: string;
  termId: string;
  type: 'CA1' | 'CA2' | 'CA3' | 'EXAM';
  maxScore: number;
  title?: string;
}

export interface UpdateAssessmentRequest extends Partial<CreateAssessmentRequest> {}

export interface StudentScore {
  studentId: string;
  studentName: string;
  admissionNumber: string;
  score: number | null;
}

export interface BulkScoreEntry {
  studentId: string;
  score: number;
}

export interface BulkScoreRequest {
  scores: BulkScoreEntry[];
}

export interface ReportCard {
  id: string;
  studentId: string;
  studentName: string;
  admissionNumber: string;
  classId: string;
  className: string;
  termId: string;
  termName: string;
  sessionName: string;
  status: 'DRAFT' | 'PUBLISHED';
  totalScore: number;
  average: number;
  position: number;
  totalStudents: number;
  generatedAt: string;
}

export interface GenerateReportCardsRequest {
  classId: string;
  termId: string;
}
