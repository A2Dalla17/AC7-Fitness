'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Heart, ShieldCheck, Search, ShoppingCart, Package, Upload, ShoppingBasket } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import ProtectedRoute from '@/components/ProtectedRoute';
import { Product, ProductCategory, productFromRow } from '@/types';
import WorldPageHeader from '@/components/world/WorldPageHeader';
import PremiumCard from '@/components/premium/PremiumCard';
import Ac7BrandWatermark from '@/components/ac7/Ac7BrandWatermark';
import { productPlaceholderClass } from '@/lib/productImages';
import { useCopy } from '@/context/LanguageContext';
import { addToBasket, readBasket } from '@/lib/shopBasket';

const CATEGORY_KEYS: (ProductCategory | 'all')[] = ['all', 'protein', 'supplements', 'equipment', 'apparel', 'accessories'];

function ProductCard({
  p,
  sellerName,
  onWishlist,
  onAdd,
}: {
  p: Product;
  sellerName?: string;
  onWishlist: (id: string) => void;
  onAdd: (p: Product, sellerName: string) => void;
}) {
  const copy = useCopy();

  return (
    <PremiumCard className="shop-product-card fit-product-card">
      <div className="shop-product-card__img-wrap">
        {p.imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={p.imageUrl} alt={p.name} className="shop-product-card__img" loading="lazy" />
        ) : (
          <div className={`shop-product-card__img ${productPlaceholderClass(p.category)}`}>
            <Package size={28} className="text-orange-400/70" />
          </div>
        )}
      </div>
      <div className="shop-product-card__body">
        <div className="flex items-start justify-between gap-1">
          <p className="shop-product-card__name">{p.name}</p>
          {p.verified && <ShieldCheck size={14} className="shrink-0 text-orange-400" />}
        </div>
        {sellerName && (
          <p className="text-[11px] text-muted mb-1">{copy.shop.seller}: {sellerName}</p>
        )}
        <p className="shop-product-card__price">${p.price.toFixed(2)}</p>
        <div className="shop-product-card__actions">
          <button
            type="button"
            onClick={() => onAdd(p, sellerName ?? copy.shop.seller)}
            className="shop-product-card__btn shop-product-card__btn--primary"
          >
            <ShoppingCart size={14} className="inline mr-1" />
            {copy.shop.addToCart}
          </button>
          <Link href={`/shop/${p.id}`} className="shop-product-card__btn shop-product-card__btn--ghost text-center">
            View
          </Link>
          <button
            type="button"
            onClick={() => onWishlist(p.id)}
            className="shop-product-card__btn shop-product-card__btn--ghost"
            aria-label={copy.shop.wishlist}
          >
            <Heart size={14} />
          </button>
        </div>
      </div>
    </PremiumCard>
  );
}

function ShopContent() {
  const copy = useCopy();
  const [products, setProducts] = useState<Product[]>([]);
  const [sellerNames, setSellerNames] = useState<Record<string, string>>({});
  const [filter, setFilter] = useState<ProductCategory | 'all'>('all');
  const [search, setSearch] = useState('');
  const [wishlist, setWishlist] = useState<string[]>([]);
  const [basketCount, setBasketCount] = useState(0);

  useEffect(() => {
    (async () => {
      const { data } = await supabase
        .from('products')
        .select('*')
        .not('seller_id', 'is', null)
        .order('created_at', { ascending: false });
      if (data) {
        const list = data.map((r) => productFromRow(r as any));
        setProducts(list);
        const sellerIds = [...new Set(list.map((p) => p.sellerId).filter(Boolean))] as string[];
        if (sellerIds.length) {
          const { data: users } = await supabase.from('users').select('id,name').in('id', sellerIds);
          if (users) setSellerNames(Object.fromEntries(users.map((u: any) => [u.id, u.name])));
        }
      }
    })();
    const refreshBasket = () => setBasketCount(readBasket().reduce((n, i) => n + i.quantity, 0));
    refreshBasket();
    window.addEventListener('ac7-basket-updated', refreshBasket);
    return () => window.removeEventListener('ac7-basket-updated', refreshBasket);
  }, []);

  const toggleWishlist = (id: string) => {
    setWishlist((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  };

  const handleAdd = (p: Product, sellerName: string) => {
    addToBasket({
      productId: p.id,
      name: p.name,
      price: p.price,
      sellerId: p.sellerId ?? 'unknown',
      sellerName,
      category: p.category,
      imageUrl: p.imageUrl,
    });
  };

  const filtered = products
    .filter((p) => filter === 'all' || p.category === filter)
    .filter((p) => p.name.toLowerCase().includes(search.toLowerCase()));

  const categoryLabel = (c: ProductCategory | 'all') => {
    if (c === 'all') return copy.shop.all;
    return c.charAt(0).toUpperCase() + c.slice(1);
  };

  return (
    <div className="fit-page">
      <WorldPageHeader title={copy.shop.title} subline={copy.shop.subline} />

      <div className="flex flex-wrap gap-2 mb-4">
        <Link href="/shop/sell" className="fit-pill fit-pill--active">
          <Upload size={14} className="inline mr-1" />
          {copy.shop.sell}
        </Link>
        <Link href="/shop/basket" className="fit-pill">
          <ShoppingBasket size={14} className="inline mr-1" />
          {copy.shop.basket}
          {basketCount > 0 && ` (${basketCount})`}
        </Link>
      </div>

      <PremiumCard className="fit-search-bar">
        <Search size={16} className="text-muted shrink-0" />
        <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder={copy.shop.search} />
      </PremiumCard>

      <div className="fit-pill-row">
        {CATEGORY_KEYS.map((c) => (
          <button
            key={c}
            type="button"
            onClick={() => setFilter(c)}
            className={`fit-pill ${filter === c ? 'fit-pill--active' : ''}`}
          >
            {categoryLabel(c)}
          </button>
        ))}
      </div>

      <section>
        <p className="fit-section-title">{filter === 'all' ? copy.shop.all : categoryLabel(filter)}</p>
        {filtered.length === 0 ? (
          <PremiumCard>
            <Ac7BrandWatermark />
            <p className="text-sm text-muted text-center">{copy.shop.noProducts}</p>
            <Link href="/shop/sell" className="inline-block mt-3 text-sm font-semibold text-orange-400">
              {copy.shop.sell} →
            </Link>
          </PremiumCard>
        ) : (
          <div className="fit-product-grid">
            {filtered.map((p) => (
              <ProductCard
                key={p.id}
                p={p}
                sellerName={p.sellerId ? sellerNames[p.sellerId] : undefined}
                onWishlist={toggleWishlist}
                onAdd={handleAdd}
              />
            ))}
          </div>
        )}
      </section>

      {wishlist.length > 0 && (
        <p className="text-xs text-muted">
          {wishlist.length} {copy.shop.wishlist.toLowerCase()}
        </p>
      )}
    </div>
  );
}

export default function ShopPage() {
  return (
    <ProtectedRoute>
      <ShopContent />
    </ProtectedRoute>
  );
}
