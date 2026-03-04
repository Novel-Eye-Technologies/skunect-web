export interface ParentDashboardData {
  childrenCount: number;
  todayAttendance: string;
  pendingFees: number;
  pendingHomework: number;
  children: ChildSummary[];
  upcomingFees: UpcomingFee[];
  recentHomework: RecentHomeworkItem[];
}

export interface ChildSummary {
  studentId: string;
  name: string;
  className: string;
  attendance: string;
  recentGrade: string;
}

export interface UpcomingFee {
  childName: string;
  description: string;
  amount: number;
  dueDate: string;
  status: string;
}

export interface RecentHomeworkItem {
  childName: string;
  subject: string;
  title: string;
  dueDate: string;
  status: string;
}
