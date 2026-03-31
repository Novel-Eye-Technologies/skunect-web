export function GradeBadge({ grade }: { grade: string | null | undefined }) {
  if (!grade || grade === '—' || grade === '-') return <span className="text-muted-foreground">—</span>;

  const upper = grade.toUpperCase();
  const letter = upper.charAt(0);

  let colorClass = 'bg-gray-50 text-gray-700 ring-gray-600/20 dark:bg-gray-400/10 dark:text-gray-400 dark:ring-gray-400/20';

  switch (letter) {
    case 'A':
      colorClass = 'bg-green-50 text-green-700 ring-green-600/20 dark:bg-green-500/10 dark:text-green-400 dark:ring-green-500/20';
      break;
    case 'B':
      colorClass = 'bg-blue-50 text-blue-700 ring-blue-700/10 dark:bg-blue-400/10 dark:text-blue-400 dark:ring-blue-400/30';
      break;
    case 'C':
      colorClass = 'bg-yellow-50 text-yellow-800 ring-yellow-600/20 dark:bg-yellow-500/10 dark:text-yellow-500 dark:ring-yellow-500/20';
      break;
    case 'D':
    case 'E':
      colorClass = 'bg-orange-50 text-orange-700 ring-orange-600/20 dark:bg-orange-500/10 dark:text-orange-400 dark:ring-orange-500/20';
      break;
    case 'F':
      colorClass = 'bg-red-50 text-red-700 ring-red-600/10 dark:bg-red-400/10 dark:text-red-400 dark:ring-red-400/20';
      break;
  }

  return (
    <span className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-bold ring-1 ring-inset ${colorClass}`}>
      {upper}
    </span>
  );
}
