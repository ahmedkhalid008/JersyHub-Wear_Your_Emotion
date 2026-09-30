import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MemoryRouter } from 'react-router';
import { AdminReviewsPage } from './AdminReviewsPage';
import { adminService } from '../../services/adminService';
import { useAuthStore } from '../../stores/useAuthStore';
import { AdminReviewResponse } from '../../types/domain';

vi.mock('../../services/adminService');

const createTestQueryClient = () =>
  new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });

const mockReview: AdminReviewResponse = {
  id: 'rev-10',
  productId: 'prod-100',
  productName: 'Real Madrid 2024 Home Kit',
  userId: 'user-2',
  userName: 'David Miller',
  userEmail: 'david@example.com',
  rating: 5,
  title: 'Top Quality Authentic Jersey',
  comment: 'Fabric feels extremely premium and light!',
  verifiedPurchase: true,
  approved: false,
  createdAt: '2026-09-28T12:00:00Z',
  updatedAt: '2026-09-28T12:00:00Z',
};

describe('AdminReviewsPage Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useAuthStore.setState({
      user: { id: 'admin-1', email: 'admin@example.com', name: 'Admin', role: 'ADMIN', enabled: true, emailVerified: true },
      accessToken: 'token-123',
      isAuthenticated: true,
      isInitialized: true,
    });
  });

  it('renders review moderation console and approves a review', async () => {
    vi.mocked(adminService.getReviews).mockResolvedValue({
      content: [mockReview],
      page: 0,
      size: 15,
      totalElements: 1,
      totalPages: 1,
      first: true,
      last: true,
    });
    vi.mocked(adminService.approveReview).mockResolvedValue({
      ...mockReview,
      approved: true,
    });

    const queryClient = createTestQueryClient();
    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <AdminReviewsPage />
        </MemoryRouter>
      </QueryClientProvider>
    );

    expect(await screen.findByText('Top Quality Authentic Jersey')).toBeInTheDocument();
    expect(screen.getByText('David Miller')).toBeInTheDocument();

    const approveBtn = screen.getByRole('button', { name: 'Approve' });
    fireEvent.click(approveBtn);

    await waitFor(() => {
      expect(adminService.approveReview).toHaveBeenCalledWith('rev-10');
    });
  });

  it('rejects an approved review', async () => {
    const approvedReview = { ...mockReview, approved: true };
    vi.mocked(adminService.getReviews).mockResolvedValue({
      content: [approvedReview],
      page: 0,
      size: 15,
      totalElements: 1,
      totalPages: 1,
      first: true,
      last: true,
    });
    vi.mocked(adminService.rejectReview).mockResolvedValue({
      ...approvedReview,
      approved: false,
    });

    const queryClient = createTestQueryClient();
    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <AdminReviewsPage />
        </MemoryRouter>
      </QueryClientProvider>
    );

    expect(await screen.findByText('Top Quality Authentic Jersey')).toBeInTheDocument();

    const rejectBtn = screen.getByRole('button', { name: 'Reject' });
    fireEvent.click(rejectBtn);

    await waitFor(() => {
      expect(adminService.rejectReview).toHaveBeenCalledWith('rev-10');
    });
  });
});
