import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export type VendorMeasurement = {
  id: string;
  label: string;
  price: number;
};

export type VendorProduct = {
  id: string;
  name: string;
  emoji: string;
  category: string;
  description: string;
  available: boolean;
  measurements: VendorMeasurement[];
  photos: string[];
};

export type VendorShop = {
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
  products: VendorProduct[];
};

type ShopRow = {
  id: string;
  owner_user_id: string;
  name: string;
  emoji: string;
  tagline: string;
  area: string;
  location: string;
  phone: string | null;
  email: string | null;
  hours: string | null;
  hue: string | null;
  is_open: boolean;
  rating: number;
  reviews_count: number;
  shop_products?: Array<{
    id: string;
    name: string;
    emoji: string;
    category: string;
    description: string;
    available: boolean;
    photos: string[];
    sort_order: number;
    product_measurements?: Array<{
      id: string;
      label: string;
      price: number;
      sort_order: number;
    }>;
  }>;
};

const shopCache = new Map<string, VendorShop>();
let lastVendorUserId: string | null = null;

const SHOP_SELECT =
  "id, owner_user_id, name, emoji, tagline, area, location, phone, email, hours, hue, is_open, rating, reviews_count, shop_products(id, name, emoji, category, description, available, photos, sort_order, product_measurements(id, label, price, sort_order))";

function emptyShop(userId: string, email: string | null): VendorShop {
  return {
    id: "",
    owner_user_id: userId,
    name: "",
    emoji: "🏪",
    tagline: "",
    area: "",
    location: "",
    phone: "",
    email: email ?? "",
    hours: "",
    hue: "from-[oklch(0.94_0.06_148)] to-[oklch(0.95_0.05_65)]",
    is_open: true,
    rating: 0,
    reviews_count: 0,
    products: [],
  };
}

function mapShop(row: ShopRow): VendorShop {
  const products = [...(row.shop_products ?? [])]
    .sort((a, b) => a.sort_order - b.sort_order)
    .map((product) => ({
      id: product.id,
      name: product.name,
      emoji: product.emoji,
      category: product.category,
      description: product.description,
      available: product.available,
      photos: product.photos ?? [],
      measurements: [...(product.product_measurements ?? [])]
        .sort((a, b) => a.sort_order - b.sort_order)
        .map((m) => ({ id: m.id, label: m.label, price: m.price })),
    }));

  return {
    id: row.id,
    owner_user_id: row.owner_user_id,
    name: row.name,
    emoji: row.emoji,
    tagline: row.tagline,
    area: row.area,
    location: row.location,
    phone: row.phone ?? "",
    email: row.email ?? "",
    hours: row.hours ?? "",
    hue: row.hue ?? "from-[oklch(0.94_0.06_148)] to-[oklch(0.95_0.05_65)]",
    is_open: row.is_open,
    rating: row.rating,
    reviews_count: row.reviews_count,
    products,
  };
}

