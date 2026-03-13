'use client';

import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
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
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useCreatePickupAuthorization } from '@/lib/hooks/use-safety';
import type { StudentListItem } from '@/lib/types/student';

const authorizationFormSchema = z.object({
  studentId: z.string().min(1, { message: 'Please select a child' }),
  pickupPersonName: z
    .string()
    .min(1, { message: 'Authorized person name is required' }),
  pickupPersonPhone: z.string().optional(),
  pickupPersonRelationship: z
    .string()
    .min(1, { message: 'Please select a relationship' }),
  validFrom: z.string().optional(),
  validUntil: z.string().optional(),
});

type AuthorizationFormValues = z.infer<typeof authorizationFormSchema>;

interface CreateAuthorizationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  childrenList: StudentListItem[];
}

export function CreateAuthorizationDialog({
  open,
  onOpenChange,
  childrenList,
}: CreateAuthorizationDialogProps) {
  const createAuthorization = useCreatePickupAuthorization();

  const form = useForm<AuthorizationFormValues>({
    resolver: zodResolver(authorizationFormSchema),
    defaultValues: {
      studentId: '',
      pickupPersonName: '',
      pickupPersonPhone: '',
      pickupPersonRelationship: '',
      validFrom: '',
      validUntil: '',
    },
  });

  useEffect(() => {
    if (!open) {
      form.reset();
    }
  }, [open, form]);

  function onSubmit(values: AuthorizationFormValues) {
    const payload = {
      studentId: values.studentId,
      pickupPersonName: values.pickupPersonName,
      pickupPersonPhone: values.pickupPersonPhone || undefined,
      pickupPersonRelationship: values.pickupPersonRelationship || undefined,
      validFrom: values.validFrom || undefined,
      validUntil: values.validUntil || undefined,
    };

    createAuthorization.mutate(payload, {
      onSuccess: () => {
        form.reset();
        onOpenChange(false);
      },
    });
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Add Pickup Authorization</DialogTitle>
          <DialogDescription>
            Authorize a person to pick up your child. A QR code will be
            generated for verification.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {/* Child Select */}
            <FormField
              control={form.control}
              name="studentId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Child</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    value={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select child" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {childrenList.map((child) => (
                        <SelectItem key={child.id} value={child.id}>
                          {child.firstName} {child.lastName}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Authorized Person Name */}
            <FormField
              control={form.control}
              name="pickupPersonName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Authorized Person Name</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g. John Doe" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Phone */}
            <FormField
              control={form.control}
              name="pickupPersonPhone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Phone Number (optional)</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="e.g. +234 800 123 4567"
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
              name="pickupPersonRelationship"
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
                      <SelectItem value="FATHER">Father</SelectItem>
                      <SelectItem value="MOTHER">Mother</SelectItem>
                      <SelectItem value="UNCLE">Uncle</SelectItem>
                      <SelectItem value="AUNT">Aunt</SelectItem>
                      <SelectItem value="GUARDIAN">Guardian</SelectItem>
                      <SelectItem value="SIBLING">Sibling</SelectItem>
                      <SelectItem value="OTHER">Other</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Valid From */}
            <FormField
              control={form.control}
              name="validFrom"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Valid From (optional)</FormLabel>
                  <FormControl>
                    <Input type="date" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Valid Until */}
            <FormField
              control={form.control}
              name="validUntil"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Valid Until (optional)</FormLabel>
                  <FormControl>
                    <Input type="date" {...field} />
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
              <Button
                type="submit"
                disabled={createAuthorization.isPending}
              >
                {createAuthorization.isPending
                  ? 'Creating...'
                  : 'Add Authorization'}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
