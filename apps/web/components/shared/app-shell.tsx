'use client';

import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useAuth } from '@/components/auth/auth-provider';
import { AppHeader } from '@/components/shared/app-header';
import { AppSidebar } from '@/components/shared/app-sidebar';
import { Sheet, SheetContent } from '@/components/ui/sheet';
import { cn } from '@/lib/utils';

const SIDEBAR_STORAGE_KEY = 'documind-sidebar-collapsed';

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, signOut } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);

  useEffect(() => {
    setCollapsed(window.localStorage.getItem(SIDEBAR_STORAGE_KEY) === 'true');
  }, []);

  function toggleCollapse() {
    setCollapsed((current) => {
      const next = !current;
      window.localStorage.setItem(SIDEBAR_STORAGE_KEY, String(next));
      return next;
    });
  }

  async function handleSignOut() {
    await signOut();
    router.replace('/login');
    router.refresh();
  }

  return (
    <div className="flex min-h-screen bg-background">
      <a
        href="#main-content"
        className="sr-only fixed left-3 top-3 z-[60] rounded-md bg-surface px-3 py-2 text-sm font-medium text-foreground shadow-md focus:not-sr-only"
      >
        Skip to main content
      </a>

      <aside
        className={cn(
          'hidden shrink-0 border-r border-border lg:block',
          collapsed ? 'w-16' : 'w-60',
        )}
      >
        <div className="sticky top-0 h-screen">
          <AppSidebar
            user={user}
            collapsed={collapsed}
            onToggleCollapse={toggleCollapse}
            onSignOut={() => {
              void handleSignOut();
            }}
          />
        </div>
      </aside>

      <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
        <SheetContent side="left" className="w-72 p-0">
          <AppSidebar
            user={user}
            onSignOut={() => {
              void handleSignOut();
            }}
            onNavigate={() => setMobileOpen(false)}
          />
        </SheetContent>
      </Sheet>

      <div className="flex min-h-screen min-w-0 flex-1 flex-col">
        <AppHeader
          pathname={pathname}
          user={user}
          onOpenMobileNav={() => setMobileOpen(true)}
          onSignOut={() => {
            void handleSignOut();
          }}
        />
        <main id="main-content" tabIndex={-1} className="min-w-0 flex-1 focus:outline-none">
          {children}
        </main>
      </div>
    </div>
  );
}
