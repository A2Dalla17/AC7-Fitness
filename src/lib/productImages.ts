import type { ProductCategory } from '@/types';

/** Neutral placeholder when seller has no product image — no fake stock photos */
export function productPlaceholderClass(category: ProductCategory): string {
  return `shop-product-placeholder shop-product-placeholder--${category}`;
}
