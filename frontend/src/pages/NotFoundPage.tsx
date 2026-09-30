import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { AlertTriangle } from 'lucide-react';

export const NotFoundPage: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center space-y-4">
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-amber-500/10 text-amber-400">
        <AlertTriangle className="h-8 w-8" />
      </div>
      <h1 className="text-4xl font-bold text-white">404 — Page Not Found</h1>
      <p className="text-slate-400 max-w-md">
        The route you are trying to access does not exist or has been moved.
      </p>
      <Link to="/">
        <Button variant="primary">Return Home</Button>
      </Link>
    </div>
  );
};
