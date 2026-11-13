'use client';

import { Loader2 } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';
import { FormField } from '@/components/auth/form-field';
import { StatusMessage } from '@/components/shared/status-message';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { forgotPassword } from '@/lib/auth/mock-auth-service';
import { validateEmail } from '@/lib/auth/validation';
import { MOCK_RESET_TOKEN } from '@/mocks/auth';

export function ForgotPasswordForm() {
  const [email, setEmail] = useState('');
  const [error, setError] = useState<string | undefined>();
  const [submitted, setSubmitted] = useState(false);
  const [pending, setPending] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const emailError = validateEmail(email);
    setError(emailError);
    if (emailError) {
      return;
    }

    setPending(true);
    // TODO: REMOVE MOCK — Replace simulated password reset request with backend integration.
    await forgotPassword(email);
    setPending(false);
    setSubmitted(true);
  }

  if (submitted) {
    return (
      <div className="flex flex-col gap-4">
        <StatusMessage tone="info">
          If an account exists for {email}, password reset instructions would be sent. This
          prototype does not send email.
        </StatusMessage>
        <p className="text-sm text-foreground-secondary">
          For the prototype, you can open a simulated reset link with a mock token.
        </p>
        <Button asChild variant="secondary" className="w-full">
          <Link href={`/reset-password?token=${MOCK_RESET_TOKEN}`}>
            Open simulated reset link
          </Link>
        </Button>
        <Link
          href="/login"
          className="text-center text-sm font-medium text-primary hover:underline"
        >
          Back to sign in
        </Link>
      </div>
    );
  }

  return (
    <form noValidate onSubmit={handleSubmit} className="flex flex-col gap-4">
      <FormField
        id="forgot-email"
        label="Email"
        required
        error={error}
        hint="Enter the email associated with your account."
      >
        <Input
          id="forgot-email"
          name="email"
          type="email"
          autoComplete="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          placeholder="you@example.com"
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? 'forgot-email-error' : 'forgot-email-hint'}
        />
      </FormField>

      <Button type="submit" className="w-full" disabled={pending}>
        {pending ? <Loader2 className="size-4 animate-spin" aria-hidden="true" /> : null}
        {pending ? 'Submitting…' : 'Send reset instructions'}
      </Button>

      <Link
        href="/login"
        className="text-center text-sm font-medium text-primary hover:underline"
      >
        Back to sign in
      </Link>
    </form>
  );
}
