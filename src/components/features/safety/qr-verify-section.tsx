'use client';

import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { toast } from 'sonner';
import { QrCode, Search, CheckCircle2, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { verifyPickupByQrCode, recordPickup } from '@/lib/api/safety';
import { useAuthStore } from '@/lib/stores/auth-store';
import { getApiErrorMessage } from '@/lib/utils/get-error-message';
import { formatDateTime } from '@/lib/utils/format-date';
import { queryClient } from '@/lib/query-client';
import type { PickupAuthorization } from '@/lib/types/safety';

export function QrVerifySection() {
  const schoolId = useAuthStore((s) => s.currentSchoolId);
  const [qrCode, setQrCode] = useState('');
  const [verifiedAuth, setVerifiedAuth] = useState<PickupAuthorization | null>(
    null,
  );

  const verifyMutation = useMutation({
    mutationFn: (code: string) => verifyPickupByQrCode(schoolId!, code),
    onSuccess: (response) => {
      if (response.status === 'SUCCESS' && response.data) {
        setVerifiedAuth(response.data);
        toast.success('QR code verified successfully');
      } else {
        toast.error(response.message || 'Invalid or expired QR code');
        setVerifiedAuth(null);
      }
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error, 'Failed to verify QR code'));
      setVerifiedAuth(null);
    },
  });

  const recordMutation = useMutation({
    mutationFn: () =>
      recordPickup(schoolId!, {
        studentId: verifiedAuth!.studentId,
        authorizationId: verifiedAuth!.id,
        verificationMethod: 'QR_CODE',
      }),
    onSuccess: () => {
      toast.success('Pickup recorded successfully');
      setVerifiedAuth(null);
      setQrCode('');
      queryClient.invalidateQueries({ queryKey: ['safety'] });
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error, 'Failed to record pickup'));
    },
  });

  function handleVerify() {
    if (!qrCode.trim() || !schoolId) return;
    verifyMutation.mutate(qrCode.trim());
  }

  function handleReset() {
    setQrCode('');
    setVerifiedAuth(null);
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <QrCode className="h-5 w-5 text-primary" />
          <CardTitle className="text-lg">QR Code Verification</CardTitle>
        </div>
        <CardDescription>
          Enter a pickup QR code to verify the authorized pickup person.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Input + Verify */}
        <div className="flex items-center gap-2">
          <Input
            placeholder="Enter or paste QR code..."
            value={qrCode}
            onChange={(e) => setQrCode(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleVerify();
            }}
            disabled={verifyMutation.isPending}
          />
          <Button
            onClick={handleVerify}
            disabled={!qrCode.trim() || verifyMutation.isPending || !schoolId}
          >
            {verifyMutation.isPending ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Search className="mr-2 h-4 w-4" />
            )}
            Verify
          </Button>
        </div>

        {/* Verification Results */}
        {verifiedAuth && (
          <div className="rounded-lg border bg-muted/50 p-4 space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="font-semibold text-sm">Verification Result</h4>
              <Badge variant={verifiedAuth.isActive ? 'default' : 'destructive'}>
                {verifiedAuth.isActive ? 'ACTIVE' : 'REVOKED'}
              </Badge>
            </div>

            <div className="grid gap-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Pickup Person</span>
                <span className="font-medium">
                  {verifiedAuth.pickupPersonName}
                </span>
              </div>
              {verifiedAuth.pickupPersonRelationship && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Relationship</span>
                  <span className="font-medium">
                    {verifiedAuth.pickupPersonRelationship}
                  </span>
                </div>
              )}
              {verifiedAuth.pickupPersonPhone && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Phone</span>
                  <span className="font-medium">
                    {verifiedAuth.pickupPersonPhone}
                  </span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-muted-foreground">Valid From</span>
                <span className="font-medium">
                  {verifiedAuth.validFrom
                    ? formatDateTime(verifiedAuth.validFrom)
                    : 'No start date'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Valid Until</span>
                <span className="font-medium">
                  {verifiedAuth.validUntil
                    ? formatDateTime(verifiedAuth.validUntil)
                    : 'No end date'}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2 pt-2">
              {verifiedAuth.isActive && (
                <Button
                  onClick={() => recordMutation.mutate()}
                  disabled={recordMutation.isPending}
                >
                  {recordMutation.isPending ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <CheckCircle2 className="mr-2 h-4 w-4" />
                  )}
                  Record Pickup
                </Button>
              )}
              <Button variant="outline" onClick={handleReset}>
                Clear
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
