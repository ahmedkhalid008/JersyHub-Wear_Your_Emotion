import React from 'react';
import { Link, useNavigate } from 'react-router';
import { ShieldAlert, ExternalLink, LogOut, Menu } from 'lucide-react';
import { useAuthStore } from '../../stores/useAuthStore';
import { authService } from '../../services/authService';
import { Button } from '../ui/Button';

export interface AdminHeaderProps {
  onToggleMobileSidebar?: () => void;
}

export const AdminHeader: React.FC<AdminHeaderProps> = ({ onToggleMobileSidebar }) => {
  const { user, logout, refreshToken } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await authService.logout(refreshToken || undefined);
    logout();
    navigate('/login', { replace: true });
  };

  return (
    <header className="sticky top-0 z-40 border-b border-slate-800 bg-slate-950/90 backdrop-blur-md px-4 sm:px-6 py-3 flex items-center justify-between">
      <div className="flex items-center gap-3">
        {onToggleMobileSidebar && (
          <button
            type="button"
            onClick={onToggleMobileSidebar}
            aria-label="Toggle mobile menu"
            className="md:hidden p-2 text-slate-400 hover:text-white"
          >
            <Menu className="h-5 w-5" />
          </button>
        )}
        <div className="flex items-center gap-2">
          <ShieldAlert className="h-5 w-5 text-amber-400" />
          <h1 className="text-sm sm:text-base font-extrabold text-white">JerseyHub Admin Console</h1>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <Link
          to="/"
          className="hidden sm:inline-flex items-center gap-1.5 text-xs font-semibold text-slate-300 hover:text-amber-400 transition-colors"
        >
          <span>Storefront</span>
          <ExternalLink className="h-3.5 w-3.5" />
        </Link>

        {user && (
          <div className="flex items-center gap-2 text-xs border-l border-slate-800 pl-4">
            <div className="hidden sm:block text-right">
              <p className="font-bold text-white leading-tight">{user.name}</p>
              <p className="text-[10px] text-amber-400 font-bold uppercase">{user.role}</p>
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleLogout}
              className="text-xs border-slate-800 text-slate-400 hover:text-red-400 hover:bg-slate-900"
            >
              <LogOut className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Logout</span>
            </Button>
          </div>
        )}
      </div>
    </header>
  );
};
