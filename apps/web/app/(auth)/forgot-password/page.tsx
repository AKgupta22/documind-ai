import type { Metadata } from 'next';
import { AuthCard } from '@/components/auth/auth-card';
import { ForgotPasswordForm } from '@/components/auth/forgot-password-form';

export const metadata: Metadata = {
  title: 'Forgot password — DocuMind AI',
};

export default function ForgotPasswordPage() {
  return (
    <AuthCard
      title="Forgot password"
      description="Request password reset instructions for your account."
    >
      <ForgotPasswordForm />
    </AuthCard>
  );
}
