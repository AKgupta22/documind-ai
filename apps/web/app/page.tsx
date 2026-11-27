'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { AuthLoading } from '@/components/auth/auth-loading';
import { useAuth } from '@/components/auth/auth-provider';

export default function HomePage() {
  const router = useRouter();
  const { user, isReady } = useAuth();

  useEffect(() => {
    if (isReady) {
      router.replace(user === null ? '/login' : '/dashboard');
    }
  }, [isReady, router, user]);

  return <AuthLoading />;
}
