'use client';

import { LogOut, PanelLeftClose, PanelLeftOpen } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Brand } from '@/components/shared/brand';
import { NAV_ITEMS } from '@/components/shared/navigation';
import { Button } from '@/components/ui/button';
import type { AuthUser } from '@/lib/auth/types';
import { cn } from '@/lib/utils';

interface AppSidebarProps {
  user: AuthUser | null;
  collapsed?: boolean;
  onToggleCollapse?: () => void;
  onSignOut: () => void;
  onNavigate?: () => void;
}

function isActive(pathname: string, href: string): boolean {
  if (href === '/chat') {
    return pathname === '/chat' || pathname.startsWith('/chat/');
  }
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function AppSidebar({
  user,
  collapsed = false,
  onToggleCollapse,
  onSignOut,
  onNavigate,
}: AppSidebarProps) {
  const pathname = usePathname();

  return (
    <div className="flex h-full flex-col bg-surface">
      <div
        className={cn(
          'flex h-14 items-center border-b border-border',
          collapsed ? 'justify-center px-2' : 'justify-between px-4',
        )}
      >
        <Brand showText={!collapsed} />
        {onToggleCollapse ? (
          <Button
            variant="ghost"
            size="icon"
            onClick={onToggleCollapse}
            aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            className={cn(collapsed && 'hidden')}
          >
            <PanelLeftClose className="size-4" aria-hidden="true" />
          </Button>
        ) : null}
      </div>

      {collapsed && onToggleCollapse ? (
        <div className="flex justify-center border-b border-border py-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={onToggleCollapse}
            aria-label="Expand sidebar"
          >
            <PanelLeftOpen className="size-4" aria-hidden="true" />
          </Button>
        </div>
      ) : null}

      <nav aria-label="Primary" className="flex-1 overflow-y-auto p-2">
        <ul className="flex flex-col gap-1">
          {NAV_ITEMS.map((item) => {
            const active = isActive(pathname, item.href);
            const Icon = item.icon;
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  onClick={onNavigate}
                  aria-current={active ? 'page' : undefined}
                  title={collapsed ? item.label : undefined}
                  className={cn(
                    'flex items-center gap-2.5 rounded-md px-2.5 py-2 text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                    collapsed && 'justify-center px-0',
                    active
                      ? 'bg-primary-subtle font-medium text-foreground'
                      : 'text-foreground-secondary hover:bg-surface-secondary hover:text-foreground',
                  )}
                >
                  <Icon
                    className={cn('size-4 shrink-0', active && 'text-primary')}
                    aria-hidden="true"
                  />
                  {collapsed ? <span className="sr-only">{item.label}</span> : <span>{item.label}</span>}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      <div className="border-t border-border p-2">
        <div
          className={cn(
            'flex items-center gap-2 rounded-md px-2 py-2',
            collapsed && 'justify-center px-0',
          )}
        >
          <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-primary-subtle text-xs font-semibold text-primary">
            {user?.initials ?? 'DM'}
          </span>
          {collapsed ? (
            <span className="sr-only">{user?.name ?? 'Account'}</span>
          ) : (
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium">{user?.name ?? 'DocuMind user'}</p>
              <p className="truncate text-xs text-foreground-muted">
                {user?.email ?? 'Prototype account'}
              </p>
            </div>
          )}
          <Button
            variant="ghost"
            size="icon"
            onClick={onSignOut}
            aria-label="Log out"
            className={cn('shrink-0', collapsed && 'hidden')}
          >
            <LogOut className="size-4" aria-hidden="true" />
          </Button>
        </div>
      </div>
    </div>
  );
}
