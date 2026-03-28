import { useQuery } from '@tanstack/react-query';
import { getAssessments, getAssessmentScores } from '@/lib/api/academics';
import { getHomeworkList } from '@/lib/api/homework';
import { useAuthStore } from '@/lib/stores/auth-store';
import type { Assessment, StudentScore } from '@/lib/types/academics';

export interface StudentAssessmentDetail {
  id: string;
  title: string;
  type: string;
  score: number | null;
  maxScore: number;
  date: string;
}

export interface StudentSubjectPerformance {
  subjectId: string;
  subjectName: string;
  caScore: number | null;
  examScore: number | null;
  totalScore: number | null;
  caMaxScore: number;
  examMaxScore: number;
  totalMaxScore: number;
  gradeLabel: string;
  assessments: StudentAssessmentDetail[];
}

// Basic grader function mapping standard 1-100 logic (can be adjusted to dynamic percentage later)
function determineGradeLabel(score: number | null, maxScore: number): string {
  if (score === null || maxScore === 0) return '—';
  const percentage = (score / maxScore) * 100;
  if (percentage >= 70) return 'A';
  if (percentage >= 60) return 'B';
  if (percentage >= 50) return 'C';
  if (percentage >= 40) return 'D';
  if (percentage >= 35) return 'E';
  if (percentage >= 0) return 'F';
  return '—';
}

export function useStudentSubjectGrades(studentId?: string, classId?: string) {
  const schoolId = useAuthStore((s) => s.currentSchoolId);

  return useQuery({
    queryKey: ['student-grades', schoolId, studentId, classId],
    queryFn: async (): Promise<StudentSubjectPerformance[]> => {
      if (!schoolId || !studentId || !classId) return [];

      // 1. Fetch all assessments to aggregate, and homework to map subject names
      const [assessmentsRes, homeworksRes] = await Promise.all([
        getAssessments(schoolId, { classId, size: 200 }),
        getHomeworkList(schoolId, { classId, size: 200, status: 'ACTIVE' }),
      ]);
      const assessments = assessmentsRes.data || [];
      const homeworks = homeworksRes.data || [];

      // Build subject name map from homework items exactly as requested
      const subjectNameMap = new Map<string, string>();
      for (const hw of homeworks) {
        if (hw.subjectId && hw.subjectName) {
          subjectNameMap.set(hw.subjectId, hw.subjectName);
        }
      }

      // 2. Fetch scores concurrently for all these assessments
      const scorePromises = assessments.map(async (assessment) => {
        try {
          const res = await getAssessmentScores(schoolId, assessment.id);
          return { assessment, scores: res.data || [] };
        } catch (error) {
          console.error(`Failed to load scores for assessment ${assessment.title}`);
          return { assessment, scores: [] };
        }
      });

      const results = await Promise.all(scorePromises);

      // 3. Group the scores by subject
      const subjectMap = new Map<string, StudentSubjectPerformance>();

      for (const { assessment, scores } of results) {
        // Find the specific child's score
        const studentScoreInfo = scores.find((s) => s.studentId === studentId);
        
        // Even if child has no score yet, we list the subject because the assessment exists
        const scoreValue = studentScoreInfo?.score ?? null;

        // Initialize subject in map if not present
        if (!subjectMap.has(assessment.subjectId)) {
          // Resolve name: prioritize homework map, fallback to assessment or ID
          const resolvedName =
            subjectNameMap.get(assessment.subjectId) ||
            assessment.subjectName ||
            'Unknown Subject';

          subjectMap.set(assessment.subjectId, {
            subjectId: assessment.subjectId,
            subjectName: resolvedName,
            caScore: null,
            examScore: null,
            totalScore: null,
            caMaxScore: 0,
            examMaxScore: 0,
            totalMaxScore: 0,
            gradeLabel: '—',
            assessments: [],
          });
        }

        const perf = subjectMap.get(assessment.subjectId)!;

        // Add to assessment list
        perf.assessments.push({
          id: assessment.id,
          title: assessment.title,
          type: assessment.type,
          score: scoreValue,
          maxScore: assessment.maxScore,
          date: assessment.createdAt,
        });

        // Add to max scores
        if (assessment.type === 'EXAM') {
          perf.examMaxScore += assessment.maxScore;
        } else {
          perf.caMaxScore += assessment.maxScore;
        }

        // Add to aggregates
        if (scoreValue !== null) {
          if (assessment.type === 'EXAM') {
            perf.examScore = (perf.examScore || 0) + scoreValue;
          } else {
            // CA1, CA2, CA3 types go into CA total
            perf.caScore = (perf.caScore || 0) + scoreValue;
          }
        }
      }

      // 4. Calculate final totals & grades
      return Array.from(subjectMap.values()).map((perf) => {
        if (perf.caScore !== null || perf.examScore !== null) {
          perf.totalScore = (perf.caScore || 0) + (perf.examScore || 0);
        } else {
          perf.totalScore = null;
        }

        perf.totalMaxScore = perf.caMaxScore + perf.examMaxScore;
        perf.gradeLabel = determineGradeLabel(perf.totalScore, perf.totalMaxScore);
        
        // Sort assessments by date
        perf.assessments.sort(
          (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
        );
        
        return perf;
      });
    },
    enabled: !!schoolId && !!studentId && !!classId,
  });
}
