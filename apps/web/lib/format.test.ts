import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { formatBytes, groupConversationDate } from '@/lib/format';

describe('formatBytes', () => {
  it('formats zero and byte values', () => {
    expect(formatBytes(0)).toBe('0 B');
    expect(formatBytes(512)).toBe('512 B');
  });

  it('formats kilobytes and megabytes', () => {
    expect(formatBytes(42_000)).toBe('41 KB');
    expect(formatBytes(2_411_520)).toBe('2.3 MB');
  });
});

describe('groupConversationDate', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(2026, 10, 13, 12, 0, 0));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('groups today and yesterday', () => {
    expect(groupConversationDate(new Date(2026, 10, 13, 9, 0, 0).toISOString())).toBe(
      'Today',
    );
    expect(groupConversationDate(new Date(2026, 10, 12, 9, 0, 0).toISOString())).toBe(
      'Yesterday',
    );
  });

  it('groups dates inside and outside the previous seven days', () => {
    expect(groupConversationDate(new Date(2026, 10, 8, 9, 0, 0).toISOString())).toBe(
      'Previous 7 days',
    );
    expect(groupConversationDate(new Date(2026, 9, 30, 9, 0, 0).toISOString())).toBe(
      'Older',
    );
  });
});
