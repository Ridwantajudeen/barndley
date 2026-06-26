import { useEffect, useMemo, useState } from "react";
import { backendRequest } from "@/lib/backend";

export type StudentOrderLineItem = {
  name: string;
  qty: number;
  unit: string;
  price: number;
  shop?: string;
};

export type StudentOrder = {
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
  line_items: StudentOrderLineItem[];
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
  shop_phone: string | null;
  shop_area: string;
  shop_location: string;
};

type StudentOrdersPayload = {
  orders: StudentOrder[];
};

const cache = {
  orders: [] as StudentOrder[],
};
const orderCache = new Map<string, StudentOrder>();

export function useStudentOrders() {
  const [orders, setOrders] = useState<StudentOrder[]>(cache.orders);
  const [loading, setLoading] = useState(cache.orders.length === 0);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      if (cache.orders.length === 0) setLoading(true);
      else setRefreshing(true);

      const payload = await backendRequest<StudentOrdersPayload>("/student/orders");
      if (cancelled) return;

      cache.orders = payload.orders ?? [];
      for (const order of cache.orders) orderCache.set(order.id, order);
      setOrders(cache.orders);
      setLoading(false);
      setRefreshing(false);
    })().catch(() => {
      if (!cancelled) {
        setLoading(false);
        setRefreshing(false);
      }
    });

    return () => {
      cancelled = true;
    };
  }, []);

  async function refresh() {
    setRefreshing(true);
    try {
      const payload = await backendRequest<StudentOrdersPayload>("/student/orders");
      cache.orders = payload.orders ?? [];
      for (const order of cache.orders) orderCache.set(order.id, order);
      setOrders(cache.orders);
      return cache.orders;
    } finally {
      setRefreshing(false);
    }
  }

  const recentOrders = useMemo(() => orders.slice(0, 4), [orders]);

  return { orders, recentOrders, loading, refreshing, refresh };
}

export async function fetchStudentOrder(orderId: string) {
  const cached = orderCache.get(orderId);
  if (cached) return cached;

  const payload = await backendRequest<{ order: StudentOrder | null }>(`/student/orders/${encodeURIComponent(orderId)}`);
  if (!payload.order) return null;
  orderCache.set(payload.order.id, payload.order);
  return payload.order;
}

export function useStudentOrder(orderId: string | undefined) {
  const [order, setOrder] = useState<StudentOrder | null>(orderId ? orderCache.get(orderId) ?? null : null);
  const [loading, setLoading] = useState(Boolean(orderId) && !orderCache.has(orderId ?? ""));
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    if (!orderId) {
      setOrder(null);
      setLoading(false);
      setRefreshing(false);
      return;
    }

    let cancelled = false;
    const cached = orderCache.get(orderId);
    if (cached) {
      setOrder(cached);
      setLoading(false);
    } else {
      setLoading(true);
    }

    (async () => {
      try {
        const next = await fetchStudentOrder(orderId);
        if (cancelled) return;
        setOrder(next);
      } finally {
        if (!cancelled) {
          setLoading(false);
          setRefreshing(false);
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [orderId]);

  async function refresh() {
    if (!orderId) return null;
    setRefreshing(true);
    try {
      const next = await backendRequest<{ order: StudentOrder | null }>(`/student/orders/${encodeURIComponent(orderId)}`);
      if (next.order) {
        orderCache.set(next.order.id, next.order);
        setOrder(next.order);
      } else {
        setOrder(null);
      }
      return next.order;
    } finally {
      setRefreshing(false);
    }
  }

  return { order, loading, refreshing, refresh };
}
