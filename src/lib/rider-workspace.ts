import { useEffect, useMemo, useState } from "react";
import { backendRequest } from "@/lib/backend";

type ProfileRow = {
  id: string;
  user_id: string;
  display_name: string | null;
  email: string | null;
  phone: string | null;
  location: string | null;
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
};

export type RiderProfileEdit = {
  name: string;
  phone: string;
  email: string;
  base: string;
};

type ParsedLineItem = {
  name: string;
  qty: number;
  unit: string;
  price: number;
  shop?: string;
};

type OrderRow = {
  id: string;
  order_code: string;
  placed_at: string;
  status: string;
  total: number;
  subtotal: number;
  delivery_fee: number;
  service_fee: number;
  items_count: number;
  hall: string;
  room: string;
  line_items: ParsedLineItem[];
  shop_name: string;
  shop_id: string | null;
  shop_names: string[];
  delivery_address: string;
  rider_name: string | null;
  rider_phone: string | null;
  rider_user_id: string | null;
  bundle: boolean;
  note: string | null;
  payment_method: string;
  user_id: string;
  customer_name: string;
  customer_phone: string | null;
  shop_phone: string | null;
  shop_area: string;
  shop_location: string;
};

export type RiderOrder = OrderRow;

export type RiderSummary = {
  availableToWithdraw: number;
  weekEarnings: number;
  todayEarnings: number;
  completedTrips: number;
  weekTrips: number;
  avgPayout: number;
  activeTrips: number;
};

type RiderPayload = {
  profile: ProfileRow | null;
  orders: RiderOrder[];
  summary: RiderSummary;
  activeOrder: RiderOrder | null;
};

type RiderOrderPayload = {
  order: RiderOrder | null;
};

const profileCache = new Map<string, ProfileRow>();
const riderCache = new Map<string, RiderPayload>();

function storeRiderPayload(next: RiderPayload) {
  riderCache.clear();
  riderCache.set("current", next);
  return next;
}

function getCachedRiderOrder(orderId: string) {
  const cached = riderCache.get("current");
  if (!cached) return null;
  const fromList = cached.orders.find((order) => order.id === orderId) ?? null;
  if (fromList) return fromList;
  if (cached.activeOrder?.id === orderId) return cached.activeOrder;
  return null;
}

function makeEmptyProfile(userId: string, email: string | null): ProfileRow {
  return {
    id: "",
    user_id: userId,
    display_name: null,
    email,
    phone: null,
    location: null,
    avatar_url: null,
    created_at: "",
    updated_at: "",
  };
}

export function riderProfileToEdit(profile: ProfileRow | null): RiderProfileEdit {
  return {
    name: profile?.display_name?.trim() || "",
    phone: profile?.phone?.trim() || "",
    email: profile?.email?.trim() || "",
    base: profile?.location?.trim() || "",
  };
}

export function useRiderProfile() {
  const [userId, setUserId] = useState<string | null>(null);
  const [profile, setProfile] = useState<ProfileRow | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      setLoading(true);
      const payload = await backendRequest<{ profile: ProfileRow | null }>("/rider/profile");
      if (cancelled) return;
      if (!payload.profile) {
        setProfile(null);
        setLoading(false);
        return;
      }
      profileCache.set(payload.profile.user_id, payload.profile);
      setUserId(payload.profile.user_id);
      setProfile(payload.profile);
      setLoading(false);
    })().catch(() => {
      if (!cancelled) setLoading(false);
    });

    return () => {
      cancelled = true;
    };
  }, []);

  async function saveProfile(next: RiderProfileEdit) {
    const payload = await backendRequest<{ profile: ProfileRow | null }>("/rider/profile", {
      method: "PUT",
      body: next,
    });
    const profileRow = payload.profile;
    if (!profileRow) throw new Error("Could not save profile");
    profileCache.set(profileRow.user_id, profileRow);
    setUserId(profileRow.user_id);
    setProfile(profileRow);
    return profileRow;
  }

  return { userId, profile, setProfile, loading, saveProfile };
}

