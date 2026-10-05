'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getSession, tokenExpiry } from '@/services/session';
export default function HomePage() {
  const router = useRouter();
  useEffect(() => {
    const session = getSession();
    router.replace(
      session && (tokenExpiry(session.token) || 0) > Date.now()
        ? session.profile === 'autopilot'
          ? '/backoffice/app/dashboard'
          : '/app/dashboard'
        : '/auth/login',
    );
  }, [router]);
  return <main className="min-h-screen grid place-content-center text-primary">AutoPilot CRM</main>;
}
