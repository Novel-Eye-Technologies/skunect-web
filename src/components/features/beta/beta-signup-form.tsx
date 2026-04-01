'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import axios from 'axios';
import {
  Loader2,
  CheckCircle2,
  ChevronsUpDown,
  Check,
  ChevronRight,
  ArrowLeft,
} from 'lucide-react';
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

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const SCHOOL_ROLES = ['SCHOOL_OWNER', 'SCHOOL_ADMIN'] as const;

const NIGERIAN_STATES = [
  'Abia',
  'Adamawa',
  'Akwa Ibom',
  'Anambra',
  'Bauchi',
  'Bayelsa',
  'Benue',
  'Borno',
  'Cross River',
  'Delta',
  'Ebonyi',
  'Edo',
  'Ekiti',
  'Enugu',
  'FCT - Abuja',
  'Gombe',
  'Imo',
  'Jigawa',
  'Kaduna',
  'Kano',
  'Katsina',
  'Kebbi',
  'Kogi',
  'Kwara',
  'Lagos',
  'Nasarawa',
  'Niger',
  'Ogun',
  'Ondo',
  'Osun',
  'Oyo',
  'Plateau',
  'Rivers',
  'Sokoto',
  'Taraba',
  'Yobe',
  'Zamfara',
];

// ---------------------------------------------------------------------------
// Schema
// ---------------------------------------------------------------------------

const betaSignupSchema = z
  .object({
    firstName: z.string().trim().min(1, 'First name is required'),
    lastName: z.string().trim().min(1, 'Last name is required'),
    email: z
      .string()
      .trim()
      .min(1, 'Email is required')
      .email('Please enter a valid email'),
    phone: z.string().optional().refine(
      (val) => {
        if (!val || !val.trim()) return true;
        return val.replace(/\D/g, '').length >= 10;
      },
      { message: 'Please enter a valid phone number (at least 10 digits)' },
    ),
    role: z.enum(['SCHOOL_OWNER', 'SCHOOL_ADMIN', 'TEACHER', 'PARENT'], {
      message: 'Please select your role',
    }),
    schoolName: z.string().min(1, 'School name is required'),
    schoolSize: z.string().optional(),
    hasExistingSystem: z.string().optional(),
    city: z.string().trim().min(1, 'City is required'),
    state: z.string().min(1, 'State is required'),
  })
  .superRefine((data, ctx) => {
    if (SCHOOL_ROLES.includes(data.role as (typeof SCHOOL_ROLES)[number])) {
      if (!data.schoolSize) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'School size is required',
          path: ['schoolSize'],
        });
      }
      if (!data.hasExistingSystem) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Please select an option',
          path: ['hasExistingSystem'],
        });
      }
    }
  });

