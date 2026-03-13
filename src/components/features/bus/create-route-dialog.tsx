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
import { Textarea } from '@/components/ui/textarea';
import { useCreateBusRoute } from '@/lib/hooks/use-bus';

const routeFormSchema = z.object({
  routeName: z.string().min(1, { message: 'Route name is required' }),
  description: z.string().optional(),
  pickupPoints: z.string().optional(),
});

type RouteFormValues = z.infer<typeof routeFormSchema>;

interface CreateRouteDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CreateRouteDialog({
  open,
  onOpenChange,
}: CreateRouteDialogProps) {
  const createRoute = useCreateBusRoute();

  const form = useForm<RouteFormValues>({
    resolver: zodResolver(routeFormSchema),
    defaultValues: {
      routeName: '',
      description: '',
      pickupPoints: '',
    },
  });

  useEffect(() => {
    if (!open) {
      form.reset();
    }
  }, [open, form]);

  function onSubmit(values: RouteFormValues) {
    const pickupPoints = values.pickupPoints
      ? values.pickupPoints
          .split(',')
          .map((p) => p.trim())
          .filter(Boolean)
      : undefined;

    createRoute.mutate(
      {
        routeName: values.routeName,
        description: values.description || undefined,
        pickupPoints,
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
          <DialogTitle>Create Bus Route</DialogTitle>
          <DialogDescription>
            Add a new bus route with pickup points.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {/* Route Name */}
            <FormField
              control={form.control}
              name="routeName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Route Name</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g. Lekki - Victoria Island" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Description */}
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Describe the route details..."
                      className="min-h-[80px] resize-none"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Pickup Points */}
            <FormField
              control={form.control}
              name="pickupPoints"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Pickup Points</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="e.g. Bus Stop A, Bus Stop B, Bus Stop C"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                  <p className="text-xs text-muted-foreground">
                    Enter pickup points separated by commas.
                  </p>
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
              <Button type="submit" disabled={createRoute.isPending}>
                {createRoute.isPending ? 'Creating...' : 'Create Route'}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
