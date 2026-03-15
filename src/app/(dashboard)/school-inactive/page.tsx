'use client';

import { AlertTriangle } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

export default function SchoolInactivePage() {
  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <Card className="max-w-md w-full">
        <CardContent className="pt-6 text-center space-y-4">
          <div className="mx-auto w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center">
            <AlertTriangle className="h-8 w-8 text-destructive" />
          </div>
          <h1 className="text-xl font-semibold">School Subscription Inactive</h1>
          <p className="text-muted-foreground">
            Your school&apos;s subscription is currently inactive. Access to the platform has been
            temporarily restricted.
          </p>
          <p className="text-sm text-muted-foreground">
            Please contact your school administrator for more information about renewing
            the subscription.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
