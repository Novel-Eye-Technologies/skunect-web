'use client';

import { useParams, useRouter } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  ArrowLeft,
  Mail,
  Phone,
  School,
  MapPin,
  Users,
  Send,
  Loader2,
  Clock,
  CheckCircle2,
} from 'lucide-react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { PageSkeleton } from '@/components/shared/loading-skeleton';
import {
  getBetaSignup,
  updateBetaSignupStatus,
  sendBetaInvitations,
} from '@/lib/api/beta';
import type { BetaSignupStatus } from '@/lib/types/beta';
import { getApiErrorMessage } from '@/lib/utils/get-error-message';

const statusSteps: { status: BetaSignupStatus; label: string }[] = [
  { status: 'PENDING', label: 'Submitted' },
  { status: 'CONTACTED', label: 'Contacted' },
  { status: 'INVITED', label: 'Invited' },
  { status: 'ACCEPTED', label: 'Accepted' },
  { status: 'ENROLLED', label: 'Enrolled' },
];

const roleLabels: Record<string, string> = {
  SCHOOL_OWNER: 'School Owner',
  SCHOOL_ADMIN: 'School Admin',
  TEACHER: 'Teacher',
  PARENT: 'Parent',
};

export function BetaSignupDetail() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const queryClient = useQueryClient();

  const { data: response, isLoading } = useQuery({
    queryKey: ['beta-signup', id],
    queryFn: () => getBetaSignup(id),
    enabled: !!id,
  });

  const statusMutation = useMutation({
    mutationFn: (status: string) => updateBetaSignupStatus(id, status),
    onSuccess: () => {
      toast.success('Status updated');
      queryClient.invalidateQueries({ queryKey: ['beta-signup', id] });
      queryClient.invalidateQueries({ queryKey: ['beta-signups'] });
      queryClient.invalidateQueries({ queryKey: ['beta-signups-stats'] });
    },
    onError: (error) => toast.error(getApiErrorMessage(error, 'Something went wrong')),
  });

  const inviteMutation = useMutation({
    mutationFn: () => sendBetaInvitations({ signupIds: [id] }),
    onSuccess: () => {
      toast.success('Invitation sent!');
      queryClient.invalidateQueries({ queryKey: ['beta-signup', id] });
      queryClient.invalidateQueries({ queryKey: ['beta-signups'] });
      queryClient.invalidateQueries({ queryKey: ['beta-signups-stats'] });
    },
    onError: (error) => toast.error(getApiErrorMessage(error, 'Something went wrong')),
  });

  const signup = response?.data;

  if (isLoading) {
    return <PageSkeleton />;
  }

  if (!signup) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Signup not found</p>
        <Button variant="outline" className="mt-4" onClick={() => router.back()}>
          Go Back
        </Button>
      </div>
    );
  }

  const currentStepIndex = statusSteps.findIndex(
    (s) => s.status === signup.status,
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" onClick={() => router.back()}>
          <ArrowLeft className="mr-1 h-4 w-4" />
          Back
        </Button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold">
            {signup.firstName} {signup.lastName}
          </h1>
          <p className="text-sm text-muted-foreground">{signup.email}</p>
        </div>
        <div className="flex items-center gap-2">
          {(signup.status === 'PENDING' || signup.status === 'CONTACTED') && (
            <Button
              onClick={() => inviteMutation.mutate()}
              disabled={inviteMutation.isPending}
            >
              {inviteMutation.isPending ? (
                <Loader2 className="mr-1 h-4 w-4 animate-spin" />
              ) : (
                <Send className="mr-1 h-4 w-4" />
              )}
              Send Invitation
            </Button>
          )}
        </div>
      </div>

      {/* Status Timeline */}
      <div className="rounded-lg border bg-card p-6">
        <h3 className="mb-4 text-sm font-semibold">Status Timeline</h3>
        <div className="flex items-center gap-2">
          {statusSteps.map((step, index) => {
            const isCompleted = index <= currentStepIndex;
            const isCurrent = index === currentStepIndex;
            return (
              <div key={step.status} className="flex items-center gap-2">
                {index > 0 && (
                  <div
                    className={`h-0.5 w-8 sm:w-12 ${
                      index <= currentStepIndex
                        ? 'bg-teal'
                        : 'bg-muted'
                    }`}
                  />
                )}
                <div className="flex flex-col items-center gap-1">
                  <div
                    className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-medium ${
                      isCompleted
                        ? 'bg-teal text-white'
                        : 'bg-muted text-muted-foreground'
                    } ${isCurrent ? 'ring-2 ring-teal ring-offset-2' : ''}`}
                  >
                    {isCompleted ? (
                      <CheckCircle2 className="h-4 w-4" />
                    ) : (
                      <Clock className="h-4 w-4" />
                    )}
                  </div>
                  <span className="text-xs text-muted-foreground whitespace-nowrap">
                    {step.label}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Details */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Contact Info */}
        <div className="rounded-lg border bg-card p-6">
          <h3 className="mb-4 text-sm font-semibold">Contact Information</h3>
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <Mail className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm">{signup.email}</span>
            </div>
            {signup.phone && (
              <div className="flex items-center gap-3">
                <Phone className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">{signup.phone}</span>
              </div>
            )}
            <div className="flex items-center gap-3">
              <Users className="h-4 w-4 text-muted-foreground" />
              <Badge variant="outline">
                {roleLabels[signup.role] || signup.role}
              </Badge>
            </div>
          </div>
        </div>

        {/* School Info */}
        <div className="rounded-lg border bg-card p-6">
          <h3 className="mb-4 text-sm font-semibold">School Information</h3>
          <div className="space-y-3">
            {signup.schoolName && (
              <div className="flex items-center gap-3">
                <School className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">{signup.schoolName}</span>
              </div>
            )}
            {signup.schoolSize && (
              <div className="flex items-center gap-3">
                <Users className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">{signup.schoolSize} students</span>
              </div>
            )}
            {signup.city && (
              <div className="flex items-center gap-3">
                <MapPin className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">{signup.city}</span>
              </div>
            )}
            {signup.hasExistingSystem !== null && (
              <div className="flex items-center gap-3">
                <School className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">
                  Existing system: {signup.hasExistingSystem ? 'Yes' : 'No'}
                </span>
              </div>
            )}
            {!signup.schoolName && !signup.schoolSize && !signup.city && (
              <p className="text-sm text-muted-foreground">
                No school information provided
              </p>
            )}
          </div>
        </div>

        {/* Invitation Details */}
        <div className="rounded-lg border bg-card p-6">
          <h3 className="mb-4 text-sm font-semibold">Invitation Details</h3>
          <div className="space-y-3 text-sm">
            {signup.invitationSentAt && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Invitation Sent</span>
                <span>{new Date(signup.invitationSentAt).toLocaleString()}</span>
              </div>
            )}
            {signup.invitationAcceptedAt && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Accepted</span>
                <span>
                  {new Date(signup.invitationAcceptedAt).toLocaleString()}
                </span>
              </div>
            )}
            <div className="flex justify-between">
              <span className="text-muted-foreground">Signed Up</span>
              <span>{new Date(signup.createdAt).toLocaleString()}</span>
            </div>
          </div>
        </div>

        {/* Manual Status Update */}
        <div className="rounded-lg border bg-card p-6">
          <h3 className="mb-4 text-sm font-semibold">Update Status</h3>
          <div className="flex items-center gap-3">
            <Select
              defaultValue={signup.status}
              onValueChange={(value) => statusMutation.mutate(value)}
              disabled={statusMutation.isPending}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="PENDING">Pending</SelectItem>
                <SelectItem value="CONTACTED">Contacted</SelectItem>
                <SelectItem value="INVITED">Invited</SelectItem>
                <SelectItem value="ACCEPTED">Accepted</SelectItem>
                <SelectItem value="ENROLLED">Enrolled</SelectItem>
              </SelectContent>
            </Select>
            {statusMutation.isPending && (
              <Loader2 className="h-4 w-4 animate-spin" />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
