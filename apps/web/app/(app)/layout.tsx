import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { AppShell } from '@/components/shared/app-shell';
import { MOCK_SESSION_COOKIE, parseMockUser } from '@/lib/auth/session-cookie';

export default async function AppGroupLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const cookieStore = await cookies();
  const session = parseMockUser(cookieStore.get(MOCK_SESSION_COOKIE)?.value);

  if (!session) {
    redirect('/login');
  }

  return <AppShell>{children}</AppShell>;
}
