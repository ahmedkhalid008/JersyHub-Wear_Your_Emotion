import React from 'react';
import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { Shield, ShoppingBag, LogOut, Menu, X, ShieldAlert, Activity, User as UserIcon } from 'lucide-react';
import { useAuthStore } from '../stores/useAuthStore';
import { useAppStore } from '../stores/useAppStore';
import { useCart } from '../hooks/useCart';
import { authService } from '../services/authService';
import { Container } from '../components/ui/Container';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';

export const MainLayout: React.FC = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { user, isAuthenticated, logout, refreshToken } = useAuthStore();
  const { mobileMenuOpen, toggleMobileMenu, setMobileMenuOpen } = useAppStore();

  const { data: cart } = useCart();
  const cartBadgeCount = cart?.totalItems || 0;

  const isAdmin = user?.role === 'ADMIN';

  const handleLogout = async () => {
    await authService.logout(refreshToken || undefined);
    logout();
    queryClient.clear();
    setMobileMenuOpen(false);
    navigate('/login', { replace: true });
  };

  const navLinkClass = ({ isActive }: { isActive: boolean }) =>
    `text-sm font-medium transition-colors hover:text-amber-400 ${
      isActive ? 'text-amber-400 font-bold' : 'text-slate-300'
    }`;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-amber-500 selection:text-slate-950">
      {/* Top Announcement Banner */}
      <div className="bg-amber-500 text-slate-950 text-[11px] font-bold py-1 px-4 text-center tracking-wider uppercase">
        ⚡ Free express shipping on orders over $100 | Authentic Player Edition Kits
      </div>

      {/* Header Navigation */}
      <header className="sticky top-0 z-50 border-b border-slate-800 bg-slate-950/90 backdrop-blur-md">
        <Container size="lg" className="flex items-center justify-between py-3">
          {/* Brand Logo */}
          <Link to="/" onClick={() => setMobileMenuOpen(false)} className="flex items-center space-x-3 group">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20 group-hover:scale-105 transition-transform font-black">
              <Shield className="h-6 w-6" />
            </div>
            <div className="flex flex-col">
              <span className="text-xl font-black tracking-wider text-white uppercase">
                JERSEY<span className="text-amber-500">HUB</span>
              </span>
              <span className="text-[9px] uppercase tracking-widest text-slate-400 font-semibold">
                Authentic Sportswear
              </span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-6">
            <NavLink to="/" className={navLinkClass}>
              Home
            </NavLink>
            <NavLink to="/products" className={navLinkClass}>
              Products
            </NavLink>

            {isAuthenticated ? (
              <>
                <NavLink to="/orders" className={navLinkClass}>
                  My Orders
                </NavLink>
                <NavLink to="/account" className={navLinkClass}>
                  Account
                </NavLink>
                {isAdmin && (
                  <NavLink to="/admin" className={navLinkClass}>
                    <Badge variant="warning" size="sm" className="gap-1">
                      <ShieldAlert className="h-3 w-3" />
                      <span>Admin</span>
                    </Badge>
                  </NavLink>
                )}
              </>
            ) : null}
          </nav>

          {/* User Actions / Auth Controls */}
          <div className="hidden md:flex items-center space-x-4">
            <Link to="/cart" className="relative p-2 text-slate-300 hover:text-amber-400 transition-colors" aria-label="Shopping Cart">
              <ShoppingBag className="h-5 w-5" />
              {cartBadgeCount > 0 && (
                <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-amber-500 text-[10px] font-bold text-slate-950">
                  {cartBadgeCount}
                </span>
              )}
            </Link>

            {isAuthenticated ? (
              <div className="flex items-center space-x-3 pl-2 border-l border-slate-800">
                <Link to="/account" className="flex items-center space-x-1.5 text-xs font-semibold text-slate-200 hover:text-amber-400">
                  <UserIcon className="h-3.5 w-3.5 text-amber-500" />
                  <span className="max-w-[120px] truncate">{user?.name || user?.email}</span>
                </Link>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleLogout}
                  className="text-slate-400 hover:text-red-400 hover:bg-red-500/10"
                  aria-label="Logout"
                >
                  <LogOut className="h-4 w-4" />
                </Button>
              </div>
            ) : (
              <div className="flex items-center space-x-2 pl-2 border-l border-slate-800">
                <Link to="/login">
                  <Button variant="ghost" size="sm">
                    Sign In
                  </Button>
                </Link>
                <Link to="/register">
                  <Button variant="primary" size="sm">
                    Register
                  </Button>
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Hamburger Toggle */}
          <div className="flex items-center md:hidden space-x-3">
            <Link to="/cart" className="relative p-2 text-slate-300" aria-label="Shopping Cart">
              <ShoppingBag className="h-5 w-5" />
              {cartBadgeCount > 0 && (
                <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-amber-500 text-[10px] font-bold text-slate-950">
                  {cartBadgeCount}
                </span>
              )}
            </Link>
            <button
              onClick={toggleMobileMenu}
              className="p-2 text-slate-300 hover:text-white focus:outline-none"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </Container>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-slate-800 bg-slate-950 px-4 pt-3 pb-6 space-y-3">
            <NavLink
              to="/"
              onClick={() => setMobileMenuOpen(false)}
              className="block py-2 text-base font-semibold text-slate-200 hover:text-amber-400"
            >
              Home
            </NavLink>
            <NavLink
              to="/products"
              onClick={() => setMobileMenuOpen(false)}
              className="block py-2 text-base font-semibold text-slate-200 hover:text-amber-400"
            >
              Products
            </NavLink>

            {isAuthenticated ? (
              <>
                <NavLink
                  to="/orders"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block py-2 text-base font-semibold text-slate-200 hover:text-amber-400"
                >
                  My Orders
                </NavLink>
                <NavLink
                  to="/account"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block py-2 text-base font-semibold text-slate-200 hover:text-amber-400"
                >
                  Account Profile
                </NavLink>
                {isAdmin && (
                  <NavLink
                    to="/admin"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block py-2 text-base font-semibold text-amber-400"
                  >
                    Admin Dashboard
                  </NavLink>
                )}
                <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-400 truncate max-w-[200px]">
                    Signed in as {user?.name || user?.email}
                  </span>
                  <Button variant="danger" size="sm" onClick={handleLogout}>
                    Logout
                  </Button>
                </div>
              </>
            ) : (
              <div className="pt-3 border-t border-slate-800 flex flex-col space-y-2">
                <Link to="/login" onClick={() => setMobileMenuOpen(false)}>
                  <Button variant="outline" className="w-full">
                    Sign In
                  </Button>
                </Link>
                <Link to="/register" onClick={() => setMobileMenuOpen(false)}>
                  <Button variant="primary" className="w-full">
                    Create Account
                  </Button>
                </Link>
              </div>
            )}
          </div>
        )}
      </header>

      {/* Main Page Body */}
      <main className="flex-1 py-8">
        <Container size="lg">
          <Outlet />
        </Container>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800 bg-slate-950 py-12 text-slate-400">
        <Container size="lg" className="grid gap-8 md:grid-cols-4">
          <div className="space-y-3 md:col-span-1">
            <div className="flex items-center space-x-2">
              <Shield className="h-6 w-6 text-amber-500" />
              <span className="text-lg font-black tracking-wider text-white">JERSEY<span className="text-amber-500">HUB</span></span>
            </div>
            <p className="text-xs leading-relaxed text-slate-400">
              Premium authentic sportswear, club jerseys, national team kits, and custom fan gear.
            </p>
          </div>

          <div>
            <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-3">Shop</h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link to="/products" className="hover:text-amber-400 transition-colors">
                  All Products
                </Link>
              </li>
              <li>
                <Link to="/products" className="hover:text-amber-400 transition-colors">
                  Club Kits
                </Link>
              </li>
              <li>
                <Link to="/products" className="hover:text-amber-400 transition-colors">
                  National Teams
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-3">Customer Care</h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link to="/account" className="hover:text-amber-400 transition-colors">
                  My Account
                </Link>
              </li>
              <li>
                <Link to="/orders" className="hover:text-amber-400 transition-colors">
                  Order Tracking
                </Link>
              </li>
              <li>
                <Link to="/health" className="flex items-center gap-1.5 hover:text-amber-400 transition-colors">
                  <Activity className="h-3.5 w-3.5" />
                  <span>System Status</span>
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-3">Security & Payment</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Protected by 256-bit SSL Encryption. Powered by SSLCommerz Payment Gateway.
            </p>
          </div>
        </Container>

        <div className="mt-8 border-t border-slate-900 pt-6 text-center text-xs text-slate-500">
          <Container size="lg">
            <p>&copy; {new Date().getFullYear()} JerseyHub. All rights reserved.</p>
          </Container>
        </div>
      </footer>
    </div>
  );
};