type BetaSignupFormValues = z.infer<typeof betaSignupSchema>;

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function BetaSignupForm() {
  const [step, setStep] = useState(1);
  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [schoolPopoverOpen, setSchoolPopoverOpen] = useState(false);
  const [schoolSearch, setSchoolSearch] = useState('');

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
      city: '',
      state: 'Lagos',
      hasExistingSystem: '',
    },
  });

  const selectedRole = form.watch('role');
  const isSchoolRole = SCHOOL_ROLES.includes(
    selectedRole as (typeof SCHOOL_ROLES)[number],
  );

  async function handleContinue() {
    const valid = await form.trigger([
      'firstName',
      'lastName',
      'email',
      'phone',
      'role',
    ]);
    if (valid) setStep(2);
  }

  async function onSubmit(data: BetaSignupFormValues) {
    setIsSubmitting(true);
    try {
      const { state, hasExistingSystem, city, ...rest } = data;
      const response = await createBetaSignup({
        ...rest,
        city: `${city}, ${state}`,
        hasExistingSystem: hasExistingSystem === 'yes',
      });
      if (response.status === 'SUCCESS') {
        setSubmitted(true);
        toast.success('Application submitted!');
      } else {
        toast.error(response.message || 'Something went wrong');
      }
    } catch (error: unknown) {
      if (axios.isAxiosError(error) && error.response?.status === 429) {
        toast.error('Too many requests. Please wait a moment and try again.');
      } else {
        toast.error(getApiErrorMessage(error, 'Something went wrong'));
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  // ── Success state ──────────────────────────────────────────────
  if (submitted) {
    return (
      <div className="rounded-2xl border bg-card p-8 text-center sm:p-12">
        <div className="mx-auto mb-5 flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-teal/20 to-emerald-50">
          <CheckCircle2 className="h-10 w-10 text-teal" />
        </div>
        <h3 className="font-display text-2xl">Application Received!</h3>
        <p className="mt-3 leading-relaxed text-muted-foreground">
          Thank you for applying to the Skunect beta program. School owners and
          admins receive priority invitations.
        </p>
        <div className="mt-8 rounded-xl bg-sage/50 p-5 text-left">
          <p className="text-sm font-semibold">What happens next?</p>
          <ol className="mt-3 space-y-2.5 text-sm text-muted-foreground">
            {[
              "We\u2019ll review your application",
              "You\u2019ll receive an invitation email",
              'Complete your school enrollment',
              'Start using Skunect for free',
            ].map((text, i) => (
              <li key={i} className="flex items-start gap-3">
                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-teal/10 text-xs font-semibold text-teal">
                  {i + 1}
                </span>
                <span>{text}</span>
              </li>
            ))}
          </ol>
        </div>
      </div>
    );
  }

  // ── Form ───────────────────────────────────────────────────────
  return (
    <div className="rounded-2xl border bg-card p-6 sm:p-8">
      {/* Header */}
      <div className="mb-2 text-center">
        <h3 className="text-xl font-bold">Join the Beta Program</h3>
        <p className="mt-1 text-sm text-muted-foreground">
          {step === 1 ? 'Tell us about yourself' : 'Tell us about your school'}
        </p>
      </div>

      {/* Step indicator */}
      <div className="mx-auto mb-6 flex max-w-[200px] items-center gap-2">
        <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-teal text-xs font-semibold text-white">
          {step > 1 ? <Check className="h-3.5 w-3.5" /> : '1'}
        </div>
        <div
          className={`h-0.5 flex-1 transition-colors duration-300 ${
            step >= 2 ? 'bg-teal' : 'bg-border'
          }`}
        />
        <div
          className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-semibold transition-colors duration-300 ${
            step >= 2
              ? 'bg-teal text-white'
              : 'bg-muted text-muted-foreground'
          }`}
        >
          2
        </div>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          {/* ── Step 1: Personal Details ── */}
          {step === 1 && (
            <div className="animate-fade-in space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <FormField
                  control={form.control}
                  name="firstName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>First name</FormLabel>
                      <FormControl>
                        <Input placeholder="Ade" {...field} />
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
                        <Input placeholder="Johnson" {...field} />
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
                      Phone number{' '}
                      <span className="text-muted-foreground">(optional)</span>
                    </FormLabel>
                    <FormControl>
                      <Input
                        type="tel"
                        placeholder="+234 800 000 0000"
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
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select your role" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="SCHOOL_OWNER">
                          School Owner
                        </SelectItem>
                        <SelectItem value="SCHOOL_ADMIN">
                          School Administrator
                        </SelectItem>
                        <SelectItem value="TEACHER">Teacher</SelectItem>
                        <SelectItem value="PARENT">Parent</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button
                type="button"
                className="mt-2 w-full bg-teal text-white hover:bg-teal/90"
                size="lg"
                onClick={handleContinue}
              >
                Continue
                <ChevronRight className="ml-1 h-4 w-4" />
              </Button>
            </div>
          )}

          {/* ── Step 2: School Details ── */}
          {step === 2 && (
            <div className="animate-fade-in space-y-4">
              <FormField
                control={form.control}
                name="schoolName"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>School name</FormLabel>
                    <Popover
                      open={schoolPopoverOpen}
                      onOpenChange={(open) => {
                        setSchoolPopoverOpen(open);
                        if (open) setSchoolSearch(field.value || '');
                      }}
                    >
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
                      <PopoverContent
                        className="w-[var(--radix-popover-trigger-width)] p-0"
                        align="start"
                      >
                        <Command>
                          <CommandInput
                            placeholder="Search or type school name..."
                            value={schoolSearch}
                            onValueChange={setSchoolSearch}
                          />
                          <CommandList>
                            <CommandEmpty className="py-3 text-center text-sm text-muted-foreground">
                              Type your school name and select it below
                            </CommandEmpty>
                            {schoolSearch.trim() && (
                              <CommandGroup heading="Your entry">
                                <CommandItem
                                  value={`custom-${schoolSearch}`}
                                  onSelect={() => {
                                    field.onChange(schoolSearch.trim());
                                    setSchoolPopoverOpen(false);
                                  }}
                                >
                                  <Check className="mr-2 h-4 w-4 opacity-100" />
                                  <span>
                                    Use &quot;{schoolSearch.trim()}&quot;
                                  </span>
                                </CommandItem>
                              </CommandGroup>
                            )}
                            <CommandGroup heading="Suggestions">
                              {lagosSchools.map((school) => (
                                <CommandItem
                                  key={school.name}
                                  value={school.name}
                                  onSelect={(value) => {
                                    field.onChange(value);
                                    setSchoolSearch(value);
                                    setSchoolPopoverOpen(false);
                                  }}
                                >
                                  <Check
                                    className={cn(
                                      'mr-2 h-4 w-4',
                                      field.value === school.name
                                        ? 'opacity-100'
                                        : 'opacity-0',
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

              {isSchoolRole && (
                <div className="grid gap-4 sm:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="schoolSize"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>School size</FormLabel>
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
                            <SelectItem value="1-50">
                              1 - 50 students
                            </SelectItem>
                            <SelectItem value="51-200">
                              51 - 200 students
                            </SelectItem>
                            <SelectItem value="201-500">
                              201 - 500 students
                            </SelectItem>
                            <SelectItem value="501-1000">
                              501 - 1,000 students
                            </SelectItem>
                            <SelectItem value="1001-2000">
                              1,001 - 2,000 students
                            </SelectItem>
                            <SelectItem value="2000+">
                              2,000+ students
                            </SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="hasExistingSystem"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Existing school system?</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                          disabled={isSubmitting}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="yes">Yes</SelectItem>
                            <SelectItem value="no">No</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              )}

              <div className="grid gap-4 sm:grid-cols-2">
                <FormField
                  control={form.control}
                  name="city"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>City</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="e.g. Ikeja"
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
                  name="state"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>State</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                        disabled={isSubmitting}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select state" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {NIGERIAN_STATES.map((state) => (
                            <SelectItem key={state} value={state}>
                              {state}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="mt-2 flex gap-3">
                <Button
                  type="button"
                  variant="outline"
                  size="lg"
                  onClick={() => setStep(1)}
                  disabled={isSubmitting}
                >
                  <ArrowLeft className="mr-1 h-4 w-4" />
                  Back
                </Button>
                <Button
                  type="submit"
                  className="flex-1 bg-teal text-white hover:bg-teal/90"
                  size="lg"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      <span>Submitting...</span>
                    </>
                  ) : (
                    'Submit Application'
                  )}
                </Button>
              </div>
            </div>
          )}
        </form>
      </Form>

      <p className="mt-4 text-center text-xs text-muted-foreground">
        By submitting, you agree to be contacted about the Skunect beta
        program.
      </p>
    </div>
  );
}
