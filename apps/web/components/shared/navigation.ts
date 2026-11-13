import {
  History,
  LayoutDashboard,
  Library,
  MessageSquare,
  Settings,
  type LucideIcon,
} from 'lucide-react';

export interface NavItem {
  href: string;
  label: string;
  icon: LucideIcon;
  description: string;
}

export const NAV_ITEMS: NavItem[] = [
  {
    href: '/dashboard',
    label: 'Overview',
    icon: LayoutDashboard,
    description: 'Application overview',
  },
  {
    href: '/documents',
    label: 'Knowledge Base',
    icon: Library,
    description: 'Your uploaded documents',
  },
  {
    href: '/chat',
    label: 'AI Chat',
    icon: MessageSquare,
    description: 'Ask questions about your documents',
  },
  {
    href: '/history',
    label: 'History',
    icon: History,
    description: 'Past conversations',
  },
  {
    href: '/settings',
    label: 'Settings',
    icon: Settings,
    description: 'Account and preferences',
  },
];

export function getPageTitle(pathname: string): string {
  if (pathname.startsWith('/chat')) {
    return 'AI Chat';
  }

  const item = NAV_ITEMS.find(
    (navItem) => pathname === navItem.href || pathname.startsWith(`${navItem.href}/`),
  );
  return item?.label ?? 'DocuMind AI';
}
