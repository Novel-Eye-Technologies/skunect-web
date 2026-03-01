'use client';

import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

type Status =
  | 'ACTIVE'
  | 'INACTIVE'
  | 'SUSPENDED'
  | 'GRADUATED'
  | 'TRANSFERRED'
  | 'CLOSED'
  | 'DRAFT'
  | 'PUBLISHED'
  | 'SUBMITTED'
  | 'GRADED'
  | 'PRESENT'
  | 'ABSENT'
  | 'LATE'
  | 'PAID'
  | 'PENDING'
  | 'OVERDUE'
  | 'PARTIAL'
  | 'VERIFIED'
  | 'RESOLVED'
  | 'CRITICAL'
  | 'HIGH'
  | 'MEDIUM'
  | 'LOW';

const statusConfig: Record<
  Status,
  { label: string; className: string }
> = {
  ACTIVE: {
    label: 'Active',
    className:
      'bg-green-100 text-green-800 hover:bg-green-100 dark:bg-green-900/30 dark:text-green-400',
  },
  INACTIVE: {
    label: 'Inactive',
    className:
      'bg-gray-100 text-gray-800 hover:bg-gray-100 dark:bg-gray-900/30 dark:text-gray-400',
  },
  SUSPENDED: {
    label: 'Suspended',
    className:
      'bg-red-100 text-red-800 hover:bg-red-100 dark:bg-red-900/30 dark:text-red-400',
  },
  GRADUATED: {
    label: 'Graduated',
    className:
      'bg-blue-100 text-blue-800 hover:bg-blue-100 dark:bg-blue-900/30 dark:text-blue-400',
  },
  TRANSFERRED: {
    label: 'Transferred',
    className:
      'bg-yellow-100 text-yellow-800 hover:bg-yellow-100 dark:bg-yellow-900/30 dark:text-yellow-400',
  },
  CLOSED: {
    label: 'Closed',
    className:
      'bg-gray-100 text-gray-800 hover:bg-gray-100 dark:bg-gray-900/30 dark:text-gray-400',
  },
  DRAFT: {
    label: 'Draft',
    className:
      'bg-yellow-100 text-yellow-800 hover:bg-yellow-100 dark:bg-yellow-900/30 dark:text-yellow-400',
  },
  PUBLISHED: {
    label: 'Published',
    className:
      'bg-green-100 text-green-800 hover:bg-green-100 dark:bg-green-900/30 dark:text-green-400',
  },
  SUBMITTED: {
    label: 'Submitted',
    className:
      'bg-blue-100 text-blue-800 hover:bg-blue-100 dark:bg-blue-900/30 dark:text-blue-400',
  },
  GRADED: {
    label: 'Graded',
    className:
      'bg-green-100 text-green-800 hover:bg-green-100 dark:bg-green-900/30 dark:text-green-400',
  },
  PRESENT: {
    label: 'Present',
    className:
      'bg-green-100 text-green-800 hover:bg-green-100 dark:bg-green-900/30 dark:text-green-400',
  },
  ABSENT: {
    label: 'Absent',
    className:
      'bg-red-100 text-red-800 hover:bg-red-100 dark:bg-red-900/30 dark:text-red-400',
  },
  LATE: {
    label: 'Late',
    className:
      'bg-amber-100 text-amber-800 hover:bg-amber-100 dark:bg-amber-900/30 dark:text-amber-400',
  },
  PAID: {
    label: 'Paid',
    className:
      'bg-green-100 text-green-800 hover:bg-green-100 dark:bg-green-900/30 dark:text-green-400',
  },
  PENDING: {
    label: 'Pending',
    className:
      'bg-yellow-100 text-yellow-800 hover:bg-yellow-100 dark:bg-yellow-900/30 dark:text-yellow-400',
  },
  OVERDUE: {
    label: 'Overdue',
    className:
      'bg-red-100 text-red-800 hover:bg-red-100 dark:bg-red-900/30 dark:text-red-400',
  },
  PARTIAL: {
    label: 'Partial',
    className:
      'bg-orange-100 text-orange-800 hover:bg-orange-100 dark:bg-orange-900/30 dark:text-orange-400',
  },
  VERIFIED: {
    label: 'Verified',
    className:
      'bg-green-100 text-green-800 hover:bg-green-100 dark:bg-green-900/30 dark:text-green-400',
  },
  RESOLVED: {
    label: 'Resolved',
    className:
      'bg-gray-100 text-gray-800 hover:bg-gray-100 dark:bg-gray-900/30 dark:text-gray-400',
  },
  CRITICAL: {
    label: 'Critical',
    className:
      'bg-red-100 text-red-800 hover:bg-red-100 dark:bg-red-900/30 dark:text-red-400',
  },
  HIGH: {
    label: 'High',
    className:
      'bg-orange-100 text-orange-800 hover:bg-orange-100 dark:bg-orange-900/30 dark:text-orange-400',
  },
  MEDIUM: {
    label: 'Medium',
    className:
      'bg-yellow-100 text-yellow-800 hover:bg-yellow-100 dark:bg-yellow-900/30 dark:text-yellow-400',
  },
  LOW: {
    label: 'Low',
    className:
      'bg-blue-100 text-blue-800 hover:bg-blue-100 dark:bg-blue-900/30 dark:text-blue-400',
  },
};

interface StatusBadgeProps {
  status: string;
  className?: string;
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const config = statusConfig[status as Status] ?? {
    label: status,
    className: 'bg-gray-100 text-gray-800',
  };

  return (
    <Badge
      variant="secondary"
      className={cn('font-medium', config.className, className)}
    >
      {config.label}
    </Badge>
  );
}
