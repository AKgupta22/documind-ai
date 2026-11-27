'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { AuthLoading } from '@/components/auth/auth-loading';
import { useAuth } from '@/components/auth/auth-provider';
import { AppShell } from '@/components/shared/app-shell';

export default function AppGroupLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const router = useRouter();
  const { user, isReady } = useAuth();

  useEffect(() => {
    if (isReady && user === null) {
      router.replace('/login');
    }
  }, [isReady, router, user]);

  if (!isReady || user === null) {
    return <AuthLoading />;
  }

  return <AppShell>{children}</AppShell>;
}
