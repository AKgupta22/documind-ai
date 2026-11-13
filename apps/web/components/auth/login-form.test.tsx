import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { LoginForm } from '@/components/auth/login-form';
import { AuthProvider } from '@/components/auth/auth-provider';

const routerMocks = vi.hoisted(() => ({
  replace: vi.fn(),
  refresh: vi.fn(),
}));

vi.mock('next/navigation', () => ({
  useRouter: () => routerMocks,
  usePathname: () => '/login',
}));

function renderLoginForm() {
  return render(
    <AuthProvider>
      <LoginForm />
    </AuthProvider>,
  );
}

describe('LoginForm', () => {
  beforeEach(() => {
    routerMocks.replace.mockClear();
    routerMocks.refresh.mockClear();
  });

  it('shows required field errors on empty submit', async () => {
    renderLoginForm();
    fireEvent.click(screen.getByRole('button', { name: 'Sign in' }));

    expect(await screen.findByText('Email is required.')).toBeInTheDocument();
    expect(screen.getByText('Password is required.')).toBeInTheDocument();
    expect(routerMocks.replace).not.toHaveBeenCalled();
  });

  it('shows an error for invalid credentials', async () => {
    renderLoginForm();
    fireEvent.change(screen.getByLabelText(/^Email/), {
      target: { value: 'demo@documind.ai' },
    });
    fireEvent.change(screen.getByLabelText(/^Password/), {
      target: { value: 'wrong-password' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Sign in' }));

    expect(
      await screen.findByText(/Email or password is incorrect/, {}, { timeout: 2500 }),
    ).toBeInTheDocument();
    expect(routerMocks.replace).not.toHaveBeenCalled();
  });

  it('signs in with the demo credentials and redirects to the dashboard', async () => {
    renderLoginForm();
    fireEvent.click(screen.getByRole('button', { name: 'Fill demo credentials' }));
    fireEvent.click(screen.getByRole('button', { name: 'Sign in' }));

    await waitFor(
      () => {
        expect(routerMocks.replace).toHaveBeenCalledWith('/dashboard');
      },
      { timeout: 2500 },
    );
    expect(document.cookie).toContain('dm_mock_session=');
    expect(routerMocks.refresh).toHaveBeenCalled();
  });
});
