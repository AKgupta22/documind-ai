'use client';

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import type { AuthUser } from '@/lib/auth/types';
import { clearMockSession, readMockSession, setMockSession } from '@/lib/auth/session-client';
import { logout as simulateLogout } from '@/lib/auth/mock-auth-service';

interface AuthContextValue {
  user: AuthUser | null;
  isReady: boolean;
  signIn: (user: AuthUser, remember: boolean) => void;
  signOut: () => Promise<void>;
  updateUser: (user: AuthUser) => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    setUser(readMockSession());
    setIsReady(true);
  }, []);

  const signIn = useCallback((nextUser: AuthUser, remember: boolean) => {
    // TODO: REMOVE MOCK — Replace simulated session persistence with backend integration.
    setMockSession(nextUser, remember);
    setUser(nextUser);
  }, []);

  const signOut = useCallback(async () => {
    // TODO: REMOVE MOCK — Replace simulated logout with backend integration.
    await simulateLogout();
    clearMockSession();
    setUser(null);
  }, []);

  const updateUser = useCallback((nextUser: AuthUser) => {
    // TODO: REMOVE MOCK — Replace simulated profile persistence with backend integration.
    setMockSession(nextUser, true);
    setUser(nextUser);
  }, []);

  const value = useMemo(
    () => ({ user, isReady, signIn, signOut, updateUser }),
    [user, isReady, signIn, signOut, updateUser],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
