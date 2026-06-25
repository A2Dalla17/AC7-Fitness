'use client';

import { useRef, useState } from 'react';
import { Camera, ImagePlus, X } from 'lucide-react';
import { validateProductImage } from '@/lib/productImageUpload';

export default function ProductImagePicker({
  previewUrl,
  onSelect,
  onClear,
  label,
  hint,
  uploadLabel,
  changeLabel,
}: {
  previewUrl: string | null;
  onSelect: (file: File) => void;
  onClear: () => void;
  label: string;
  hint: string;
  uploadLabel: string;
  changeLabel: string;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [error, setError] = useState('');

  const pick = (file: File | undefined) => {
    if (!file) return;
    const err = validateProductImage(file);
    if (err) {
      setError(err);
      return;
    }
    setError('');
    onSelect(file);
  };

  return (
    <div className="sell-image-picker">
      <div className="sell-image-picker__header">
        <p className="sell-image-picker__label">{label}</p>
        <p className="sell-image-picker__hint">{hint}</p>
      </div>

      {previewUrl ? (
        <div className="sell-image-picker__preview">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={previewUrl} alt="" className="sell-image-picker__img" />
          <div className="sell-image-picker__actions">
            <button type="button" className="sell-image-picker__btn" onClick={() => inputRef.current?.click()}>
              <Camera size={16} />
              {changeLabel}
            </button>
            <button type="button" className="sell-image-picker__btn sell-image-picker__btn--ghost" onClick={onClear}>
              <X size={16} />
            </button>
          </div>
        </div>
      ) : (
        <button
          type="button"
          className="sell-image-picker__drop"
          onClick={() => inputRef.current?.click()}
        >
          <span className="sell-image-picker__icon">
            <ImagePlus size={28} />
          </span>
          <span className="sell-image-picker__cta">{uploadLabel}</span>
          <span className="sell-image-picker__formats">JPG · PNG · WebP · max 5 MB</span>
        </button>
      )}

      {error && <p className="sell-image-picker__error">{error}</p>}

      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        className="sr-only"
        onChange={(e) => pick(e.target.files?.[0])}
      />
    </div>
  );
}
