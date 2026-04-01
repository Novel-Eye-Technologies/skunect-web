import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Beta Program',
  description:
    'Join the Skunect beta program. Free access to real-time attendance, grades, messaging, and fee management for African schools.',
};

export default function BetaLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
