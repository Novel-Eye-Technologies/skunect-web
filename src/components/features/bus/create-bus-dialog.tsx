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
import { useCreateBus, useBusRoutes } from '@/lib/hooks/use-bus';

const busFormSchema = z.object({
  routeId: z.string().optional(),
  plateNumber: z.string().min(1, { message: 'Plate number is required' }),
  capacity: z.number().min(1, { message: 'Capacity must be at least 1' }),
  driverName: z.string().min(1, { message: 'Driver name is required' }),
  driverPhone: z.string().min(1, { message: 'Driver phone is required' }),
});

type BusFormValues = z.infer<typeof busFormSchema>;

interface CreateBusDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CreateBusDialog({ open, onOpenChange }: CreateBusDialogProps) {
  const createBus = useCreateBus();
  const { data: routesResponse } = useBusRoutes();
  const routes = routesResponse?.data ?? [];

  const form = useForm<BusFormValues>({
    resolver: zodResolver(busFormSchema),
    defaultValues: {
      routeId: undefined,
      plateNumber: '',
      capacity: 0,
      driverName: '',
      driverPhone: '',
    },
  });

  useEffect(() => {
    if (!open) {
      form.reset();
    }
  }, [open, form]);

  function onSubmit(values: BusFormValues) {
    createBus.mutate(
      {
        routeId: values.routeId || '',
        plateNumber: values.plateNumber,
        capacity: values.capacity,
        driverName: values.driverName,
        driverPhone: values.driverPhone,
      },
      {
        onSuccess: () => {
          form.reset();
          onOpenChange(false);
        },
      },
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Add Bus</DialogTitle>
          <DialogDescription>
            Register a new school bus with driver details.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {/* Route */}
            <FormField
              control={form.control}
              name="routeId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Route (Optional)</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    value={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a route" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {routes.map((route) => (
                        <SelectItem key={route.id} value={route.id}>
                          {route.routeName}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Plate Number */}
            <FormField
              control={form.control}
              name="plateNumber"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Plate Number</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g. LAG-123-XY" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Capacity */}
            <FormField
              control={form.control}
              name="capacity"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Capacity</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      min={1}
                      placeholder="e.g. 30"
                      {...field}
                      onChange={(e) =>
                        field.onChange(e.target.valueAsNumber || 0)
                      }
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Driver Name */}
            <FormField
              control={form.control}
              name="driverName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Driver Name</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g. John Okafor" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Driver Phone */}
            <FormField
              control={form.control}
              name="driverPhone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Driver Phone</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g. 08012345678" {...field} />
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
              <Button type="submit" disabled={createBus.isPending}>
                {createBus.isPending ? 'Adding...' : 'Add Bus'}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
