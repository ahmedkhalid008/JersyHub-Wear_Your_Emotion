import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { RegisterPage } from './RegisterPage';
import { authService } from '../services/authService';
import { useAuthStore } from '../stores/useAuthStore';
import { ApiError } from '../services/api/errors';

vi.mock('../services/authService');

describe('RegisterPage Component', () => {
  beforeEach(() => {
    useAuthStore.getState().logout();
    vi.restoreAllMocks();
  });

  it('renders registration form inputs', () => {
    render(
      <MemoryRouter>
        <RegisterPage />
      </MemoryRouter>
    );

    expect(screen.getByLabelText(/full name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/email address/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText('At least 8 characters')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /create account/i })).toBeInTheDocument();
  });

  it('shows validation errors for short password', async () => {
    render(
      <MemoryRouter>
        <RegisterPage />
      </MemoryRouter>
    );

    fireEvent.change(screen.getByLabelText(/full name/i), { target: { value: 'John Doe' } });
    fireEvent.change(screen.getByLabelText(/email address/i), { target: { value: 'john@example.com' } });
    fireEvent.change(screen.getByPlaceholderText('At least 8 characters'), { target: { value: '123' } });

    fireEvent.click(screen.getByRole('button', { name: /create account/i }));

    await waitFor(() => {
      expect(screen.getByText(/password must be at least 8 characters/i)).toBeInTheDocument();
    });
  });

  it('handles duplicate email error from backend', async () => {
    vi.mocked(authService.register).mockRejectedValueOnce(
      new ApiError(409, 'Email address is already registered', 'CONFLICT')
    );

    render(
      <MemoryRouter>
        <RegisterPage />
      </MemoryRouter>
    );

    fireEvent.change(screen.getByLabelText(/full name/i), { target: { value: 'John Doe' } });
    fireEvent.change(screen.getByLabelText(/email address/i), { target: { value: 'existing@example.com' } });
    fireEvent.change(screen.getByPlaceholderText('At least 8 characters'), { target: { value: 'password123' } });

    fireEvent.click(screen.getByRole('button', { name: /create account/i }));

    await waitFor(() => {
      expect(screen.getByText(/email address is already registered/i)).toBeInTheDocument();
    });
  });

  it('registers and automatically logs user in', async () => {
    const mockUser = {
      id: 'uuid-10',
      name: 'John Customer',
      email: 'newuser@example.com',
      role: 'CUSTOMER' as const,
      enabled: true,
      emailVerified: false,
    };

    const mockAuthData = {
      accessToken: 'acc-token-10',
      refreshToken: 'ref-token-10',
      tokenType: 'Bearer',
      expiresIn: 900,
      user: mockUser,
    };

    vi.mocked(authService.register).mockResolvedValueOnce(mockUser);
    vi.mocked(authService.login).mockResolvedValueOnce(mockAuthData);

    render(
      <MemoryRouter>
        <RegisterPage />
      </MemoryRouter>
    );

    fireEvent.change(screen.getByLabelText(/full name/i), { target: { value: 'John Customer' } });
    fireEvent.change(screen.getByLabelText(/email address/i), { target: { value: 'newuser@example.com' } });
    fireEvent.change(screen.getByPlaceholderText('At least 8 characters'), { target: { value: 'password123' } });

    fireEvent.click(screen.getByRole('button', { name: /create account/i }));

    await waitFor(() => {
      expect(authService.register).toHaveBeenCalledWith({
        name: 'John Customer',
        email: 'newuser@example.com',
        password: 'password123',
        phone: undefined,
      });
      expect(authService.login).toHaveBeenCalledWith({
        email: 'newuser@example.com',
        password: 'password123',
      });
      expect(useAuthStore.getState().isAuthenticated).toBe(true);
    });
  });
});
