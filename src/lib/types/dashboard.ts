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
  children: ParentChildSummary[];
  upcomingFees: UpcomingFee[];
  recentHomework: RecentHomeworkItem[];
  // Enhanced fields (nullable — backend may not populate yet)
  academicPerformance: ParentAcademicOverview | null;
  attendanceMetrics: ParentAttendanceOverview | null;
  subjectPerformance: ParentSubjectItem[] | null;
  recentAssessments: ParentAssessmentItem[] | null;
  recentAnnouncements: ParentAnnouncementItem[] | null;
  upcomingEvents: ParentEventItem[] | null;
  unreadMessages: number;
}

export interface ParentChildSummary {
  studentId: string;
  name: string;
  className: string;
  /** SCRUM-63: resolved level name (e.g. 'JSS 1') for display alongside className */
  levelName: string | null;
  attendance: string;
  recentGrade: string;
}

/** @deprecated Use ParentChildSummary instead */
export type ChildSummary = ParentChildSummary;

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

// ─── Parent Academic Overview ─────────────────────────────────────

export interface ParentAcademicOverview {
  overallAverage: number | null;
  grade: string | null;
  classPosition: number | null;
  classSize: number | null;
  subjectsAboveAvg: number;
  subjectsBelowAvg: number;
  subjectsDeclining: number;
  subjectsNeedingAttention: string[];
}

/** @deprecated Use ParentAcademicOverview instead */
export type AcademicPerformance = ParentAcademicOverview;

// ─── Parent Attendance Overview ───────────────────────────────────

export interface ParentAttendanceOverview {
  presentDays: number;
  absentDays: number;
  lateDays: number;
  totalSchoolDays: number;
  attendanceRate: number;
  todayStatus: string | null;
}

/** @deprecated Use ParentAttendanceOverview instead */
export type AttendanceMetrics = ParentAttendanceOverview;

// ─── Parent Subject Performance ───────────────────────────────────

export interface ParentSubjectItem {
  subjectName: string;
  studentAvg: number | null;
  classAvg: number | null;
  grade: string | null;
  assessmentCount: number;
  belowClassAvg: boolean;
  declining: boolean;
  trend: number | null;
}

/** @deprecated Use ParentSubjectItem instead */
export type SubjectPerformance = ParentSubjectItem;

// ─── Parent Assessment Item ───────────────────────────────────────

export interface ParentAssessmentItem {
  assessmentId: string;
  title: string;
  subjectName: string;
  type: string;
  score: number | null;
  maxScore: number | null;
  percentage: number | null;
  classAverage: number | null;
  date: string;
}

/** @deprecated Use ParentAssessmentItem instead */
export type RecentAssessment = ParentAssessmentItem;

// ─── Parent Announcement Item ─────────────────────────────────────

export interface ParentAnnouncementItem {
  id: string;
  title: string;
  content: string;
  publishedAt: string;
}

// ─── Parent Event Item ────────────────────────────────────────────

export interface ParentEventItem {
  id: string;
  title: string;
  description: string | null;
  startDate: string;
  endDate: string | null;
  location: string | null;
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

// ── Enhanced Teacher Dashboard ──

export interface EnhancedTeacherDashboard {
  // Schedule
  todaySchedule: TeacherScheduleSlot[];

  // Quick Stats
  myClassesCount: number;
  totalStudentsCount: number;
  todayAttendanceRate: number;
  todayPresentCount: number;
  todayAbsentCount: number;
  todayLateCount: number;
  pendingHomeworkToGrade: number;
  overdueHomeworkCount: number;
  unansweredParentMessages: number;

  // At-Risk
  atRiskStudents: AtRiskStudentItem[];

  // Homework
  pendingGrading: TeacherHomeworkItem[];
  recentAssignments: TeacherHomeworkItem[];

  // Class Performance
  classPerformance: TeacherClassPerformance[];
}

export interface TeacherScheduleSlot {
  periodNumber: number;
  className: string;
  subjectName: string;
  isHomeroom: boolean;
  attendanceMarked: boolean;
}

export interface AtRiskStudentItem {
  studentId: string;
  studentName: string;
  className: string;
  attendanceRate: number;
  homeworkCompletionRate: number;
  avgScore: number | null;
  scoreTrend: number | null;
  riskScore: number;
  riskFactors: string[];
}

export interface TeacherHomeworkItem {
  homeworkId: string;
  title: string;
  className: string;
  subjectName: string;
  dueDate: string;
  totalStudents: number;
  submittedCount: number;
  gradedCount: number;
  status: string;
}

export interface TeacherClassPerformance {
  classId: string;
  className: string;
  isHomeroom: boolean;
  studentCount: number;
  attendanceRate: number;
  homeworkSubmissionRate: number;
  avgScore: number | null;
  atRiskCount: number;
}
