'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { ShieldCheck } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/context/AuthContext';
import ProtectedRoute from '@/components/ProtectedRoute';
import Header from '@/components/Header';
import BottomNav from '@/components/BottomNav';
import { Product, productFromRow } from '@/types';

function ProductDetailContent() {
  const { id } = useParams<{ id: string }>();
  const { supabaseUser } = useAuth();
  const [product, setProduct] = useState<Product | null>(null);
  const [status, setStatus] = useState('');

  useEffect(() => {
    (async () => {
      const { data } = await supabase.from('products').select('*').eq('id', id).maybeSingle();
      if (data) setProduct(productFromRow(data as any));
    })();
  }, [id]);

  const buyNow = async () => {
    if (!supabaseUser || !product) return;
    setStatus('placing');
    const { data: order } = await supabase
      .from('orders')
      .insert({ user_id: supabaseUser.id, total: product.price, status: 'paid' })
      .select()
      .single();
    if (order) {
      await supabase.from('order_items').insert({
        order_id: order.id,
        product_id: product.id,
        quantity: 1,
        unit_price: product.price,
      });
    }
    setStatus('placed');
  };

  if (!product) {
    return (
      <div className="flex min-h-screen flex-col bg-bg">
        <Header title="Product" back />
        <p className="px-4 py-6 text-sm text-muted">Loading product...</p>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-bg">
      <Header title="Product" back />
      <main className="flex-1 space-y-6 px-4 py-6 pb-24">
        <div className="flex h-48 items-center justify-center rounded-xl2 border border-navy-deep bg-navy/20 text-sm text-muted">
          {product.category}
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold">{product.name}</h2>
            {product.verified && <ShieldCheck size={18} className="text-orange-400" />}
          </div>
          <p className="mt-1 text-sm text-muted">{product.description}</p>
          <p className="mt-3 text-2xl font-bold">${product.price.toFixed(2)}</p>
          <p className="mt-1 text-xs text-muted">{product.stock} in stock</p>
        </div>
        <button
          disabled={status === 'placing' || product.stock === 0}
          onClick={buyNow}
          className="w-full rounded-xl2 bg-navy px-6 py-3 font-semibold disabled:opacity-50"
        >
          {status === 'placing' ? 'Placing order...' : 'Buy Now'}
        </button>
        {status === 'placed' && <p className="text-sm text-orange-400">Order placed! Check your email for confirmation.</p>}
      </main>
      <BottomNav />
    </div>
  );
}

export default function ProductDetailPage() {
  return (
    <ProtectedRoute>
      <ProductDetailContent />
    </ProtectedRoute>
  );
}
