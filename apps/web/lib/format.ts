const BYTE_UNITS = ['B', 'KB', 'MB', 'GB'] as const;

export function formatBytes(bytes: number): string {
  if (bytes <= 0) {
    return '0 B';
  }

  const exponent = Math.min(
    Math.floor(Math.log(bytes) / Math.log(1024)),
    BYTE_UNITS.length - 1,
  );
  const value = bytes / 1024 ** exponent;
  const unit = BYTE_UNITS[exponent] ?? 'B';
  return `${value >= 10 || exponent === 0 ? Math.round(value) : value.toFixed(1)} ${unit}`;
}

export function formatDate(iso: string): string {
  return new Intl.DateTimeFormat('en', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(new Date(iso));
}

export function formatTime(iso: string): string {
  return new Intl.DateTimeFormat('en', {
    hour: 'numeric',
    minute: '2-digit',
  }).format(new Date(iso));
}

export function formatDuration(durationMs: number): string {
  if (durationMs < 1000) {
    return `${durationMs} ms`;
  }
  return `${(durationMs / 1000).toFixed(1)} s`;
}

export function daysAgoIso(days: number, hours = 0): string {
  const date = new Date();
  date.setDate(date.getDate() - days);
  date.setHours(date.getHours() - hours);
  return date.toISOString();
}

export function startOfDay(date: Date): number {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime();
}

export function groupConversationDate(iso: string): 'Today' | 'Yesterday' | 'Previous 7 days' | 'Older' {
  const now = new Date();
  const value = new Date(iso);
  const dayDifference = Math.round(
    (startOfDay(now) - startOfDay(value)) / (24 * 60 * 60 * 1000),
  );

  if (dayDifference <= 0) {
    return 'Today';
  }
  if (dayDifference === 1) {
    return 'Yesterday';
  }
  if (dayDifference <= 7) {
    return 'Previous 7 days';
  }
  return 'Older';
}

export function initialsFromName(name: string): string {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join('');
}
