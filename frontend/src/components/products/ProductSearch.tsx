import React, { useState, useEffect } from 'react';
import { Search, X } from 'lucide-react';
import { Input } from '../ui/Input';

export interface ProductSearchProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  debounceMs?: number;
}

export const ProductSearch: React.FC<ProductSearchProps> = ({
  value: externalValue,
  onChange,
  placeholder = 'Search by kit name, team, brand, or league...',
  debounceMs = 400,
}) => {
  const [inputValue, setInputValue] = useState(externalValue);

  // Sync internal input state when external value changes (e.g. URL query params updated externally or cleared)
  useEffect(() => {
    setInputValue(externalValue);
  }, [externalValue]);

  // Debounce notification to parent
  useEffect(() => {
    const handler = setTimeout(() => {
      if (inputValue !== externalValue) {
        onChange(inputValue);
      }
    }, debounceMs);

    return () => clearTimeout(handler);
  }, [inputValue, externalValue, onChange, debounceMs]);

  const handleClear = () => {
    setInputValue('');
    onChange('');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onChange(inputValue);
  };

  return (
    <form onSubmit={handleSubmit} className="relative w-full" role="search">
      <div className="relative flex items-center">
        <Input
          type="search"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          placeholder={placeholder}
          aria-label="Search products"
          leftIcon={<Search className="h-4 w-4 text-slate-400" />}
          rightIcon={
            inputValue ? (
              <button
                type="button"
                onClick={handleClear}
                aria-label="Clear search"
                className="rounded-md p-1 text-slate-400 hover:text-white hover:bg-slate-800 transition-colors focus:outline-none focus:ring-1 focus:ring-amber-500"
              >
                <X className="h-4 w-4" />
              </button>
            ) : undefined
          }
          className="w-full bg-slate-900/90 border-slate-800 text-white placeholder-slate-500 focus:border-amber-500 focus:ring-amber-500/20"
        />
      </div>
    </form>
  );
};
