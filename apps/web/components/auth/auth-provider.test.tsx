import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { AuthProvider, useAuth } from '@/components/auth/auth-provider';

const authServiceMocks = vi.hoisted(() => ({
  getCurrentUser: vi.fn(),
  logout: vi.fn(),
}));

vi.mock('@/services/auth.service', () => authServiceMocks);

function Consumer() {
  const { user, isReady, signOut } = useAuth();

  return (
    <div>
      <span data-testid="ready">{String(isReady)}</span>
      <span data-testid="user">{user?.name ?? 'none'}</span>
      <button type="button" onClick={() => void signOut()}>
        Sign out
      </button>
    </div>
  );
}

function renderProvider() {
  return render(
    <AuthProvider>
      <Consumer />
    </AuthProvider>,
  );
}

describe('AuthProvider', () => {
  beforeEach(() => {
    authServiceMocks.getCurrentUser.mockReset();
    authServiceMocks.logout.mockReset();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('hydrates the session user from the API', async () => {
    authServiceMocks.getCurrentUser.mockResolvedValue({
      id: 'user-1',
      name: 'Avery Morgan',
      email: 'avery@example.com',
      initials: 'AM',
    });

    renderProvider();

    await waitFor(() => {
      expect(screen.getByTestId('user')).toHaveTextContent('Avery Morgan');
    });
    expect(screen.getByTestId('ready')).toHaveTextContent('true');
  });

  it('clears the user after a successful logout', async () => {
    authServiceMocks.getCurrentUser.mockResolvedValue({
      id: 'user-1',
      name: 'Avery Morgan',
      email: 'avery@example.com',
      initials: 'AM',
    });
    authServiceMocks.logout.mockResolvedValue(undefined);

    renderProvider();

    await waitFor(() => {
      expect(screen.getByTestId('user')).toHaveTextContent('Avery Morgan');
    });

    fireEvent.click(screen.getByRole('button', { name: 'Sign out' }));

    await waitFor(() => {
      expect(screen.getByTestId('user')).toHaveTextContent('none');
    });
    expect(authServiceMocks.logout).toHaveBeenCalledOnce();
  });
});
