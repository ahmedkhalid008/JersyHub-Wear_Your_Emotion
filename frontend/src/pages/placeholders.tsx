import React from 'react';
import { useParams } from 'react-router-dom';
import { PageHeader } from '../components/ui/PageHeader';
import { Card, CardContent } from '../components/ui/Card';
import { ShoppingBag, Lock, UserCheck, CreditCard, PackageCheck, Star, Tag, Users, BarChart3 } from 'lucide-react';

export const LoginPlaceholderPage: React.FC = () => (
  <div className="mx-auto max-w-md space-y-6">
    <PageHeader title="Account Login" description="Sign in to access your JerseyHub profile, cart, and order history." />
    <Card>
      <CardContent className="space-y-4 py-8 text-center text-slate-400">
        <Lock className="mx-auto h-12 w-12 text-amber-500/80" />
        <p className="text-sm">Authentication module foundation ready for backend JWT integration.</p>
      </CardContent>
    </Card>
  </div>
);

export const RegisterPlaceholderPage: React.FC = () => (
  <div className="mx-auto max-w-md space-y-6">
    <PageHeader title="Create Account" description="Join JerseyHub to start building your sportswear collection." />
    <Card>
      <CardContent className="space-y-4 py-8 text-center text-slate-400">
        <UserCheck className="mx-auto h-12 w-12 text-amber-500/80" />
        <p className="text-sm">Registration module foundation ready for backend user creation.</p>
      </CardContent>
    </Card>
  </div>
);

export const ProductsPlaceholderPage: React.FC = () => (
  <div className="space-y-6">
    <PageHeader title="Authentic Football Kits" description="Explore our catalog of official player and fan version jerseys." />
    <Card>
      <CardContent className="space-y-4 py-12 text-center text-slate-400">
        <ShoppingBag className="mx-auto h-12 w-12 text-amber-500/80" />
        <p className="text-sm">Product catalog routing architecture initialized.</p>
      </CardContent>
    </Card>
  </div>
);

export const ProductDetailPlaceholderPage: React.FC = () => {
  const { productId } = useParams<{ productId: string }>();
  return (
    <div className="space-y-6">
      <PageHeader title={`Product #${productId || ''}`} description="Detailed jersey specifications, sizing, and inventory variants." />
      <Card>
        <CardContent className="space-y-4 py-12 text-center text-slate-400">
          <ShoppingBag className="mx-auto h-12 w-12 text-amber-500/80" />
          <p className="text-sm">Product detail route active for item ID: {productId}.</p>
        </CardContent>
      </Card>
    </div>
  );
};

export const AccountPlaceholderPage: React.FC = () => (
  <div className="space-y-6">
    <PageHeader title="My Account" description="Manage your personal information, default shipping address, and password." />
    <Card>
      <CardContent className="space-y-4 py-12 text-center text-slate-400">
        <UserCheck className="mx-auto h-12 w-12 text-amber-500/80" />
        <p className="text-sm">Protected account management foundation ready.</p>
      </CardContent>
    </Card>
  </div>
);

export const CartPlaceholderPage: React.FC = () => (
  <div className="space-y-6">
    <PageHeader title="Shopping Cart" description="Review selected jerseys, apply coupon codes, and proceed to checkout." />
    <Card>
      <CardContent className="space-y-4 py-12 text-center text-slate-400">
        <ShoppingBag className="mx-auto h-12 w-12 text-amber-500/80" />
        <p className="text-sm">Cart route foundation active.</p>
      </CardContent>
    </Card>
  </div>
);

export const CheckoutPlaceholderPage: React.FC = () => (
  <div className="space-y-6">
    <PageHeader title="Order Checkout" description="Secure SSLCommerz payment gateway integration." />
    <Card>
      <CardContent className="space-y-4 py-12 text-center text-slate-400">
        <CreditCard className="mx-auto h-12 w-12 text-amber-500/80" />
        <p className="text-sm">Protected checkout foundation ready.</p>
      </CardContent>
    </Card>
  </div>
);

