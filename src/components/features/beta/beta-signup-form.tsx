'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Loader2, CheckCircle2, ChevronsUpDown, Check } from 'lucide-react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { lagosSchools } from '@/lib/data/lagos-schools';
import { createBetaSignup } from '@/lib/api/beta';
import { getApiErrorMessage } from '@/lib/utils/get-error-message';

const betaSignupSchema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  email: z.string().min(1, 'Email is required').email('Please enter a valid email'),
  phone: z.string().optional(),
  role: z.enum(['SCHOOL_OWNER', 'SCHOOL_ADMIN', 'TEACHER', 'PARENT'], {
    message: 'Please select your role',
  }),
  schoolName: z.string().optional(),
  schoolSize: z.string().optional(),
  city: z.string().optional(),
});

type BetaSignupFormValues = z.infer<typeof betaSignupSchema>;

export function BetaSignupForm() {
  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [schoolPopoverOpen, setSchoolPopoverOpen] = useState(false);

  const form = useForm<BetaSignupFormValues>({
    resolver: zodResolver(betaSignupSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      role: undefined,
      schoolName: '',
      schoolSize: '',
      city: 'Lagos',
    },
  });

  async function onSubmit(data: BetaSignupFormValues) {
    setIsSubmitting(true);
    try {
      const response = await createBetaSignup(data);
      if (response.status === 'SUCCESS') {
        setSubmitted(true);
        toast.success('Application submitted!');
      } else {
        toast.error(response.message || 'Something went wrong');
      }
    } catch (error: unknown) {
      toast.error(getApiErrorMessage(error, 'Something went wrong'));
    } finally {
      setIsSubmitting(false);
    }
  }

  if (submitted) {
    return (
      <div className="rounded-2xl border bg-card p-8 text-center sm:p-12">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-teal/10">
          <CheckCircle2 className="h-8 w-8 text-teal" />
        </div>
        <h3 className="text-2xl font-bold">Thank You!</h3>
        <p className="mt-3 text-muted-foreground">
          We&apos;ve received your application. School owners and admins receive
          priority invitations. We&apos;ll be in touch soon!
        </p>
        <div className="mt-6 rounded-lg bg-muted/50 p-4 text-sm text-muted-foreground">
          <p className="font-medium text-foreground">What happens next?</p>
          <ul className="mt-2 space-y-1 text-left">
            <li>1. We&apos;ll review your application</li>
            <li>2. You&apos;ll receive an invitation email</li>
            <li>3. Complete your school enrollment</li>
            <li>4. Start using Skunect for free during beta</li>
          </ul>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border bg-card p-6 sm:p-8">
      <div className="mb-6 text-center">
        <h3 className="text-xl font-bold">Join the Beta Program</h3>
        <p className="mt-1 text-sm text-muted-foreground">
          Fill out the form below and we&apos;ll be in touch
        </p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <FormField
              control={form.control}
              name="firstName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>First name</FormLabel>
                  <FormControl>
                    <Input placeholder="Ade" disabled={isSubmitting} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="lastName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Last name</FormLabel>
                  <FormControl>
                    <Input placeholder="Johnson" disabled={isSubmitting} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email address</FormLabel>
                <FormControl>
                  <Input
                    type="email"
                    placeholder="ade@school.ng"
                    disabled={isSubmitting}
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="phone"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  Phone number <span className="text-muted-foreground">(optional)</span>
                </FormLabel>
                <FormControl>
                  <Input
                    type="tel"
                    placeholder="+234 800 000 0000"
                    disabled={isSubmitting}
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="role"
            render={({ field }) => (
              <FormItem>
                <FormLabel>I am a...</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                  disabled={isSubmitting}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select your role" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="SCHOOL_OWNER">School Owner</SelectItem>
                    <SelectItem value="SCHOOL_ADMIN">School Administrator</SelectItem>
                    <SelectItem value="TEACHER">Teacher</SelectItem>
                    <SelectItem value="PARENT">Parent</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="schoolName"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>
                  School name <span className="text-muted-foreground">(optional)</span>
                </FormLabel>
                <Popover open={schoolPopoverOpen} onOpenChange={setSchoolPopoverOpen}>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant="outline"
                        role="combobox"
                        className={cn(
                          'w-full justify-between font-normal',
                          !field.value && 'text-muted-foreground',
                        )}
                        disabled={isSubmitting}
                      >
                        {field.value || 'Search or type school name...'}
                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0" align="start">
                    <Command>
                      <CommandInput
                        placeholder="Search schools..."
                        onValueChange={(search) => {
                          // Allow free text entry
                          if (search) field.onChange(search);
                        }}
                      />
                      <CommandList>
                        <CommandEmpty>
                          <button
                            type="button"
                            className="w-full px-2 py-1.5 text-left text-sm"
                            onClick={() => {
                              setSchoolPopoverOpen(false);
                            }}
                          >
                            Use typed name
                          </button>
                        </CommandEmpty>
                        <CommandGroup>
                          {lagosSchools.map((school) => (
                            <CommandItem
                              key={school.name}
                              value={school.name}
                              onSelect={(value) => {
                                field.onChange(value);
                                setSchoolPopoverOpen(false);
                              }}
                            >
                              <Check
                                className={cn(
                                  'mr-2 h-4 w-4',
                                  field.value === school.name ? 'opacity-100' : 'opacity-0',
                                )}
                              />
                              <span>{school.name}</span>
                              <span className="ml-auto text-xs text-muted-foreground">
                                {school.area}
                              </span>
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="grid gap-4 sm:grid-cols-2">
            <FormField
              control={form.control}
              name="schoolSize"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    School size <span className="text-muted-foreground">(optional)</span>
                  </FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                    disabled={isSubmitting}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Number of students" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="1-50">1 - 50 students</SelectItem>
                      <SelectItem value="51-200">51 - 200 students</SelectItem>
                      <SelectItem value="201-500">201 - 500 students</SelectItem>
                      <SelectItem value="501-1000">501 - 1,000 students</SelectItem>
                      <SelectItem value="1001-2000">1,001 - 2,000 students</SelectItem>
                      <SelectItem value="2000+">2,000+ students</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="city"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    City <span className="text-muted-foreground">(optional)</span>
                  </FormLabel>
                  <FormControl>
                    <Input placeholder="Lagos" disabled={isSubmitting} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <Button
            type="submit"
            className="mt-2 w-full bg-teal text-white hover:bg-teal/90"
            size="lg"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              'Submit Application'
            )}
          </Button>

          <p className="text-center text-xs text-muted-foreground">
            By submitting, you agree to be contacted about the Skunect beta program.
          </p>
        </form>
      </Form>
    </div>
  );
}
