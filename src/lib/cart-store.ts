import { useEffect, useState, useSyncExternalStore } from "react";
import type { Product, Measurement, Shop } from "./mock";

export type CartLine = {
  shopId: string;
  productId: string;
  productName: string;
  emoji: string;
  measurement: Measurement;
  qty: number;
};

type CartState = { shopId: string | null; lines: CartLine[] };

let state: CartState = { shopId: null, lines: [] };
const listeners = new Set<() => void>();

function persist() {
  if (typeof window === "undefined") return;
  localStorage.setItem("cb-cart", JSON.stringify(state));
}
function load() {
  if (typeof window === "undefined") return;
  try {
    const raw = localStorage.getItem("cb-cart");
    if (raw) state = JSON.parse(raw);
  } catch {}
}
load();

const emit = () => listeners.forEach((l) => l());

export const cart = {
  get: () => state,
  add(shop: Shop, p: Product, m: Measurement, qty = 1) {
    if (state.shopId && state.shopId !== shop.id) {
      // Different shop — confirm replace
      const ok =
        typeof window === "undefined"
          ? true
          : confirm(
              `Your cart has items from another shop. Replace with items from ${shop.name}?`,
            );
      if (!ok) return;
      state = { shopId: shop.id, lines: [] };
    }
    if (!state.shopId) state.shopId = shop.id;
    const existing = state.lines.find(
      (l) => l.productId === p.id && l.measurement.id === m.id,
    );
    if (existing) existing.qty += qty;
    else
      state.lines.push({
        shopId: shop.id,
        productId: p.id,
        productName: p.name,
        emoji: p.emoji,
        measurement: m,
        qty,
      });
    state = { ...state, lines: [...state.lines] };
    persist();
    emit();
  },
  setQty(productId: string, measurementId: string, qty: number) {
    state.lines = state.lines
      .map((l) =>
        l.productId === productId && l.measurement.id === measurementId
          ? { ...l, qty }
          : l,
      )
      .filter((l) => l.qty > 0);
    if (state.lines.length === 0) state.shopId = null;
    state = { ...state };
    persist();
    emit();
  },
  clear() {
    state = { shopId: null, lines: [] };
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
    return () => { unsub(); };
  }, []);
  return snap;
}

export const cartTotal = (lines: CartLine[]) =>
  lines.reduce((s, l) => s + l.measurement.price * l.qty, 0);
