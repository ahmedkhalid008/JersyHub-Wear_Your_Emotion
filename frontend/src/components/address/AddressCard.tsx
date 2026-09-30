import React from 'react';
import { MapPin, Phone, User, Star, Edit3, Trash2 } from 'lucide-react';
import { AddressResponse } from '../../types/domain';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';

export interface AddressCardProps {
  address: AddressResponse;
  onEdit: (address: AddressResponse) => void;
  onDelete: (id: string) => void;
  onSetDefault: (id: string) => void;
  isSettingDefault?: boolean;
}

export const AddressCard: React.FC<AddressCardProps> = ({
  address,
  onEdit,
  onDelete,
  onSetDefault,
  isSettingDefault = false,
}) => {
  return (
    <div
      className={`relative flex flex-col justify-between gap-4 rounded-2xl border p-5 backdrop-blur-md transition-all ${
        address.isDefault
          ? 'border-amber-500/50 bg-amber-500/5 ring-1 ring-amber-500/20'
          : 'border-slate-800 bg-slate-900/60 hover:border-slate-700'
      }`}
    >
      <div className="space-y-3">
        {/* Top Header */}
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <User className="h-4 w-4 text-amber-500" />
            <h4 className="text-sm font-extrabold text-white">{address.recipientName}</h4>
          </div>
          {address.isDefault ? (
            <Badge variant="default" size="sm" className="bg-amber-500 text-slate-950 font-bold border-amber-400">
              <Star className="h-3 w-3 mr-1 fill-slate-950" />
              Default Address
            </Badge>
          ) : (
            <Button
              variant="outline"
              size="sm"
              isLoading={isSettingDefault}
              onClick={() => onSetDefault(address.id)}
              className="text-[11px] border-slate-800 text-slate-400 hover:text-amber-400 hover:bg-slate-800"
            >
              Set as Default
            </Button>
          )}
        </div>

        {/* Details */}
        <div className="space-y-1.5 text-xs text-slate-300">
          <div className="flex items-start gap-2">
            <MapPin className="h-4 w-4 text-slate-400 flex-shrink-0 mt-0.5" />
            <span>
              {address.addressLine}, {address.area}, {address.district}, {address.division}
              {address.postalCode ? ` - ${address.postalCode}` : ''}
            </span>
          </div>
          <div className="flex items-center gap-2 text-slate-400">
            <Phone className="h-3.5 w-3.5 text-slate-500" />
            <span>{address.phone}</span>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center justify-end gap-2 border-t border-slate-800/80 pt-3">
        <button
          type="button"
          onClick={() => onEdit(address)}
          aria-label={`Edit address for ${address.recipientName}`}
          className="inline-flex items-center gap-1 text-xs font-semibold text-slate-400 hover:text-amber-400 transition-colors p-1"
        >
          <Edit3 className="h-3.5 w-3.5" />
          Edit
        </button>
        <button
          type="button"
          onClick={() => onDelete(address.id)}
          aria-label={`Delete address for ${address.recipientName}`}
          className="inline-flex items-center gap-1 text-xs font-semibold text-slate-400 hover:text-red-400 transition-colors p-1 ml-2"
        >
          <Trash2 className="h-3.5 w-3.5" />
          Delete
        </button>
      </div>
    </div>
  );
};
