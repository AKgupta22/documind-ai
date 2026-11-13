import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { MOCK_SESSION_COOKIE, parseMockUser } from '@/lib/auth/session-cookie';

export default async function HomePage() {
  const cookieStore = await cookies();
  const session = parseMockUser(cookieStore.get(MOCK_SESSION_COOKIE)?.value);

  redirect(session ? '/dashboard' : '/login');
}