export const OrdersPlaceholderPage: React.FC = () => (
  <div className="space-y-6">
    <PageHeader title="My Orders" description="Track order status, delivery, and download PDF invoices." />
    <Card>
      <CardContent className="space-y-4 py-12 text-center text-slate-400">
        <PackageCheck className="mx-auto h-12 w-12 text-amber-500/80" />
        <p className="text-sm">Protected order history foundation ready.</p>
      </CardContent>
    </Card>
  </div>
);

export const OrderDetailPlaceholderPage: React.FC = () => {
  const { orderId } = useParams<{ orderId: string }>();
  return (
    <div className="space-y-6">
      <PageHeader title={`Order #${orderId || ''}`} description="Order breakdown, tracking info, and official invoice." />
      <Card>
        <CardContent className="space-y-4 py-12 text-center text-slate-400">
          <PackageCheck className="mx-auto h-12 w-12 text-amber-500/80" />
          <p className="text-sm">Order detail route active for order ID: {orderId}.</p>
        </CardContent>
      </Card>
    </div>
  );
};

// Admin Placeholders
export const AdminDashboardPlaceholderPage: React.FC = () => (
  <div className="space-y-6">
    <PageHeader title="Admin Dashboard" description="Overview of platform sales, active inventory, and pending orders." />
    <Card>
      <CardContent className="space-y-4 py-12 text-center text-slate-400">
        <BarChart3 className="mx-auto h-12 w-12 text-amber-500/80" />
        <p className="text-sm">Admin route guard active. Admin dashboard placeholder.</p>
      </CardContent>
    </Card>
  </div>
);

export const AdminProductsPlaceholderPage: React.FC = () => (
  <div className="space-y-6">
    <PageHeader title="Admin — Product Management" description="Create, update, and manage jersey inventory & sizes." />
    <Card>
      <CardContent className="space-y-4 py-12 text-center text-slate-400">
        <ShoppingBag className="mx-auto h-12 w-12 text-amber-500/80" />
        <p className="text-sm">Admin product management routing active.</p>
      </CardContent>
    </Card>
  </div>
);

export const AdminOrdersPlaceholderPage: React.FC = () => (
  <div className="space-y-6">
    <PageHeader title="Admin — Order Management" description="Process customer orders, update statuses, and generate invoices." />
    <Card>
      <CardContent className="space-y-4 py-12 text-center text-slate-400">
        <PackageCheck className="mx-auto h-12 w-12 text-amber-500/80" />
        <p className="text-sm">Admin order management routing active.</p>
      </CardContent>
    </Card>
  </div>
);

export const AdminUsersPlaceholderPage: React.FC = () => (
  <div className="space-y-6">
    <PageHeader title="Admin — User Management" description="View user accounts, roles, and administrative permissions." />
    <Card>
      <CardContent className="space-y-4 py-12 text-center text-slate-400">
        <Users className="mx-auto h-12 w-12 text-amber-500/80" />
        <p className="text-sm">Admin user management routing active.</p>
      </CardContent>
    </Card>
  </div>
);

export const AdminCouponsPlaceholderPage: React.FC = () => (
  <div className="space-y-6">
    <PageHeader title="Admin — Coupon Management" description="Configure promo codes, discount rates, and spending thresholds." />
    <Card>
      <CardContent className="space-y-4 py-12 text-center text-slate-400">
        <Tag className="mx-auto h-12 w-12 text-amber-500/80" />
        <p className="text-sm">Admin coupon management routing active.</p>
      </CardContent>
    </Card>
  </div>
);

export const AdminReviewsPlaceholderPage: React.FC = () => (
  <div className="space-y-6">
    <PageHeader title="Admin — Review Moderation" description="Approve customer product reviews and ratings." />
    <Card>
      <CardContent className="space-y-4 py-12 text-center text-slate-400">
        <Star className="mx-auto h-12 w-12 text-amber-500/80" />
        <p className="text-sm">Admin review moderation routing active.</p>
      </CardContent>
    </Card>
  </div>
);
