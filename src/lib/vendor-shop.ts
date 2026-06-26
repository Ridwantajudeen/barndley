import { useEffect, useState } from "react";
import { backendRequest } from "@/lib/backend";
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

const shopCache = new Map<string, VendorShop>();
let lastVendorUserId: string | null = null;

async function getVendorSession() {
  const { data } = await supabase.auth.getSession();
  return data.session?.user ?? null;
}

async function resolveVendorUser() {
  const sessionUser = await getVendorSession();
  if (sessionUser) return sessionUser;

  const { data } = await supabase.auth.getUser();
  return data.user ?? null;
}

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
      const sessionUser = await resolveVendorUser();
      const effectiveUserId = sessionUser?.id ?? lastVendorUserId;
      const effectiveEmail = sessionUser?.email ?? email ?? null;
      if (!cancelled && sessionUser) {
        setUserId(sessionUser.id);
        setEmail(sessionUser.email ?? null);
        lastVendorUserId = sessionUser.id;
      }

      const hasCached = Boolean(lastVendorUserId && shopCache.has(lastVendorUserId));
      if (!hasCached) setLoading(true);
      const payload = await backendRequest<{ shop: VendorShop | null }>("/vendor/shop");
      if (cancelled) return;

      const next = payload.shop ?? null;
      if (next) {
        setUserId(next.owner_user_id);
        lastVendorUserId = next.owner_user_id;
        setEmail(next.email || null);
        shopCache.set(next.owner_user_id, next);
        setShop(next);
      } else {
        if (effectiveUserId) {
          shopCache.delete(effectiveUserId);
        }
        setShop(null);
      }

      setLoading(false);
      setSyncing(false);
    })().catch(() => {
      if (!cancelled) {
        setLoading(false);
        setSyncing(false);
      }
    });

    return () => {
      cancelled = true;
    };
  }, []);

  async function refresh() {
    const sessionUser = userId ? null : await resolveVendorUser();
    const effectiveUserId = userId ?? sessionUser?.id ?? lastVendorUserId;
    const effectiveEmail = email ?? sessionUser?.email ?? null;
    if (!effectiveUserId) return null;
    if (sessionUser) {
      setUserId(sessionUser.id);
      setEmail(sessionUser.email ?? null);
      lastVendorUserId = sessionUser.id;
    }
    setSyncing(true);
    const payload = await backendRequest<{ shop: VendorShop | null }>("/vendor/shop");
    const next = payload.shop ?? null;
    if (next) {
      shopCache.set(effectiveUserId, next);
    } else {
      shopCache.delete(effectiveUserId);
    }
    setShop(next);
    setSyncing(false);
    return next;
  }

  async function saveShop(next: Partial<VendorShop>) {
    const sessionUser = userId ? null : await resolveVendorUser();
    const effectiveUserId = userId ?? sessionUser?.id ?? null;
    const effectiveEmail = email ?? sessionUser?.email ?? null;
    if (!effectiveUserId) throw new Error("Not signed in");
    if (sessionUser) {
      setUserId(sessionUser.id);
      setEmail(sessionUser.email ?? null);
      lastVendorUserId = sessionUser.id;
    }
    setSyncing(true);
    const payload = await backendRequest<{ shop: VendorShop | null }>("/vendor/shop", {
      method: "PUT",
      body: next,
    });
    const nextShop = payload.shop ?? null;
    if (nextShop) {
      shopCache.set(nextShop.owner_user_id, nextShop);
      setShop(nextShop);
      setUserId(nextShop.owner_user_id);
      lastVendorUserId = nextShop.owner_user_id;
      setEmail(nextShop.email || null);
    } else if (effectiveEmail && effectiveUserId) {
      shopCache.delete(effectiveUserId);
      setShop(null);
    }
    setSyncing(false);
    return nextShop;
  }

  async function saveProduct(product: VendorProduct) {
    const sessionUser = userId ? null : await resolveVendorUser();
    const effectiveUserId = userId ?? sessionUser?.id ?? null;
    if (!effectiveUserId) throw new Error("Not signed in");
    if (sessionUser) {
      setUserId(sessionUser.id);
      setEmail(sessionUser.email ?? null);
      lastVendorUserId = sessionUser.id;
    }
    const payload = await backendRequest<{ shop: VendorShop | null }>("/vendor/products", {
      method: "POST",
      body: { product },
    });
    const nextShop = payload.shop ?? null;
    if (nextShop) {
      shopCache.set(nextShop.owner_user_id, nextShop);
      setShop(nextShop);
      setUserId(nextShop.owner_user_id);
      lastVendorUserId = nextShop.owner_user_id;
      setEmail(nextShop.email || null);
    }
    return nextShop;
  }

  async function deleteProduct(productId: string) {
    const sessionUser = userId ? null : await resolveVendorUser();
    const effectiveUserId = userId ?? sessionUser?.id ?? null;
    if (!effectiveUserId) throw new Error("Not signed in");
    if (sessionUser) {
      setUserId(sessionUser.id);
      setEmail(sessionUser.email ?? null);
      lastVendorUserId = sessionUser.id;
    }
    const payload = await backendRequest<{ shop: VendorShop | null }>(`/vendor/products/${encodeURIComponent(productId)}`, {
      method: "DELETE",
    });
    const nextShop = payload.shop ?? null;
    if (nextShop) {
      shopCache.set(nextShop.owner_user_id, nextShop);
      setShop(nextShop);
      setUserId(nextShop.owner_user_id);
      lastVendorUserId = nextShop.owner_user_id;
      setEmail(nextShop.email || null);
    } else if (effectiveUserId) {
      shopCache.delete(effectiveUserId);
      setShop(null);
    }
    return nextShop;
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
