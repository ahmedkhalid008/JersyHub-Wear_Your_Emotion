import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { orderService } from '../services/orderService';
import { queryKeys } from '../services/api/queryKeys';
import { useAuthStore } from '../stores/useAuthStore';

export function useOrders() {
  const { isAuthenticated } = useAuthStore();

  return useQuery({
    queryKey: queryKeys.orders.all,
    queryFn: () => orderService.getUserOrders(),
    enabled: isAuthenticated,
    staleTime: 1000 * 60 * 2,
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

export function useDownloadInvoice() {
  return useMutation({
    mutationFn: async ({ orderId, orderNumber }: { orderId: string; orderNumber: string }) => {
      const blob = await orderService.downloadInvoice(orderId);
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `JerseyHub-Invoice-${orderNumber}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      return true;
    },
  });
}

export function useCancelOrder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (orderId: string) => orderService.cancelOrder(orderId),
    onSuccess: (_, orderId) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.orders.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.orders.detail(orderId) });
    },
  });
}
