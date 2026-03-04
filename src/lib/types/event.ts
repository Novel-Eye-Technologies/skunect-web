export interface EventItem {
  id: string;
  schoolId: string;
  title: string;
  description: string | null;
  eventDate: string;
  endDate: string | null;
  location: string | null;
  targetAudience: string;
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
  eventDate: string;
  endDate?: string;
  location?: string;
  targetAudience?: string;
  coordinatorIds?: string[];
}

export interface UpdateEventRequest {
  title?: string;
  description?: string;
  eventDate?: string;
  endDate?: string;
  location?: string;
  targetAudience?: string;
  status?: string;
  coordinatorIds?: string[];
}
