import React from 'react';
import { Navigate, Link } from 'react-router';
import { PackageX, ShoppingBag, RefreshCw } from 'lucide-react';
import { useAuthStore } from '../stores/useAuthStore';
import { useOrders } from '../hooks/useOrders';
import { OrderCard } from '../components/orders/OrderCard';
import { OrdersSkeleton } from '../components/orders/OrdersSkeleton';
import { Button } from '../components/ui/Button';

export const OrdersPage: React.FC = () => {
  const { isAuthenticated } = useAuthStore();
  const { data: orders = [], isLoading, isError, refetch } = useOrders();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (isLoading) {
    return <OrdersSkeleton />;
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">My Orders</h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Track and view your jersey purchase history & invoices.
          </p>
        </div>
        <Link to="/products">
          <Button type="button" variant="outline" size="sm" className="text-xs border-slate-700">
            <ShoppingBag className="h-4 w-4 mr-1.5" />
            Browse Jerseys
          </Button>
        </Link>
      </div>

      {/* Error State */}
      {isError ? (
        <div className="p-6 rounded-2xl border border-red-500/30 bg-red-500/10 text-center space-y-4">
          <p className="text-sm font-semibold text-red-300">
            Unable to retrieve your orders. Please try again.
          </p>
          <Button type="button" variant="outline" size="sm" onClick={() => refetch()} className="border-slate-700">
            <RefreshCw className="h-4 w-4 mr-1.5" />
            Try Again
          </Button>
        </div>
      ) : orders.length === 0 ? (
        /* Empty State */
        <div className="text-center py-16 border border-dashed border-slate-800 rounded-3xl bg-slate-900/40 space-y-4">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-800 text-slate-500">
            <PackageX className="h-8 w-8" />
          </div>
          <div className="space-y-1">
            <h3 className="text-lg font-bold text-white">You haven't placed any orders yet</h3>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              Once you checkout your favorite football jerseys, your order details will appear here.
            </p>
          </div>
          <Link to="/products" className="inline-block pt-2">
            <Button type="button" variant="amber" size="md">
              <ShoppingBag className="h-4 w-4 mr-2" />
              Continue Shopping
            </Button>
          </Link>
        </div>
      ) : (
        /* Order List */
        <div className="space-y-4">
          {orders.map((order) => (
            <OrderCard key={order.id} order={order} />
          ))}
        </div>
      )}
    </div>
  );
};
