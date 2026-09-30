import React, { useState } from 'react';
import { Shirt, Plus, Search, CheckCircle2, XCircle, Edit, Trash2, Image as ImageIcon } from 'lucide-react';
import {
  useAdminProducts,
  useAdminCreateProduct,
  useAdminUpdateProduct,
  useAdminUpdateProductStatus,
  useAdminDeleteProduct,
} from '../../hooks/useAdmin';
import { adminService } from '../../services/adminService';
import { formatCurrency } from '../../utils';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { JerseyAuthenticity, JerseyType, ProductSummary } from '../../types/domain';

export const AdminProductsPage: React.FC = () => {
  const [search, setSearch] = useState('');
  const [activeFilter, setActiveFilter] = useState<boolean | undefined>(undefined);
  const [page, setPage] = useState(0);

  const { data: pageData, isLoading, isError, refetch } = useAdminProducts(
    search || undefined,
    activeFilter,
    page,
    15
  );

  const createProductMutation = useAdminCreateProduct();
  const updateProductMutation = useAdminUpdateProduct();
  const updateStatusMutation = useAdminUpdateProductStatus();
  const deleteProductMutation = useAdminDeleteProduct();

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<ProductSummary | null>(null);

  const [selectedSizes, setSelectedSizes] = useState<string[]>(['S', 'M', 'L', 'XL']);
  const [initialStock, setInitialStock] = useState<number>(20);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    brand: '',
    team: '',
    jerseyType: 'HOME' as JerseyType,
    authenticity: 'AUTHENTIC' as JerseyAuthenticity,
    basePrice: 2500,
    imageUrl: '',
    featured: false,
  });

  const [editFormData, setEditFormData] = useState({
    name: '',
    slug: '',
    brand: '',
    team: '',
    jerseyType: 'HOME' as JerseyType,
    authenticity: 'AUTHENTIC' as JerseyAuthenticity,
    basePrice: 2500,
    imageUrl: '',
    featured: false,
  });

  const [formError, setFormError] = useState<string | null>(null);
  const [editFormError, setEditFormError] = useState<string | null>(null);

  const products = pageData?.content || [];

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.slug) {
      setFormError('Product name and slug are required.');
      return;
    }

    if (selectedSizes.length === 0) {
      setFormError('Please select at least one size for the product.');
      return;
    }

    setFormError(null);
    setIsSubmitting(true);
    try {
      // 1. Create Product
      const createdProduct = await createProductMutation.mutateAsync({
        name: formData.name.trim(),
        slug: formData.slug.trim(),
        brand: formData.brand.trim() || undefined,
        team: formData.team.trim() || undefined,
        jerseyType: formData.jerseyType,
        authenticity: formData.authenticity,
        basePrice: Number(formData.basePrice),
        featured: formData.featured,
      });

      const productId = createdProduct.id;

      // 2. Create Variants & Adjust Inventory for Each Selected Size
      for (const size of selectedSizes) {
        const sku = `${formData.slug}-${size}`.toUpperCase();
        try {
          const variant = await adminService.createProductVariant(productId, {
            sku,
            size,
            price: Number(formData.basePrice),
          });

          if (initialStock > 0 && variant?.id) {
            await adminService.adjustInventory({
              productVariantId: variant.id,
              quantityChange: Number(initialStock),
              transactionType: 'RESTOCK',
              note: 'Initial inventory setup',
            });
          }
        } catch {
          // Continue if size variant creation encounters duplicate or non-blocking notice
        }
      }

      // 3. Attach Product Primary Image if URL provided
      if (formData.imageUrl.trim()) {
        try {
          await adminService.addProductImage(productId, {
            imageUrl: formData.imageUrl.trim(),
            altText: formData.name.trim(),
            displayOrder: 1,
            isPrimary: true,
          });
        } catch {
          // Continue if image assignment encounters notice
        }
      }

      // 4. Immediately Refetch Catalog
      await refetch();

      setShowCreateModal(false);
      setFormData({
        name: '',
        slug: '',
        brand: '',
        team: '',
        jerseyType: 'HOME',
        authenticity: 'AUTHENTIC',
        basePrice: 2500,
        imageUrl: '',
        featured: false,
      });
      setSelectedSizes(['S', 'M', 'L', 'XL']);
      setInitialStock(20);
    } catch {
      setFormError('Failed to create product. Check if slug is unique.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOpenEditModal = (prod: ProductSummary) => {
    setEditingProduct(prod);
    setEditFormData({
      name: prod.name,
      slug: prod.slug,
      brand: prod.brand || '',
      team: prod.team || '',
      jerseyType: prod.jerseyType || 'HOME',
      authenticity: prod.authenticity || 'AUTHENTIC',
      basePrice: prod.basePrice,
      imageUrl: prod.primaryImageUrl || '',
      featured: prod.featured || false,
    });
    setEditFormError(null);
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProduct) return;

    if (!editFormData.name || !editFormData.slug) {
      setEditFormError('Product name and slug are required.');
      return;
    }

    setEditFormError(null);
    setIsSubmitting(true);
    try {
      await updateProductMutation.mutateAsync({
        id: editingProduct.id,
        request: {
          name: editFormData.name.trim(),
          slug: editFormData.slug.trim(),
          brand: editFormData.brand.trim() || undefined,
          team: editFormData.team.trim() || undefined,
          jerseyType: editFormData.jerseyType,
          authenticity: editFormData.authenticity,
          basePrice: Number(editFormData.basePrice),
          featured: editFormData.featured,
        },
      });

      if (editFormData.imageUrl.trim() && editFormData.imageUrl.trim() !== (editingProduct.primaryImageUrl || '')) {
        try {
          await adminService.addProductImage(editingProduct.id, {
            imageUrl: editFormData.imageUrl.trim(),
            altText: editFormData.name.trim(),
            displayOrder: 1,
            isPrimary: true,
          });
        } catch {
          // Ignore non-blocking image assignment warning
        }
      }

      await refetch();
      setEditingProduct(null);
    } catch {
      setEditFormError('Failed to update product details.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggleStatus = async (id: string, currentActive: boolean) => {
    await updateStatusMutation.mutateAsync({ id, active: !currentActive });
  };

  const handleDeleteProduct = async (id: string, name: string) => {
    if (window.confirm(`Are you sure you want to delete product "${name}"?`)) {
      await deleteProductMutation.mutateAsync(id);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-black text-white">Product Catalog Management</h1>
            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-500/10 text-blue-400 border border-blue-500/20">
              Admin CRUD
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Create new jerseys, assign images, configure size variants, set initial inventory, update specifications, and manage catalog status.
          </p>
        </div>

        <Button
          type="button"
          variant="amber"
          size="sm"
          onClick={() => setShowCreateModal(true)}
        >
          <Plus className="h-4 w-4 mr-1.5" />
          Add New Jersey
        </Button>
      </div>

      {/* Filters Bar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
          <input
            type="text"
            placeholder="Search by name, team, or brand..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(0);
            }}
            className="w-full rounded-xl border border-slate-800 bg-slate-900/80 pl-9 pr-4 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
          />
        </div>

        <select
          value={activeFilter === undefined ? 'ALL' : activeFilter ? 'ACTIVE' : 'INACTIVE'}
          onChange={(e) => {
            const val = e.target.value;
            setActiveFilter(val === 'ALL' ? undefined : val === 'ACTIVE');
            setPage(0);
          }}
          className="rounded-xl border border-slate-800 bg-slate-900/80 px-3 py-2 text-xs text-slate-300 focus:outline-none focus:border-amber-500"
        >
          <option value="ALL">All Statuses</option>
          <option value="ACTIVE">Active Only</option>
          <option value="INACTIVE">Inactive Only</option>
        </select>
      </div>

      {/* Create Product Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-2xl border border-slate-800 bg-slate-900 p-6 space-y-4 shadow-2xl max-h-[90vh] overflow-y-auto">
            <h2 className="text-lg font-black text-white flex items-center gap-2">
              <Shirt className="h-5 w-5 text-amber-400" /> Add New Jersey
            </h2>

            {formError && (
              <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-xs text-red-300">
                {formError}
              </div>
            )}

            <form onSubmit={handleCreateSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-300 mb-1">Product Name *</label>
                <Input
                  value={formData.name}
                  onChange={(e) => {
                    const name = e.target.value;
                    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
                    setFormData({ ...formData, name, slug });
                  }}
                  placeholder="e.g. Real Madrid 2026 Home Kit"
                  required
                />
              </div>

              <div>
                <label className="block font-bold text-slate-300 mb-1">Slug *</label>
                <Input
                  value={formData.slug}
                  onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                  placeholder="e.g. real-madrid-2026-home"
                  required
                />
              </div>

              {/* Product Image URL */}
              <div>
                <label className="block font-bold text-slate-300 mb-1">Product Image URL</label>
                <Input
                  value={formData.imageUrl}
                  onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                  placeholder="https://images.unsplash.com/... or CDN image URL"
                />
                {formData.imageUrl.trim() && (
                  <div className="mt-2 flex items-center gap-3 p-2 rounded-xl border border-slate-800 bg-slate-950">
                    <img
                      src={formData.imageUrl.trim()}
                      alt="Preview"
                      className="h-12 w-12 rounded-lg object-cover bg-slate-900 border border-slate-800"
                      onError={(e) => {
                        (e.target as HTMLElement).style.display = 'none';
                      }}
                    />
                    <span className="text-[10px] text-slate-400 font-semibold flex items-center gap-1">
                      <ImageIcon className="h-3.5 w-3.5 text-amber-400" /> Primary Display Image Preview
                    </span>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-300 mb-1">Brand</label>
                  <Input
                    value={formData.brand}
                    onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                    placeholder="Adidas, Nike, Puma"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-300 mb-1">Team</label>
                  <Input
                    value={formData.team}
                    onChange={(e) => setFormData({ ...formData, team: e.target.value })}
                    placeholder="Real Madrid, Arsenal"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-300 mb-1">Jersey Type</label>
                  <select
                    value={formData.jerseyType}
                    onChange={(e) => setFormData({ ...formData, jerseyType: e.target.value as JerseyType })}
                    className="w-full rounded-xl border border-slate-800 bg-slate-950 p-2.5 text-xs text-white"
                  >
                    <option value="HOME">HOME</option>
                    <option value="AWAY">AWAY</option>
                    <option value="THIRD">THIRD</option>
                    <option value="TRAINING">TRAINING</option>
                    <option value="SPECIAL_EDITION">SPECIAL_EDITION</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-slate-300 mb-1">Authenticity</label>
                  <select
                    value={formData.authenticity}
                    onChange={(e) => setFormData({ ...formData, authenticity: e.target.value as JerseyAuthenticity })}
                    className="w-full rounded-xl border border-slate-800 bg-slate-950 p-2.5 text-xs text-white"
                  >
                    <option value="AUTHENTIC">AUTHENTIC</option>
                    <option value="REPLICA">REPLICA</option>
                  </select>
                </div>
              </div>

              {/* Sizes Selection */}
              <div>
                <label className="block font-bold text-slate-300 mb-1">Available Sizes *</label>
                <div className="flex flex-wrap gap-2 pt-1">
                  {['XS', 'S', 'M', 'L', 'XL', 'XXL'].map((sz) => {
                    const isChecked = selectedSizes.includes(sz);
                    return (
                      <button
                        key={sz}
                        type="button"
                        onClick={() => {
                          if (isChecked) {
                            setSelectedSizes(selectedSizes.filter((s) => s !== sz));
                          } else {
                            setSelectedSizes([...selectedSizes, sz]);
                          }
                        }}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-all ${
                          isChecked
                            ? 'bg-amber-500 text-slate-950 border-amber-400 shadow-sm'
                            : 'bg-slate-950 text-slate-400 border-slate-800 hover:border-slate-700'
                        }`}
                      >
                        {sz}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Initial Stock & Price */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-300 mb-1">Base Price (BDT) *</label>
                  <Input
                    type="number"
                    value={formData.basePrice}
                    onChange={(e) => setFormData({ ...formData, basePrice: Number(e.target.value) })}
                    required
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-300 mb-1">Initial Stock (per size) *</label>
                  <Input
                    type="number"
                    min="0"
                    value={initialStock}
                    onChange={(e) => setInitialStock(Math.max(0, Number(e.target.value)))}
                    required
                  />
                </div>
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="featured"
                  checked={formData.featured}
                  onChange={(e) => setFormData({ ...formData, featured: e.target.checked })}
                  className="rounded bg-slate-950 border-slate-800 text-amber-500"
                />
                <label htmlFor="featured" className="text-xs font-semibold text-slate-300">
                  Featured Product
                </label>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setShowCreateModal(false)}
                  disabled={isSubmitting}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="amber"
                  size="sm"
                  isLoading={createProductMutation.isPending || isSubmitting}
                >
                  Create Product & Seed Stock
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Product Modal */}
      {editingProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-2xl border border-slate-800 bg-slate-900 p-6 space-y-4 shadow-2xl max-h-[90vh] overflow-y-auto">
            <h2 className="text-lg font-black text-white flex items-center gap-2">
              <Edit className="h-5 w-5 text-amber-400" /> Edit Jersey: {editingProduct.name}
            </h2>

            {editFormError && (
              <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-xs text-red-300">
                {editFormError}
              </div>
            )}

            <form onSubmit={handleEditSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-300 mb-1">Product Name *</label>
                <Input
                  value={editFormData.name}
                  onChange={(e) => setEditFormData({ ...editFormData, name: e.target.value })}
                  required
                />
              </div>

              <div>
                <label className="block font-bold text-slate-300 mb-1">Slug *</label>
                <Input
                  value={editFormData.slug}
                  onChange={(e) => setEditFormData({ ...editFormData, slug: e.target.value })}
                  required
                />
              </div>

              {/* Product Image URL */}
              <div>
                <label className="block font-bold text-slate-300 mb-1">Product Image URL</label>
                <Input
                  value={editFormData.imageUrl}
                  onChange={(e) => setEditFormData({ ...editFormData, imageUrl: e.target.value })}
                  placeholder="https://images.unsplash.com/... or CDN image URL"
                />
                {editFormData.imageUrl.trim() && (
                  <div className="mt-2 flex items-center gap-3 p-2 rounded-xl border border-slate-800 bg-slate-950">
                    <img
                      src={editFormData.imageUrl.trim()}
                      alt="Preview"
                      className="h-12 w-12 rounded-lg object-cover bg-slate-900 border border-slate-800"
                      onError={(e) => {
                        (e.target as HTMLElement).style.display = 'none';
                      }}
                    />
                    <span className="text-[10px] text-slate-400 font-semibold flex items-center gap-1">
                      <ImageIcon className="h-3.5 w-3.5 text-amber-400" /> Primary Display Image Preview
                    </span>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-300 mb-1">Brand</label>
                  <Input
                    value={editFormData.brand}
                    onChange={(e) => setEditFormData({ ...editFormData, brand: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-300 mb-1">Team</label>
                  <Input
                    value={editFormData.team}
                    onChange={(e) => setEditFormData({ ...editFormData, team: e.target.value })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-300 mb-1">Jersey Type</label>
                  <select
                    value={editFormData.jerseyType}
                    onChange={(e) => setEditFormData({ ...editFormData, jerseyType: e.target.value as JerseyType })}
                    className="w-full rounded-xl border border-slate-800 bg-slate-950 p-2.5 text-xs text-white"
                  >
                    <option value="HOME">HOME</option>
                    <option value="AWAY">AWAY</option>
                    <option value="THIRD">THIRD</option>
                    <option value="TRAINING">TRAINING</option>
                    <option value="SPECIAL_EDITION">SPECIAL_EDITION</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-slate-300 mb-1">Authenticity</label>
                  <select
                    value={editFormData.authenticity}
                    onChange={(e) => setEditFormData({ ...editFormData, authenticity: e.target.value as JerseyAuthenticity })}
                    className="w-full rounded-xl border border-slate-800 bg-slate-950 p-2.5 text-xs text-white"
                  >
                    <option value="AUTHENTIC">AUTHENTIC</option>
                    <option value="REPLICA">REPLICA</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-300 mb-1">Base Price (BDT) *</label>
                <Input
                  type="number"
                  value={editFormData.basePrice}
                  onChange={(e) => setEditFormData({ ...editFormData, basePrice: Number(e.target.value) })}
                  required
                />
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="edit-featured"
                  checked={editFormData.featured}
                  onChange={(e) => setEditFormData({ ...editFormData, featured: e.target.checked })}
                  className="rounded bg-slate-950 border-slate-800 text-amber-500"
                />
                <label htmlFor="edit-featured" className="text-xs font-semibold text-slate-300">
                  Featured Product
                </label>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setEditingProduct(null)}
                  disabled={isSubmitting}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="amber"
                  size="sm"
                  isLoading={updateProductMutation.isPending || isSubmitting}
                >
                  Save Changes
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Products Table */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5 backdrop-blur-md">
        {isLoading ? (
          <div className="h-64 bg-slate-800/40 rounded-xl animate-pulse" />
        ) : isError ? (
          <div className="p-4 text-center text-xs text-red-400">
            Failed to load products. <button onClick={() => refetch()} className="underline font-bold">Retry</button>
          </div>
        ) : products.length === 0 ? (
          <div className="py-12 text-center text-xs text-slate-500">No products match your criteria.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 uppercase tracking-wider text-[10px]">
                  <th className="py-3 px-3">Jersey Name</th>
                  <th className="py-3 px-3">Team</th>
                  <th className="py-3 px-3">Price</th>
                  <th className="py-3 px-3">Stock Status</th>
                  <th className="py-3 px-3">Active</th>
                  <th className="py-3 px-3">Featured</th>
                  <th className="py-3 px-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-medium">
                {products.map((prod) => (
                  <tr key={prod.id} className="hover:bg-slate-800/40">
                    <td className="py-3 px-3">
                      <div className="flex items-center gap-3">
                        {prod.primaryImageUrl ? (
                          <img
                            src={prod.primaryImageUrl}
                            alt={prod.name}
                            className="h-9 w-9 rounded-lg object-cover bg-slate-950 border border-slate-800 flex-shrink-0"
                            onError={(e) => {
                              (e.target as HTMLElement).style.display = 'none';
                            }}
                          />
                        ) : (
                          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-950 text-slate-600 border border-slate-800 flex-shrink-0">
                            <Shirt className="h-5 w-5 text-slate-700" />
                          </div>
                        )}
                        <div>
                          <div className="font-extrabold text-white">{prod.name}</div>
                          <div className="text-[10px] text-slate-500">{prod.brand} • {prod.jerseyType}</div>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-3 text-slate-300">{prod.team || 'N/A'}</td>
                    <td className="py-3 px-3 font-bold text-amber-400">
                      {formatCurrency(prod.basePrice)}
                    </td>
                    <td className="py-3 px-3">
                      <span
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold border ${
                          prod.stockStatus === 'IN_STOCK'
                            ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                            : prod.stockStatus === 'LOW_STOCK'
                            ? 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                            : 'bg-red-500/10 text-red-400 border-red-500/30'
                        }`}
                      >
                        {prod.stockStatus === 'IN_STOCK' ? 'In Stock' : prod.stockStatus === 'LOW_STOCK' ? 'Low Stock' : 'Out of Stock'}
                      </span>
                    </td>
                    <td className="py-3 px-3">
                      <span
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                          prod.active
                            ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                            : 'bg-slate-800 text-slate-400 border-slate-700'
                        }`}
                      >
                        {prod.active ? <CheckCircle2 className="h-3 w-3" /> : <XCircle className="h-3 w-3" />}
                        {prod.active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="py-3 px-3">
                      {prod.featured ? (
                        <span className="text-[10px] font-bold text-amber-400">Yes</span>
                      ) : (
                        <span className="text-[10px] text-slate-500">No</span>
                      )}
                    </td>
                    <td className="py-3 px-3 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => handleToggleStatus(String(prod.id), prod.active)}
                          className="text-[10px] border-slate-800 text-slate-300 hover:text-white"
                        >
                          {prod.active ? 'Deactivate' : 'Activate'}
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => handleOpenEditModal(prod)}
                          className="text-[10px] border-slate-800 text-amber-400 hover:bg-amber-500/10"
                        >
                          <Edit className="h-3 w-3 mr-1" />
                          Edit
                        </Button>
                        <button
                          type="button"
                          onClick={() => handleDeleteProduct(String(prod.id), prod.name)}
                          className="p-1.5 text-slate-500 hover:text-red-400 transition-colors"
                          aria-label="Delete product"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
