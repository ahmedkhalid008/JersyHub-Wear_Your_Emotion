import React from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { User as UserIcon, Mail, Phone, Calendar, ShieldCheck, LogOut, CheckCircle2, XCircle } from 'lucide-react';
import { PageHeader } from '../components/ui/PageHeader';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { LoadingState } from '../components/ui/LoadingState';
import { ErrorState } from '../components/ui/ErrorState';
import { authService } from '../services/authService';
import { useAuthStore } from '../stores/useAuthStore';
import { queryKeys } from '../services/api/queryKeys';

export const AccountPage: React.FC = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { user: storedUser, logout, refreshToken } = useAuthStore();

  const { data: user, isLoading, isError, error, refetch, isFetching } = useQuery({
    queryKey: queryKeys.auth.user,
    queryFn: authService.getCurrentUser,
    initialData: storedUser || undefined,
    staleTime: 5 * 60 * 1000,
  });

  const handleLogout = async () => {
    await authService.logout(refreshToken || undefined);
    logout();
    queryClient.clear();
    navigate('/login', { replace: true });
  };

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <PageHeader
        title="My Account Profile"
        description="Manage your personal details, role permissions, and profile preferences."
        actions={
          <Button variant="outline" size="sm" onClick={handleLogout} className="text-red-400 hover:bg-red-500/10">
            <LogOut className="h-4 w-4 mr-1.5" />
            <span>Sign Out</span>
          </Button>
        }
      />

      {isLoading ? (
        <LoadingState message="Fetching current profile details..." />
      ) : isError ? (
        <ErrorState
          title="Failed to Load Profile"
          message={(error as Error)?.message || 'Unable to retrieve account details.'}
          onRetry={() => refetch()}
          isRetrying={isFetching}
        />
      ) : user ? (
        <div className="grid gap-6 md:grid-cols-3">
          {/* Main User Summary Card */}
          <Card className="md:col-span-1 flex flex-col items-center text-center p-6 space-y-4">
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20 text-2xl font-black">
              {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
            </div>

            <div className="space-y-1 w-full">
              <h3 className="text-xl font-bold text-white tracking-tight">{user.name}</h3>
              <p className="text-xs text-slate-400 truncate">{user.email}</p>
            </div>

            <Badge variant={user.role === 'ADMIN' ? 'warning' : 'info'} size="md" className="capitalize gap-1">
              <ShieldCheck className="h-3.5 w-3.5" />
              <span>{user.role}</span>
            </Badge>
          </Card>

          {/* Detailed Specifications Card */}
          <Card className="md:col-span-2 space-y-6">
            <CardHeader>
              <CardTitle className="text-lg font-bold">Personal Information</CardTitle>
              <CardDescription>Verified account records stored in JerseyHub core backend.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="rounded-xl bg-slate-950 p-4 border border-slate-800 space-y-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1">
                    <UserIcon className="h-3 w-3 text-amber-500" />
                    <span>Full Name</span>
                  </span>
                  <p className="text-sm font-semibold text-white">{user.name}</p>
                </div>

                <div className="rounded-xl bg-slate-950 p-4 border border-slate-800 space-y-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1">
                    <Mail className="h-3 w-3 text-amber-500" />
                    <span>Email Address</span>
                  </span>
                  <p className="text-sm font-semibold text-white truncate">{user.email}</p>
                </div>

                <div className="rounded-xl bg-slate-950 p-4 border border-slate-800 space-y-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1">
                    <Phone className="h-3 w-3 text-amber-500" />
                    <span>Phone Number</span>
                  </span>
                  <p className="text-sm font-semibold text-white">{user.phone || 'Not provided'}</p>
                </div>

                <div className="rounded-xl bg-slate-950 p-4 border border-slate-800 space-y-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1">
                    <Calendar className="h-3 w-3 text-amber-500" />
                    <span>Member Since</span>
                  </span>
                  <p className="text-sm font-semibold text-white">
                    {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'Active Member'}
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-between rounded-xl bg-slate-950 p-4 border border-slate-800">
                <span className="text-xs font-semibold text-slate-400">Email Verification Status</span>
                <Badge variant={user.emailVerified ? 'success' : 'outline'} size="sm" className="gap-1">
                  {user.emailVerified ? (
                    <>
                      <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
                      <span>Verified</span>
                    </>
                  ) : (
                    <>
                      <XCircle className="h-3.5 w-3.5 text-slate-400" />
                      <span>Unverified</span>
                    </>
                  )}
                </Badge>
              </div>
            </CardContent>
          </Card>
        </div>
      ) : null}
    </div>
  );
};
