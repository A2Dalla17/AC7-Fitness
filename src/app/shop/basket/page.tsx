'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Trash2 } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/context/AuthContext';
import ProtectedRoute from '@/components/ProtectedRoute';
import WorldPageHeader from '@/components/world/WorldPageHeader';
import PremiumCard from '@/components/premium/PremiumCard';
import Ac7BrandWatermark from '@/components/ac7/Ac7BrandWatermark';
import { useCopy } from '@/context/LanguageContext';
import {
  basketBySeller,
  basketTotal,
  clearBasket,
  readBasket,
  removeFromBasket,
  type BasketItem,
} from '@/lib/shopBasket';

function BasketContent() {
  const copy = useCopy();
  const { supabaseUser } = useAuth();
  const [items, setItems] = useState<BasketItem[]>([]);
  const [status, setStatus] = useState('');

  const refresh = () => setItems(readBasket());

  useEffect(() => {
    refresh();
    const onUpdate = () => refresh();
    window.addEventListener('ac7-basket-updated', onUpdate);
    return () => window.removeEventListener('ac7-basket-updated', onUpdate);
  }, []);

  const checkout = async () => {
    if (!supabaseUser || items.length === 0) return;
    setStatus('placing');
    const total = basketTotal(items);
    const { data: order } = await supabase
      .from('orders')
      .insert({ user_id: supabaseUser.id, total, status: 'pending' })
      .select()
      .single();
    if (order) {
      for (const item of items) {
        await supabase.from('order_items').insert({
          order_id: order.id,
          product_id: item.productId,
          quantity: item.quantity,
          unit_price: item.price,
        });
      }
    }
    clearBasket();
    refresh();
    setStatus('done');
  };

  const groups = basketBySeller(items);
  const total = basketTotal(items);

  return (
    <div className="fit-page">
      <WorldPageHeader title={copy.shop.basket} subline={copy.shop.subline} />

      <div className="flex flex-wrap gap-2 mb-4">
        <Link href="/shop" className="fit-pill">
          ← {copy.shop.title}
        </Link>
        <Link href="/shop/sell" className="fit-pill">
          {copy.shop.sell}
        </Link>
      </div>

      {items.length === 0 ? (
        <PremiumCard className="text-center py-10">
          <Ac7BrandWatermark />
          <p className="text-sm text-muted">{copy.shop.basketEmpty}</p>
          <Link href="/shop" className="inline-block mt-4 text-sm font-semibold text-orange-400">
            {copy.shop.title} →
          </Link>
        </PremiumCard>
      ) : (
        <>
          {groups.map(([sellerId, group]) => (
            <section key={sellerId} className="mb-4">
              <p className="fit-section-title">
                {copy.shop.seller}: {group.sellerName}
              </p>
              <div className="space-y-2">
                {group.items.map((item) => (
                  <PremiumCard key={item.productId} className="flex items-center justify-between gap-3">
                    <div className="min-w-0">
                      <p className="font-semibold text-ink truncate">{item.name}</p>
                      <p className="text-xs text-muted">
                        ${item.price.toFixed(2)} × {item.quantity}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeFromBasket(item.productId)}
                      className="text-muted hover:text-red-400"
                      aria-label={copy.shop.removeFromBasket}
                    >
                      <Trash2 size={16} />
                    </button>
                  </PremiumCard>
                ))}
              </div>
            </section>
          ))}

          <PremiumCard className="mt-4">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-ink">{copy.shop.basketTotal}</span>
              <span className="text-xl font-bold text-ink">${total.toFixed(2)}</span>
            </div>
            <button
              type="button"
              onClick={checkout}
              disabled={status === 'placing'}
              className="mt-4 w-full rounded-xl bg-orange-500 py-3 font-semibold text-white disabled:opacity-50"
            >
              {status === 'placing' ? '…' : copy.shop.basketCheckout}
            </button>
            {status === 'done' && (
              <p className="mt-2 text-sm text-orange-400 text-center">✓ Order placed!</p>
            )}
          </PremiumCard>
        </>
      )}
    </div>
  );
}

export default function ShopBasketPage() {
  return (
    <ProtectedRoute>
      <BasketContent />
    </ProtectedRoute>
  );
}
