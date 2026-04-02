'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Loader2,
  CheckCircle2,
  ChevronRight,
  ChevronLeft,
  School,
  User,
  CreditCard,
  FileCheck,
} from 'lucide-react';
import { toast } from 'sonner';
import Link from 'next/link';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { PricingCalculator } from '@/components/features/beta/pricing-calculator';
import { acceptBetaInvitation } from '@/lib/api/beta';
import type { BetaSignup } from '@/lib/types/beta';
import { getApiErrorMessage } from '@/lib/utils/get-error-message';

const enrollmentSchema = z.object({
  schoolName: z.string().min(1, 'School name is required'),
  schoolEmail: z.string().email('Valid school email is required'),
  schoolPhone: z.string().optional(),
  schoolAddress: z.string().optional(),
  schoolCity: z.string().optional(),
  schoolState: z.string().optional(),
  adminFirstName: z.string().min(1, 'First name is required'),
  adminLastName: z.string().min(1, 'Last name is required'),
  adminEmail: z.string().email('Valid email is required'),
  adminPhone: z.string().optional(),
  studentCount: z.number().min(1, 'Enter number of students'),
  acceptTerms: z.literal(true, {
    message: 'You must accept the terms',
  }),
  acceptPrivacy: z.literal(true, {
    message: 'You must accept the privacy policy',
  }),
});

type EnrollmentFormValues = z.infer<typeof enrollmentSchema>;

interface EnrollmentFormProps {
  token: string;
  signup: BetaSignup;
}

const steps = [
  { id: 'school', label: 'School Details', icon: School },
  { id: 'admin', label: 'Admin Account', icon: User },
  { id: 'pricing', label: 'License & Pricing', icon: CreditCard },
  { id: 'terms', label: 'Terms & Submit', icon: FileCheck },
];

