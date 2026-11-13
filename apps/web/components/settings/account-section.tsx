'use client';

import { LogOut } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useAuth } from '@/components/auth/auth-provider';
import { Button } from '@/components/ui/button';

export function AccountSection() {
  const router = useRouter();
  const { signOut } = useAuth();
  const [pending, setPending] = useState(false);

  async function handleSignOut() {
    setPending(true);
    // TODO: REMOVE MOCK — Replace simulated logout with backend integration.
    await signOut();
    router.replace('/login');
    router.refresh();
  }

  return (
    <div className="flex max-w-lg flex-col gap-3">
      <p className="text-sm text-foreground-secondary">
        Signing out clears the mock session cookie and returns you to the login screen.
      </p>
      <Button
        type="button"
        variant="secondary"
        className="self-start"
        onClick={() => {
          void handleSignOut();
        }}
        disabled={pending}
      >
        <LogOut className="size-4" aria-hidden="true" />
        {pending ? 'Signing out…' : 'Log out'}
      </Button>
    </div>
  );
}
