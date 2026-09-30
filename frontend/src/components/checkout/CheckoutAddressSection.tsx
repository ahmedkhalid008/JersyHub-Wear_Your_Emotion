import React, { useState } from 'react';
import { MapPin, Plus, CheckCircle2, User, Phone, Star } from 'lucide-react';
import { AddressResponse } from '../../types/domain';
import { Button } from '../ui/Button';
import { AddressForm } from '../address/AddressForm';
import { useCreateAddress } from '../../hooks/useAddresses';

export interface CheckoutAddressSectionProps {
  addresses: AddressResponse[];
  selectedAddressId: string | null;
  onSelectAddress: (id: string) => void;
  isLoading?: boolean;
}

export const CheckoutAddressSection: React.FC<CheckoutAddressSectionProps> = ({
  addresses,
  selectedAddressId,
  onSelectAddress,
  isLoading = false,
}) => {
  const [showAddForm, setShowAddForm] = useState(false);
  const createAddressMutation = useCreateAddress();

  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5 sm:p-6 backdrop-blur-md space-y-5">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-500/10 text-amber-400">
            <MapPin className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-lg font-extrabold text-white">Shipping Address</h2>
            <p className="text-xs text-slate-400">Select where your jersey order will be delivered</p>
          </div>
        </div>

        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => setShowAddForm(!showAddForm)}
          className="text-xs border-slate-700 text-slate-300 hover:text-white"
        >
          {showAddForm ? (
            'Cancel'
          ) : (
            <>
              <Plus className="h-3.5 w-3.5 mr-1 text-amber-400" />
              Add Address
            </>
          )}
        </Button>
      </div>

      {showAddForm && (
        <div className="border border-slate-800 rounded-xl p-4 bg-slate-950/80">
          <AddressForm
            onSubmit={async (data) => {
              const created = await createAddressMutation.mutateAsync(data);
              onSelectAddress(created.id);
              setShowAddForm(false);
            }}
            onCancel={() => setShowAddForm(false)}
            isLoading={createAddressMutation.isPending}
          />
        </div>
      )}

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="h-32 rounded-xl bg-slate-800/40 animate-pulse" />
          <div className="h-32 rounded-xl bg-slate-800/40 animate-pulse" />
        </div>
      ) : addresses.length === 0 ? (
        <div className="text-center py-8 border border-dashed border-slate-800 rounded-xl bg-slate-950/40 space-y-3">
          <MapPin className="h-8 w-8 text-slate-500 mx-auto" />
          <p className="text-sm font-semibold text-slate-300">No saved addresses found</p>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            Please add a delivery address to proceed with checkout.
          </p>
          {!showAddForm && (
            <Button
              type="button"
              variant="amber"
              size="sm"
              onClick={() => setShowAddForm(true)}
              className="mt-2"
            >
              <Plus className="h-4 w-4 mr-1.5" />
              Add New Address
            </Button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {addresses.map((address) => {
            const isSelected = selectedAddressId === address.id;

            return (
              <div
                key={address.id}
                onClick={() => onSelectAddress(address.id)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    onSelectAddress(address.id);
                  }
                }}
                className={`relative cursor-pointer rounded-xl border p-4 transition-all ${
                  isSelected
                    ? 'border-amber-500 bg-amber-500/10 ring-2 ring-amber-500/20'
                    : 'border-slate-800 bg-slate-950/50 hover:border-slate-700 hover:bg-slate-900/60'
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4 text-amber-400" />
                    <span className="font-extrabold text-sm text-white">{address.recipientName}</span>
                  </div>
                  {isSelected ? (
                    <CheckCircle2 className="h-5 w-5 text-amber-400 flex-shrink-0" />
                  ) : address.isDefault ? (
                    <span className="inline-flex items-center text-[10px] font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                      <Star className="h-3 w-3 mr-1 fill-amber-400" /> Default
                    </span>
                  ) : null}
                </div>

                <div className="mt-3 space-y-1.5 text-xs text-slate-300">
                  <p className="line-clamp-2">
                    {address.addressLine}, {address.area}, {address.district}, {address.division}
                    {address.postalCode ? ` - ${address.postalCode}` : ''}
                  </p>
                  <p className="flex items-center gap-1.5 text-slate-400">
                    <Phone className="h-3.5 w-3.5 text-slate-500" />
                    {address.phone}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
