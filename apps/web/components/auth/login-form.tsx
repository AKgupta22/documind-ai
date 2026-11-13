'use client';

import { Loader2 } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useAuth } from '@/components/auth/auth-provider';
import { FormField } from '@/components/auth/form-field';
import { PasswordInput } from '@/components/auth/password-input';
import { StatusMessage } from '@/components/shared/status-message';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { login } from '@/lib/auth/mock-auth-service';
import { validateEmail } from '@/lib/auth/validation';
import { DEMO_CREDENTIALS } from '@/mocks/auth';

interface LoginErrors {
  email?: string;
  password?: string;
}

export function LoginForm() {
  const router = useRouter();
  const { signIn } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [remember, setRemember] = useState(true);
  const [errors, setErrors] = useState<LoginErrors>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFormError(null);

    const nextErrors: LoginErrors = {
      email: validateEmail(email),
      password: password ? undefined : 'Password is required.',
    };
    setErrors(nextErrors);

    if (nextErrors.email || nextErrors.password) {
      return;
    }

    setPending(true);
    // TODO: REMOVE MOCK — Replace simulated login with the real authentication API.
    const result = await login({ email, password, remember });
    setPending(false);

    if (!result.ok) {
      setFormError(result.error);
      return;
    }

    signIn(result.user, remember);
    router.replace('/dashboard');
    router.refresh();
  }

  function useDemoCredentials() {
    // TODO: REMOVE MOCK — Remove the demo credential shortcut with backend integration.
    setEmail(DEMO_CREDENTIALS.email);
    setPassword(DEMO_CREDENTIALS.password);
    setErrors({});
    setFormError(null);
  }

  return (
    <div className="flex flex-col gap-5">
      <form noValidate onSubmit={handleSubmit} className="flex flex-col gap-4">
        <FormField id="login-email" label="Email" required error={errors.email}>
          <Input
            id="login-email"
            name="email"
            type="email"
            autoComplete="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="you@example.com"
            aria-invalid={errors.email ? true : undefined}
            aria-describedby={errors.email ? 'login-email-error' : undefined}
          />
        </FormField>

        <FormField
          id="login-password"
          label="Password"
          required
          error={errors.password}
          labelAction={
            <Link
              href="/forgot-password"
              className="text-xs font-medium text-primary hover:underline"
            >
              Forgot password?
            </Link>
          }
        >
          <PasswordInput
            id="login-password"
            name="password"
            autoComplete="current-password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            placeholder="Enter your password"
            aria-invalid={errors.password ? true : undefined}
            aria-describedby={errors.password ? 'login-password-error' : undefined}
          />
        </FormField>

        <div className="flex items-center gap-2">
          <Checkbox
            id="remember-me"
            checked={remember}
            onCheckedChange={(checked) => setRemember(checked === true)}
          />
          <Label htmlFor="remember-me" className="font-normal text-foreground-secondary">
            Remember me
          </Label>
        </div>

        {formError ? <StatusMessage tone="error">{formError}</StatusMessage> : null}

        <Button type="submit" className="w-full" disabled={pending}>
          {pending ? <Loader2 className="size-4 animate-spin" aria-hidden="true" /> : null}
          {pending ? 'Signing in…' : 'Sign in'}
        </Button>
      </form>

      <div className="rounded-md border border-border bg-surface-secondary px-3 py-2.5 text-xs text-foreground-secondary">
        {/* TODO: REMOVE MOCK — Replace with actual authentication details. */}
        <p className="font-medium text-foreground">Prototype credentials</p>
        <p className="mt-1">
          {DEMO_CREDENTIALS.email} / {DEMO_CREDENTIALS.password}
        </p>
        <button
          type="button"
          onClick={useDemoCredentials}
          className="mt-1.5 font-medium text-primary hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          Fill demo credentials
        </button>
      </div>
    </div>
  );
}