export function useVendorShop() {
  const [userId, setUserId] = useState<string | null>(lastVendorUserId);
  const [email, setEmail] = useState<string | null>(null);
  const [shop, setShop] = useState<VendorShop | null>(() =>
    lastVendorUserId ? shopCache.get(lastVendorUserId) ?? null : null,
  );
  const [loading, setLoading] = useState(() => !(lastVendorUserId && shopCache.has(lastVendorUserId)));
  const [syncing, setSyncing] = useState(false);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      const hasCached = Boolean(lastVendorUserId && shopCache.has(lastVendorUserId));
      if (!hasCached) setLoading(true);
      const { data: auth, error } = await supabase.auth.getUser();

      if (cancelled) return;

      if (error || !auth.user) {
        setUserId(null);
        lastVendorUserId = null;
        setEmail(null);
        setShop(null);
        setLoading(false);
        return;
      }

      setUserId(auth.user.id);
      lastVendorUserId = auth.user.id;
      setEmail(auth.user.email ?? null);

      const cached = shopCache.get(auth.user.id) ?? null;
      if (cached) {
        setShop(cached);
        setLoading(false);
        setSyncing(true);
      } else {
        setLoading(true);
      }

      const { data, error: shopError } = await supabase
        .from("shops")
        .select(SHOP_SELECT)
        .eq("owner_user_id", auth.user.id)
        .maybeSingle<ShopRow>();

      if (cancelled) return;

      if (shopError) {
        setShop(cached);
      } else if (data) {
        const next = mapShop(data);
        shopCache.set(auth.user.id, next);
        setShop(next);
      } else {
        const next = emptyShop(auth.user.id, auth.user.email ?? null);
        shopCache.set(auth.user.id, next);
        setShop(next);
      }

      setLoading(false);
      setSyncing(false);
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  async function refresh() {
    if (!userId) return null;
    setSyncing(true);
    const { data } = await supabase
      .from("shops")
      .select(SHOP_SELECT)
      .eq("owner_user_id", userId)
      .maybeSingle<ShopRow>();

    const next = data ? mapShop(data) : emptyShop(userId, email);
    shopCache.set(userId, next);
    setShop(next);
    setSyncing(false);
    return next;
  }

  function mergeProductIntoShop(current: VendorShop, nextProduct: VendorProduct) {
    const existingIndex = current.products.findIndex((p) => p.id === nextProduct.id);
    const products = [...current.products];
    if (existingIndex >= 0) products[existingIndex] = nextProduct;
    else products.push(nextProduct);
    return { ...current, products };
  }

function toUuid(value: string | undefined | null) {
  if (value && /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value)) {
    return value;
  }
  return crypto.randomUUID();
}

  async function saveShop(next: Partial<VendorShop>) {
    if (!userId) throw new Error("Not signed in");

    const payload = {
      owner_user_id: userId,
      name: next.name ?? shop?.name ?? "",
      emoji: next.emoji ?? shop?.emoji ?? "🏪",
      tagline: next.tagline ?? shop?.tagline ?? "",
      area: next.area ?? shop?.area ?? "",
      location: next.location ?? shop?.location ?? "",
      phone: next.phone ?? shop?.phone ?? "",
      email: next.email ?? shop?.email ?? email ?? "",
      hours: next.hours ?? shop?.hours ?? "",
      hue: next.hue ?? shop?.hue ?? "from-[oklch(0.94_0.06_148)] to-[oklch(0.95_0.05_65)]",
      is_open: next.is_open ?? shop?.is_open ?? true,
      rating: next.rating ?? shop?.rating ?? 0,
      reviews_count: next.reviews_count ?? shop?.reviews_count ?? 0,
    };

    const { data, error } = await supabase
      .from("shops")
      .upsert(
        shop?.id
          ? { ...payload, id: shop.id }
          : payload,
        { onConflict: "owner_user_id" },
      )
      .select(
      SHOP_SELECT,
      )
      .maybeSingle<ShopRow>();

    if (error) throw error;
    const nextShop = data ? mapShop(data) : null;
    if (nextShop) {
      shopCache.set(nextShop.owner_user_id, nextShop);
      setShop(nextShop);
    }
    return nextShop;
  }

  async function saveProduct(product: VendorProduct) {
    if (!userId) throw new Error("Not signed in");
    const currentShop = shop ?? (await refresh());
    if (!currentShop || !currentShop.id) {
      throw new Error("Create your shop profile first");
    }

    const productId = product.id?.trim() || crypto.randomUUID();
    const name = product.name.trim();
    const category = product.category.trim();
    const description = product.description.trim();
    const photos = product.photos.filter(Boolean);
    const { error: productError } = await supabase.from("shop_products").upsert({
      id: productId,
      shop_id: currentShop.id,
      name,
      emoji: product.emoji,
      category,
      description,
      available: product.available,
      photos,
      sort_order: 0,
    });

    if (productError) throw new Error(`Saving product failed: ${productError.message}`);

    const { error: deleteError } = await supabase
      .from("product_measurements")
      .delete()
      .eq("product_id", productId);

    if (deleteError) throw new Error(`Saving product failed: ${deleteError.message}`);

    if (product.measurements.length > 0) {
      const measurements = product.measurements.map((m, index) => ({
        id: toUuid(m.id),
        product_id: productId,
        label: m.label.trim(),
        price: Math.max(0, Math.round(Number(m.price) || 0)),
        sort_order: index,
      }));

      const { error: measurementsError } = await supabase.from("product_measurements").insert(measurements);
      if (measurementsError) throw new Error(`Saving product failed: ${measurementsError.message}`);
    }

    const optimisticProduct: VendorProduct = {
      ...product,
      id: productId,
      measurements: product.measurements.map((m, index) => ({
        ...m,
        id: toUuid(m.id),
        price: Number(m.price),
      })),
    };
    setShop((current) => {
      if (!current) return current;
      const next = mergeProductIntoShop(current, optimisticProduct);
      if (userId) shopCache.set(userId, next);
      return next;
    });

    void refresh().catch(() => {});
  }

  async function deleteProduct(productId: string) {
    const { error } = await supabase.from("shop_products").delete().eq("id", productId);
    if (error) throw new Error(`Deleting product failed: ${error.message}`);
    setShop((current) =>
      current
        ? (() => {
            const next = { ...current, products: current.products.filter((product) => product.id !== productId) };
            if (userId) shopCache.set(userId, next);
            return next;
          })()
        : current,
    );
    void refresh().catch(() => {});
  }

  return {
    userId,
    shop,
    setShop,
    loading,
    saveShop,
    saveProduct,
    deleteProduct,
    refresh,
    syncing,
  };
}
