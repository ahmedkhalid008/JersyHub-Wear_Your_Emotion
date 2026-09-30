import React, { useState, useEffect } from 'react';
import { AddressResponse, AddressRequest } from '../../types/domain';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';

export interface AddressFormProps {
  initialData?: AddressResponse | null;
  onSubmit: (request: AddressRequest) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
  error?: string | null;
}

export const DIVISIONS = [
  'Dhaka',
  'Chittagong',
  'Rajshahi',
  'Khulna',
  'Barisal',
  'Sylhet',
  'Rangpur',
  'Mymensingh',
];

export const AddressForm: React.FC<AddressFormProps> = ({
  initialData,
  onSubmit,
  onCancel,
  isLoading = false,
  error = null,
}) => {
  const [recipientName, setRecipientName] = useState(initialData?.recipientName || '');
  const [phone, setPhone] = useState(initialData?.phone || '');
  const [division, setDivision] = useState(initialData?.division || 'Dhaka');
  const [district, setDistrict] = useState(initialData?.district || '');
  const [area, setArea] = useState(initialData?.area || '');
  const [addressLine, setAddressLine] = useState(initialData?.addressLine || '');
  const [postalCode, setPostalCode] = useState(initialData?.postalCode || '');
  const [isDefault, setIsDefault] = useState(initialData?.isDefault || false);
  const [valError, setValError] = useState<string | null>(null);

  useEffect(() => {
    if (initialData) {
      setRecipientName(initialData.recipientName);
      setPhone(initialData.phone);
      setDivision(initialData.division);
      setDistrict(initialData.district);
      setArea(initialData.area);
      setAddressLine(initialData.addressLine);
      setPostalCode(initialData.postalCode || '');
      setIsDefault(initialData.isDefault);
    }
  }, [initialData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setValError(null);

    if (!recipientName.trim()) {
      setValError('Recipient name is required.');
      return;
    }
    if (!phone.trim()) {
      setValError('Phone number is required.');
      return;
    }
    if (!division.trim()) {
      setValError('Division is required.');
      return;
    }
    if (!district.trim()) {
      setValError('District is required.');
      return;
    }
    if (!area.trim()) {
      setValError('Area is required.');
      return;
    }
    if (!addressLine.trim()) {
      setValError('Address line is required.');
      return;
    }

    await onSubmit({
      recipientName: recipientName.trim(),
      phone: phone.trim(),
      division: division.trim(),
      district: district.trim(),
      area: area.trim(),
      addressLine: addressLine.trim(),
      postalCode: postalCode.trim() || undefined,
      isDefault,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Input
          label="Recipient Full Name *"
          placeholder="e.g. Khalid Hossain"
          value={recipientName}
          maxLength={100}
          onChange={(e) => setRecipientName(e.target.value)}
        />
        <Input
          label="Phone Number *"
          placeholder="e.g. +8801700000000"
          value={phone}
          maxLength={20}
          onChange={(e) => setPhone(e.target.value)}
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="space-y-1">
          <label htmlFor="address-division-select" className="text-xs font-semibold text-slate-300">
            Division *
          </label>
          <select
            id="address-division-select"
            value={division}
            onChange={(e) => setDivision(e.target.value)}
            className="w-full rounded-xl border border-slate-800 bg-slate-900 px-3 py-2.5 text-sm text-slate-100 focus:border-amber-500 focus:outline-none"
          >
            {DIVISIONS.map((div) => (
              <option key={div} value={div}>
                {div}
              </option>
            ))}
          </select>
        </div>

        <Input
          label="District *"
          placeholder="e.g. Dhaka"
          value={district}
          maxLength={50}
          onChange={(e) => setDistrict(e.target.value)}
        />

        <Input
          label="Area / Thana *"
          placeholder="e.g. Dhanmondi"
          value={area}
          maxLength={50}
          onChange={(e) => setArea(e.target.value)}
        />
      </div>

      <Input
        label="Street Address Line *"
        placeholder="e.g. House 12, Road 5, Block B"
        value={addressLine}
        maxLength={255}
        onChange={(e) => setAddressLine(e.target.value)}
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center">
        <Input
          label="Postal Code (Optional)"
          placeholder="e.g. 1209"
          value={postalCode}
          maxLength={20}
          onChange={(e) => setPostalCode(e.target.value)}
        />

        <label className="flex items-center gap-2 pt-4 cursor-pointer">
          <input
            type="checkbox"
            checked={isDefault}
            onChange={(e) => setIsDefault(e.target.checked)}
            className="h-4 w-4 rounded border-slate-800 bg-slate-900 text-amber-500 focus:ring-amber-500"
          />
          <span className="text-xs font-semibold text-slate-300">Set as default shipping address</span>
        </label>
      </div>

      {(valError || error) && (
        <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-3 text-xs text-red-300">
          {valError || error}
        </div>
      )}

      <div className="flex justify-end gap-2 pt-4 border-t border-slate-800">
        <Button type="button" variant="outline" size="sm" onClick={onCancel}>
          Cancel
        </Button>
        <Button
          type="submit"
          size="sm"
          isLoading={isLoading}
          className="bg-amber-500 text-slate-950 hover:bg-amber-400 font-bold"
        >
          {initialData ? 'Update Address' : 'Save Address'}
        </Button>
      </div>
    </form>
  );
};
