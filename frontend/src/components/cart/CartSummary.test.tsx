import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { CartSummary } from './CartSummary';

describe('CartSummary Component', () => {
  it('renders subtotal and checkout notice correctly', () => {
    render(
      <MemoryRouter>
        <CartSummary
          subtotal={250}
          onApplyCoupon={vi.fn()}
          onRemoveCoupon={vi.fn()}
        />
      </MemoryRouter>
    );

    expect(screen.getByText('Order Summary')).toBeInTheDocument();
    expect(screen.getAllByText('৳250.00').length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText(/Proceed to Checkout/i)).toBeInTheDocument();
  });

  it('handles coupon code entry and submission', async () => {
    const handleApply = vi.fn().mockResolvedValue(undefined);

    render(
      <MemoryRouter>
        <CartSummary
          subtotal={200}
          onApplyCoupon={handleApply}
          onRemoveCoupon={vi.fn()}
        />
      </MemoryRouter>
    );

    const couponInput = screen.getByPlaceholderText('Enter coupon code');
    fireEvent.change(couponInput, { target: { value: 'jersey10' } });

    const applyBtn = screen.getByRole('button', { name: /apply/i });
    fireEvent.click(applyBtn);

    await waitFor(() => {
      expect(handleApply).toHaveBeenCalledWith('JERSEY10');
    });
  });

  it('renders applied coupon badge and discount', () => {
    render(
      <MemoryRouter>
        <CartSummary
          subtotal={200}
          appliedCoupon={{
            couponCode: 'JERSEY10',
            discountType: 'PERCENTAGE',
            discountAmount: 20,
            subtotal: 200,
            shippingAmount: 0,
            totalAfterDiscount: 180,
          }}
          onApplyCoupon={vi.fn()}
          onRemoveCoupon={vi.fn()}
        />
      </MemoryRouter>
    );

    expect(screen.getByText('Coupon "JERSEY10" applied')).toBeInTheDocument();
    expect(screen.getByText('-৳20.00')).toBeInTheDocument();
    expect(screen.getByText('৳180.00')).toBeInTheDocument();
  });
});
