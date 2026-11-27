import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { AuthProvider } from '@/components/auth/auth-provider';
import { LoginForm } from '@/components/auth/login-form';

const routerMocks = vi.hoisted(() => ({
  replace: vi.fn(),
  refresh: vi.fn(),
}));

const authServiceMocks = vi.hoisted(() => ({
  login: vi.fn(),
  getCurrentUser: vi.fn(),
  logout: vi.fn(),
}));

vi.mock('next/navigation', () => ({
  useRouter: () => routerMocks,
  usePathname: () => '/login',
}));

vi.mock('@/services/auth.service', () => authServiceMocks);

function renderLoginForm() {
  return render(
    <AuthProvider>
      <LoginForm />
    </AuthProvider>,
  );
}

function fillCredentials() {
  fireEvent.change(screen.getByLabelText(/^Email/), {
    target: { value: 'avery@example.com' },
  });
  fireEvent.change(screen.getByLabelText(/^Password/), {
    target: { value: 'Password1' },
  });
}

describe('LoginForm', () => {
  beforeEach(() => {
    routerMocks.replace.mockClear();
    routerMocks.refresh.mockClear();
    authServiceMocks.login.mockReset();
    authServiceMocks.logout.mockReset();
    authServiceMocks.getCurrentUser.mockReset();
    authServiceMocks.getCurrentUser.mockResolvedValue(null);
  });

  it('shows required field errors on empty submit', async () => {
    renderLoginForm();
    fireEvent.click(screen.getByRole('button', { name: 'Sign in' }));

    expect(await screen.findByText('Email is required.')).toBeInTheDocument();
    expect(screen.getByText('Password is required.')).toBeInTheDocument();
    expect(authServiceMocks.login).not.toHaveBeenCalled();
    expect(routerMocks.replace).not.toHaveBeenCalled();
  });

  it('shows an error for invalid credentials', async () => {
    authServiceMocks.login.mockResolvedValue({
      ok: false,
      error: 'Email or password is incorrect.',
    });

    renderLoginForm();
    fillCredentials();
    fireEvent.click(screen.getByRole('button', { name: 'Sign in' }));

    expect(
      await screen.findByText('Email or password is incorrect.'),
    ).toBeInTheDocument();
    expect(authServiceMocks.login).toHaveBeenCalledWith({
      email: 'avery@example.com',
      password: 'Password1',
    });
    expect(routerMocks.replace).not.toHaveBeenCalled();
  });

  it('signs in through the API and redirects to the dashboard', async () => {
    authServiceMocks.login.mockResolvedValue({
      ok: true,
      user: {
        id: 'user-1',
        name: 'Avery Morgan',
        email: 'avery@example.com',
        initials: 'AM',
      },
    });

    renderLoginForm();
    fillCredentials();
    fireEvent.click(screen.getByRole('button', { name: 'Sign in' }));

    await waitFor(() => {
      expect(routerMocks.replace).toHaveBeenCalledWith('/dashboard');
    });
    expect(authServiceMocks.login).toHaveBeenCalledWith({
      email: 'avery@example.com',
      password: 'Password1',
    });
    expect(routerMocks.refresh).toHaveBeenCalled();
  });
});
