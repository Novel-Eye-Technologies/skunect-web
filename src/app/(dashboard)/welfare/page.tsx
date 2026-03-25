'use client';

import { useState } from 'react';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { PageHeader } from '@/components/shared/page-header';
import { WelfareFormDialog } from '@/components/features/welfare/welfare-form-dialog';
import { useAuthStore } from '@/lib/stores/auth-store';
import { useQuery } from '@tanstack/react-query';
import { getClasses } from '@/lib/api/school-settings';

export default function WelfarePage() {
  const schoolId = useAuthStore((s) => s.currentSchoolId);
  const [formOpen, setFormOpen] = useState(false);

  const { data: classesRes } = useQuery({
    queryKey: ['classes', schoolId ?? ''],
    queryFn: () => getClasses(schoolId!),
    enabled: !!schoolId,
  });

  const classes = classesRes?.data ?? [];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Welfare & Behavior Logs"
        description="Record student welfare observations."
        actions={
          <Button onClick={() => setFormOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Record Welfare
          </Button>
        }
      />

      <Card>
        <CardContent className="py-8 text-center text-muted-foreground">
          Use the button above to record a new welfare observation. Welfare
          records are available on individual student profiles.
        </CardContent>
      </Card>

      <WelfareFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        classes={classes}
      />
    </div>
  );
}
