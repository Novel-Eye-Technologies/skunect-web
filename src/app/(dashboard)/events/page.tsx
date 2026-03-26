'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function EventsPage() {
  const router = useRouter();
  
  useEffect(() => {
    router.replace('/calendar');
  }, [router]);
  return null;
}
