'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { AuthLoading } from '@/components/auth/auth-loading';
import { AuthLayout } from '@/components/auth/auth-layout';
import { useAuth } from '@/components/auth/auth-provider';

export default function AuthGroupLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const router = useRouter();
  const { user, isReady } = useAuth();

  useEffect(() => {
    if (isReady && user !== null) {
      router.replace('/dashboard');
    }
  }, [isReady, router, user]);

  if (!isReady || user !== null) {
    return <AuthLoading />;
  }

  return <AuthLayout>{children}</AuthLayout>;
}
