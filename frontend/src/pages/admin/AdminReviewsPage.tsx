import React, { useState } from 'react';
import { Star, CheckCircle2, XCircle, ShieldCheck } from 'lucide-react';
import { useAdminReviews, useAdminApproveReview, useAdminRejectReview } from '../../hooks/useAdmin';
import { Button } from '../../components/ui/Button';

export const AdminReviewsPage: React.FC = () => {
  const [approvedFilter, setApprovedFilter] = useState<boolean | undefined>(undefined);
  const [page, setPage] = useState(0);

  const { data: pageData, isLoading, isError, refetch } = useAdminReviews(approvedFilter, page, 15);

  const approveReviewMutation = useAdminApproveReview();
  const rejectReviewMutation = useAdminRejectReview();

  const reviews = pageData?.content || [];

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-black text-white">Review Moderation Console</h1>
            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20">
              Moderation
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Audit customer product reviews and approve or reject submissions.
          </p>
        </div>

        <select
          value={approvedFilter === undefined ? 'ALL' : approvedFilter ? 'APPROVED' : 'PENDING'}
          onChange={(e) => {
            const val = e.target.value;
            setApprovedFilter(val === 'ALL' ? undefined : val === 'APPROVED');
            setPage(0);
          }}
          className="rounded-xl border border-slate-800 bg-slate-900 px-3 py-2 text-xs text-slate-300 focus:outline-none focus:border-amber-500"
        >
          <option value="ALL">All Moderation Statuses</option>
          <option value="APPROVED">Approved Reviews Only</option>
          <option value="PENDING">Pending / Rejected Only</option>
        </select>
      </div>

      {/* Reviews Table */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5 backdrop-blur-md">
        {isLoading ? (
          <div className="h-64 bg-slate-800/40 rounded-xl animate-pulse" />
        ) : isError ? (
          <div className="p-4 text-center text-xs text-red-400">
            Failed to load reviews. <button onClick={() => refetch()} className="underline font-bold">Retry</button>
          </div>
        ) : reviews.length === 0 ? (
          <div className="py-12 text-center text-xs text-slate-500">No reviews found matching criteria.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 uppercase tracking-wider text-[10px]">
                  <th className="py-3 px-3">Product</th>
                  <th className="py-3 px-3">Customer</th>
                  <th className="py-3 px-3">Rating</th>
                  <th className="py-3 px-3">Review & Comment</th>
                  <th className="py-3 px-3">Status</th>
                  <th className="py-3 px-3 text-right">Moderation</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-medium">
                {reviews.map((rev) => (
                  <tr key={rev.id} className="hover:bg-slate-800/40">
                    <td className="py-3 px-3 font-bold text-white max-w-xs truncate">
                      {rev.productName}
                    </td>
                    <td className="py-3 px-3">
                      <div className="text-slate-200 font-bold">{rev.userName}</div>
                      <div className="text-[10px] text-slate-500">{rev.userEmail}</div>
                    </td>
                    <td className="py-3 px-3">
                      <div className="flex items-center gap-1 text-amber-400 font-bold">
                        <Star className="h-3.5 w-3.5 fill-amber-400" />
                        <span>{rev.rating}/5</span>
                      </div>
                    </td>
                    <td className="py-3 px-3 max-w-sm">
                      {rev.title && <p className="font-bold text-white truncate">{rev.title}</p>}
                      <p className="text-slate-300 line-clamp-2">{rev.comment}</p>
                      {rev.verifiedPurchase && (
                        <span className="inline-flex items-center gap-1 text-[9px] font-bold text-emerald-400 mt-1">
                          <ShieldCheck className="h-3 w-3" /> Verified Buyer
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-3">
                      <span
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold border ${
                          rev.approved
                            ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                            : 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                        }`}
                      >
                        {rev.approved ? <CheckCircle2 className="h-3 w-3" /> : <XCircle className="h-3 w-3" />}
                        {rev.approved ? 'Approved' : 'Pending'}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {!rev.approved ? (
                          <Button
                            type="button"
                            variant="amber"
                            size="sm"
                            isLoading={approveReviewMutation.isPending}
                            onClick={() => approveReviewMutation.mutate(rev.id)}
                            className="text-[10px]"
                          >
                            Approve
                          </Button>
                        ) : (
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            isLoading={rejectReviewMutation.isPending}
                            onClick={() => rejectReviewMutation.mutate(rev.id)}
                            className="text-[10px] border-slate-800 text-red-400 hover:bg-slate-900"
                          >
                            Reject
                          </Button>
                        )}
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
