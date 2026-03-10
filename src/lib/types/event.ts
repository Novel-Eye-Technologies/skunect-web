export interface EventItem {
  id: string;
  schoolId: string;
  title: string;
  description: string | null;
  startTime: string;
  endTime: string | null;
  location: string | null;
  classId: string | null;
  className: string | null;
  reminderMinutes: number | null;
  visibility: 'TEACHERS_ONLY' | 'TEACHERS_AND_PARENTS';
  status: string;
  createdBy: string;
  createdByName: string;
  coordinators: CoordinatorInfo[];
  createdAt: string;
}

export interface CoordinatorInfo {
  id: string;
  teacherId: string;
  teacherName: string;
  role: string;
}

export interface CreateEventRequest {
  title: string;
  description?: string;
  startTime: string;
  endTime?: string;
  location?: string;
  classId?: string;
  reminderMinutes?: number;
  visibility?: 'TEACHERS_ONLY' | 'TEACHERS_AND_PARENTS';
  coordinatorIds?: string[];
}

export interface UpdateEventRequest {
  title?: string;
  description?: string;
  startTime?: string;
  endTime?: string;
  location?: string;
  classId?: string;
  reminderMinutes?: number;
  visibility?: 'TEACHERS_ONLY' | 'TEACHERS_AND_PARENTS';
  status?: string;
  coordinatorIds?: string[];
}