export function useRiderOrders() {
  const [payload, setPayload] = useState<RiderPayload | null>(null);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      setLoading(true);
      const next = await backendRequest<RiderPayload>("/rider/orders");
      if (cancelled) return;
      setPayload(storeRiderPayload(next));
      setLoading(false);
      setSyncing(false);
    })().catch(() => {
      if (!cancelled) setLoading(false);
    });

    return () => {
      cancelled = true;
    };
  }, []);

  async function refresh() {
    setSyncing(true);
    const next = await backendRequest<RiderPayload>("/rider/orders");
    setPayload(storeRiderPayload(next));
    setSyncing(false);
    return next;
  }

  async function acceptOrder(orderId: string) {
    const next = await backendRequest<RiderPayload>(`/rider/orders/${encodeURIComponent(orderId)}/accept`, {
      method: "PUT",
      body: {},
    });
    setPayload(storeRiderPayload(next));
    return next;
  }

  async function advanceOrder(orderId: string) {
    setSyncing(true);
    try {
      const next = await backendRequest<RiderPayload>(`/rider/orders/${encodeURIComponent(orderId)}/next-step`, {
        method: "PUT",
        body: {},
      });
      setPayload(storeRiderPayload(next));
      return next;
    } finally {
      setSyncing(false);
    }
  }

  const orders = payload?.orders ?? [];
  const assignedOrders = useMemo(() => orders.filter((order) => order.rider_user_id && String(order.status) !== "Delivered"), [orders]);
  const availableOrders = useMemo(
    () => orders.filter((order) => !order.rider_user_id && String(order.status) === "Vendor confirmed"),
    [orders],
  );
  const activeOrder = payload?.activeOrder ?? assignedOrders[0] ?? null;
  const summary = payload?.summary ?? {
    availableToWithdraw: 0,
    weekEarnings: 0,
    todayEarnings: 0,
    completedTrips: 0,
    weekTrips: 0,
    avgPayout: 0,
    activeTrips: 0,
  };

  return {
    orders,
    assignedOrders,
    availableOrders,
    activeOrder,
    summary,
    loading,
    syncing,
    refresh,
    acceptOrder,
    advanceOrder,
  };
}

export function useRiderOrder(orderId: string | undefined) {
  const [order, setOrder] = useState<RiderOrder | null>(() => (orderId ? getCachedRiderOrder(orderId) : null));
  const [loading, setLoading] = useState(Boolean(orderId));
  const [syncing, setSyncing] = useState(false);

  useEffect(() => {
    if (!orderId) {
      setOrder(null);
      setLoading(false);
      setSyncing(false);
      return;
    }

    let cancelled = false;

    (async () => {
      setLoading(true);
      const payload = await backendRequest<RiderOrderPayload>(`/rider/orders/${encodeURIComponent(orderId)}`);
      if (cancelled) return;
      setOrder(payload.order ?? null);
      setLoading(false);
      setSyncing(false);
    })().catch(() => {
      if (!cancelled) {
        setOrder((current) => current ?? getCachedRiderOrder(orderId));
        setLoading(false);
        setSyncing(false);
      }
    });

    return () => {
      cancelled = true;
    };
  }, [orderId]);

  async function refresh() {
    if (!orderId) return null;
    setSyncing(true);
    try {
      const payload = await backendRequest<RiderOrderPayload>(`/rider/orders/${encodeURIComponent(orderId)}`);
      setOrder(payload.order ?? null);
      return payload.order;
    } finally {
      setSyncing(false);
    }
  }

  async function runAction(path: string) {
    if (!orderId) return null;
    setSyncing(true);
    try {
      const workspace = await backendRequest<RiderPayload>(`/rider/orders/${encodeURIComponent(orderId)}/${path}`, {
        method: "PUT",
        body: {},
      });
      storeRiderPayload(workspace);
      const nextOrder = workspace.orders.find((item) => item.id === orderId) ?? (workspace.activeOrder?.id === orderId ? workspace.activeOrder : null);
      const targetStatus =
        path === "picked-up"
          ? "Picked up"
          : path === "contacted"
            ? "Student contacted"
            : "Delivered";
      setOrder((current) => nextOrder ?? (current ? { ...current, status: targetStatus } : null));
      return nextOrder ?? null;
    } finally {
      setSyncing(false);
    }
  }

  return {
    order,
    loading,
    syncing,
    refresh,
    markPickedUp: () => runAction("picked-up"),
    markStudentContacted: () => runAction("contacted"),
    markDelivered: () => runAction("delivered"),
  };
}

export function useRiderHistory() {
  const [orders, setOrders] = useState<RiderOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      const payload = await backendRequest<{ orders: RiderOrder[] }>("/rider/orders/history");
      if (cancelled) return;
      setOrders((payload.orders ?? []).map((o) => ({ ...o })));
      setLoading(false);
    })().catch(() => {
      if (!cancelled) setLoading(false);
    });

    return () => {
      cancelled = true;
    };
  }, []);

  async function refresh() {
    setSyncing(true);
    try {
      const payload = await backendRequest<{ orders: RiderOrder[] }>("/rider/orders/history");
      setOrders((payload.orders ?? []).map((o) => ({ ...o })));
      return payload.orders ?? [];
    } finally {
      setSyncing(false);
    }
  }

  return { orders, loading, syncing, refresh };
}

export function buildRiderStatementEntries(orders: RiderOrder[]) {
  return orders
    .filter((order) => String(order.status) === "Delivered")
    .map((order) => {
      const payout = Math.round(Number(order.delivery_fee || 0) * 0.85);
      return {
        id: order.id,
        label: `Trip payout · ${order.shop_name}`,
        ref: order.order_code,
        amount: payout,
        date: order.placed_at,
      };
    })
    .sort((a, b) => +new Date(b.date) - +new Date(a.date));
}
