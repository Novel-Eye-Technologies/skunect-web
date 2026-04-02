/** Severity badge colors for health records and welfare entries */
export const SEVERITY_COLORS: Record<string, string> = {
  LOW: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  MEDIUM: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
  HIGH: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400',
  CRITICAL: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
};

/** Border colors for emergency alert severity */
export const SEVERITY_BORDER_COLORS: Record<string, string> = {
  LOW: 'border-blue-300 dark:border-blue-700',
  MEDIUM: 'border-yellow-300 dark:border-yellow-700',
  HIGH: 'border-orange-300 dark:border-orange-700',
  CRITICAL: 'border-red-500 dark:border-red-600',
};

/** Health record type display labels */
export const RECORD_TYPE_LABELS: Record<string, string> = {
  ALLERGY: 'Allergy',
  CONDITION: 'Condition',
  MEDICATION: 'Medication',
  VACCINATION: 'Vaccination',
  INCIDENT: 'Incident',
  NOTE: 'Note',
};

/** Mood badge colors */
export const MOOD_COLORS: Record<string, string> = {
  HAPPY: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
  SAD: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  ANGRY: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
  ANXIOUS: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
  NEUTRAL: 'bg-gray-100 text-gray-700 dark:bg-gray-800/30 dark:text-gray-400',
  EXCITED: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
};

/** Mood emoji mappings */
export const MOOD_EMOJIS: Record<string, string> = {
  HAPPY: '\uD83D\uDE0A',
  SAD: '\uD83D\uDE22',
  ANGRY: '\uD83D\uDE21',
  ANXIOUS: '\uD83D\uDE1F',
  NEUTRAL: '\uD83D\uDE10',
  EXCITED: '\uD83E\uDD29',
};

/** Assessment type badge colors */
export const ASSESSMENT_TYPE_COLORS: Record<string, string> = {
  CA1: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
  CA2: 'bg-teal/10 text-teal dark:bg-teal/20 dark:text-teal',
  CA3: 'bg-navy/10 text-navy dark:bg-navy/20 dark:text-white/80',
  EXAM: 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400',
};
