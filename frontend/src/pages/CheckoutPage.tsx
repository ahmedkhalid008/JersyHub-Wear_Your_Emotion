import React, { useState, useEffect } from 'react';
import { Navigate, useLocation, useNavigate, Link } from 'react-router-dom';
import { ShoppingBag, ArrowLeft } from 'lucide-react';
import { useAuthStore } from '../stores/useAuthStore';
import { useCart, useClearCart } from '../hooks/useCart';
import { useAddresses } from '../hooks/useAddresses';
import { useCheckoutOrder, useInitiatePayment } from '../hooks/useCheckout';
import { CheckoutHeader } from '../components/checkout/CheckoutHeader';
import { CheckoutAddressSection } from '../components/checkout/CheckoutAddressSection';
import { CheckoutOrderSummary } from '../components/checkout/CheckoutOrderSummary';
import { CheckoutPaymentSection } from '../components/checkout/CheckoutPaymentSection';
import { CheckoutSkeleton } from '../components/checkout/CheckoutSkeleton';
import { Button } from '../components/ui/Button';
import { ApiError } from '../services/api/errors';

export const CheckoutPage: React.FC = () => {
  const { isAuthenticated } = useAuthStore();
  const location = useLocation();
  const navigate = useNavigate();

  const { data: cart, isLoading: isCartLoading } = useCart();
  const { data: addresses = [], isLoading: isAddressesLoading } = useAddresses();

  const checkoutMutation = useCheckoutOrder();
  const initiatePaymentMutation = useInitiatePayment();
  const clearCartMutation = useClearCart();

  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<'SSLCOMMERZ' | 'CASH_ON_DELIVERY'>('SSLCOMMERZ');
  const [submissionError, setSubmissionError] = useState<string | null>(null);
  const [isProcessingOrder, setIsProcessingOrder] = useState(false);

  // Auto-select default address or first address
  useEffect(() => {
    if (addresses.length > 0 && !selectedAddressId) {
      const defaultAddr = addresses.find((a) => a.isDefault);
      if (defaultAddr) {
        setSelectedAddressId(defaultAddr.id);
      } else {
        setSelectedAddressId(addresses[0].id);
      }
    }
  }, [addresses, selectedAddressId]);

  // Auth protection
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Loading state
  if (isCartLoading || isAddressesLoading) {
    return <CheckoutSkeleton />;
  }

  const isSubmitting =
    isProcessingOrder ||
    checkoutMutation.isPending ||
    initiatePaymentMutation.isPending ||
    clearCartMutation.isPending;

  // Empty cart protection - only render if cart is truly empty AND user is NOT actively submitting an order
  const isCartEmpty = !cart || !cart.items || cart.items.length === 0;
  if (isCartEmpty && !isSubmitting) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center space-y-6">
        <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-3xl bg-amber-500/10 text-amber-400">
          <ShoppingBag className="h-10 w-10" />
        </div>
        <div className="space-y-2">
          <h1 className="text-2xl sm:text-3xl font-black text-white">Your cart is empty</h1>
          <p className="text-sm text-slate-400 max-w-md mx-auto">
            You need to add products to your cart before proceeding to checkout.
          </p>
        </div>
        <div className="flex items-center justify-center gap-4 pt-2">
          <Link to="/products">
            <Button type="button" variant="amber" size="md">
              <ShoppingBag className="h-4 w-4 mr-2" />
              Browse Jerseys
            </Button>
          </Link>
          <Link to="/cart">
            <Button type="button" variant="outline" size="md" className="border-slate-700">
              <ArrowLeft className="h-4 w-4 mr-2" />
              View Cart
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  const handleConfirmOrder = async () => {
    if (!selectedAddressId) {
      setSubmissionError('Please select a shipping address before placing your order.');
      return;
    }

    setSubmissionError(null);
    setIsProcessingOrder(true);

    try {
      const checkoutItems = (cart?.items || []).map((item) => ({
        productVariantId: String(item.productVariantId || item.productId),
        quantity: item.quantity,
      }));

      // 1. Create Order authoritatively on backend
      const order = await checkoutMutation.mutateAsync({
        shippingAddressId: selectedAddressId,
        paymentMethod: paymentMethod,
        items: checkoutItems,
      });

      if (!order || !order.id) {
        throw new Error('Order creation failed. Please try again.');
      }

      if (paymentMethod === 'CASH_ON_DELIVERY') {
        // ONLY after receiving a successful response (status 200/201 with orderId):
        // a) Clear the cart
        try {
          await clearCartMutation.mutateAsync();
        } catch (clearErr) {
          console.error('Failed to clear cart after order creation:', clearErr);
        }
        // b) Redirect to order confirmation page
        navigate(`/order-success?orderId=${order.id}`);
      } else {
        // 2. Initiate SSLCommerz Payment session
        const paymentResponse = await initiatePaymentMutation.mutateAsync({
          orderId: order.id,
        });

        // 3. On receiving the redirect URL from the gateway:
        if (paymentResponse && paymentResponse.gatewayPageUrl) {
          // a) Clear the cart
          try {
            await clearCartMutation.mutateAsync();
          } catch (clearErr) {
            console.error('Failed to clear cart before payment redirect:', clearErr);
          }
          // b) Redirect via window.location.href = gatewayUrl
          window.location.href = paymentResponse.gatewayPageUrl;
        } else {
          setSubmissionError('Payment gateway URL missing. Please try again.');
          setIsProcessingOrder(false);
        }
      }
    } catch (err) {
      setIsProcessingOrder(false);
      if (err instanceof ApiError) {
        if (err.status === 409) {
          setSubmissionError('Inventory stock or cart changed. Please review your cart and try again.');
        } else {
          setSubmissionError(err.message || 'Failed to place order. Please try again.');
        }
      } else if (err instanceof Error) {
        setSubmissionError(err.message || 'An unexpected error occurred while processing your order.');
      } else {
        setSubmissionError('An unexpected error occurred while processing your order.');
      }
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <CheckoutHeader />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Address Selection & Payment Info */}
        <div className="lg:col-span-7 space-y-6">
          <CheckoutAddressSection
            addresses={addresses}
            selectedAddressId={selectedAddressId}
            onSelectAddress={(id) => {
              setSelectedAddressId(id);
              setSubmissionError(null);
            }}
          />

          <CheckoutPaymentSection
            paymentMethod={paymentMethod}
            onSelectPaymentMethod={setPaymentMethod}
            onConfirmOrder={handleConfirmOrder}
            isSubmitting={isSubmitting}
            disabled={!selectedAddressId || addresses.length === 0}
            errorMessage={submissionError}
          />
        </div>

        {/* Right Column: Authoritative Order Summary */}
        <div className="lg:col-span-5 sticky top-24">
          <CheckoutOrderSummary cart={cart || { id: '', userId: '', items: [], total: 0, totalItems: 0, createdAt: '', updatedAt: '' }} />
        </div>
      </div>
    </div>
  );
};
