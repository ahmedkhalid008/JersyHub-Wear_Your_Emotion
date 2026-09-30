import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldAlert, ArrowLeft } from 'lucide-react';
import { Button } from '../components/ui/Button';

export const ForbiddenPage: React.FC = () => {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center text-center px-4">
      <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-red-500/10 text-red-400 border border-red-500/20">
        <ShieldAlert className="h-8 w-8" />
      </div>
      <h1 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl">403 — Access Denied</h1>
      <p className="mt-2 max-w-md text-sm text-slate-400">
        You do not have administrative permissions to view this resource. Please log in with an administrator account.
      </p>
      <div className="mt-6">
        <Link to="/">
          <Button variant="primary" className="flex items-center space-x-2">
            <ArrowLeft className="h-4 w-4" />
            <span>Return to Homepage</span>
          </Button>
        </Link>
      </div>
    </div>
  );
};
