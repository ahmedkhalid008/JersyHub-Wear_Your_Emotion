import React, { useState } from 'react';
import { Shield, CheckCircle2, XCircle } from 'lucide-react';
import { useAdminUsers } from '../../hooks/useAdmin';

export const AdminUsersPage: React.FC = () => {
  const [page] = useState(0);
  const { data: pageData, isLoading, isError, refetch } = useAdminUsers(page, 15);

  const users = pageData?.content || [];

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-black text-white">Registered Users Directory</h1>
            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-purple-500/10 text-purple-400 border border-purple-500/20">
              User Accounts
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Safe user profile records and role configurations stored in core database.
          </p>
        </div>
      </div>

      {/* Users Table */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5 backdrop-blur-md">
        {isLoading ? (
          <div className="h-64 bg-slate-800/40 rounded-xl animate-pulse" />
        ) : isError ? (
          <div className="p-4 text-center text-xs text-red-400">
            Failed to load users. <button onClick={() => refetch()} className="underline font-bold">Retry</button>
          </div>
        ) : users.length === 0 ? (
          <div className="py-12 text-center text-xs text-slate-500">No registered users found.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 uppercase tracking-wider text-[10px]">
                  <th className="py-3 px-3">Name</th>
                  <th className="py-3 px-3">Email & Phone</th>
                  <th className="py-3 px-3">Role</th>
                  <th className="py-3 px-3">Status</th>
                  <th className="py-3 px-3">Email Verification</th>
                  <th className="py-3 px-3 text-right">Joined Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-medium">
                {users.map((usr) => (
                  <tr key={usr.id} className="hover:bg-slate-800/40">
                    <td className="py-3 px-3 font-bold text-white flex items-center gap-2">
                      <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-amber-500/10 text-amber-400 font-black text-xs border border-amber-500/20">
                        {usr.name ? usr.name.charAt(0).toUpperCase() : 'U'}
                      </div>
                      <span>{usr.name}</span>
                    </td>
                    <td className="py-3 px-3">
                      <div className="text-slate-200">{usr.email}</div>
                      <div className="text-[10px] text-slate-500">{usr.phone || 'No phone'}</div>
                    </td>
                    <td className="py-3 px-3">
                      <span
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-extrabold ${
                          usr.role === 'ADMIN'
                            ? 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
                            : 'bg-slate-800 text-slate-300'
                        }`}
                      >
                        {usr.role === 'ADMIN' && <Shield className="h-3 w-3" />}
                        {usr.role}
                      </span>
                    </td>
                    <td className="py-3 px-3">
                      <span
                        className={`inline-flex items-center gap-1 text-[10px] font-bold ${
                          usr.enabled ? 'text-emerald-400' : 'text-red-400'
                        }`}
                      >
                        {usr.enabled ? <CheckCircle2 className="h-3 w-3" /> : <XCircle className="h-3 w-3" />}
                        {usr.enabled ? 'Enabled' : 'Disabled'}
                      </span>
                    </td>
                    <td className="py-3 px-3">
                      <span
                        className={`inline-flex items-center gap-1 text-[10px] font-semibold ${
                          usr.emailVerified ? 'text-emerald-400' : 'text-slate-500'
                        }`}
                      >
                        {usr.emailVerified ? 'Verified' : 'Unverified'}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-right text-slate-400">
                      {new Date(usr.createdAt).toLocaleDateString()}
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
