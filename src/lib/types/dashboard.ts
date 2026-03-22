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

// ─── Enhanced Admin Dashboard ─────────────────────────────────────

export interface EnhancedAdminDashboard {
  // Hero
  todayAttendanceRate: number;
  todayPresentCount: number;
  todayAbsentCount: number;
  todayLateCount: number;
  teachersMarkedAttendance: number;
  totalTeachersWithClasses: number;
  unansweredParentMessages: number;
  feeCollectionRate: number;
  totalFeesBilled: number;
  totalFeesCollected: number;
  totalFeesOutstanding: number;

  // Scale
  totalStudents: number;
  activeStudents: number;
  totalTeachers: number;
  totalClasses: number;
  totalParents: number;

  // Engagement
  parentEngagementRate: number;
  homeworkAssignedThisWeek: number;
  announcementsSentToday: number;

  // Phase
  currentPhase: string;
  phaseMetrics: PhaseMetrics | null;

  // Worst 5
  worstTeachers: TeacherActivityItem[];
  worstClassesAttendance: AdminClassAttendanceItem[];
  worstStudentsAttendance: StudentAttendanceItem[];
  classesNoHomework: ClassHomeworkItem[];
  unansweredThreads: UnansweredThreadItem[];

  // Alerts
  alerts: AdminDashboardAlert[];
}

export interface TeacherActivityItem {
  teacherId: string;
  teacherName: string;
  daysAttendanceMarked: number;
  homeworkAssigned: number;
  unansweredMessages: number;
  activityScore: number;
}

export interface AdminClassAttendanceItem {
  classId: string;
  className: string;
  attendanceRate: number;
  studentCount: number;
}

export interface StudentAttendanceItem {
  studentId: string;
  studentName: string;
  className: string;
  attendanceRate: number;
  daysAbsent: number;
}

export interface ClassHomeworkItem {
  classId: string;
  className: string;
  classTeacherName: string | null;
  daysSinceLastHomework: number;
}

export interface UnansweredThreadItem {
  conversationId: string;
  parentName: string;
  lastMessage: string;
  sentAt: string;
  hoursUnanswered: number;
  teacherName: string | null;
}

export interface PhaseMetrics {
  newStudentsThisTerm: number | null;
  incompleteRegistrations: number | null;
  unpaidFeesCount: number | null;
  termAttendanceTrend: number | null;
  homeworkCompletionRate: number | null;
  parentWeeklyEngagement: number | null;
  assessmentsCreated: number | null;
  assessmentsGraded: number | null;
  assessmentCoverage: number | null;
  termFeeCollectionRate: number | null;
  reportCardsGenerated: number | null;
  avgTermScore: number | null;
}

export interface AdminDashboardAlert {
  severity: 'warning' | 'danger' | 'info';
  title: string;
  message: string;
}
