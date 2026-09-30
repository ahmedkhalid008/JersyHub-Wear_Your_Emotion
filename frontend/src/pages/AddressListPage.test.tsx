import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AddressListPage } from './AddressListPage';
import { addressService } from '../services/addressService';
import { useAuthStore } from '../stores/useAuthStore';
import { AddressResponse } from '../types/domain';

vi.mock('../services/addressService', () => ({
  addressService: {
    getAddresses: vi.fn(),
    createAddress: vi.fn(),
    updateAddress: vi.fn(),
    deleteAddress: vi.fn(),
    setDefaultAddress: vi.fn(),
  },
}));

const mockAddresses: AddressResponse[] = [
  {
    id: 'addr-10',
    recipientName: 'Tariq Rahman',
    phone: '+8801811111111',
    division: 'Dhaka',
    district: 'Dhaka',
    area: 'Uttara',
    addressLine: 'Sector 4, Road 7',
    postalCode: '1230',
    isDefault: true,
    createdAt: '2025-01-01T00:00:00Z',
    updatedAt: '2025-01-01T00:00:00Z',
  },
];

const createTestQueryClient = () =>
  new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });

const renderAddressListPage = () => {
  const queryClient = createTestQueryClient();
  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter>
        <AddressListPage />
      </MemoryRouter>
    </QueryClientProvider>
  );
};

describe('AddressListPage Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useAuthStore.setState({
      user: { id: 'user-1', email: 'user@example.com', name: 'User', role: 'CUSTOMER', enabled: true, emailVerified: true },
      accessToken: 'token',
      isAuthenticated: true,
    });
  });

  it('renders user shipping addresses list with default badge', async () => {
    vi.mocked(addressService.getAddresses).mockResolvedValue(mockAddresses);

    renderAddressListPage();

    expect(await screen.findByText('Tariq Rahman')).toBeInTheDocument();
    expect(screen.getByText('Default Address')).toBeInTheDocument();
    expect(screen.getByText(/Sector 4, Road 7/i)).toBeInTheDocument();
  });

  it('renders empty state when user has no saved addresses', async () => {
    vi.mocked(addressService.getAddresses).mockResolvedValue([]);

    renderAddressListPage();

    expect(await screen.findByText('No saved shipping addresses')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /add your first address/i })).toBeInTheDocument();
  });

  it('opens add new address modal when button is clicked', async () => {
    vi.mocked(addressService.getAddresses).mockResolvedValue(mockAddresses);

    renderAddressListPage();

    const addBtn = await screen.findByRole('button', { name: /add new address/i });
    fireEvent.click(addBtn);

    expect(await screen.findByText('Add New Shipping Address')).toBeInTheDocument();
  });
});
