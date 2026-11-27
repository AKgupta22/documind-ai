'use client';

import { Loader2, MailCheck } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';
import { StatusMessage } from '@/components/shared/status-message';
import { Button } from '@/components/ui/button';
import { verifyEmail } from '@/lib/auth/mock-auth-service';

interface VerificationMessageProps {
  email: string;
}

export function VerificationMessage({ email }: VerificationMessageProps) {
  const [resendState, setResendState] = useState<'idle' | 'sending' | 'sent'>('idle');

  async function handleResend() {
    setResendState('sending');
    // TODO: REMOVE MOCK — Replace simulated verification email with backend integration.
    await verifyEmail();
    setResendState('sent');
  }

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-col items-center gap-3 text-center">
        <span className="flex size-12 items-center justify-center rounded-full bg-primary-subtle text-primary">
          <MailCheck className="size-6" aria-hidden="true" />
        </span>
        <p className="text-sm text-foreground-secondary">
          Verification instructions would be sent to{' '}
          <span className="font-medium text-foreground">{email}</span>. This prototype does
          not send email, so the address stays unverified and sign-in remains blocked.
        </p>
      </div>

      <div className="rounded-md border border-border bg-surface-secondary p-3 text-sm text-foreground-secondary">
        <p className="font-medium text-foreground">Simulated steps</p>
        <ol className="mt-1 list-decimal space-y-1 pl-4">
          <li>Check the inbox for a verification message.</li>
          <li>Open the link in the message.</li>
          <li>Return here and sign in with your new account.</li>
        </ol>
      </div>

      {resendState === 'sent' ? (
        <StatusMessage tone="info">
          A verification message would be sent again. Nothing was delivered in this
          prototype.
        </StatusMessage>
      ) : null}

      <div className="flex flex-col gap-2">
        <Button
          type="button"
          variant="secondary"
          onClick={() => {
            void handleResend();
          }}
          disabled={resendState === 'sending'}
        >
          {resendState === 'sending' ? (
            <Loader2 className="size-4 animate-spin" aria-hidden="true" />
          ) : null}
          {resendState === 'sending' ? 'Sending…' : 'Resend verification'}
        </Button>
        <Link
          href="/login"
          className="text-center text-sm font-medium text-primary hover:underline"
        >
          Back to sign in
        </Link>
      </div>
    </div>
  );
}
