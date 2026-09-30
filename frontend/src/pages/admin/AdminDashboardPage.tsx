import React from 'react';
import { Link } from 'react-router';
import {
  Users,
  Shirt,
  ShoppingBag,
  DollarSign,
  Clock,
  Package,
  Truck,
  CheckCircle2,
  XCircle,
  ArrowRight,
  Shield,
} from 'lucide-react';
import { useAdminDashboard, useAdminOrders } from '../../hooks/useAdmin';
import { AdminStatCard } from '../../components/admin/AdminStatCard';
import { OrderStatusBadge } from '../../components/orders/OrderStatusBadge';
import { formatCurrency } from '../../utils';
import { Button } from '../../components/ui/Button';

export const AdminDashboardPage: React.FC = () => {
  const { data: summary, isLoading: isSummaryLoading, isError: isSummaryError } = useAdminDashboard();
  const { data: ordersData, isLoading: isOrdersLoading } = useAdminOrders(undefined, 0, 5);

  const recentOrders = ordersData?.content || [];

  return (
    <div className="space-y-8">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              Admin Dashboard
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-amber-500/10 text-amber-400 border border-amber-500/20 flex items-center gap-1">
              <Shield className="h-3 w-3" /> System Overview
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Authoritative summary statistics and recent customer order operations.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Link to="/admin/products">
            <Button type="button" variant="amber" size="sm">
              <Shirt className="h-4 w-4 mr-1.5" />
              Manage Products
            </Button>
          </Link>
          <Link to="/admin/orders">
            <Button type="button" variant="outline" size="sm" className="border-slate-700">
              <ShoppingBag className="h-4 w-4 mr-1.5" />
              All Orders
            </Button>
          </Link>
        </div>
      </div>

      {isSummaryError ? (
        <div className="p-4 rounded-xl border border-red-500/30 bg-red-500/10 text-xs text-red-300">
          Failed to load dashboard summary statistics from backend API.
        </div>
      ) : (
        /* High Level Metric Cards */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <AdminStatCard
            title="Total Revenue"
            value={formatCurrency(summary?.totalSuccessfulRevenue || 0)}
            icon={DollarSign}
            description="Verified completed order sales"
            isLoading={isSummaryLoading}
            variant="emerald"
          />
          <AdminStatCard
            title="Total Orders"
            value={summary?.totalOrders ?? 0}
            icon={ShoppingBag}
            description={`${summary?.pendingOrders ?? 0} pending payment`}
            isLoading={isSummaryLoading}
            variant="amber"
          />
          <AdminStatCard
            title="Total Products"
            value={summary?.totalProducts ?? 0}
            icon={Shirt}
            description="Active & inactive catalog items"
            isLoading={isSummaryLoading}
            variant="blue"
          />
          <AdminStatCard
            title="Registered Users"
            value={summary?.totalUsers ?? 0}
            icon={Users}
            description="Customer & admin accounts"
            isLoading={isSummaryLoading}
            variant="purple"
          />
        </div>
      )}

      {/* Order Status Breakdown Cards */}
      <div className="space-y-3">
        <h2 className="text-sm font-extrabold uppercase tracking-wider text-slate-400">
          Order Status Pipeline
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
          <div className="p-3.5 rounded-xl border border-slate-800 bg-slate-900/60 text-xs space-y-1">
            <div className="flex items-center gap-1.5 text-amber-400 font-bold">
              <Clock className="h-3.5 w-3.5" />
              <span>Pending</span>
            </div>
            <p className="text-xl font-black text-white">{summary?.pendingOrders ?? 0}</p>
          </div>

          <div className="p-3.5 rounded-xl border border-slate-800 bg-slate-900/60 text-xs space-y-1">
            <div className="flex items-center gap-1.5 text-blue-400 font-bold">
              <Package className="h-3.5 w-3.5" />
              <span>Processing</span>
            </div>
            <p className="text-xl font-black text-white">{summary?.processingOrders ?? 0}</p>
          </div>

          <div className="p-3.5 rounded-xl border border-slate-800 bg-slate-900/60 text-xs space-y-1">
            <div className="flex items-center gap-1.5 text-indigo-400 font-bold">
              <Truck className="h-3.5 w-3.5" />
              <span>Shipped</span>
            </div>
            <p className="text-xl font-black text-white">{summary?.shippedOrders ?? 0}</p>
          </div>

          <div className="p-3.5 rounded-xl border border-slate-800 bg-slate-900/60 text-xs space-y-1">
            <div className="flex items-center gap-1.5 text-emerald-400 font-bold">
              <CheckCircle2 className="h-3.5 w-3.5" />
              <span>Delivered</span>
            </div>
            <p className="text-xl font-black text-white">{summary?.deliveredOrders ?? 0}</p>
          </div>

          <div className="p-3.5 rounded-xl border border-slate-800 bg-slate-900/60 text-xs space-y-1 col-span-2 sm:col-span-1">
            <div className="flex items-center gap-1.5 text-red-400 font-bold">
              <XCircle className="h-3.5 w-3.5" />
              <span>Cancelled</span>
            </div>
            <p className="text-xl font-black text-white">{summary?.cancelledOrders ?? 0}</p>
          </div>
        </div>
      </div>

      {/* Recent Orders Table Preview */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5 sm:p-6 backdrop-blur-md space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-extrabold text-white">Recent Customer Orders</h2>
            <p className="text-xs text-slate-400">Latest orders placed across the store</p>
          </div>
          <Link
            to="/admin/orders"
            className="inline-flex items-center gap-1 text-xs font-bold text-amber-400 hover:text-amber-300"
          >
            <span>View All Orders</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        {isOrdersLoading ? (
          <div className="h-40 rounded-xl bg-slate-800/40 animate-pulse" />
        ) : recentOrders.length === 0 ? (
          <div className="text-center py-8 text-xs text-slate-500">No recent orders found.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 uppercase tracking-wider text-[10px]">
                  <th className="py-2.5 px-3">Order Number</th>
                  <th className="py-2.5 px-3">Customer</th>
                  <th className="py-2.5 px-3">Date</th>
                  <th className="py-2.5 px-3">Status</th>
                  <th className="py-2.5 px-3 text-right">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-medium">
                {recentOrders.map((ord) => (
                  <tr key={ord.id} className="hover:bg-slate-800/40">
                    <td className="py-3 px-3 font-mono font-bold text-white">{ord.orderNumber}</td>
                    <td className="py-3 px-3 text-slate-300">{ord.customerName}</td>
                    <td className="py-3 px-3 text-slate-400">
                      {new Date(ord.createdAt).toLocaleDateString()}
                    </td>
                    <td className="py-3 px-3">
                      <OrderStatusBadge status={ord.status} />
                    </td>
                    <td className="py-3 px-3 text-right font-black text-amber-400">
                      {formatCurrency(ord.totalAmount)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
