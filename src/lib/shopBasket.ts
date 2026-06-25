const STORAGE_KEY = 'ac7-basket';

export type BasketItem = {
  productId: string;
  name: string;
  price: number;
  sellerId: string;
  sellerName: string;
  quantity: number;
  imageUrl?: string;
  category: string;
};

export function readBasket(): BasketItem[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as BasketItem[]) : [];
  } catch {
    return [];
  }
}

export function writeBasket(items: BasketItem[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  window.dispatchEvent(new Event('ac7-basket-updated'));
}

export function addToBasket(item: Omit<BasketItem, 'quantity'>, qty = 1) {
  const items = readBasket();
  const existing = items.find((i) => i.productId === item.productId);
  if (existing) {
    existing.quantity += qty;
  } else {
    items.push({ ...item, quantity: qty });
  }
  writeBasket(items);
}

export function removeFromBasket(productId: string) {
  writeBasket(readBasket().filter((i) => i.productId !== productId));
}

export function clearBasket() {
  writeBasket([]);
}

export function basketTotal(items: BasketItem[]) {
  return items.reduce((sum, i) => sum + i.price * i.quantity, 0);
}

export function basketBySeller(items: BasketItem[]) {
  const map = new Map<string, { sellerName: string; items: BasketItem[] }>();
  for (const item of items) {
    const key = item.sellerId || 'unknown';
    const group = map.get(key) ?? { sellerName: item.sellerName || 'Seller', items: [] };
    group.items.push(item);
    map.set(key, group);
  }
  return Array.from(map.entries());
}
