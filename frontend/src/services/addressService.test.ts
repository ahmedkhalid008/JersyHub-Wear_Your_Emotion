import { describe, it, expect, vi, beforeEach } from 'vitest';
import { addressService } from './addressService';
import { apiClient } from './api/client';
import { AddressResponse, AddressRequest } from '../types/domain';

vi.mock('./api/client', () => ({
  apiClient: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),
    patch: vi.fn(),
  },
}));

describe('addressService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const mockAddress: AddressResponse = {
    id: 'addr-1',
    recipientName: 'Khalid Hossain',
    phone: '+8801700000000',
    division: 'Dhaka',
    district: 'Dhaka',
    area: 'Dhanmondi',
    addressLine: 'House 12, Road 5',
    postalCode: '1209',
    isDefault: true,
    createdAt: '2025-01-01T00:00:00Z',
    updatedAt: '2025-01-01T00:00:00Z',
  };

  const mockRequest: AddressRequest = {
    recipientName: 'Khalid Hossain',
    phone: '+8801700000000',
    division: 'Dhaka',
    district: 'Dhaka',
    area: 'Dhanmondi',
    addressLine: 'House 12, Road 5',
    postalCode: '1209',
    isDefault: true,
  };

  it('fetches list of user addresses', async () => {
    vi.mocked(apiClient.get).mockResolvedValue({
      success: true,
      message: 'Success',
      data: [mockAddress],
      timestamp: '2025-01-01T00:00:00Z',
    });

    const result = await addressService.getAddresses();

    expect(apiClient.get).toHaveBeenCalledWith('/addresses');
    expect(result).toHaveLength(1);
    expect(result[0]).toEqual(mockAddress);
  });

  it('creates a new address', async () => {
    vi.mocked(apiClient.post).mockResolvedValue({
      success: true,
      message: 'Created',
      data: mockAddress,
      timestamp: '2025-01-01T00:00:00Z',
    });

    const result = await addressService.createAddress(mockRequest);

    expect(apiClient.post).toHaveBeenCalledWith('/addresses', mockRequest);
    expect(result).toEqual(mockAddress);
  });

  it('updates an existing address', async () => {
    vi.mocked(apiClient.put).mockResolvedValue({
      success: true,
      message: 'Updated',
      data: mockAddress,
      timestamp: '2025-01-01T00:00:00Z',
    });

    const result = await addressService.updateAddress('addr-1', mockRequest);

    expect(apiClient.put).toHaveBeenCalledWith('/addresses/addr-1', mockRequest);
    expect(result).toEqual(mockAddress);
  });

  it('deletes an address', async () => {
    vi.mocked(apiClient.delete).mockResolvedValue({
      success: true,
      message: 'Deleted',
      data: null,
      timestamp: '2025-01-01T00:00:00Z',
    });

    await addressService.deleteAddress('addr-1');

    expect(apiClient.delete).toHaveBeenCalledWith('/addresses/addr-1');
  });

  it('sets an address as default', async () => {
    vi.mocked(apiClient.patch).mockResolvedValue({
      success: true,
      message: 'Set default',
      data: mockAddress,
      timestamp: '2025-01-01T00:00:00Z',
    });

    const result = await addressService.setDefaultAddress('addr-1');

    expect(apiClient.patch).toHaveBeenCalledWith('/addresses/addr-1/default');
    expect(result).toEqual(mockAddress);
  });
});
