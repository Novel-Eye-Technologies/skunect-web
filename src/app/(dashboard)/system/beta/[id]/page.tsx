import { BetaSignupDetail } from '@/components/features/beta/beta-signup-detail';

export function generateStaticParams() {
  return [{ id: '_' }];
}

export default function BetaSignupDetailPage() {
  return <BetaSignupDetail />;
}
