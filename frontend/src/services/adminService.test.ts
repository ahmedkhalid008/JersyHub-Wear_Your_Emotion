import { describe, it, expect, vi, beforeEach } from 'vitest';
import { adminService } from './adminService';
import { apiClient } from './api/client';
import {
  AdminDashboardSummaryResponse,
  CouponResponse,
  AdminUserResponse,
} from '../types/domain';

vi.mock('./api/client', () => ({
  apiClient: {
    get: vi.fn(),
    post: vi.fn(),
    patch: vi.fn(),
    delete: vi.fn(),
  },
}));

describe('adminService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('getDashboardSummary calls GET /admin/dashboard/summary', async () => {
    const mockSummary: AdminDashboardSummaryResponse = {
      totalUsers: 15,
      totalProducts: 42,
      totalOrders: 28,
      pendingOrders: 3,
      processingOrders: 5,
      shippedOrders: 8,
      deliveredOrders: 10,
      cancelledOrders: 2,
      totalSuccessfulRevenue: 75000,
    };

    vi.mocked(apiClient.get).mockResolvedValueOnce({
      success: true,
      data: mockSummary,
      message: 'Dashboard summary retrieved',
      timestamp: new Date().toISOString(),
    });

    const result = await adminService.getDashboardSummary();

    expect(apiClient.get).toHaveBeenCalledWith('/admin/dashboard/summary');
    expect(result).toEqual(mockSummary);
  });

  it('getOrders calls GET /admin/orders with query parameters', async () => {
    vi.mocked(apiClient.get).mockResolvedValueOnce({
      success: true,
      data: { content: [], page: 0, size: 20, totalElements: 0, totalPages: 0, last: true },
      message: 'Orders retrieved',
      timestamp: new Date().toISOString(),
    });

    await adminService.getOrders('PAID', 0, 20);

    expect(apiClient.get).toHaveBeenCalledWith('/admin/orders?page=0&size=20&status=PAID');
  });

  it('getUsers calls GET /admin/users', async () => {
    const mockUser: AdminUserResponse = {
      id: 'u-1',
      name: 'Admin User',
      email: 'admin@example.com',
      role: 'ADMIN',
      enabled: true,
      emailVerified: true,
      createdAt: '2026-01-01T00:00:00Z',
      updatedAt: '2026-01-01T00:00:00Z',
    };

    vi.mocked(apiClient.get).mockResolvedValueOnce({
      success: true,
      data: { content: [mockUser], page: 0, size: 20, totalElements: 1, totalPages: 1, last: true },
      message: 'Users retrieved',
      timestamp: new Date().toISOString(),
    });

    const result = await adminService.getUsers(0, 20);

    expect(apiClient.get).toHaveBeenCalledWith('/admin/users?page=0&size=20');
    expect(result.content).toEqual([mockUser]);
  });

  it('createCoupon calls POST /admin/coupons', async () => {
    const mockCoupon: CouponResponse = {
      id: 'c-1',
      code: 'WELCOME20',
      discountType: 'PERCENTAGE',
      discountValue: 20,
      usageCount: 0,
      active: true,
      createdAt: '2026-01-01T00:00:00Z',
      updatedAt: '2026-01-01T00:00:00Z',
    };

    vi.mocked(apiClient.post).mockResolvedValueOnce({
      success: true,
      data: mockCoupon,
      message: 'Coupon created',
      timestamp: new Date().toISOString(),
    });

    const result = await adminService.createCoupon({
      code: 'WELCOME20',
      discountType: 'PERCENTAGE',
      discountValue: 20,
    });

    expect(apiClient.post).toHaveBeenCalledWith('/admin/coupons', {
      code: 'WELCOME20',
      discountType: 'PERCENTAGE',
      discountValue: 20,
    });
    expect(result).toEqual(mockCoupon);
  });

  it('approveReview calls PATCH /admin/reviews/:id/approve', async () => {
    vi.mocked(apiClient.patch).mockResolvedValueOnce({
      success: true,
      data: { id: 'rev-1', approved: true },
      message: 'Approved',
      timestamp: new Date().toISOString(),
    });

    await adminService.approveReview('rev-1');

    expect(apiClient.patch).toHaveBeenCalledWith('/admin/reviews/rev-1/approve');
  });
});
