'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ShieldCheck, Search } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import ProtectedRoute from '@/components/ProtectedRoute';
import { Product, ProductCategory, productFromRow } from '@/types';
import { COPY } from '@/lib/legacyBrand';
import WorldPageHeader from '@/components/world/WorldPageHeader';

const CATEGORIES: { value: ProductCategory | 'all'; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'protein', label: 'Protein' },
  { value: 'supplements', label: 'Supplements' },
  { value: 'equipment', label: 'Equipment' },
  { value: 'apparel', label: 'Apparel' },
  { value: 'accessories', label: 'Accessories' },
];

function ProductCard({ p, compact }: { p: Product; compact?: boolean }) {
  return (
    <Link href={`/shop/${p.id}`} className="fit-product-card">
      <div className="fit-product-card__img">{p.category}</div>
      <div className="fit-product-card__body">
        <div className="flex items-start justify-between gap-1">
          <p className="fit-product-card__name">{p.name}</p>
          {p.verified && !compact && <ShieldCheck size={14} className="shrink-0 text-blue-400" />}
        </div>
        <p className="fit-product-card__price">${p.price.toFixed(2)}</p>
      </div>
    </Link>
  );
}

function ShopContent() {
  const [products, setProducts] = useState<Product[]>([]);
  const [filter, setFilter] = useState<ProductCategory | 'all'>('all');
  const [search, setSearch] = useState('');

  useEffect(() => {
    (async () => {
      const { data } = await supabase.from('products').select('*').order('name');
      if (data) setProducts(data.map((r) => productFromRow(r as any)));
    })();
  }, []);

  const filtered = products
    .filter((p) => filter === 'all' || p.category === filter)
    .filter((p) => p.name.toLowerCase().includes(search.toLowerCase()));
  const featured = products.filter((p) => p.verified).slice(0, 6);

  return (
    <div className="fit-page">
      <WorldPageHeader title={COPY.shop.title} subline={COPY.shop.subline} />

      <div className="fit-search-bar">
        <Search size={16} className="text-muted shrink-0" />
        <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder={COPY.shop.search} />
      </div>

      <div className="fit-pill-row">
        {CATEGORIES.map((c) => (
          <button
            key={c.value}
            type="button"
            onClick={() => setFilter(c.value)}
            className={`fit-pill ${filter === c.value ? 'fit-pill--active' : ''}`}
          >
            {c.label}
          </button>
        ))}
      </div>

      {featured.length > 0 && filter === 'all' && !search && (
        <section>
          <p className="fit-section-title">{COPY.shop.featured}</p>
          <div className="fit-featured-scroll">
            {featured.map((p) => (
              <ProductCard key={p.id} p={p} compact />
            ))}
          </div>
        </section>
      )}

      <section>
        <p className="fit-section-title">{filter === 'all' ? COPY.shop.all : CATEGORIES.find((c) => c.value === filter)?.label}</p>
        {filtered.length === 0 ? (
          <p className="text-sm text-muted">No products found.</p>
        ) : (
          <div className="fit-product-grid">
            {filtered.map((p) => (
              <ProductCard key={p.id} p={p} />
            ))}
          </div>
        )}
      </section>
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
