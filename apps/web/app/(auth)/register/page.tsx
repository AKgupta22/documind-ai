import type { Metadata } from 'next';
import { AuthCard } from '@/components/auth/auth-card';
import { RegisterForm } from '@/components/auth/register-form';

export const metadata: Metadata = {
  title: 'Create account — DocuMind AI',
};

export default function RegisterPage() {
  return (
    <AuthCard
      title="Create your account"
      description="Start organizing and asking questions about your documents."
    >
      <RegisterForm />
    </AuthCard>
  );
}
