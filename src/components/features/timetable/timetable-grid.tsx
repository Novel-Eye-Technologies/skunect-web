'use client';

import { useMemo, Fragment } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, Trash2 } from 'lucide-react';
import type { TimetableSlot, TimetableConfig } from '@/lib/types/timetable';

interface TimetableGridProps {
  config: TimetableConfig | undefined;
  slots: TimetableSlot[];
  onAddSlot?: (day: string, period: number) => void;
  onDeleteSlot?: (slotId: string) => void;
  subjectMap?: Record<string, string>;
  teacherMap?: Record<string, string>;
  isLoading?: boolean;
}

const DAYS = ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY'];

export function TimetableGrid({
  config,
  slots,
  onAddSlot,
  onDeleteSlot,
  subjectMap = {},
  teacherMap = {},
  isLoading,
}: TimetableGridProps) {
  const days = config?.days ?? DAYS;
  const periodsPerDay = config?.periodsPerDay ?? 8;

  const slotMap = useMemo(() => {
    const map: Record<string, TimetableSlot> = {};
    for (const slot of slots) {
      map[`${slot.dayOfWeek}-${slot.periodNumber}`] = slot;
    }
    return map;
  }, [slots]);

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="animate-pulse space-y-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="h-10 bg-muted rounded" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Timetable</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr>
                <th className="border p-2 bg-muted font-medium text-left">Period</th>
                {days.map((day) => (
                  <th key={day} className="border p-2 bg-muted font-medium text-center capitalize">
                    {day.slice(0, 3)}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {Array.from({ length: periodsPerDay }).map((_, periodIdx) => {
                const period = periodIdx + 1;
                const isBreak = config?.breakAfter === period;
                return (
                  <Fragment key={period}>
                    <tr>
                      <td className="border p-2 font-medium text-center bg-muted/50">
                        P{period}
                      </td>
                      {days.map((day) => {
                        const slot = slotMap[`${day}-${period}`];
                        return (
                          <td key={`${day}-${period}`} className="border p-1 text-center min-w-[100px] h-16 relative group">
                            {slot ? (
                              <div className="space-y-0.5">
                                <div className="font-medium text-xs">
                                  {slot.label ?? subjectMap[slot.subjectId ?? ''] ?? '-'}
                                </div>
                                {slot.teacherId && (
                                  <div className="text-[10px] text-muted-foreground">
                                    {teacherMap[slot.teacherId] ?? ''}
                                  </div>
                                )}
                                {onDeleteSlot && (
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-5 w-5 absolute top-0.5 right-0.5 opacity-0 group-hover:opacity-100"
                                    aria-label="Delete timetable slot"
                                    onClick={() => onDeleteSlot(slot.id)}
                                  >
                                    <Trash2 className="h-3 w-3" />
                                  </Button>
                                )}
                              </div>
                            ) : (
                              onAddSlot && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-full w-full opacity-0 group-hover:opacity-100"
                                  onClick={() => onAddSlot(day, period)}
                                >
                                  <Plus className="h-3 w-3" />
                                </Button>
                              )
                            )}
                          </td>
                        );
                      })}
                    </tr>
                    {isBreak && (
                      <tr>
                        <td colSpan={days.length + 1} className="border p-1 text-center bg-yellow-50 text-yellow-700 text-xs font-medium">
                          Break ({config?.breakDuration ?? 30} min)
                        </td>
                      </tr>
                    )}
                  </Fragment>
                );
              })}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}
