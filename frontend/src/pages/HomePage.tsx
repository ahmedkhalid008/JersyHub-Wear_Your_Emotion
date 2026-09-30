import React from 'react';
import { Link } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { ProductCard } from '../components/products/ProductCard';
import { useProducts } from '../hooks/useProducts';
import {
  ShieldCheck,
  Truck,
  Lock,
  RotateCcw,
  ArrowRight,
  ShoppingBag,
  Flame,
  Shirt,
  Sparkles,
} from 'lucide-react';

export const HomePage: React.FC = () => {
  const { data: featuredData, isLoading: isFeaturedLoading } = useProducts({
    featured: true,
    size: 8,
  });

  const { data: fallbackData, isLoading: isFallbackLoading } = useProducts({
    size: 8,
  });

  const featuredProducts = featuredData?.content || [];
  const fallbackProducts = fallbackData?.content || [];
  const displayProducts = featuredProducts.length > 0 ? featuredProducts : fallbackProducts;
  const isLoading = isFeaturedLoading || isFallbackLoading;

  return (
    <div className="space-y-16 pb-8">
      {/* Hero Banner */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-slate-950 to-amber-950/40 p-8 sm:p-12 md:p-16 border border-slate-800 shadow-2xl">
        <div className="absolute right-0 top-0 -mt-12 -mr-12 h-96 w-96 rounded-full bg-amber-500/10 blur-3xl pointer-events-none" />
        
        <div className="relative z-10 max-w-2xl space-y-6">
          <div className="inline-flex items-center space-x-2 rounded-full border border-amber-500/30 bg-amber-500/10 px-3.5 py-1 text-xs font-extrabold text-amber-400 uppercase tracking-wider">
            <Sparkles className="h-3.5 w-3.5" />
            <span>Official JerseyHub Store</span>
          </div>

          <h1 className="text-4xl font-black tracking-tight text-white sm:text-6xl uppercase leading-none">
            Wear Your <span className="text-amber-500">Passion.</span>
          </h1>

          <p className="text-base text-slate-300 sm:text-lg leading-relaxed font-normal">
            Discover authentic player & replica edition football kits, official club merchandise, and elite sportswear engineered for peak performance on and off the pitch.
          </p>

          <div className="flex flex-wrap gap-4 pt-2">
            <Link to="/products">
              <Button variant="amber" size="lg" className="font-bold shadow-lg shadow-amber-500/20">
                <ShoppingBag className="h-5 w-5 mr-2" />
                <span>Browse Products</span>
                <ArrowRight className="h-5 w-5 ml-2" />
              </Button>
            </Link>
            <Link to="/products?featured=true">
              <Button variant="outline" size="lg" className="border-slate-800 bg-slate-900/80 text-slate-200 hover:text-amber-400 hover:border-amber-500/30 font-semibold">
                <Flame className="h-5 w-5 text-amber-500 mr-2" />
                <span>Trending Kits</span>
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Trust & E-Commerce Consumer Features */}
      <section className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="bg-slate-900/60 border-slate-800/80 hover:border-amber-500/30 transition-all">
          <CardHeader>
            <div className="mb-2 flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
              <ShieldCheck className="h-6 w-6" />
            </div>
            <CardTitle className="text-base font-extrabold text-white">100% Authentic Gear</CardTitle>
            <CardDescription className="text-xs text-slate-400">Official Club & National Kits</CardDescription>
          </CardHeader>
          <CardContent className="text-xs text-slate-400 leading-relaxed">
            Direct sourcing of official player and replica edition jerseys with verified authenticity badges.
          </CardContent>
        </Card>

        <Card className="bg-slate-900/60 border-slate-800/80 hover:border-amber-500/30 transition-all">
          <CardHeader>
            <div className="mb-2 flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
              <Truck className="h-6 w-6" />
            </div>
            <CardTitle className="text-base font-extrabold text-white">Fast Express Delivery</CardTitle>
            <CardDescription className="text-xs text-slate-400">Nationwide Rapid Dispatch</CardDescription>
          </CardHeader>
          <CardContent className="text-xs text-slate-400 leading-relaxed">
            Safe, protective packaging and swift doorstep delivery across all divisions and districts.
          </CardContent>
        </Card>

        <Card className="bg-slate-900/60 border-slate-800/80 hover:border-amber-500/30 transition-all">
          <CardHeader>
            <div className="mb-2 flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
              <Lock className="h-6 w-6" />
            </div>
            <CardTitle className="text-base font-extrabold text-white">Secure Checkout</CardTitle>
            <CardDescription className="text-xs text-slate-400">256-Bit SSL Encryption</CardDescription>
          </CardHeader>
          <CardContent className="text-xs text-slate-400 leading-relaxed">
            Protected online payments powered by SSLCommerz, bKash, mobile banking & major credit cards.
          </CardContent>
        </Card>

        <Card className="bg-slate-900/60 border-slate-800/80 hover:border-amber-500/30 transition-all">
          <CardHeader>
            <div className="mb-2 flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
              <RotateCcw className="h-6 w-6" />
            </div>
            <CardTitle className="text-base font-extrabold text-white">Easy Exchange</CardTitle>
            <CardDescription className="text-xs text-slate-400">7-Day Return & Size Guarantee</CardDescription>
          </CardHeader>
          <CardContent className="text-xs text-slate-400 leading-relaxed">
            Hassle-free size exchange policy and quick customer support for complete satisfaction.
          </CardContent>
        </Card>
      </section>

      {/* Featured Products Showcase Section */}
      <section className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-slate-800 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <Flame className="h-5 w-5 text-amber-500" />
              <h2 className="text-2xl font-black text-white uppercase tracking-tight">
                Featured <span className="text-amber-500">Jerseys</span>
              </h2>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Top-trending club kits and national team jerseys handpicked for true fans.
            </p>
          </div>

          <Link
            to="/products"
            className="inline-flex items-center text-xs font-bold text-amber-400 hover:text-amber-300 transition-colors"
          >
            <span>View Full Catalog</span>
            <ArrowRight className="h-4 w-4 ml-1" />
          </Link>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-72 rounded-2xl bg-slate-900/40 border border-slate-800 animate-pulse" />
            ))}
          </div>
        ) : displayProducts.length === 0 ? (
          <div className="py-12 text-center text-xs text-slate-500 space-y-3 rounded-2xl border border-slate-800 bg-slate-900/40">
            <Shirt className="h-10 w-10 text-slate-600 mx-auto" />
            <p>No products currently featured. Check back soon for new arrivals!</p>
            <Link to="/products">
              <Button variant="outline" size="sm">
                Explore All Products
              </Button>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {displayProducts.map((prod) => (
              <ProductCard key={prod.id} product={prod} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
};
