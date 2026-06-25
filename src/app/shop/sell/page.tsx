'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Package, ShoppingBasket, Tag, DollarSign, AlignLeft, Layers } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/context/AuthContext';
import ProtectedRoute from '@/components/ProtectedRoute';
import WorldPageHeader from '@/components/world/WorldPageHeader';
import PremiumCard from '@/components/premium/PremiumCard';
import ProductImagePicker from '@/components/shop/ProductImagePicker';
import { useCopy } from '@/context/LanguageContext';
import { Product, ProductCategory, productFromRow } from '@/types';
import { uploadProductImage } from '@/lib/productImageUpload';
import { productPlaceholderClass } from '@/lib/productImages';

const CATEGORIES: ProductCategory[] = ['protein', 'supplements', 'equipment', 'apparel', 'accessories'];

function SellContent() {
  const copy = useCopy();
  const { supabaseUser, appUser } = useAuth();
  const router = useRouter();
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<ProductCategory>('equipment');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [status, setStatus] = useState<'idle' | 'uploading' | 'saving' | 'done' | 'error'>('idle');
  const [errorMsg, setErrorMsg] = useState('');
  const [myProducts, setMyProducts] = useState<Product[]>([]);

  useEffect(() => {
    if (!supabaseUser) return;
    (async () => {
      const { data } = await supabase
        .from('products')
        .select('*')
        .eq('seller_id', supabaseUser.id)
        .order('created_at', { ascending: false });
      if (data) setMyProducts(data.map((r) => productFromRow(r as any)));
    })();
  }, [supabaseUser, status]);

  useEffect(() => {
    return () => {
      if (imagePreview?.startsWith('blob:')) URL.revokeObjectURL(imagePreview);
    };
  }, [imagePreview]);

  const selectImage = (file: File) => {
    if (imagePreview?.startsWith('blob:')) URL.revokeObjectURL(imagePreview);
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const clearImage = () => {
    if (imagePreview?.startsWith('blob:')) URL.revokeObjectURL(imagePreview);
    setImageFile(null);
    setImagePreview(null);
  };

  const canPublish = Boolean(supabaseUser && name.trim() && price && imageFile && status !== 'uploading' && status !== 'saving');

  const publish = async () => {
    if (!supabaseUser || !name.trim() || !price || !imageFile) return;
    setStatus('uploading');
    setErrorMsg('');

    try {
      const imageUrl = await uploadProductImage(supabaseUser.id, imageFile);
      setStatus('saving');

      const { error } = await supabase.from('products').insert({
        name: name.trim(),
        price: parseFloat(price),
        description: description.trim(),
        category,
        seller_id: supabaseUser.id,
        image_url: imageUrl,
        verified: false,
        stock: 10,
      });

      if (error) throw error;

      setName('');
      setPrice('');
      setDescription('');
      clearImage();
      setStatus('done');
      setTimeout(() => setStatus('idle'), 2500);
    } catch (e) {
      setStatus('error');
      setErrorMsg(
        e instanceof Error && e.message.includes('bucket')
          ? 'Run migration 013_product_images.sql in Supabase.'
          : e instanceof Error
            ? e.message
            : 'Could not publish listing.'
      );
    }
  };

  return (
    <div className="fit-page">
      <WorldPageHeader title={copy.shop.sell} subline={copy.shop.sellSubline} />

      <div className="flex flex-wrap gap-2 mb-4">
        <Link href="/shop" className="fit-pill">
          ← {copy.shop.title}
        </Link>
        <Link href="/shop/basket" className="fit-pill fit-pill--active">
          <ShoppingBasket size={14} className="inline mr-1" />
          {copy.shop.basket}
        </Link>
      </div>

      <PremiumCard className="sell-form-card">
        <div className="sell-form-grid">
          <div className="sell-form-media">
            <ProductImagePicker
              previewUrl={imagePreview}
              onSelect={selectImage}
              onClear={clearImage}
              label={copy.shop.productImage}
              hint={copy.shop.productImageHint}
              uploadLabel={copy.shop.productImageUpload}
              changeLabel={copy.shop.productImageChange}
            />
          </div>

          <div className="sell-form-fields">
            <div>
              <p className="sell-form-title">{copy.shop.uploadProduct}</p>
              <p className="sell-form-sub">{copy.shop.sellSubline}</p>
            </div>

            <div className="sell-field">
              <label className="sell-field__label" htmlFor="sell-name">
                <Tag size={12} className="inline mr-1 -mt-0.5" />
                {copy.shop.productName}
              </label>
              <input
                id="sell-name"
                className="sell-field__input"
                placeholder={copy.shop.productName}
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>

            <div className="sell-field-row">
              <div className="sell-field">
                <label className="sell-field__label" htmlFor="sell-price">
                  <DollarSign size={12} className="inline mr-1 -mt-0.5" />
                  {copy.shop.productPrice}
                </label>
                <input
                  id="sell-price"
                  className="sell-field__input"
                  placeholder="0.00"
                  type="number"
                  min="0"
                  step="0.01"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                />
              </div>
              <div className="sell-field">
                <label className="sell-field__label" htmlFor="sell-category">
                  <Layers size={12} className="inline mr-1 -mt-0.5" />
                  {copy.shop.productCategory}
                </label>
                <select
                  id="sell-category"
                  className="sell-field__select"
                  value={category}
                  onChange={(e) => setCategory(e.target.value as ProductCategory)}
                >
                  {CATEGORIES.map((c) => (
                    <option key={c} value={c}>
                      {c.charAt(0).toUpperCase() + c.slice(1)}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="sell-field">
              <label className="sell-field__label" htmlFor="sell-desc">
                <AlignLeft size={12} className="inline mr-1 -mt-0.5" />
                {copy.shop.productDesc}
              </label>
              <textarea
                id="sell-desc"
                className="sell-field__textarea"
                placeholder={copy.shop.productDesc}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>

            <button type="button" onClick={publish} disabled={!canPublish} className="sell-form-submit">
              {status === 'uploading'
                ? copy.shop.uploadingImage
                : status === 'saving'
                  ? copy.shop.publishing
                  : copy.shop.publish}
            </button>

            {status === 'done' && <p className="sell-form-status sell-form-status--ok">{copy.shop.published}</p>}
            {status === 'error' && <p className="sell-form-status sell-form-status--err">{errorMsg}</p>}
          </div>
        </div>
      </PremiumCard>

      {myProducts.length > 0 && (
        <section className="mt-6">
          <p className="fit-section-title">{copy.shop.myListings}</p>
          <div className="space-y-2">
            {myProducts.map((p) => (
              <PremiumCard key={p.id} className="sell-listing-row">
                {p.imageUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={p.imageUrl} alt="" className="sell-listing-row__thumb" />
                ) : (
                  <div className={`sell-listing-row__placeholder ${productPlaceholderClass(p.category)}`}>
                    <Package size={16} className="text-orange-400/70" />
                  </div>
                )}
                <div className="min-w-0 flex-1">
                  <p className="font-semibold text-ink truncate">{p.name}</p>
                  <p className="text-xs text-muted">
                    ${p.price.toFixed(2)} · {p.category}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => router.push(`/shop/${p.id}`)}
                  className="text-xs font-semibold text-orange-400"
                >
                  View
                </button>
              </PremiumCard>
            ))}
          </div>
        </section>
      )}

      <p className="text-xs text-muted mt-4">
        {appUser?.name} · {copy.shop.seller}
      </p>
    </div>
  );
}

export default function ShopSellPage() {
  return (
    <ProtectedRoute>
      <SellContent />
    </ProtectedRoute>
  );
}
