import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { RegisterForm } from '@/components/auth/register-form';

const routerMocks = vi.hoisted(() => ({
  push: vi.fn(),
}));

const authServiceMocks = vi.hoisted(() => ({
  signup: vi.fn(),
}));

vi.mock('next/navigation', () => ({
  useRouter: () => routerMocks,
}));

vi.mock('@/services/auth.service', () => ({
  signup: authServiceMocks.signup,
}));

function fillForm() {
  fireEvent.change(screen.getByLabelText(/^Full name/), {
    target: { value: 'Avery Morgan' },
  });
  fireEvent.change(screen.getByLabelText(/^Email/), {
    target: { value: 'avery@example.com' },
  });
  fireEvent.change(screen.getByLabelText(/^Password/), {
    target: { value: 'Password1' },
  });
  fireEvent.change(screen.getByLabelText(/^Confirm password/), {
    target: { value: 'Password1' },
  });
  fireEvent.click(screen.getByRole('checkbox'));
}

describe('RegisterForm', () => {
  beforeEach(() => {
    routerMocks.push.mockClear();
    authServiceMocks.signup.mockReset();
  });

  it('does not call the API when client validation fails', async () => {
    render(<RegisterForm />);
    fireEvent.click(screen.getByRole('button', { name: 'Create account' }));

    expect(await screen.findByText('Full name is required.')).toBeInTheDocument();
    expect(screen.getByText('Email is required.')).toBeInTheDocument();
    expect(screen.getByText('Password is required.')).toBeInTheDocument();
    expect(screen.getByText('Confirm your password.')).toBeInTheDocument();
    expect(screen.getByText('Accept the terms to continue.')).toBeInTheDocument();
    expect(authServiceMocks.signup).not.toHaveBeenCalled();
  });

  it('creates the account and redirects to verification', async () => {
    authServiceMocks.signup.mockResolvedValue({
      ok: true,
      user: {
        id: 'user-1',
        name: 'Avery Morgan',
        email: 'avery@example.com',
        initials: 'AM',
      },
    });

    render(<RegisterForm />);
    fillForm();
    fireEvent.click(screen.getByRole('button', { name: 'Create account' }));

    await waitFor(() => {
      expect(authServiceMocks.signup).toHaveBeenCalledWith({
        fullname: 'Avery Morgan',
        email: 'avery@example.com',
        password: 'Password1',
      });
    });
    expect(routerMocks.push).toHaveBeenCalledWith(
      '/verify-email?email=avery%40example.com',
    );
  });

  it('shows API errors returned by the backend', async () => {
    authServiceMocks.signup.mockResolvedValue({
      ok: false,
      error: 'An account with this email already exists.',
      fieldErrors: {
        email: 'This email is already registered.',
        fullname: 'Full name is invalid.',
        password: 'Password is too weak.',
      },
    });

    render(<RegisterForm />);
    fillForm();
    fireEvent.click(screen.getByRole('button', { name: 'Create account' }));

    expect(
      await screen.findByText('An account with this email already exists.'),
    ).toBeInTheDocument();
    expect(screen.getByText('This email is already registered.')).toBeInTheDocument();
    expect(screen.getByText('Full name is invalid.')).toBeInTheDocument();
    expect(screen.getByText('Password is too weak.')).toBeInTheDocument();
    expect(routerMocks.push).not.toHaveBeenCalled();
  });
});
