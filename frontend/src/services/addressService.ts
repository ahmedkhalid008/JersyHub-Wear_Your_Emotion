import { apiClient } from './api/client';
import { ApiResponse } from '../types/api';
import { AddressResponse, AddressRequest } from '../types/domain';

export const addressService = {
  async getAddresses(): Promise<AddressResponse[]> {
    const response: ApiResponse<AddressResponse[]> = await apiClient.get<AddressResponse[]>(
      '/addresses'
    );
    return response.data || [];
  },

  async getAddressById(id: string): Promise<AddressResponse> {
    const response: ApiResponse<AddressResponse> = await apiClient.get<AddressResponse>(
      `/addresses/${id}`
    );
    return response.data;
  },

  async createAddress(request: AddressRequest): Promise<AddressResponse> {
    const response: ApiResponse<AddressResponse> = await apiClient.post<AddressResponse>(
      '/addresses',
      request
    );
    return response.data;
  },

  async updateAddress(id: string, request: AddressRequest): Promise<AddressResponse> {
    const response: ApiResponse<AddressResponse> = await apiClient.put<AddressResponse>(
      `/addresses/${id}`,
      request
    );
    return response.data;
  },

  async deleteAddress(id: string): Promise<void> {
    await apiClient.delete<void>(`/addresses/${id}`);
  },

  async setDefaultAddress(id: string): Promise<AddressResponse> {
    const response: ApiResponse<AddressResponse> = await apiClient.patch<AddressResponse>(
      `/addresses/${id}/default`
    );
    return response.data;
  },
};
