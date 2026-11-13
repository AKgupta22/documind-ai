'use client';

import { Loader2 } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { FormField } from '@/components/auth/form-field';
import { PasswordInput } from '@/components/auth/password-input';
import { StatusMessage } from '@/components/shared/status-message';
import { Button } from '@/components/ui/button';
import { resetPassword } from '@/lib/auth/mock-auth-service';
import {
  validatePassword,
  validatePasswordConfirmation,
} from '@/lib/auth/validation';

interface ResetPasswordFormProps {
  token: string;
}

export function ResetPasswordForm({ token }: ResetPasswordFormProps) {
  const router = useRouter();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errors, setErrors] = useState<{ password?: string; confirmPassword?: string }>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [pending, setPending] = useState(false);

  if (!token) {
    return (
      <div className="flex flex-col gap-4">
        <StatusMessage tone="warning">
          This prototype needs a mock reset token. Request a new link from the forgot
          password screen.
        </StatusMessage>
        <Button asChild className="w-full">
          <Link href="/forgot-password">Request a reset link</Link>
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

  if (success) {
    return (
      <div className="flex flex-col gap-4">
        <StatusMessage tone="success">
          Your password would be reset in a connected app. This prototype did not change any
          real credentials.
        </StatusMessage>
        <Button asChild className="w-full">
          <Link href="/login">Back to sign in</Link>
        </Button>
      </div>
    );
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFormError(null);

    const nextErrors = {
      password: validatePassword(password),
      confirmPassword: validatePasswordConfirmation(password, confirmPassword),
    };
    setErrors(nextErrors);

    if (nextErrors.password || nextErrors.confirmPassword) {
      return;
    }

    setPending(true);
    // TODO: REMOVE MOCK — Replace simulated password reset with backend integration.
    const result = await resetPassword({ token, password, confirmPassword });
    setPending(false);

    if (!result.ok) {
      setFormError(result.error);
      return;
    }

    setSuccess(true);
    window.setTimeout(() => {
      router.push('/login');
    }, 1600);
  }

  return (
    <form noValidate onSubmit={handleSubmit} className="flex flex-col gap-4">
      <p className="text-sm text-foreground-secondary">
        This screen uses a mock reset token and does not update a real account.
      </p>

      <FormField
        id="reset-password"
        label="New password"
        required
        error={errors.password}
        hint="At least 8 characters with uppercase, lowercase, and a number."
      >
        <PasswordInput
          id="reset-password"
          name="password"
          autoComplete="new-password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          placeholder="Enter a new password"
          aria-invalid={errors.password ? true : undefined}
          aria-describedby={errors.password ? 'reset-password-error' : 'reset-password-hint'}
        />
      </FormField>

      <FormField
        id="reset-confirm-password"
        label="Confirm new password"
        required
        error={errors.confirmPassword}
      >
        <PasswordInput
          id="reset-confirm-password"
          name="confirmPassword"
          autoComplete="new-password"
          value={confirmPassword}
          onChange={(event) => setConfirmPassword(event.target.value)}
          placeholder="Repeat the new password"
          aria-invalid={errors.confirmPassword ? true : undefined}
          aria-describedby={
            errors.confirmPassword ? 'reset-confirm-password-error' : undefined
          }
        />
      </FormField>

      {formError ? <StatusMessage tone="error">{formError}</StatusMessage> : null}

      <Button type="submit" className="w-full" disabled={pending}>
        {pending ? <Loader2 className="size-4 animate-spin" aria-hidden="true" /> : null}
        {pending ? 'Resetting…' : 'Reset password'}
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
