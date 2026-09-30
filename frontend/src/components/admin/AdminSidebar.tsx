import React from 'react';
import { NavLink } from 'react-router';
import {
  LayoutDashboard,
  Shirt,
  ShoppingBag,
  Users,
  Ticket,
  MessageSquare,
  Shield,
} from 'lucide-react';

export interface AdminSidebarProps {
  onCloseMobile?: () => void;
}

export const AdminSidebar: React.FC<AdminSidebarProps> = ({ onCloseMobile }) => {
  const navItems = [
    { label: 'Dashboard', path: '/admin', icon: LayoutDashboard, end: true },
    { label: 'Products', path: '/admin/products', icon: Shirt },
    { label: 'Orders', path: '/admin/orders', icon: ShoppingBag },
    { label: 'Users', path: '/admin/users', icon: Users },
    { label: 'Coupons', path: '/admin/coupons', icon: Ticket },
    { label: 'Reviews', path: '/admin/reviews', icon: MessageSquare },
  ];

  const linkClass = ({ isActive }: { isActive: boolean }) =>
    `flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all ${
      isActive
        ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
        : 'text-slate-300 hover:bg-slate-800/80 hover:text-amber-400'
    }`;

  return (
    <aside className="w-64 bg-slate-900/90 border-r border-slate-800 p-4 space-y-6 flex flex-col justify-between h-full">
      <div className="space-y-6">
        {/* Admin Brand */}
        <div className="flex items-center gap-3 px-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-500 text-slate-950 font-black shadow-md shadow-amber-500/20">
            <Shield className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-sm font-black text-white tracking-wider uppercase">JERSEYHUB</h2>
            <p className="text-[10px] font-bold text-amber-400 uppercase tracking-widest">
              Admin Portal
            </p>
          </div>
        </div>

        {/* Navigation Items */}
        <nav className="space-y-1.5">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                end={item.end}
                onClick={onCloseMobile}
                className={linkClass}
              >
                <Icon className="h-4 w-4 flex-shrink-0" />
                <span>{item.label}</span>
              </NavLink>
            );
          })}
        </nav>
      </div>

      <div className="px-3 py-2.5 rounded-xl bg-slate-950/60 border border-slate-800 text-[11px] text-slate-400 space-y-1">
        <p className="font-bold text-slate-200">Backend Authority</p>
        <p className="line-clamp-2">Spring Security Role: ROLE_ADMIN</p>
      </div>
    </aside>
  );
};
