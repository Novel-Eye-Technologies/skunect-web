// ---------------------------------------------------------------------------
// Dashboard & analytics types
// ---------------------------------------------------------------------------

export interface DashboardResponse {
  totalStudents: number;
  totalTeachers: number;
  totalFees: number;
  totalFeesPaid: number;
  attendanceRate: number;
  academicPerformance: number;
}

export interface AttendanceSummary {
  presentCount: number;
  absentCount: number;
  lateCount: number;
  totalStudents: number;
  averageAttendance: number;
}

export interface AcademicSummary {
  averageScore: number;
  topPerformers: StudentPerformance[];
  lowestPerformers: StudentPerformance[];
  distributionByGrade: GradeDistribution[];
}

export interface StudentPerformance {
  studentId: string;
  studentName: string;
  averageScore: number;
  className: string;
}

export interface GradeDistribution {
  grade: string;
  count: number;
  percentage: number;
}

export interface FeeSummary {
  totalInvoiced: number;
  totalCollected: number;
  totalOutstanding: number;
  paymentRate: number;
}

// ---------------------------------------------------------------------------
// Extended attendance summary (returned from analytics/attendance endpoint)
// ---------------------------------------------------------------------------

export interface AttendanceAnalytics extends AttendanceSummary {
  dailyTrend: AttendanceChartPoint[];
}

// ---------------------------------------------------------------------------
// Extended academic summary (returned from analytics/academic endpoint)
// ---------------------------------------------------------------------------

export interface SubjectAverage {
  subjectId: string;
  subjectName: string;
  averageScore: number;
}

export interface AcademicAnalytics extends AcademicSummary {
  subjectAverages: SubjectAverage[];
}

// ---------------------------------------------------------------------------
// Extended fee summary (returned from analytics/fees endpoint)
// ---------------------------------------------------------------------------

export interface FeeStatusBreakdown {
  status: 'PAID' | 'PARTIAL' | 'PENDING' | 'OVERDUE';
  count: number;
  amount: number;
}

export interface FeeAnalytics extends FeeSummary {
  monthlyCollection: FeeCollectionChartPoint[];
  statusBreakdown: FeeStatusBreakdown[];
}

// ---------------------------------------------------------------------------
// Chart data types used in the dashboard
// ---------------------------------------------------------------------------

export interface AttendanceChartPoint {
  date: string;
  present: number;
  absent: number;
  late: number;
}

export interface FeeCollectionChartPoint {
  month: string;
  collected: number;
  outstanding: number;
}

export interface RecentActivity {
  id: string;
  type: 'attendance' | 'grade' | 'fee' | 'enrollment' | 'announcement';
  description: string;
  timestamp: string;
  user: string;
}
