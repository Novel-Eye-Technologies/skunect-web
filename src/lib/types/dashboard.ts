// ─── Admin Dashboard ────────────────────────────────────────────────

export interface AdminDashboardData {
  totalStudents: number;
  activeStudents: number;
  totalTeachers: number;
  todayAttendanceRate: number;
  todayPresentCount: number;
  todayAbsentCount: number;
  totalFeesBilled: number;
  totalFeesCollected: number;
  totalFeesOutstanding: number;
  feeCollectionRate: number;
  activeEmergencyAlerts: number;
  totalClasses: number;
}

export interface AttendanceDailyBreakdown {
  date: string;
  present: number;
  absent: number;
  late: number;
  rate: number;
}

export interface AttendanceSummaryData {
  totalRecords: number;
  presentCount: number;
  absentCount: number;
  lateCount: number;
  attendanceRate: number;
  dailyBreakdown: AttendanceDailyBreakdown[];
}

export interface FeeSummaryData {
  totalBilled: number;
  totalCollected: number;
  totalOutstanding: number;
  collectionRate: number;
  totalInvoices: number;
  paidInvoices: number;
  pendingInvoices: number;
  overdueInvoices: number;
}

// ─── Teacher Dashboard ──────────────────────────────────────────────

export interface TeacherDashboardData {
  myClassesCount: number;
  totalStudentsCount: number;
  todayAttendanceRate: number;
  pendingHomeworkCount: number;
  classAttendance: ClassAttendanceItem[];
  upcomingAssignments: UpcomingAssignmentItem[];
  dailySchedule: DailyScheduleItem[];
}

export interface DailyScheduleItem {
  periodNumber: number;
  className: string;
  subjectName: string | null;
  startTime: string;
  endTime: string;
  durationMinutes: number;
  label: string | null;
}

export interface ClassAttendanceItem {
  className: string;
  present: number;
  total: number;
  percentage: number;
}

export interface UpcomingAssignmentItem {
  id: string;
  title: string;
  className: string;
  dueDate: string;
  submissionRate: number;
  status: string;
}

// ─── Parent Dashboard ───────────────────────────────────────────────

export interface ParentDashboardData {
  childrenCount: number;
  todayAttendance: string;
  pendingFees: number;
  pendingHomework: number;
  children: ChildSummary[];
  upcomingFees: UpcomingFee[];
  recentHomework: RecentHomeworkItem[];
  // Enhanced fields (optional for backward compat with backend)
  academicPerformance?: AcademicPerformance;
  attendanceMetrics?: AttendanceMetrics;
  recentAssessments?: RecentAssessment[];
  subjectPerformance?: SubjectPerformance[];
  unreadMessages?: number;
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

// ─── Academic Performance ──────────────────────────────────────────

export interface AcademicPerformance {
  overallAverage: number;
  classPosition: number;
  totalStudents: number;
  coreSubjects: number;
  electiveSubjects: number;
  pendingAssignments: number;
}

// ─── Attendance Metrics ────────────────────────────────────────────

export interface AttendanceMetrics {
  presentDays: number;
  schoolDays: number;
  lateDays: number;
  absentDays: number;
  attendanceRate: number;
}

// ─── Recent Assessments ────────────────────────────────────────────

export interface RecentAssessment {
  subjectName: string;
  title: string;
  score: number;
  maxScore: number;
  type: string;
  date: string;
  childName: string;
}

// ─── Subject Performance ───────────────────────────────────────────

export interface SubjectPerformance {
  subjectName: string;
  currentScore: number;
  maxPossible: number;
  grade: string;
  assessmentCount: number;
}
