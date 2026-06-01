import { useEffect, useState } from "react";
import type { Product, Measurement, Shop } from "./mock";

export type CartLine = {
  shopId: string;
  shopName: string;
  shopEmoji: string;
  productId: string;
  productName: string;
  emoji: string;
  measurement: Measurement;
  qty: number;
};

type CartState = { lines: CartLine[] };

let state: CartState = { lines: [] };
const listeners = new Set<() => void>();

function persist() {
  if (typeof window === "undefined") return;
  localStorage.setItem("cb-cart", JSON.stringify(state));
}
function load() {
  if (typeof window === "undefined") return;
  try {
    const raw = localStorage.getItem("cb-cart");
    if (raw) {
      const parsed = JSON.parse(raw);
      // Migrate old shape { shopId, lines }
      state = { lines: Array.isArray(parsed?.lines) ? parsed.lines : [] };
      // Drop lines missing the new shopName field
      state.lines = state.lines.filter((l) => l && l.shopId && l.productId);
    }
  } catch {}
}
load();

const emit = () => listeners.forEach((l) => l());

export const cart = {
  get: () => state,
  add(shop: Shop, p: Product, m: Measurement, qty = 1) {
    const existing = state.lines.find(
      (l) =>
        l.shopId === shop.id &&
        l.productId === p.id &&
        l.measurement.id === m.id,
    );
    if (existing) existing.qty += qty;
    else
      state.lines.push({
        shopId: shop.id,
        shopName: shop.name,
        shopEmoji: shop.emoji,
        productId: p.id,
        productName: p.name,
        emoji: p.emoji,
        measurement: m,
        qty,
      });
    state = { lines: [...state.lines] };
    persist();
    emit();
  },
  setQty(shopId: string, productId: string, measurementId: string, qty: number) {
    state.lines = state.lines
      .map((l) =>
        l.shopId === shopId &&
        l.productId === productId &&
        l.measurement.id === measurementId
          ? { ...l, qty }
          : l,
      )
      .filter((l) => l.qty > 0);
    state = { ...state };
    persist();
    emit();
  },
  clear() {
    state = { lines: [] };
    persist();
    emit();
  },
  subscribe(fn: () => void) {
    listeners.add(fn);
    return () => listeners.delete(fn);
  },
};

export function useCart() {
  const [snap, setSnap] = useState(state);
  useEffect(() => {
    const unsub = cart.subscribe(() => setSnap({ ...cart.get() }));
    return () => {
      unsub();
    };
  }, []);
  return snap;
}

export const cartTotal = (lines: CartLine[]) =>
  lines.reduce((s, l) => s + l.measurement.price * l.qty, 0);

export function groupByShop(lines: CartLine[]) {
  const map = new Map<string, { shopId: string; shopName: string; shopEmoji: string; lines: CartLine[] }>();
  for (const l of lines) {
    const g = map.get(l.shopId) ?? {
      shopId: l.shopId,
      shopName: l.shopName,
      shopEmoji: l.shopEmoji,
      lines: [],
    };
    g.lines.push(l);
    map.set(l.shopId, g);
  }
  return Array.from(map.values());
}

export const isBundle = (lines: CartLine[]) =>
  new Set(lines.map((l) => l.shopId)).size > 1;
