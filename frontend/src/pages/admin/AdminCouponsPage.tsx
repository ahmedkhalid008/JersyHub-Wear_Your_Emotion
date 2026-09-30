import React, { useState } from 'react';
import { Ticket, Plus, CheckCircle2, XCircle, Trash2 } from 'lucide-react';
import {
  useAdminCoupons,
  useAdminCreateCoupon,
  useAdminActivateCoupon,
  useAdminDeactivateCoupon,
  useAdminDeleteCoupon,
} from '../../hooks/useAdmin';
import { formatCurrency } from '../../utils';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';

export const AdminCouponsPage: React.FC = () => {
  const [page] = useState(0);
  const { data: pageData, isLoading, isError, refetch } = useAdminCoupons(page, 15);

  const createCouponMutation = useAdminCreateCoupon();
  const activateCouponMutation = useAdminActivateCoupon();
  const deactivateCouponMutation = useAdminDeactivateCoupon();
  const deleteCouponMutation = useAdminDeleteCoupon();

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [formData, setFormData] = useState({
    code: '',
    description: '',
    discountType: 'PERCENTAGE' as 'PERCENTAGE' | 'FIXED_AMOUNT',
    discountValue: 10,
    minimumOrderAmount: 1000,
    maximumDiscountAmount: 500,
    usageLimit: 100,
  });
  const [formError, setFormError] = useState<string | null>(null);

  const coupons = pageData?.content || [];

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.code) {
      setFormError('Coupon code is required.');
      return;
    }

    setFormError(null);
    try {
      await createCouponMutation.mutateAsync({
        code: formData.code.toUpperCase(),
        description: formData.description || undefined,
        discountType: formData.discountType,
        discountValue: Number(formData.discountValue),
        minimumOrderAmount: Number(formData.minimumOrderAmount),
        maximumDiscountAmount: Number(formData.maximumDiscountAmount),
        usageLimit: Number(formData.usageLimit),
        active: true,
      });
      setShowCreateModal(false);
      setFormData({
        code: '',
        description: '',
        discountType: 'PERCENTAGE',
        discountValue: 10,
        minimumOrderAmount: 1000,
        maximumDiscountAmount: 500,
        usageLimit: 100,
      });
    } catch {
      setFormError('Failed to create coupon. Code must be unique.');
    }
  };

  const handleToggleActivate = async (id: string, active: boolean) => {
    if (active) {
      await deactivateCouponMutation.mutateAsync(id);
    } else {
      await activateCouponMutation.mutateAsync(id);
    }
  };

  const handleDelete = async (id: string, code: string) => {
    if (window.confirm(`Are you sure you want to delete coupon ${code}?`)) {
      await deleteCouponMutation.mutateAsync(id);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-black text-white">Discount Coupon Management</h1>
            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20">
              Promotions
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Create promotional codes, limit maximum usage, and manage active status.
          </p>
        </div>

        <Button
          type="button"
          variant="amber"
          size="sm"
          onClick={() => setShowCreateModal(true)}
        >
          <Plus className="h-4 w-4 mr-1.5" />
          Create Coupon
        </Button>
      </div>

      {/* Create Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-2xl border border-slate-800 bg-slate-900 p-6 space-y-4 shadow-2xl">
            <h2 className="text-lg font-black text-white flex items-center gap-2">
              <Ticket className="h-5 w-5 text-amber-400" /> Create Promotional Coupon
            </h2>

            {formError && (
              <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-xs text-red-300">
                {formError}
              </div>
            )}

            <form onSubmit={handleCreateSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-300 mb-1">Coupon Code *</label>
                <Input
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                  placeholder="e.g. SUMMER10, JERSEY20"
                  required
                />
              </div>

              <div>
                <label className="block font-bold text-slate-300 mb-1">Description</label>
                <Input
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="e.g. 10% discount on orders over 1000 BDT"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-300 mb-1">Discount Type</label>
                  <select
                    value={formData.discountType}
                    onChange={(e) => setFormData({ ...formData, discountType: e.target.value as any })}
                    className="w-full rounded-xl border border-slate-800 bg-slate-950 p-2.5 text-xs text-white"
                  >
                    <option value="PERCENTAGE">PERCENTAGE (%)</option>
                    <option value="FIXED_AMOUNT">FIXED AMOUNT (BDT)</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-slate-300 mb-1">Discount Value *</label>
                  <Input
                    type="number"
                    value={formData.discountValue}
                    onChange={(e) => setFormData({ ...formData, discountValue: Number(e.target.value) })}
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-300 mb-1">Min Order Amount</label>
                  <Input
                    type="number"
                    value={formData.minimumOrderAmount}
                    onChange={(e) => setFormData({ ...formData, minimumOrderAmount: Number(e.target.value) })}
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-300 mb-1">Max Discount Amount</label>
                  <Input
                    type="number"
                    value={formData.maximumDiscountAmount}
                    onChange={(e) => setFormData({ ...formData, maximumDiscountAmount: Number(e.target.value) })}
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-300 mb-1">Global Usage Limit</label>
                <Input
                  type="number"
                  value={formData.usageLimit}
                  onChange={(e) => setFormData({ ...formData, usageLimit: Number(e.target.value) })}
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setShowCreateModal(false)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="amber"
                  size="sm"
                  isLoading={createCouponMutation.isPending}
                >
                  Create Coupon
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Coupons Table */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5 backdrop-blur-md">
        {isLoading ? (
          <div className="h-64 bg-slate-800/40 rounded-xl animate-pulse" />
        ) : isError ? (
          <div className="p-4 text-center text-xs text-red-400">
            Failed to load coupons. <button onClick={() => refetch()} className="underline font-bold">Retry</button>
          </div>
        ) : coupons.length === 0 ? (
          <div className="py-12 text-center text-xs text-slate-500">No coupons found.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 uppercase tracking-wider text-[10px]">
                  <th className="py-3 px-3">Code</th>
                  <th className="py-3 px-3">Discount</th>
                  <th className="py-3 px-3">Min Spend</th>
                  <th className="py-3 px-3">Usage</th>
                  <th className="py-3 px-3">Status</th>
                  <th className="py-3 px-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-medium">
                {coupons.map((c) => (
                  <tr key={c.id} className="hover:bg-slate-800/40">
                    <td className="py-3 px-3">
                      <div className="font-mono font-black text-amber-400 text-sm">{c.code}</div>
                      <div className="text-[10px] text-slate-400 truncate max-w-xs">{c.description || 'No description'}</div>
                    </td>
                    <td className="py-3 px-3 font-bold text-white">
                      {c.discountType === 'PERCENTAGE'
                        ? `${c.discountValue}% OFF`
                        : formatCurrency(c.discountValue)}
                    </td>
                    <td className="py-3 px-3 text-slate-300">
                      {c.minimumOrderAmount ? formatCurrency(c.minimumOrderAmount) : 'None'}
                    </td>
                    <td className="py-3 px-3 text-slate-300">
                      {c.usageCount} {c.usageLimit ? `/ ${c.usageLimit}` : 'used'}
                    </td>
                    <td className="py-3 px-3">
                      <span
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold border ${
                          c.active
                            ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                            : 'bg-slate-800 text-slate-400 border-slate-700'
                        }`}
                      >
                        {c.active ? <CheckCircle2 className="h-3 w-3" /> : <XCircle className="h-3 w-3" />}
                        {c.active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => handleToggleActivate(c.id, c.active)}
                          className="text-[10px] border-slate-800"
                        >
                          {c.active ? 'Deactivate' : 'Activate'}
                        </Button>
                        <button
                          type="button"
                          onClick={() => handleDelete(c.id, c.code)}
                          className="p-1.5 text-slate-500 hover:text-red-400 transition-colors"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
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
