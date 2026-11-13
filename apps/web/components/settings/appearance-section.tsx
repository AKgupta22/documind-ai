'use client';

import { Monitor, Moon, Sun } from 'lucide-react';
import { useTheme } from '@/components/shared/theme-provider';
import { cn } from '@/lib/utils';
import type { Theme } from '@/lib/theme';

const OPTIONS: Array<{ value: Theme; label: string; description: string; icon: typeof Sun }> = [
  {
    value: 'light',
    label: 'Light',
    description: 'Bright surfaces for daytime use.',
    icon: Sun,
  },
  {
    value: 'dark',
    label: 'Dark',
    description: 'Low-light surfaces with softer contrast.',
    icon: Moon,
  },
  {
    value: 'system',
    label: 'System',
    description: 'Follow your operating system preference.',
    icon: Monitor,
  },
];

export function AppearanceSection() {
  const { theme, resolvedTheme, setTheme } = useTheme();

  return (
    <div className="flex flex-col gap-4">
      <div
        role="group"
        aria-label="Theme"
        className="grid gap-2 sm:grid-cols-3"
      >
        {OPTIONS.map((option) => {
          const Icon = option.icon;
          const selected = theme === option.value;
          return (
            <button
              key={option.value}
              type="button"
              onClick={() => setTheme(option.value)}
              aria-pressed={selected}
              className={cn(
                'flex flex-col items-start gap-2 rounded-lg border p-3 text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                selected
                  ? 'border-primary bg-primary-subtle'
                  : 'border-border bg-surface hover:border-border-strong hover:bg-surface-secondary',
              )}
            >
              <Icon
                className={cn('size-4', selected ? 'text-primary' : 'text-foreground-secondary')}
                aria-hidden="true"
              />
              <span className="text-sm font-medium">{option.label}</span>
              <span className="text-xs text-foreground-secondary">{option.description}</span>
            </button>
          );
        })}
      </div>
      <p className="text-xs text-foreground-muted">
        Currently using the {resolvedTheme} theme. The choice is saved in this browser.
      </p>
    </div>
  );
}
