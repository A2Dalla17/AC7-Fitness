'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Package, ShoppingBasket } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/context/AuthContext';
import ProtectedRoute from '@/components/ProtectedRoute';
import WorldPageHeader from '@/components/world/WorldPageHeader';
import PremiumCard from '@/components/premium/PremiumCard';
import { useCopy } from '@/context/LanguageContext';
import { Product, ProductCategory, productFromRow } from '@/types';

const CATEGORIES: ProductCategory[] = ['protein', 'supplements', 'equipment', 'apparel', 'accessories'];

function SellContent() {
  const copy = useCopy();
  const { supabaseUser, appUser } = useAuth();
  const router = useRouter();
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<ProductCategory>('equipment');
  const [status, setStatus] = useState<'idle' | 'saving' | 'done' | 'error'>('idle');
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

  const publish = async () => {
    if (!supabaseUser || !name.trim() || !price) return;
    setStatus('saving');
    const { error } = await supabase.from('products').insert({
      name: name.trim(),
      price: parseFloat(price),
      description: description.trim(),
      category,
      seller_id: supabaseUser.id,
      verified: false,
      stock: 10,
    });
    if (error) {
      setStatus('error');
      return;
    }
    setName('');
    setPrice('');
    setDescription('');
    setStatus('done');
    setTimeout(() => setStatus('idle'), 2000);
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

      <PremiumCard>
        <p className="text-sm font-semibold text-ink mb-4">{copy.shop.uploadProduct}</p>
        <div className="space-y-3">
          <input
            className="w-full rounded-xl border border-[var(--elite-card-border)] bg-transparent px-3 py-2 text-sm"
            placeholder={copy.shop.productName}
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <input
            className="w-full rounded-xl border border-[var(--elite-card-border)] bg-transparent px-3 py-2 text-sm"
            placeholder={copy.shop.productPrice}
            type="number"
            min="0"
            step="0.01"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
          />
          <select
            className="w-full rounded-xl border border-[var(--elite-card-border)] bg-transparent px-3 py-2 text-sm"
            value={category}
            onChange={(e) => setCategory(e.target.value as ProductCategory)}
          >
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
          <textarea
            className="w-full rounded-xl border border-[var(--elite-card-border)] bg-transparent px-3 py-2 text-sm min-h-[80px]"
            placeholder={copy.shop.productDesc}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
          <button
            type="button"
            onClick={publish}
            disabled={status === 'saving' || !name.trim() || !price}
            className="w-full rounded-xl bg-orange-500 py-3 font-semibold text-white disabled:opacity-50"
          >
            {status === 'saving' ? copy.shop.publishing : copy.shop.publish}
          </button>
          {status === 'done' && <p className="text-sm text-orange-400">{copy.shop.published}</p>}
          {status === 'error' && (
            <p className="text-sm text-red-400">Could not publish — run migration 011_shop_sellers.sql in Supabase.</p>
          )}
        </div>
      </PremiumCard>

      {myProducts.length > 0 && (
        <section className="mt-6">
          <p className="fit-section-title">{copy.shop.myListings}</p>
          <div className="space-y-2">
            {myProducts.map((p) => (
              <PremiumCard key={p.id} className="flex items-center gap-3">
                <Package size={18} className="text-orange-400 shrink-0" />
                <div className="min-w-0 flex-1">
                  <p className="font-semibold text-ink truncate">{p.name}</p>
                  <p className="text-xs text-muted">${p.price.toFixed(2)} · {p.category}</p>
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
