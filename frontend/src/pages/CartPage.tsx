import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingBag, Trash2, ArrowLeft } from 'lucide-react';
import {
  useCart,
  useUpdateCartItem,
  useRemoveCartItem,
  useClearCart,
  useApplyCoupon,
  useRemoveCoupon,
} from '../hooks/useCart';
import { useAuthStore } from '../stores/useAuthStore';
import { PageHeader } from '../components/ui/PageHeader';
import { CartItemCard } from '../components/cart/CartItemCard';
import { CartSummary } from '../components/cart/CartSummary';
import { CartSkeleton } from '../components/cart/CartSkeleton';
import { EmptyState } from '../components/ui/EmptyState';
import { ErrorState } from '../components/ui/ErrorState';
import { Button } from '../components/ui/Button';
import { CouponApplyResponse } from '../types/domain';

export const CartPage: React.FC = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuthStore();

  const [appliedCoupon, setAppliedCoupon] = useState<CouponApplyResponse | null>(null);
  const [couponError, setCouponError] = useState<string | null>(null);

  const { data: cart, isLoading, isError, error, refetch } = useCart();

  const updateItemMutation = useUpdateCartItem();
  const removeItemMutation = useRemoveCartItem();
  const clearCartMutation = useClearCart();
  const applyCouponMutation = useApplyCoupon();
  const removeCouponMutation = useRemoveCoupon();

  if (!isAuthenticated) {
    return (
      <div className="space-y-6 max-w-md mx-auto py-8">
        <EmptyState
          icon={<ShoppingBag className="h-8 w-8 text-amber-400" />}
          title="Sign in to view your cart"
          description="Please sign in to your JerseyHub account to access your shopping cart and saved items."
          actionLabel="Sign In"
          onAction={() => navigate('/login')}
        />
      </div>
    );
  }

  const handleUpdateQuantity = async (cartItemId: string, newQuantity: number) => {
    try {
      await updateItemMutation.mutateAsync({
        cartItemId,
        request: { quantity: newQuantity },
      });
    } catch {
      // Handled by query refetch
    }
  };

  const handleRemoveItem = async (cartItemId: string) => {
    try {
      await removeItemMutation.mutateAsync(cartItemId);
    } catch {
      // Handled by query refetch
    }
  };

  const handleClearCart = async () => {
    try {
      await clearCartMutation.mutateAsync();
      setAppliedCoupon(null);
    } catch {
      // Handled by query refetch
    }
  };

  const handleApplyCoupon = async (code: string) => {
    setCouponError(null);
    try {
      const res = await applyCouponMutation.mutateAsync(code);
      setAppliedCoupon(res);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setCouponError(err.message);
      } else {
        setCouponError('Invalid coupon code or minimum spend requirement not met.');
      }
    }
  };

  const handleRemoveCoupon = async () => {
    try {
      await removeCouponMutation.mutateAsync();
      setAppliedCoupon(null);
    } catch {
      setAppliedCoupon(null);
    }
  };

  if (isLoading) {
    return <CartSkeleton />;
  }

  if (isError) {
    return (
      <div className="space-y-6">
        <PageHeader title="Shopping Cart" description="Review selected jerseys and kit items." />
        <ErrorState
          title="Could not retrieve shopping cart"
          message={error instanceof Error ? error.message : 'Failed to communicate with cart service.'}
          onRetry={() => refetch()}
        />
      </div>
    );
  }

  const items = cart?.items || [];
  const subtotal = cart?.total || 0;

  if (items.length === 0) {
    return (
      <div className="space-y-6">
        <PageHeader title="Shopping Cart" description="Review selected jerseys and kit items." />
        <EmptyState
          icon={<ShoppingBag className="h-8 w-8 text-amber-400" />}
          title="Your cart is empty"
          description="Looks like you haven't added any football kits to your cart yet."
          actionLabel="Continue Shopping"
          onAction={() => navigate('/products')}
        />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <PageHeader
          title="Shopping Cart"
          description={`You have ${cart?.totalItems || items.length} kit item(s) in your cart.`}
        />
        <Button
          variant="outline"
          size="sm"
          onClick={handleClearCart}
          isLoading={clearCartMutation.isPending}
          className="border-slate-800 text-slate-400 hover:text-red-400 hover:bg-red-500/10 self-start sm:self-auto"
        >
          <Trash2 className="h-4 w-4 mr-1.5" />
          Clear Cart
        </Button>
      </div>

      {/* Cart Grid Layout: Items List (Left) + Order Summary (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Cart Items */}
        <div className="lg:col-span-8 space-y-4">
          {items.map((item) => (
            <CartItemCard
              key={item.id}
              item={item}
              onUpdateQuantity={handleUpdateQuantity}
              onRemoveItem={handleRemoveItem}
              isUpdating={updateItemMutation.isPending || removeItemMutation.isPending}
            />
          ))}

          <div className="pt-4">
            <Link
              to="/products"
              className="inline-flex items-center gap-2 text-xs font-bold text-amber-400 hover:underline"
            >
              <ArrowLeft className="h-4 w-4" />
              Continue Shopping Football Kits
            </Link>
          </div>
        </div>

        {/* Right Column: Order Summary & Coupons */}
        <div className="lg:col-span-4">
          <CartSummary
            subtotal={subtotal}
            appliedCoupon={appliedCoupon}
            onApplyCoupon={handleApplyCoupon}
            onRemoveCoupon={handleRemoveCoupon}
            isApplyingCoupon={applyCouponMutation.isPending}
            couponError={couponError}
          />
        </div>
      </div>
    </div>
  );
};
