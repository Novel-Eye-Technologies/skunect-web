'use client';

import { HelpCircle, Mail, Phone } from 'lucide-react';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { PageHeader } from '@/components/shared/page-header';
import { SiteNavbar } from '@/components/shared/site-navbar';
import { SiteFooter } from '@/components/shared/site-footer';

const faqSections = [
  {
    title: 'Getting Started',
    items: [
      {
        question: 'How do I log in to Skunect?',
        answer:
          'Use the email address and password provided by your school administrator. If this is your first time logging in, check your email for an invitation link. You can also use the OTP (One-Time Password) option for passwordless login.',
      },
      {
        question: 'How do I switch between schools?',
        answer:
          'If you have roles at multiple schools, use the school switcher dropdown in the sidebar. Click on it and select the school you want to view. All data will update automatically.',
      },
      {
        question: 'How do I update my profile information?',
        answer:
          'Click on your avatar in the top-right corner and select "Profile". From there you can update your name, phone number, and notification preferences.',
      },
    ],
  },
  {
    title: 'For Teachers',
    items: [
      {
        question: 'How do I take attendance?',
        answer:
          'Navigate to the Attendance page from the sidebar. Select your class and the date, then mark each student as Present, Absent, Late, or Excused. Click "Save" to submit the attendance record.',
      },
      {
        question: 'How do I assign homework?',
        answer:
          'Go to the Homework page and click "Create Assignment". Fill in the subject, title, description, and due date. You can assign it to a specific class. Students and parents will be notified.',
      },
      {
        question: 'How do I record student welfare observations?',
        answer:
          'Visit the Welfare page and click "Record Welfare". Select the student, choose a status (e.g., Healthy, Unwell, Needs Attention), and add any relevant notes.',
      },
      {
        question: 'How do I log student moods?',
        answer:
          'Navigate to Welfare > Mood Tracker. Click "Log Mood" to record a student\'s emotional state. You can select from options like Happy, Sad, Anxious, etc., and add notes for context.',
      },
    ],
  },
  {
    title: 'For Parents',
    items: [
      {
        question: 'How do I view my child\'s attendance?',
        answer:
          'Your dashboard shows today\'s attendance status for each of your children. For detailed attendance history, navigate to the Attendance section where you can see records by date.',
      },
      {
        question: 'How do I check pending fees?',
        answer:
          'Your dashboard displays pending fees at a glance. For a full breakdown, visit the Fees page where you can see all invoices, amounts, due dates, and payment status.',
      },
      {
        question: 'How do I view homework assignments?',
        answer:
          'The Homework page lists all assignments for your children. You can see the subject, title, due date, and submission status. Overdue assignments are highlighted.',
      },
    ],
  },
  {
    title: 'Account & Security',
    items: [
      {
        question: 'How do I change my password?',
        answer:
          'Go to your Profile settings and click "Change Password". Enter your current password followed by your new password. For security, use a strong password with a mix of letters, numbers, and symbols.',
      },
      {
        question: 'What should I do if I forget my password?',
        answer:
          'On the login page, click "Forgot Password". Enter your registered email address and you\'ll receive a password reset link. If you don\'t receive the email, check your spam folder or contact your school administrator.',
      },
      {
        question: 'How do I manage my notification preferences?',
        answer:
          'Navigate to Notification Preferences from the sidebar. You can enable or disable notifications for different categories such as attendance, homework, announcements, and fees.',
      },
    ],
  },
];

export default function HelpPage() {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <SiteNavbar />
      
      <main id="main-content" className="flex-1 px-4 py-12 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-4xl space-y-8">
          <PageHeader
            title="Help & Support"
            description="Find answers to common questions and get support."
          />

          {/* FAQ Sections */}
          <div className="space-y-6">
            {faqSections.map((section) => (
              <Card key={section.title} className="overflow-hidden border-none shadow-sm ring-1 ring-border">
                <CardHeader className="bg-muted/30">
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <HelpCircle className="h-5 w-5 text-teal" />
                    {section.title}
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  <Accordion type="multiple" className="w-full">
                    {section.items.map((item, index) => (
                      <AccordionItem
                        key={index}
                        value={`${section.title}-${index}`}
                        className="border-b px-6 last:border-0"
                      >
                        <AccordionTrigger className="py-4 text-left text-sm font-medium hover:no-underline">
                          {item.question}
                        </AccordionTrigger>
                        <AccordionContent className="pb-4 text-sm leading-relaxed text-muted-foreground">
                          {item.answer}
                        </AccordionContent>
                      </AccordionItem>
                    ))}
                  </Accordion>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Contact Support */}
          <Card className="border-none shadow-md ring-1 ring-border">
            <CardHeader>
              <CardTitle>Contact Support</CardTitle>
              <CardDescription>
                Can&apos;t find what you&apos;re looking for? Reach out to us.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="flex items-center gap-4 rounded-xl border bg-card p-5 transition-colors hover:bg-muted/20">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-teal/10 text-teal">
                    <Mail className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold">Email Support</p>
                    <p className="text-sm text-muted-foreground">
                      support@skunect.com
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-4 rounded-xl border bg-card p-5 transition-colors hover:bg-muted/20">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-teal/10 text-teal">
                    <Phone className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold">Phone Support</p>
                    <p className="text-sm text-muted-foreground">
                      +234 800 123 4567
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>

      <SiteFooter />
    </div>
  );
}

