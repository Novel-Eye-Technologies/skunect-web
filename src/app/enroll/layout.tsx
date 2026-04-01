import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Complete Enrollment',
  description:
    'Complete your school enrollment on Skunect. Set up your school and start connecting with parents and teachers.',
};

export default function EnrollLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
