import React from 'react';
import { useHealthCheck } from '../hooks/useHealthCheck';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { LoadingState } from '../components/ui/LoadingState';
import { ErrorState } from '../components/ui/ErrorState';
import { Badge } from '../components/ui/Badge';
import { Activity, CheckCircle2, RefreshCw } from 'lucide-react';

export const HealthPage: React.FC = () => {
  const { data, isLoading, isError, error, refetch, isFetching } = useHealthCheck();

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-white uppercase tracking-tight sm:text-3xl">
            System Operational Status
          </h1>
          <p className="text-xs text-slate-400">Real-time health check verification endpoint (/api/v1/health)</p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => refetch()}
          disabled={isFetching}
          className="flex items-center space-x-2"
        >
          <RefreshCw className={`h-4 w-4 ${isFetching ? 'animate-spin' : ''}`} />
          <span>Refresh</span>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Activity className="h-5 w-5 text-amber-500" />
            <span>Backend Service Status</span>
          </CardTitle>
          <CardDescription>Target API: GET /api/v1/health</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <LoadingState message="Connecting to backend health service..." />
          ) : isError ? (
            <ErrorState
              title="Backend Service Unavailable"
              message={(error as Error)?.message || 'Failed to connect to backend service. Ensure Spring Boot is running on port 8080.'}
              onRetry={() => refetch()}
              isRetrying={isFetching}
            />
          ) : data ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between rounded-xl bg-slate-950 p-4 border border-slate-800">
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Overall Status</span>
                <Badge variant="success" size="md" className="gap-1">
                  <CheckCircle2 className="h-4 w-4" />
                  <span>{data.data.status}</span>
                </Badge>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <div className="rounded-xl bg-slate-950 p-4 border border-slate-800 space-y-1">
                  <span className="text-[10px] text-slate-500 uppercase tracking-wider font-bold">Application</span>
                  <p className="text-sm font-bold text-white">{data.data.application}</p>
                </div>
                <div className="rounded-xl bg-slate-950 p-4 border border-slate-800 space-y-1">
                  <span className="text-[10px] text-slate-500 uppercase tracking-wider font-bold">Version</span>
                  <p className="text-sm font-bold text-white">{data.data.version}</p>
                </div>
              </div>

              <div className="rounded-xl bg-slate-950 p-4 border border-slate-800 space-y-1">
                <span className="text-[10px] text-slate-500 uppercase tracking-wider font-bold">Message Payload</span>
                <p className="text-xs font-mono text-amber-400">{data.message}</p>
              </div>
            </div>
          ) : null}
        </CardContent>
      </Card>
    </div>
  );
};
