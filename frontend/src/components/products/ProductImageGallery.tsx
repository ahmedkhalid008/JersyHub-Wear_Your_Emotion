import React, { useState } from 'react';
import { Shirt } from 'lucide-react';
import { ProductImage } from '../../types/domain';

export interface ProductImageGalleryProps {
  images: ProductImage[];
  productName: string;
}

export const ProductImageGallery: React.FC<ProductImageGalleryProps> = ({
  images,
  productName,
}) => {
  // Find primary image index or default to first image
  const primaryIndex = Math.max(
    0,
    images.findIndex((img) => img.primary)
  );

  const [selectedIndex, setSelectedIndex] = useState(primaryIndex);
  const [imgErrorMap, setImgErrorMap] = useState<Record<string, boolean>>({});

  const currentImg = images[selectedIndex];
  const isCurrentFailed = currentImg ? imgErrorMap[currentImg.id] : true;

  const handleImageError = (id: string) => {
    setImgErrorMap((prev) => ({ ...prev, [id]: true }));
  };

  return (
    <div className="flex flex-col gap-4">
      {/* Primary Image Viewport */}
      <div className="relative aspect-[4/3] w-full overflow-hidden rounded-2xl border border-slate-800 bg-slate-950 p-2 flex items-center justify-center shadow-lg">
        {currentImg && currentImg.imageUrl && !isCurrentFailed ? (
          <img
            src={currentImg.imageUrl}
            alt={`${productName} view ${selectedIndex + 1}`}
            onError={() => handleImageError(currentImg.id)}
            className="h-full w-full object-contain transition-all duration-300"
          />
        ) : (
          <div className="flex flex-col items-center justify-center p-8 text-center text-slate-600">
            <Shirt className="h-24 w-24 text-slate-700/80 mb-2" />
            <span className="text-xs text-slate-500 font-medium">No Image Available</span>
          </div>
        )}
      </div>

      {/* Thumbnails row (only if > 1 image) */}
      {images.length > 1 && (
        <div className="flex items-center gap-3 overflow-x-auto pb-2 scrollbar-thin">
          {images.map((img, index) => {
            const isSelected = index === selectedIndex;
            const isFailed = imgErrorMap[img.id];

            return (
              <button
                key={img.id || index}
                type="button"
                onClick={() => setSelectedIndex(index)}
                aria-label={`View product image ${index + 1}`}
                aria-current={isSelected ? 'true' : undefined}
                className={`relative h-20 w-20 flex-shrink-0 overflow-hidden rounded-xl border transition-all ${
                  isSelected
                    ? 'border-amber-500 ring-2 ring-amber-500/30 bg-slate-900'
                    : 'border-slate-800 opacity-70 hover:opacity-100 bg-slate-950'
                }`}
              >
                {img.imageUrl && !isFailed ? (
                  <img
                    src={img.imageUrl}
                    alt={`${productName} thumbnail ${index + 1}`}
                    onError={() => handleImageError(img.id)}
                    className="h-full w-full object-cover object-center"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center bg-slate-900 text-slate-600">
                    <Shirt className="h-8 w-8" />
                  </div>
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};
