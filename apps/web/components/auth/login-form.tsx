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
import { Input } from '@/components/ui/input';
import { validateEmail } from '@/lib/auth/validation';
import { login } from '@/services/auth.service';

interface LoginErrors {
  email?: string;
  password?: string;
}

export function LoginForm() {
  const router = useRouter();
  const { signIn } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
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
    const result = await login({ email, password });
    setPending(false);

    if (!result.ok) {
      setFormError(result.error);
      if (result.fieldErrors) {
        setErrors((current) => ({
          ...current,
          email: result.fieldErrors?.['email'] ?? current.email,
          password: result.fieldErrors?.['password'] ?? current.password,
        }));
      }
      return;
    }

    signIn(result.user);
    router.replace('/dashboard');
    router.refresh();
  }

  return (
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

      {formError ? <StatusMessage tone="error">{formError}</StatusMessage> : null}

      <Button type="submit" className="w-full" disabled={pending}>
        {pending ? <Loader2 className="size-4 animate-spin" aria-hidden="true" /> : null}
        {pending ? 'Signing in…' : 'Sign in'}
      </Button>
    </form>
  );
}
