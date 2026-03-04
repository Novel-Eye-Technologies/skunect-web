'use client';

import { Bell, Mail, Smartphone, MessageSquare } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { PageHeader } from '@/components/shared/page-header';
import {
  useNotificationPreferences,
  useUpdateNotificationPreference,
} from '@/lib/hooks/use-notification-preferences';
import type { NotificationPreference } from '@/lib/types/notification-preference';

const PREF_LABELS: Record<string, { label: string; description: string; icon: typeof Bell }> = {
  ANNOUNCEMENT: {
    label: 'Announcements',
    description: 'School-wide announcements and updates',
    icon: Bell,
  },
  ATTENDANCE: {
    label: 'Attendance',
    description: 'Daily attendance notifications',
    icon: Bell,
  },
  HOMEWORK: {
    label: 'Homework',
    description: 'New assignments and due date reminders',
    icon: Bell,
  },
  FEE: {
    label: 'Fees & Payments',
    description: 'Invoice and payment notifications',
    icon: Bell,
  },
  PICKUP: {
    label: 'Pickup',
    description: 'Pickup authorization and verification alerts',
    icon: Bell,
  },
  EMERGENCY: {
    label: 'Emergency Alerts',
    description: 'Critical safety and emergency notifications',
    icon: Bell,
  },
  MESSAGE: {
    label: 'Messages',
    description: 'New message notifications',
    icon: MessageSquare,
  },
  WELFARE: {
    label: 'Welfare',
    description: 'Student welfare and behavior notifications',
    icon: Bell,
  },
};

function PreferenceRow({
  pref,
  onToggle,
}: {
  pref: NotificationPreference;
  onToggle: (type: string, channel: 'email' | 'push' | 'sms', value: boolean) => void;
}) {
  const config = PREF_LABELS[pref.type] ?? {
    label: pref.type,
    description: '',
    icon: Bell,
  };

  return (
    <div className="flex flex-col gap-4 py-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="space-y-0.5">
        <div className="text-sm font-medium">{config.label}</div>
        <div className="text-xs text-muted-foreground">{config.description}</div>
      </div>
      <div className="flex items-center gap-6">
        <div className="flex items-center gap-2">
          <Mail className="h-4 w-4 text-muted-foreground" />
          <Switch
            checked={pref.email}
            onCheckedChange={(checked) => onToggle(pref.type, 'email', checked)}
          />
        </div>
        <div className="flex items-center gap-2">
          <Smartphone className="h-4 w-4 text-muted-foreground" />
          <Switch
            checked={pref.push}
            onCheckedChange={(checked) => onToggle(pref.type, 'push', checked)}
          />
        </div>
        <div className="flex items-center gap-2">
          <MessageSquare className="h-4 w-4 text-muted-foreground" />
          <Switch
            checked={pref.sms}
            onCheckedChange={(checked) => onToggle(pref.type, 'sms', checked)}
          />
        </div>
      </div>
    </div>
  );
}

export default function NotificationPreferencesPage() {
  const { data: response, isLoading } = useNotificationPreferences();
  const updatePref = useUpdateNotificationPreference();

  const preferences = response?.data ?? [];

  function handleToggle(type: string, channel: 'email' | 'push' | 'sms', value: boolean) {
    updatePref.mutate({ type, [channel]: value });
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Notification Preferences"
        description="Choose how you want to be notified for different events."
      />

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Notification Channels
          </CardTitle>
          <CardDescription>
            Toggle notifications per channel: email, push, or SMS.
          </CardDescription>
        </CardHeader>
        <Separator />
        <CardContent>
          {/* Column headers */}
          <div className="flex items-center justify-end gap-6 pb-2 pt-4">
            <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
              <Mail className="h-3.5 w-3.5" />
              Email
            </div>
            <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
              <Smartphone className="h-3.5 w-3.5" />
              Push
            </div>
            <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
              <MessageSquare className="h-3.5 w-3.5" />
              SMS
            </div>
          </div>

          {isLoading ? (
            <div className="space-y-4 py-4">
              {Array.from({ length: 6 }).map((_, i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : preferences.length === 0 ? (
            <div className="py-8 text-center text-sm text-muted-foreground">
              No notification preferences available.
            </div>
          ) : (
            <div className="divide-y">
              {preferences.map((pref) => (
                <PreferenceRow
                  key={pref.type}
                  pref={pref}
                  onToggle={handleToggle}
                />
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
