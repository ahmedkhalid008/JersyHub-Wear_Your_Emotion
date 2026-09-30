import React, { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, ShieldCheck, Tag, Globe, Sparkles, CheckCircle2, AlertTriangle, XCircle, ShoppingBag } from 'lucide-react';
import { useProductDetail } from '../hooks/useProducts';
import { useAddToCart } from '../hooks/useCart';
import { useAuthStore } from '../stores/useAuthStore';
import { ProductImageGallery } from '../components/products/ProductImageGallery';
import { ProductVariants } from '../components/products/ProductVariants';
import { ProductDetailsSkeleton } from '../components/products/ProductDetailsSkeleton';
import { ReviewList } from '../components/reviews/ReviewList';
import { ErrorState } from '../components/ui/ErrorState';
import { EmptyState } from '../components/ui/EmptyState';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { formatCurrency } from '../utils';
import { ProductVariant } from '../types/domain';

export const ProductDetailsPage: React.FC = () => {
  const { productId } = useParams<{ productId: string }>();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuthStore();

  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(null);
  const [cartErrorMsg, setCartErrorMsg] = useState<string | null>(null);
  const [cartSuccessMsg, setCartSuccessMsg] = useState<string | null>(null);

  const addToCartMutation = useAddToCart();

  const handleAddToCart = async () => {
    setCartErrorMsg(null);
    setCartSuccessMsg(null);

    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    if (product?.variants && product.variants.length > 0 && !selectedVariant) {
      setCartErrorMsg('Please select a jersey size before adding to cart.');
      return;
    }

    const targetVariantId = selectedVariant
      ? String(selectedVariant.id)
      : product?.variants?.[0]
      ? String(product.variants[0].id)
      : null;

    if (!targetVariantId) {
      setCartErrorMsg('Product variant unavailable.');
      return;
    }

    try {
      await addToCartMutation.mutateAsync({
        productVariantId: targetVariantId,
        quantity: 1,
      });
      setCartSuccessMsg('Item added to your cart successfully!');
    } catch (err: unknown) {
      if (err instanceof Error) {
        setCartErrorMsg(err.message);
      } else {
        setCartErrorMsg('Failed to add item to cart.');
      }
    }
  };

  const {
    data: product,
    isLoading,
    isError,
    error,
    refetch,
  } = useProductDetail(productId);

  // Helper for stock status badge
  const renderStockBadge = () => {
    if (!product) return null;
    switch (product.stockStatus) {
      case 'IN_STOCK':
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-400 border border-emerald-500/20">
            <CheckCircle2 className="h-3.5 w-3.5" />
            In Stock
          </span>
        );
      case 'LOW_STOCK':
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-500/10 px-3 py-1 text-xs font-semibold text-amber-400 border border-amber-500/20">
            <AlertTriangle className="h-3.5 w-3.5" />
            Low Stock
          </span>
        );
      case 'OUT_OF_STOCK':
      default:
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-red-500/10 px-3 py-1 text-xs font-semibold text-red-400 border border-red-500/20">
            <XCircle className="h-3.5 w-3.5" />
            Out of Stock
          </span>
        );
    }
  };

  const currentPrice = product
    ? product.basePrice + (selectedVariant?.additionalPrice || 0)
    : 0;

  if (isLoading) {
    return <ProductDetailsSkeleton />;
  }

  if (isError) {
    return (
      <div className="space-y-6">
        <Link
          to="/products"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-400 hover:underline"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Catalog
        </Link>
        <ErrorState
          title="Could not load product details"
          message={
            error instanceof Error
              ? error.message
              : 'Failed to fetch requested product details from the server.'
          }
          onRetry={() => refetch()}
        />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="space-y-6">
        <Link
          to="/products"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-400 hover:underline"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Catalog
        </Link>
        <EmptyState
          title="Product Not Found"
          description="The requested jersey could not be found or is no longer available in our store."
          actionLabel="Browse Catalog"
          onAction={() => navigate('/products')}
        />
      </div>
    );
  }

  return (
    <div className="space-y-10">
      {/* Top Breadcrumb / Back Link */}
      <nav aria-label="Breadcrumb" className="flex items-center justify-between">
        <Link
          to="/products"
          className="inline-flex items-center gap-2 text-xs font-bold text-slate-400 hover:text-amber-400 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Football Kits
        </Link>
        <div className="flex items-center gap-2 text-xs text-slate-500">
          <span>Catalog</span>
          <span>/</span>
          {product.league && (
            <>
              <span className="text-slate-400">{product.league}</span>
              <span>/</span>
            </>
          )}
          <span className="text-amber-400 font-semibold truncate max-w-[200px]">
            {product.name}
          </span>
        </div>
      </nav>

      {/* Main Product Layout: Gallery (Left) + Information & Variants (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
        {/* Left Column: Image Gallery */}
        <div className="lg:col-span-6">
          <ProductImageGallery images={product.images || []} productName={product.name} />
        </div>

        {/* Right Column: Specifications & Variant Selection */}
        <div className="lg:col-span-6 space-y-6 rounded-3xl border border-slate-800 bg-slate-900/40 p-6 sm:p-8 backdrop-blur-md">
          {/* Header & Badges */}
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2 text-xs font-bold uppercase tracking-wider text-amber-400">
              {product.brand && <span>{product.brand}</span>}
              {product.brand && product.team && <span>•</span>}
              {product.team && <span className="text-slate-300">{product.team}</span>}
            </div>

            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight leading-tight">
              {product.name}
            </h1>

            {/* Sub-Badges */}
            <div className="flex flex-wrap items-center gap-2 pt-1">
              {product.authenticity && (
                <span className="inline-flex items-center gap-1 rounded-full bg-slate-950 px-2.5 py-0.5 text-xs font-semibold text-amber-300 border border-amber-500/30">
                  <ShieldCheck className="h-3.5 w-3.5" />
                  {product.authenticity === 'AUTHENTIC' ? 'Player Authentic' : 'Fan Replica'}
                </span>
              )}
              {product.jerseyType && (
                <span className="inline-flex items-center gap-1 rounded-full bg-slate-950 px-2.5 py-0.5 text-xs font-semibold text-slate-300 border border-slate-800">
                  <Tag className="h-3.5 w-3.5 text-amber-400" />
                  {product.jerseyType.replace('_', ' ')}
                </span>
              )}
              {product.featured && (
                <Badge variant="default" size="sm" className="bg-amber-500 text-slate-950 border-amber-400 font-bold">
                  <Sparkles className="h-3 w-3 mr-1" />
                  Featured Kit
                </Badge>
              )}
              {renderStockBadge()}
            </div>
          </div>

          {/* Pricing Box */}
          <div className="flex items-baseline gap-3 border-y border-slate-800/80 py-4">
            <span className="text-3xl font-black text-white tracking-tight">
              {formatCurrency(currentPrice)}
            </span>
            {selectedVariant?.additionalPrice ? (
              <span className="text-xs text-amber-400 font-medium">
                (Includes {formatCurrency(selectedVariant.additionalPrice)} size adjustment)
              </span>
            ) : null}
          </div>

          {/* Product Metadata Specs Grid */}
          <div className="grid grid-cols-2 gap-4 rounded-2xl border border-slate-800/80 bg-slate-950/60 p-4 text-xs">
            {product.season && (
              <div>
                <span className="text-slate-500 uppercase font-bold text-[10px]">Season</span>
                <p className="font-semibold text-slate-200 mt-0.5">{product.season}</p>
              </div>
            )}
            {product.league && (
              <div>
                <span className="text-slate-500 uppercase font-bold text-[10px]">League / Cup</span>
                <p className="font-semibold text-slate-200 mt-0.5">{product.league}</p>
              </div>
            )}
            {product.country && (
              <div>
                <span className="text-slate-500 uppercase font-bold text-[10px]">Country</span>
                <p className="font-semibold text-slate-200 mt-0.5 flex items-center gap-1">
                  <Globe className="h-3 w-3 text-slate-400" />
                  {product.country}
                </p>
              </div>
            )}
            {product.material && (
              <div>
                <span className="text-slate-500 uppercase font-bold text-[10px]">Fabric Material</span>
                <p className="font-semibold text-slate-200 mt-0.5">{product.material}</p>
              </div>
            )}
          </div>

          {/* Variant Selection */}
          {product.variants && product.variants.length > 0 && (
            <ProductVariants
              variants={product.variants}
              selectedVariantId={selectedVariant?.id || null}
              onSelectVariant={(varItem) => setSelectedVariant(varItem)}
              basePrice={product.basePrice}
            />
          )}

          {/* Description Section */}
          {product.description && (
            <div className="space-y-2 border-t border-slate-800/80 pt-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Product Details & Description
              </h3>
              <p className="text-xs text-slate-300 leading-relaxed whitespace-pre-line">
                {product.description}
              </p>
            </div>
          )}

          {/* Categories Pills */}
          {product.categories && product.categories.length > 0 && (
            <div className="flex flex-wrap items-center gap-1.5 border-t border-slate-800/80 pt-4">
              <span className="text-xs font-bold text-slate-500 mr-1">Categories:</span>
              {product.categories.map((cat) => (
                <Link
                  key={cat.id}
                  to={`/products?category=${cat.slug}`}
                  className="rounded-lg bg-slate-900 px-2.5 py-1 text-[11px] font-semibold text-slate-400 border border-slate-800 hover:border-amber-500/40 hover:text-amber-300 transition-colors"
                >
                  {cat.name}
                </Link>
              ))}
            </div>
          )}

          {/* Add to Cart Section */}
          <div className="space-y-3 rounded-2xl border border-slate-800 bg-slate-950/80 p-4">
            {cartErrorMsg && (
              <p className="text-xs text-red-400 font-medium">{cartErrorMsg}</p>
            )}
            {cartSuccessMsg && (
              <p className="text-xs text-emerald-400 font-bold flex items-center justify-center gap-1">
                <CheckCircle2 className="h-4 w-4" />
                {cartSuccessMsg}
              </p>
            )}

            <Button
              onClick={handleAddToCart}
              isLoading={addToCartMutation.isPending}
              disabled={
                Boolean(
                  !product.available ||
                  product.stockStatus === 'OUT_OF_STOCK' ||
                  (selectedVariant && selectedVariant.stockQuantity <= 0)
                )
              }
              className="w-full bg-amber-500 text-slate-950 hover:bg-amber-400 font-bold py-3 text-sm shadow-lg shadow-amber-500/10"
            >
              <ShoppingBag className="h-4 w-4 mr-2" />
              {product.stockStatus === 'OUT_OF_STOCK' ? 'Out of Stock' : 'Add to Cart'}
            </Button>
          </div>
        </div>
      </div>

      {/* Customer Reviews & Ratings Section */}
      <ReviewList productId={product.id} />
    </div>
  );
};
