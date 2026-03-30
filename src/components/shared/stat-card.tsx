'use client';

import { type LucideIcon, TrendingUp, TrendingDown } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface StatCardProps {
  title: string;
  value: string | number;
  description?: React.ReactNode;
  icon?: LucideIcon;
  iconBgClassName?: string;
  iconClassName?: string;
  trend?: {
    value: number;
    direction: 'up' | 'down';
  };
  className?: string;
  onClick?: () => void;
}

export function StatCard({
  title,
  value,
  description,
  icon: Icon,
  iconBgClassName,
  iconClassName,
  trend,
  className,
  onClick,
}: StatCardProps) {
  return (
    <Card 
      className={cn(
        'relative overflow-hidden', 
        onClick && 'cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-900 transition-colors', 
        className
      )}
      onClick={onClick}
    >
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div className="space-y-2">
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <p className="text-3xl font-bold tracking-tight">{value}</p>
            {(description || trend) && (
              <div className="flex items-center gap-2">
                {trend && (
                  <span
                    className={cn(
                      'inline-flex items-center gap-0.5 text-xs font-medium',
                      trend.direction === 'up'
                        ? 'text-emerald-600'
                        : 'text-red-600',
                    )}
                  >
                    {trend.direction === 'up' ? (
                      <TrendingUp className="h-3 w-3" />
                    ) : (
                      <TrendingDown className="h-3 w-3" />
                    )}
                    {trend.value}%
                  </span>
                )}
                {description && (
                  <div className="text-xs text-muted-foreground">{description}</div>
                )}
              </div>
            )}
          </div>
          {Icon && (
            <div className={cn('rounded-lg p-3', iconBgClassName ?? 'bg-teal/10')}>
              <Icon className={cn('h-5 w-5', iconClassName ?? 'text-teal')} />
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
