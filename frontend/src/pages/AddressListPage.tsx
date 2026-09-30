import React, { useState } from 'react';
import { Plus, MapPin } from 'lucide-react';
import {
  useAddresses,
  useCreateAddress,
  useUpdateAddress,
  useDeleteAddress,
  useSetDefaultAddress,
} from '../hooks/useAddresses';
import { PageHeader } from '../components/ui/PageHeader';
import { AddressCard } from '../components/address/AddressCard';
import { AddressForm } from '../components/address/AddressForm';
import { Button } from '../components/ui/Button';
import { Modal } from '../components/ui/Modal';
import { EmptyState } from '../components/ui/EmptyState';
import { ErrorState } from '../components/ui/ErrorState';
import { AddressResponse, AddressRequest } from '../types/domain';

export const AddressListPage: React.FC = () => {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingAddress, setEditingAddress] = useState<AddressResponse | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);

  const { data: addresses = [], isLoading, isError, error, refetch } = useAddresses();

  const createMutation = useCreateAddress();
  const updateMutation = useUpdateAddress();
  const deleteMutation = useDeleteAddress();
  const setDefaultMutation = useSetDefaultAddress();

  const handleCreate = async (request: AddressRequest) => {
    setFormError(null);
    try {
      await createMutation.mutateAsync(request);
      setShowCreateModal(false);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setFormError(err.message);
      } else {
        setFormError('Failed to create address.');
      }
    }
  };

  const handleUpdate = async (request: AddressRequest) => {
    if (!editingAddress) return;
    setFormError(null);
    try {
      await updateMutation.mutateAsync({ id: editingAddress.id, request });
      setEditingAddress(null);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setFormError(err.message);
      } else {
        setFormError('Failed to update address.');
      }
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deletingId) return;
    try {
      await deleteMutation.mutateAsync(deletingId);
      setDeletingId(null);
    } catch {
      // Handled by mutation error
    }
  };

  const handleSetDefault = async (id: string) => {
    try {
      await setDefaultMutation.mutateAsync(id);
    } catch {
      // Handled by query refetch
    }
  };

  return (
    <div className="space-y-6">
      {/* Header & Add Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <PageHeader
          title="My Shipping Addresses"
          description="Manage default delivery addresses for fast and secure checkout."
        />
        <Button
          size="sm"
          onClick={() => {
            setFormError(null);
            setShowCreateModal(true);
          }}
          className="bg-amber-500 text-slate-950 hover:bg-amber-400 font-bold self-start sm:self-auto"
        >
          <Plus className="h-4 w-4 mr-1.5" />
          Add New Address
        </Button>
      </div>

      {/* Loading Skeleton */}
      {isLoading && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-pulse">
          <div className="h-40 rounded-2xl bg-slate-900/40 border border-slate-800" />
          <div className="h-40 rounded-2xl bg-slate-900/40 border border-slate-800" />
        </div>
      )}

      {/* Error State */}
      {isError && (
        <ErrorState
          title="Could not load addresses"
          message={error instanceof Error ? error.message : 'Failed to fetch user addresses.'}
          onRetry={() => refetch()}
        />
      )}

      {/* Empty State */}
      {!isLoading && !isError && addresses.length === 0 && (
        <EmptyState
          icon={<MapPin className="h-8 w-8 text-amber-400" />}
          title="No saved shipping addresses"
          description="Save your shipping address now to enable one-click delivery at checkout."
          actionLabel="Add Your First Address"
          onAction={() => {
            setFormError(null);
            setShowCreateModal(true);
          }}
        />
      )}

      {/* Addresses Grid */}
      {!isLoading && !isError && addresses.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {addresses.map((addr) => (
            <AddressCard
              key={addr.id}
              address={addr}
              onEdit={(addressToEdit) => {
                setFormError(null);
                setEditingAddress(addressToEdit);
              }}
              onDelete={(idToDelete) => setDeletingId(idToDelete)}
              onSetDefault={handleSetDefault}
              isSettingDefault={setDefaultMutation.isPending}
            />
          ))}
        </div>
      )}

      {/* Create Address Modal */}
      <Modal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        title="Add New Shipping Address"
      >
        <AddressForm
          onSubmit={handleCreate}
          onCancel={() => setShowCreateModal(false)}
          isLoading={createMutation.isPending}
          error={formError}
        />
      </Modal>

      {/* Edit Address Modal */}
      <Modal
        isOpen={Boolean(editingAddress)}
        onClose={() => setEditingAddress(null)}
        title="Edit Shipping Address"
      >
        <AddressForm
          initialData={editingAddress}
          onSubmit={handleUpdate}
          onCancel={() => setEditingAddress(null)}
          isLoading={updateMutation.isPending}
          error={formError}
        />
      </Modal>

      {/* Delete Address Modal */}
      <Modal
        isOpen={Boolean(deletingId)}
        onClose={() => setDeletingId(null)}
        title="Delete Address Confirmation"
      >
        <div className="space-y-4 p-2">
          <p className="text-xs text-slate-300">
            Are you sure you want to delete this shipping address?
          </p>
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" size="sm" onClick={() => setDeletingId(null)}>
              Cancel
            </Button>
            <Button
              size="sm"
              isLoading={deleteMutation.isPending}
              onClick={handleDeleteConfirm}
              className="bg-red-500 hover:bg-red-600 text-white font-bold"
            >
              Delete Address
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
