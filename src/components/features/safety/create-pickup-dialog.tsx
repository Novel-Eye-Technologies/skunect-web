'use client';

import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useQuery } from '@tanstack/react-query';
import { QrCode, CheckCircle, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { useAuthStore } from '@/lib/stores/auth-store';
import { getStudents, type StudentListParams } from '@/lib/api/students';
import { verifyPickupByQrCode } from '@/lib/api/safety';
import { useCreatePickupLog } from '@/lib/hooks/use-safety';

const pickupFormSchema = z.object({
  studentId: z.string().min(1, { message: 'Please select a student' }),
  pickupPersonName: z.string().min(1, { message: 'Pickup person name is required' }),
  relationship: z.string().min(1, { message: 'Please select a relationship' }),
  authorizationId: z.string().optional(),
  notes: z.string().optional(),
});

type PickupFormValues = z.infer<typeof pickupFormSchema>;

interface CreatePickupDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CreatePickupDialog({
  open,
  onOpenChange,
}: CreatePickupDialogProps) {
  const schoolId = useAuthStore((s) => s.currentSchoolId);
  const createPickupLog = useCreatePickupLog();
  const [searchQuery, setSearchQuery] = useState('');
  const [qrCodeInput, setQrCodeInput] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [qrVerified, setQrVerified] = useState(false);

  const { data: studentsResponse } = useQuery({
    queryKey: ['students', schoolId, { search: searchQuery }],
    queryFn: () =>
      getStudents(schoolId!, {
        search: searchQuery || undefined,
        size: 20,
      } as StudentListParams),
    enabled: !!schoolId && open,
    select: (res) => res.data,
  });

  const students = studentsResponse ?? [];

  const form = useForm<PickupFormValues>({
    resolver: zodResolver(pickupFormSchema),
    defaultValues: {
      studentId: '',
      pickupPersonName: '',
      relationship: '',
      authorizationId: '',
      notes: '',
    },
  });

  useEffect(() => {
    if (!open) {
      form.reset();
      setSearchQuery('');
      setQrCodeInput('');
      setQrVerified(false);
    }
  }, [open, form]);

  async function handleVerifyQrCode() {
    if (!qrCodeInput.trim() || !schoolId) return;
    setIsVerifying(true);
    try {
      const response = await verifyPickupByQrCode(schoolId, qrCodeInput.trim());
      const auth = response.data;
      if (auth) {
        // Auto-populate fields from the authorization
        form.setValue('studentId', auth.studentId);
        form.setValue('pickupPersonName', auth.pickupPersonName);
        if (auth.pickupPersonRelationship) {
          form.setValue('relationship', auth.pickupPersonRelationship);
        }
        form.setValue('authorizationId', auth.id);
        setQrVerified(true);
        toast.success('QR code verified successfully');
      }
    } catch {
      toast.error('Invalid or expired QR code');
      setQrVerified(false);
    } finally {
      setIsVerifying(false);
    }
  }

  function onSubmit(values: PickupFormValues) {
    const payload = {
      studentId: values.studentId,
      pickupPersonName: values.pickupPersonName,
      relationship: values.relationship,
      authorizationId: values.authorizationId || undefined,
      notes: values.notes || undefined,
    };

    createPickupLog.mutate(payload, {
      onSuccess: () => {
        form.reset();
        setSearchQuery('');
        setQrCodeInput('');
        setQrVerified(false);
        onOpenChange(false);
      },
    });
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Create Pickup Log</DialogTitle>
          <DialogDescription>
            Record a student pickup event. Optionally verify via QR code.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {/* QR Code Verification */}
            <div className="space-y-2">
              <FormLabel>QR Code (optional)</FormLabel>
              <div className="flex items-center gap-2">
                <div className="relative flex-1">
                  <QrCode className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Scan or enter QR code..."
                    value={qrCodeInput}
                    onChange={(e) => {
                      setQrCodeInput(e.target.value);
                      setQrVerified(false);
                    }}
                    className="pl-9"
                  />
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleVerifyQrCode}
                  disabled={isVerifying || !qrCodeInput.trim()}
                >
                  {isVerifying ? (
                    <Loader2 className="mr-1 h-4 w-4 animate-spin" />
                  ) : (
                    <CheckCircle className="mr-1 h-4 w-4" />
                  )}
                  Verify
                </Button>
              </div>
              {qrVerified && (
                <Badge
                  variant="secondary"
                  className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
                >
                  QR Verified - fields auto-populated
                </Badge>
              )}
            </div>

            {/* Student Search */}
            <div className="space-y-2">
              <FormLabel>Search Student</FormLabel>
              <Input
                placeholder="Search by name or admission number..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            {/* Student Select */}
            <FormField
              control={form.control}
              name="studentId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Student</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    value={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select student" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {students.map((student) => (
                        <SelectItem key={student.id} value={student.id}>
                          {student.firstName} {student.lastName} ({student.admissionNumber})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Pickup Person Name */}
            <FormField
              control={form.control}
              name="pickupPersonName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Pickup Person Name</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="e.g. John Doe"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Relationship */}
            <FormField
              control={form.control}
              name="relationship"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Relationship</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    value={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select relationship" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="Parent">Parent</SelectItem>
                      <SelectItem value="Guardian">Guardian</SelectItem>
                      <SelectItem value="Relative">Relative</SelectItem>
                      <SelectItem value="Other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Notes */}
            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Notes (optional)</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Any additional notes about this pickup..."
                      className="min-h-[80px] resize-none"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Actions */}
            <div className="flex justify-end gap-2 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={createPickupLog.isPending}>
                {createPickupLog.isPending ? 'Creating...' : 'Create Log'}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
