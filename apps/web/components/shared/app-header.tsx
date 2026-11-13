'use client';

import { Menu, Search } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { getPageTitle } from '@/components/shared/navigation';
import { ThemeToggle } from '@/components/shared/theme-toggle';
import { UserMenu } from '@/components/shared/user-menu';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import type { AuthUser } from '@/lib/auth/types';

interface AppHeaderProps {
  pathname: string;
  user: AuthUser | null;
  onOpenMobileNav: () => void;
  onSignOut: () => void;
}

export function AppHeader({
  pathname,
  user,
  onOpenMobileNav,
  onSignOut,
}: AppHeaderProps) {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const title = getPageTitle(pathname);

  function handleSearch(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const trimmed = query.trim();
    router.push(trimmed ? `/documents?q=${encodeURIComponent(trimmed)}` : '/documents');
    setQuery('');
  }

  return (
    <header className="flex h-14 shrink-0 items-center gap-2 border-b border-border bg-surface px-3 sm:px-4">
      <Button
        variant="ghost"
        size="icon"
        className="lg:hidden"
        onClick={onOpenMobileNav}
        aria-label="Open navigation"
      >
        <Menu className="size-4" aria-hidden="true" />
      </Button>

      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium">{title}</p>
      </div>

      <form onSubmit={handleSearch} className="hidden w-56 xl:block" role="search">
        <label htmlFor="global-search" className="sr-only">
          Search documents
        </label>
        <div className="relative">
          <Search
            className="pointer-events-none absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-foreground-muted"
            aria-hidden="true"
          />
          <Input
            id="global-search"
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search documents"
            className="h-8 pl-8 text-sm"
          />
        </div>
      </form>

      <ThemeToggle />
      <UserMenu user={user} onSignOut={onSignOut} />
    </header>
  );
}
