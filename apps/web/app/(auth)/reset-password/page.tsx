import type { Metadata } from 'next';
import { AuthCard } from '@/components/auth/auth-card';
import { ResetPasswordForm } from '@/components/auth/reset-password-form';

export const metadata: Metadata = {
  title: 'Reset password — DocuMind AI',
};

export default async function ResetPasswordPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>;
}) {
  const params = await searchParams;

  return (
    <AuthCard
      title="Set a new password"
      description="Choose a new password for your DocuMind AI account."
    >
      <ResetPasswordForm token={params.token ?? ''} />
    </AuthCard>
  );
}
