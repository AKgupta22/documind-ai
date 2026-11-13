import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { AuthLayout } from '@/components/auth/auth-layout';
import { MOCK_SESSION_COOKIE, parseMockUser } from '@/lib/auth/session-cookie';

export default async function AuthGroupLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const cookieStore = await cookies();
  const session = parseMockUser(cookieStore.get(MOCK_SESSION_COOKIE)?.value);

  if (session) {
    redirect('/dashboard');
  }

  return <AuthLayout>{children}</AuthLayout>;
}
