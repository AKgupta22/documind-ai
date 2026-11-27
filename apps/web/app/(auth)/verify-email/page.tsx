import type { Metadata } from 'next';
import { AuthCard } from '@/components/auth/auth-card';
import { VerificationMessage } from '@/components/auth/verification-message';

export const metadata: Metadata = {
  title: 'Verify email — DocuMind AI',
};

export default async function VerifyEmailPage({
  searchParams,
}: {
  searchParams: Promise<{ email?: string }>;
}) {
  const params = await searchParams;
  const email = params.email ?? 'you@example.com';

  return (
    <AuthCard
      title="Verify your email"
      description="Check your inbox to finish setting up your account."
    >
      <VerificationMessage email={email} />
    </AuthCard>
  );
}
