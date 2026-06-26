import { useEffect, useState } from "react";
import { backendRequest } from "@/lib/backend";

export type LiveShopMeasurement = {
  id: string;
  label: string;
  price: number;
};

export type LiveShopProduct = {
  id: string;
  name: string;
  emoji: string;
  category: string;
  description: string;
  available: boolean;
  photos: string[];
  measurements: LiveShopMeasurement[];
};

export type LiveShop = {
  id: string;
  owner_user_id: string;
  name: string;
  emoji: string;
  tagline: string;
  area: string;
  location: string;
  phone: string;
  email: string;
  hours: string;
  hue: string;
  is_open: boolean;
  rating: number;
  reviews_count: number;
  cover_image_url: string | null;
  products: LiveShopProduct[];
};

const cachedById = new Map<string, LiveShop>();
let cachedList: LiveShop[] = [];

function normalize(value: string) {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim();
}

const CATEGORY_BUCKETS = {
  Grains: ["grain", "cereal", "rice", "beans", "garri", "semolina", "semovita", "oatmeal", "maize", "millet", "sorghum"],
  Vegetables: [
    "vegetable",
    "leaf",
    "produce",
    "ugu",
    "spinach",
    "waterleaf",
    "bitter leaf",
    "scent leaf",
    "lettuce",
    "cabbage",
    "okra",
    "carrot",
    "cucumber",
    "tomato",
    "pepper",
    "onion",
    "garlic",
    "ginger",
    "garden egg",
    "avocado",
  ],
  Protein: ["protein", "meat", "fish", "egg", "chicken", "beef", "goat", "turkey", "frozen", "snail", "crab", "prawn", "stockfish"],
  Packaged: ["packaged", "pantry", "breakfast", "dairy", "bread", "snack", "spice", "seasoning", "oil", "condiment", "indomie", "custard", "sardine", "biscuit"],
  Drinks: ["drink", "beverage", "water", "juice", "malt", "energy drink", "tea", "coffee"],
} as const;

export function matchesStudentCategory(shop: LiveShop, category: "All" | "Grains" | "Vegetables" | "Protein" | "Packaged" | "Drinks") {
  if (category === "All") return true;
  const terms = CATEGORY_BUCKETS[category];
  return shop.products.some((product) => {
    const haystack = normalize([product.category, product.name, product.description].join(" "));
    return terms.some((term) => haystack.includes(term));
  });
}

export function matchesShopQuery(shop: LiveShop, query: string) {
  const needle = normalize(query);
  if (!needle) return true;
  const fields = [
    shop.name,
    shop.tagline,
    shop.area,
    shop.location,
    ...shop.products.flatMap((product) => [product.name, product.category, product.description]),
  ].map(normalize);
  return fields.some((field) => field.includes(needle));
}

export function useLiveShops() {
  const [shops, setShops] = useState<LiveShop[]>(cachedList);
  const [loading, setLoading] = useState(cachedList.length === 0);
  const [syncing, setSyncing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      if (cachedList.length === 0) setLoading(true);
      else setSyncing(true);

      const payload = await backendRequest<{ shops: LiveShop[] }>("/shops", { auth: false });
      if (cancelled) return;

      cachedList = payload.shops;
      cachedById.clear();
      for (const shop of payload.shops) cachedById.set(shop.id, shop);
      setShops(payload.shops);
      setError(null);
      setLoading(false);
      setSyncing(false);
    })().catch(() => {
      if (!cancelled) {
        setLoading(false);
        setSyncing(false);
        setError("Could not load shops from the backend.");
      }
    });

    return () => {
      cancelled = true;
    };
  }, []);

  async function refresh() {
    setSyncing(true);
    try {
      const payload = await backendRequest<{ shops: LiveShop[] }>("/shops", { auth: false });
      cachedList = payload.shops;
      cachedById.clear();
      for (const shop of payload.shops) cachedById.set(shop.id, shop);
      setShops(payload.shops);
      setError(null);
      return payload.shops;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not load shops from the backend.");
      throw err;
    } finally {
      setSyncing(false);
    }
  }

  return { shops, loading, syncing, error, refresh };
}

export async function fetchLiveShopById(id: string) {
  if (cachedById.has(id)) return cachedById.get(id) ?? null;
  const payload = await backendRequest<{ shop: LiveShop | null }>(`/shops/${encodeURIComponent(id)}`, { auth: false });
  if (!payload.shop) return null;
  cachedById.set(payload.shop.id, payload.shop);
  return payload.shop;
}
