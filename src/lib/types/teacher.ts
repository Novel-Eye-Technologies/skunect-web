export interface TeacherListItem {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string | null;
  status: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED';
  lastLogin: string | null;
  createdAt: string;
  assignedClasses?: string[];
}

export interface AssignSubjectRequest {
  teacherId: string;
  classId: string;
  subjectId: string;
}
