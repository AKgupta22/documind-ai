'use client';

import { Loader2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useAuth } from '@/components/auth/auth-provider';
import { FormField } from '@/components/auth/form-field';
import { StatusMessage } from '@/components/shared/status-message';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { initialsFromName } from '@/lib/format';
import { validateEmail } from '@/lib/auth/validation';

export function ProfileSection() {
  const { user, updateUser } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [nameError, setNameError] = useState<string | undefined>();
  const [emailError, setEmailError] = useState<string | undefined>();
  const [pending, setPending] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    setName(user?.name ?? '');
    setEmail(user?.email ?? '');
  }, [user?.name, user?.email]);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const nextNameError = name.trim() ? undefined : 'Name is required.';
    const nextEmailError = validateEmail(email);
    setNameError(nextNameError);
    setEmailError(nextEmailError);
    setSaved(false);

    if (nextNameError || nextEmailError) {
      return;
    }

    setPending(true);
    // TODO: REMOVE MOCK — Replace simulated profile save with backend integration.
    await new Promise((resolve) => window.setTimeout(resolve, 400));
    updateUser({
      id: user?.id ?? 'user-local',
      name: name.trim(),
      email: email.trim().toLowerCase(),
      initials: initialsFromName(name.trim()),
    });
    setPending(false);
    setSaved(true);
  }

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center gap-3">
        <span className="flex size-12 items-center justify-center rounded-full bg-primary-subtle text-sm font-semibold text-primary">
          {initialsFromName(name || user?.name || 'DocuMind user')}
        </span>
        <div>
          <p className="text-sm font-medium">{name || 'DocuMind user'}</p>
          <p className="text-xs text-foreground-muted">Avatar upload is not available yet.</p>
        </div>
      </div>

      <form noValidate onSubmit={handleSubmit} className="flex max-w-md flex-col gap-4">
        <FormField id="profile-name" label="Name" required error={nameError}>
          <Input
            id="profile-name"
            name="name"
            autoComplete="name"
            value={name}
            onChange={(event) => setName(event.target.value)}
            aria-invalid={nameError ? true : undefined}
            aria-describedby={nameError ? 'profile-name-error' : undefined}
          />
        </FormField>

        <FormField id="profile-email" label="Email" required error={emailError}>
          <Input
            id="profile-email"
            name="email"
            type="email"
            autoComplete="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            aria-invalid={emailError ? true : undefined}
            aria-describedby={emailError ? 'profile-email-error' : undefined}
          />
        </FormField>

        {saved ? (
          <StatusMessage tone="success">
            Profile changes were saved to this prototype session only.
          </StatusMessage>
        ) : null}

        <Button type="submit" disabled={pending} className="self-start">
          {pending ? <Loader2 className="size-4 animate-spin" aria-hidden="true" /> : null}
          {pending ? 'Saving…' : 'Save profile'}
        </Button>
      </form>
    </div>
  );
}
