import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { ThemeProvider, useTheme } from '@/components/shared/theme-provider';
import { THEME_STORAGE_KEY } from '@/lib/theme';

function ThemeHarness() {
  const { theme, resolvedTheme, setTheme } = useTheme();
  return (
    <div>
      <span data-testid="theme">{theme}</span>
      <span data-testid="resolved">{resolvedTheme}</span>
      <button type="button" onClick={() => setTheme('dark')}>
        Set dark
      </button>
    </div>
  );
}

describe('ThemeProvider', () => {
  it('applies and persists the selected theme', async () => {
    render(
      <ThemeProvider>
        <ThemeHarness />
      </ThemeProvider>,
    );

    await waitFor(() => {
      expect(screen.getByTestId('theme')).toHaveTextContent('system');
    });

    fireEvent.click(screen.getByRole('button', { name: 'Set dark' }));

    expect(document.documentElement.classList.contains('dark')).toBe(true);
    expect(window.localStorage.getItem(THEME_STORAGE_KEY)).toBe('dark');
    expect(screen.getByTestId('resolved')).toHaveTextContent('dark');
  });
});
