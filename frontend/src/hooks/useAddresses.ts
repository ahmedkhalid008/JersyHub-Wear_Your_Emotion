import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { addressService } from '../services/addressService';
import { queryKeys } from '../services/api/queryKeys';
import { useAuthStore } from '../stores/useAuthStore';
import { AddressRequest } from '../types/domain';

export function useAddresses() {
  const { isAuthenticated } = useAuthStore();

  return useQuery({
    queryKey: queryKeys.addresses,
    queryFn: () => addressService.getAddresses(),
    enabled: isAuthenticated,
    staleTime: 1000 * 60 * 5,
  });
}

export function useCreateAddress() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (request: AddressRequest) => addressService.createAddress(request),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.addresses });
    },
  });
}

export function useUpdateAddress() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, request }: { id: string; request: AddressRequest }) =>
      addressService.updateAddress(id, request),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.addresses });
    },
  });
}

export function useDeleteAddress() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => addressService.deleteAddress(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.addresses });
    },
  });
}

export function useSetDefaultAddress() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => addressService.setDefaultAddress(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.addresses });
    },
  });
}
