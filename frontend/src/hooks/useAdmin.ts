import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminService } from '../services/adminService';
import { useAuthStore } from '../stores/useAuthStore';
import { CouponCreateRequest, ProductCreateRequest, ProductUpdateRequest } from '../types/domain';

export function useAdminDashboard() {
  const { isAuthenticated, user } = useAuthStore();
  const isAdmin = isAuthenticated && user?.role === 'ADMIN';

  return useQuery({
    queryKey: ['admin', 'dashboard'],
    queryFn: () => adminService.getDashboardSummary(),
    enabled: isAdmin,
    staleTime: 1000 * 60 * 2,
  });
}

export function useAdminOrders(status?: string, page = 0, size = 20) {
  const { isAuthenticated, user } = useAuthStore();
  const isAdmin = isAuthenticated && user?.role === 'ADMIN';

  return useQuery({
    queryKey: ['admin', 'orders', status, page, size],
    queryFn: () => adminService.getOrders(status, page, size),
    enabled: isAdmin,
  });
}

export function useAdminOrderDetail(id: string | undefined) {
  const { isAuthenticated, user } = useAuthStore();
  const isAdmin = isAuthenticated && user?.role === 'ADMIN';

  return useQuery({
    queryKey: ['admin', 'orders', 'detail', id],
    queryFn: () => adminService.getOrderById(id!),
    enabled: isAdmin && Boolean(id),
  });
}

export function useAdminUsers(page = 0, size = 20) {
  const { isAuthenticated, user } = useAuthStore();
  const isAdmin = isAuthenticated && user?.role === 'ADMIN';

  return useQuery({
    queryKey: ['admin', 'users', page, size],
    queryFn: () => adminService.getUsers(page, size),
    enabled: isAdmin,
  });
}

export function useAdminProducts(search?: string, active?: boolean, page = 0, size = 20) {
  const { isAuthenticated, user } = useAuthStore();
  const isAdmin = isAuthenticated && user?.role === 'ADMIN';

  return useQuery({
    queryKey: ['admin', 'products', search, active, page, size],
    queryFn: () => adminService.getProducts(search, active, page, size),
    enabled: isAdmin,
  });
}

export function useAdminCreateProduct() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (request: ProductCreateRequest) => adminService.createProduct(request),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'products'] });
    },
  });
}

export function useAdminUpdateProductStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, active }: { id: string; active: boolean }) =>
      adminService.updateProductStatus(id, active),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'products'] });
    },
  });
}

export function useAdminUpdateProduct() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, request }: { id: string; request: ProductUpdateRequest }) =>
      adminService.updateProduct(id, request),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'products'] });
    },
  });
}

export function useAdminDeleteProduct() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => adminService.deleteProduct(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'products'] });
    },
  });
}

export function useAdminCoupons(page = 0, size = 20) {
  const { isAuthenticated, user } = useAuthStore();
  const isAdmin = isAuthenticated && user?.role === 'ADMIN';

  return useQuery({
    queryKey: ['admin', 'coupons', page, size],
    queryFn: () => adminService.getCoupons(page, size),
    enabled: isAdmin,
  });
}

export function useAdminCreateCoupon() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (request: CouponCreateRequest) => adminService.createCoupon(request),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'coupons'] });
    },
  });
}

export function useAdminActivateCoupon() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => adminService.activateCoupon(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'coupons'] });
    },
  });
}

export function useAdminDeactivateCoupon() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => adminService.deactivateCoupon(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'coupons'] });
    },
  });
}

export function useAdminDeleteCoupon() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => adminService.deleteCoupon(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'coupons'] });
    },
  });
}

export function useAdminReviews(approved?: boolean, page = 0, size = 20) {
  const { isAuthenticated, user } = useAuthStore();
  const isAdmin = isAuthenticated && user?.role === 'ADMIN';

  return useQuery({
    queryKey: ['admin', 'reviews', approved, page, size],
    queryFn: () => adminService.getReviews(approved, page, size),
    enabled: isAdmin,
  });
}

export function useAdminApproveReview() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => adminService.approveReview(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'reviews'] });
    },
  });
}

export function useAdminRejectReview() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => adminService.rejectReview(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'reviews'] });
    },
  });
}
