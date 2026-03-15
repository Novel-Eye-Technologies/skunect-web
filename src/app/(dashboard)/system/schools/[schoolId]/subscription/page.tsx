import { SchoolSubscriptionClient } from './school-subscription-client';

export function generateStaticParams() {
  return [{ schoolId: '_' }];
}

export default function SchoolSubscriptionPage() {
  return <SchoolSubscriptionClient />;
}
