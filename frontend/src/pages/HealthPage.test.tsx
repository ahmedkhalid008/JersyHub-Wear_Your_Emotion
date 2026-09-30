import { render, screen } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { describe, it, expect, vi } from 'vitest';
import { HealthPage } from './HealthPage';
import * as healthHook from '../hooks/useHealthCheck';

vi.mock('../hooks/useHealthCheck');

describe('HealthPage Component', () => {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });

  it('renders loading state initially', () => {
    vi.spyOn(healthHook, 'useHealthCheck').mockReturnValue({
      data: undefined,
      isLoading: true,
      isError: false,
      error: null,
      refetch: vi.fn(),
      isFetching: false,
    } as any);

    render(
      <QueryClientProvider client={queryClient}>
        <HealthPage />
      </QueryClientProvider>
    );

    expect(screen.getByText(/Connecting to backend health service/i)).toBeInTheDocument();
  });

  it('renders health data when call succeeds', () => {
    vi.spyOn(healthHook, 'useHealthCheck').mockReturnValue({
      data: {
        success: true,
        message: 'JerseyHub Backend Operational',
        data: {
          status: 'UP',
          application: 'JerseyHub Modular Monolith Backend',
          version: '1.0.0',
          timestamp: 123456789,
        },
        timestamp: '2026-01-01',
      },
      isLoading: false,
      isError: false,
      error: null,
      refetch: vi.fn(),
      isFetching: false,
    } as any);

    render(
      <QueryClientProvider client={queryClient}>
        <HealthPage />
      </QueryClientProvider>
    );

    expect(screen.getByText('UP')).toBeInTheDocument();
    expect(screen.getByText('JerseyHub Modular Monolith Backend')).toBeInTheDocument();
  });
});
