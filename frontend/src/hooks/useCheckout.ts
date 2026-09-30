import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { orderService } from '../services/orderService';
import { paymentService } from '../services/paymentService';
import { queryKeys } from '../services/api/queryKeys';
import { useAuthStore } from '../stores/useAuthStore';
import { CheckoutRequest, PaymentInitiateRequest } from '../types/domain';

export function useCheckoutOrder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (request: CheckoutRequest) => orderService.checkout(request),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.orders.all });
    },
  });
}

export function useInitiatePayment() {
  return useMutation({
    mutationFn: (request: PaymentInitiateRequest) => paymentService.initiatePayment(request),
  });
}

export function useOrderDetails(orderId: string | undefined) {
  const { isAuthenticated } = useAuthStore();

  return useQuery({
    queryKey: queryKeys.orders.detail(orderId || ''),
    queryFn: () => orderService.getUserOrder(orderId!),
    enabled: isAuthenticated && Boolean(orderId),
  });
}

export function usePaymentDetails(paymentId: string | undefined) {
  const { isAuthenticated } = useAuthStore();

  return useQuery({
    queryKey: ['payments', 'detail', paymentId],
    queryFn: () => paymentService.getPayment(paymentId!),
    enabled: isAuthenticated && Boolean(paymentId),
  });
}