export function EnrollmentForm({ token, signup }: EnrollmentFormProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [completed, setCompleted] = useState(false);
  const [schoolCode, setSchoolCode] = useState('');

  const form = useForm<EnrollmentFormValues>({
    resolver: zodResolver(enrollmentSchema),
    defaultValues: {
      schoolName: signup.schoolName || '',
      schoolEmail: '',
      schoolPhone: '',
      schoolAddress: '',
      schoolCity: 'Lagos',
      schoolState: 'Lagos',
      adminFirstName: signup.firstName,
      adminLastName: signup.lastName,
      adminEmail: signup.email,
      adminPhone: signup.phone || '',
      studentCount: 0,
      acceptTerms: false as unknown as true,
      acceptPrivacy: false as unknown as true,
    },
  });

  async function onSubmit(data: EnrollmentFormValues) {
    setIsSubmitting(true);
    try {
      const response = await acceptBetaInvitation(token, {
        schoolName: data.schoolName,
        schoolEmail: data.schoolEmail,
        schoolPhone: data.schoolPhone,
        schoolAddress: data.schoolAddress,
        schoolCity: data.schoolCity,
        schoolState: data.schoolState,
        adminFirstName: data.adminFirstName,
        adminLastName: data.adminLastName,
        adminEmail: data.adminEmail,
        adminPhone: data.adminPhone,
        studentCount: data.studentCount,
      });

      if (response.status === 'SUCCESS') {
        setCompleted(true);
        // Try to extract school code from the response or just show success
        setSchoolCode(data.schoolName.substring(0, 3).toUpperCase());
        toast.success('Enrollment completed!');
      } else {
        toast.error(response.message || 'Enrollment failed');
      }
    } catch (error: unknown) {
      toast.error(getApiErrorMessage(error, 'Something went wrong'));
    } finally {
      setIsSubmitting(false);
    }
  }

  // Validate current step fields before advancing
  async function handleNext() {
    let fieldsToValidate: (keyof EnrollmentFormValues)[] = [];

    switch (currentStep) {
      case 0:
        fieldsToValidate = ['schoolName', 'schoolEmail'];
        break;
      case 1:
        fieldsToValidate = ['adminFirstName', 'adminLastName', 'adminEmail'];
        break;
      case 2:
        fieldsToValidate = ['studentCount'];
        break;
    }

    const isValid = await form.trigger(fieldsToValidate);
    if (isValid) setCurrentStep((prev) => Math.min(prev + 1, steps.length - 1));
  }

  if (completed) {
    return (
      <div className="mx-auto max-w-lg rounded-2xl border bg-card p-8 text-center sm:p-12">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-teal/10">
          <CheckCircle2 className="h-8 w-8 text-teal" />
        </div>
        <h2 className="font-display text-2xl">Welcome to Skunect!</h2>
        <p className="mt-3 text-muted-foreground">
          Your school has been set up. You can now log in and start configuring
          your school.
        </p>
        {schoolCode && (
          <div className="mt-4 rounded-lg bg-muted/50 p-4">
            <p className="text-xs text-muted-foreground">Your School Code</p>
            <p className="text-2xl font-bold tracking-wider">{schoolCode}</p>
          </div>
        )}
        <div className="mt-6 space-y-3">
          <Link href="/login" className="block">
            <Button className="w-full bg-teal text-white hover:bg-teal/90">
              Log In to Skunect
              <ChevronRight className="ml-1 h-4 w-4" />
            </Button>
          </Link>
        </div>
        <div className="mt-6 rounded-lg bg-muted/50 p-4 text-left text-sm">
          <p className="font-medium">Next Steps:</p>
          <ul className="mt-2 space-y-1 text-muted-foreground">
            <li>1. Log in with your email and OTP</li>
            <li>2. Configure your school settings</li>
            <li>3. Add classes and subjects</li>
            <li>4. Invite teachers and parents</li>
          </ul>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl">
      {/* Step Indicator */}
      <div className="mb-8 flex items-center justify-center gap-2 sm:gap-4">
        {steps.map((step, index) => (
          <div key={step.id} className="flex items-center gap-2">
            {index > 0 && (
              <div
                className={`hidden h-0.5 w-6 sm:block ${
                  index <= currentStep ? 'bg-teal' : 'bg-muted'
                }`}
              />
            )}
            <button
              type="button"
              onClick={() => index < currentStep && setCurrentStep(index)}
              className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
                index === currentStep
                  ? 'bg-teal text-white'
                  : index < currentStep
                    ? 'bg-teal/10 text-teal cursor-pointer'
                    : 'bg-muted text-muted-foreground'
              }`}
            >
              <step.icon className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">{step.label}</span>
              <span className="sm:hidden">{index + 1}</span>
            </button>
          </div>
        ))}
      </div>

      <div className="rounded-2xl border bg-card p-6 sm:p-8">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            {/* Step 1: School Details */}
            {currentStep === 0 && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">School Details</h3>
                <p className="text-sm text-muted-foreground">
                  Tell us about your school
                </p>

                <FormField
                  control={form.control}
                  name="schoolName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>School name</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="schoolEmail"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>School email</FormLabel>
                      <FormControl>
                        <Input type="email" placeholder="info@school.ng" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="schoolPhone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        Phone <span className="text-muted-foreground">(optional)</span>
                      </FormLabel>
                      <FormControl>
                        <Input type="tel" placeholder="+234..." {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="schoolAddress"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        Address <span className="text-muted-foreground">(optional)</span>
                      </FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid gap-4 sm:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="schoolCity"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>City</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="schoolState"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>State</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>
            )}

            {/* Step 2: Admin Account */}
            {currentStep === 1 && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Admin Account</h3>
                <p className="text-sm text-muted-foreground">
                  This person will be the school administrator
                </p>

                <div className="grid gap-4 sm:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="adminFirstName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>First name</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="adminLastName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Last name</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="adminEmail"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input type="email" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="adminPhone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        Phone <span className="text-muted-foreground">(optional)</span>
                      </FormLabel>
                      <FormControl>
                        <Input type="tel" placeholder="+234..." {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            )}

            {/* Step 3: Pricing */}
            {currentStep === 2 && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">License & Pricing</h3>
                <p className="text-sm text-muted-foreground">
                  Enter your expected student count to see pricing estimates
                </p>

                <PricingCalculator
                  studentCount={form.watch('studentCount')}
                  onStudentCountChange={(count) =>
                    form.setValue('studentCount', count, { shouldValidate: true })
                  }
                  isBeta={true}
                  discountPercent={20}
                />
              </div>
            )}

            {/* Step 4: Terms & Submit */}
            {currentStep === 3 && (
              <div className="space-y-6">
                <h3 className="text-lg font-semibold">Review & Submit</h3>

                {/* Summary */}
                <div className="space-y-3 rounded-lg bg-muted/50 p-4 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">School</span>
                    <span className="font-medium">
                      {form.getValues('schoolName')}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Admin</span>
                    <span className="font-medium">
                      {form.getValues('adminFirstName')}{' '}
                      {form.getValues('adminLastName')}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Admin Email</span>
                    <span className="font-medium">
                      {form.getValues('adminEmail')}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Students</span>
                    <span className="font-medium">
                      {form.getValues('studentCount')}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Plan</span>
                    <span className="font-medium text-teal">
                      Free (Beta)
                    </span>
                  </div>
                </div>

                <FormField
                  control={form.control}
                  name="acceptTerms"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                      <FormControl>
                        <Checkbox
                          checked={!!field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel>
                          I agree to the Terms of Service
                        </FormLabel>
                        <FormMessage />
                      </div>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="acceptPrivacy"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                      <FormControl>
                        <Checkbox
                          checked={!!field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel>
                          I agree to the Privacy Policy
                        </FormLabel>
                        <FormMessage />
                      </div>
                    </FormItem>
                  )}
                />
              </div>
            )}

            {/* Navigation Buttons */}
            <div className="mt-8 flex items-center justify-between">
              <Button
                type="button"
                variant="outline"
                onClick={() => setCurrentStep((prev) => Math.max(prev - 1, 0))}
                disabled={currentStep === 0}
              >
                <ChevronLeft className="mr-1 h-4 w-4" />
                Back
              </Button>

              {currentStep < steps.length - 1 ? (
                <Button type="button" onClick={handleNext}>
                  Next
                  <ChevronRight className="ml-1 h-4 w-4" />
                </Button>
              ) : (
                <Button
                  type="submit"
                  className="bg-teal text-white hover:bg-teal/90"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <Loader2 className="mr-1 h-4 w-4 animate-spin" />
                  ) : (
                    'Complete Enrollment'
                  )}
                </Button>
              )}
            </div>
          </form>
        </Form>
      </div>
    </div>
  );
}
