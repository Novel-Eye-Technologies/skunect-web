import { useQuery } from '@tanstack/react-query';
import { getAssessments, getAssessmentScores } from '@/lib/api/academics';
import { getHomeworkList } from '@/lib/api/homework';
import { getGradingSystems } from '@/lib/api/school-settings';
import { useAuthStore } from '@/lib/stores/auth-store';

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

interface GradeScale {
  gradeLabel: string;
  minScore: number;
  maxScore: number;
}

function determineGradeLabel(
  score: number | null,
  maxScore: number,
  scales: GradeScale[],
): string {
  if (score === null || maxScore === 0) return '—';
  const percentage = (score / maxScore) * 100;

  // If school has configured grading scales, use them
  if (scales.length > 0) {
    // Scales use min/max percentage ranges
    const match = scales.find(
      (s) => percentage >= s.minScore && percentage <= s.maxScore,
    );
    if (match) return match.gradeLabel;
    return '—';
  }

  // Fallback: standard Nigerian grading
  if (percentage >= 70) return 'A';
  if (percentage >= 60) return 'B';
  if (percentage >= 50) return 'C';
  if (percentage >= 40) return 'D';
  if (percentage >= 35) return 'E';
  return 'F';
}

// Limit concurrent score fetches to avoid overwhelming the backend
async function fetchScoresBatched<T>(
  tasks: (() => Promise<T>)[],
  concurrency: number,
): Promise<T[]> {
  const results: T[] = new Array(tasks.length);
  let index = 0;

  async function worker() {
    while (index < tasks.length) {
      const i = index++;
      results[i] = await tasks[i]();
    }
  }

  const workers = Array.from(
    { length: Math.min(concurrency, tasks.length) },
    () => worker(),
  );
  await Promise.all(workers);
  return results;
}

export function useStudentSubjectGrades(studentId?: string, classId?: string) {
  const schoolId = useAuthStore((s) => s.currentSchoolId);

  return useQuery({
    queryKey: ['student-grades', schoolId, studentId, classId],
    queryFn: async (): Promise<StudentSubjectPerformance[]> => {
      if (!schoolId || !studentId || !classId) return [];

      // 1. Fetch assessments, homework (for subject names), and grading config in parallel
      const [assessmentsRes, homeworksRes, gradingRes] = await Promise.all([
        getAssessments(schoolId, { classId, size: 200 }),
        getHomeworkList(schoolId, { classId, size: 200, status: 'ACTIVE' }),
        getGradingSystems(schoolId).catch(() => ({ data: [] })),
      ]);
      const assessments = assessmentsRes.data || [];
      const homeworks = homeworksRes.data || [];

      // Get the default grading system's scales (or first available)
      const gradingSystems = gradingRes.data || [];
      const defaultSystem =
        gradingSystems.find((gs) => gs.isDefault) || gradingSystems[0];
      const scales: GradeScale[] = defaultSystem?.scales ?? [];

      // Build subject name map from homework items
      const subjectNameMap = new Map<string, string>();
      for (const hw of homeworks) {
        if (hw.subjectId && hw.subjectName) {
          subjectNameMap.set(hw.subjectId, hw.subjectName);
        }
      }

      // 2. Fetch scores with concurrency limit of 5
      type ScoreResult = { assessment: typeof assessments[number]; scores: Awaited<ReturnType<typeof getAssessmentScores>>['data'] extends infer D ? NonNullable<D> : never };
      const scoreTasks = assessments.map((assessment) => async (): Promise<ScoreResult> => {
        try {
          const res = await getAssessmentScores(schoolId, assessment.id);
          return { assessment, scores: res.data || [] };
        } catch {
          return { assessment, scores: [] };
        }
      });

      const results = await fetchScoresBatched(scoreTasks, 5);

      // 3. Group the scores by subject
      const subjectMap = new Map<string, StudentSubjectPerformance>();

      for (const { assessment, scores } of results) {
        const studentScoreInfo = scores.find((s) => s.studentId === studentId);
        const scoreValue = studentScoreInfo?.score ?? null;

        if (!subjectMap.has(assessment.subjectId)) {
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

        perf.assessments.push({
          id: assessment.id,
          title: assessment.title,
          type: assessment.type,
          score: scoreValue,
          maxScore: assessment.maxScore,
          date: assessment.createdAt,
        });

        if (assessment.type === 'EXAM') {
          perf.examMaxScore += assessment.maxScore;
        } else {
          perf.caMaxScore += assessment.maxScore;
        }

        if (scoreValue !== null) {
          if (assessment.type === 'EXAM') {
            perf.examScore = (perf.examScore || 0) + scoreValue;
          } else {
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
        perf.gradeLabel = determineGradeLabel(
          perf.totalScore,
          perf.totalMaxScore,
          scales,
        );

        perf.assessments.sort(
          (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime(),
        );

        return perf;
      });
    },
    enabled: !!schoolId && !!studentId && !!classId,
  });
}
