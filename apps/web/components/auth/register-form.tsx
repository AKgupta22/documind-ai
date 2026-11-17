'use client';

import { Loader2 } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { FormField } from '@/components/auth/form-field';
import { PasswordInput } from '@/components/auth/password-input';
import { StatusMessage } from '@/components/shared/status-message';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  validateEmail,
  validatePassword,
  validatePasswordConfirmation,
} from '@/lib/auth/validation';
import { signup } from '@/services/auth.service';

interface RegisterErrors {
  name?: string;
  email?: string;
  password?: string;
  confirmPassword?: string;
  terms?: string;
}

export function RegisterForm() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [errors, setErrors] = useState<RegisterErrors>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFormError(null);

    const nextErrors: RegisterErrors = {
      name: name.trim() ? undefined : 'Full name is required.',
      email: validateEmail(email),
      password: validatePassword(password),
      confirmPassword: validatePasswordConfirmation(password, confirmPassword),
      terms: acceptedTerms ? undefined : 'Accept the terms to continue.',
    };
    setErrors(nextErrors);

    if (Object.values(nextErrors).some(Boolean)) {
      return;
    }

    setPending(true);
    const result = await signup({ fullname: name, email, password });
    setPending(false);

    if (!result.ok) {
      setFormError(result.error);
      if (result.fieldErrors) {
        setErrors((current) => ({
          ...current,
          name: result.fieldErrors?.['fullname'] ?? current.name,
          email: result.fieldErrors?.['email'] ?? current.email,
          password: result.fieldErrors?.['password'] ?? current.password,
        }));
      }
      return;
    }

    const params = new URLSearchParams({ email: result.user.email, name: result.user.name });
    router.push(`/verify-email?${params.toString()}`);
  }

  return (
    <form noValidate onSubmit={handleSubmit} className="flex flex-col gap-4">
      <FormField id="register-name" label="Full name" required error={errors.name}>
        <Input
          id="register-name"
          name="name"
          autoComplete="name"
          value={name}
          onChange={(event) => setName(event.target.value)}
          placeholder="Enter your full name"
          aria-invalid={errors.name ? true : undefined}
          aria-describedby={errors.name ? 'register-name-error' : undefined}
        />
      </FormField>

      <FormField id="register-email" label="Email" required error={errors.email}>
        <Input
          id="register-email"
          name="email"
          type="email"
          autoComplete="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          placeholder="you@example.com"
          aria-invalid={errors.email ? true : undefined}
          aria-describedby={errors.email ? 'register-email-error' : undefined}
        />
      </FormField>

      <FormField
        id="register-password"
        label="Password"
        required
        error={errors.password}
        hint="At least 8 characters with uppercase, lowercase, and a number."
      >
        <PasswordInput
          id="register-password"
          name="password"
          autoComplete="new-password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          placeholder="Create a password"
          aria-invalid={errors.password ? true : undefined}
          aria-describedby={
            errors.password ? 'register-password-error' : 'register-password-hint'
          }
        />
      </FormField>

      <FormField
        id="register-confirm-password"
        label="Confirm password"
        required
        error={errors.confirmPassword}
      >
        <PasswordInput
          id="register-confirm-password"
          name="confirmPassword"
          autoComplete="new-password"
          value={confirmPassword}
          onChange={(event) => setConfirmPassword(event.target.value)}
          placeholder="Repeat your password"
          aria-invalid={errors.confirmPassword ? true : undefined}
          aria-describedby={
            errors.confirmPassword ? 'register-confirm-password-error' : undefined
          }
        />
      </FormField>

      <div className="flex flex-col gap-1.5">
        <div className="flex items-start gap-2">
          <Checkbox
            id="accept-terms"
            checked={acceptedTerms}
            onCheckedChange={(checked) => setAcceptedTerms(checked === true)}
            aria-invalid={errors.terms ? true : undefined}
            aria-describedby={errors.terms ? 'accept-terms-error' : undefined}
            className="mt-0.5"
          />
          <Label htmlFor="accept-terms" className="font-normal leading-5 text-foreground-secondary">
            I accept the Terms and Conditions for this prototype.
          </Label>
        </div>
        {errors.terms ? (
          <p id="accept-terms-error" className="text-xs text-danger" role="alert">
            {errors.terms}
          </p>
        ) : null}
      </div>

      {formError ? <StatusMessage tone="error">{formError}</StatusMessage> : null}

      <Button type="submit" className="w-full" disabled={pending}>
        {pending ? <Loader2 className="size-4 animate-spin" aria-hidden="true" /> : null}
        {pending ? 'Creating account…' : 'Create account'}
      </Button>

      <p className="text-center text-xs text-foreground-muted">
        Already have an account?{' '}
        <Link href="/login" className="font-medium text-primary hover:underline">
          Sign in
        </Link>
      </p>
    </form>
  );
}
