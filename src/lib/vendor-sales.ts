import { useEffect, useMemo, useState } from "react";
import { backendRequest } from "@/lib/backend";

export type VendorSalesLineItem = {
  name: string;
  qty: number;
  unit: string;
  price: number;
  shop?: string;
};

export type VendorOrder = {
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
  line_items: VendorSalesLineItem[];
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
};

export type VendorSalesSummary = {
  revenue: number;
  availableToWithdraw: number;
  ordersToday: number;
  avgBasket: number;
  weekRevenue: number[];
  topProducts: Array<{ name: string; sold: number }>;
  recentOrders: VendorOrder[];
};

type VendorSalesPayload = {
  shop: unknown;
  orders: VendorOrder[];
  summary: VendorSalesSummary;
};

const orderCache = new Map<string, VendorOrder[]>();

export function useVendorSales(shopId: string | null | undefined) {
  const [orders, setOrders] = useState<VendorOrder[]>(() => (shopId ? orderCache.get(shopId) ?? [] : []));
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    let cancelled = false;

    if (!shopId) {
      setOrders([]);
      setLoading(false);
      setRefreshing(false);
      return;
    }

    const cached = orderCache.get(shopId);
    if (cached) {
      setOrders(cached);
      setLoading(false);
      setRefreshing(true);
    } else {
      setLoading(true);
      setRefreshing(false);
    }

    (async () => {
      const payload = await backendRequest<VendorSalesPayload>("/vendor/orders");
      if (cancelled) return;
      const next = payload.orders ?? [];
      orderCache.set(shopId, next);
      setOrders(next);
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
  }, [shopId]);

  const summary = useMemo<VendorSalesSummary>(() => {
    const now = new Date();
    const weekStart = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 6);

    const revenue = orders.reduce((sum, order) => sum + Number(order.total || 0), 0);
    const availableToWithdraw = orders
      .filter((order) => String(order.status) === "Delivered")
      .reduce((sum, order) => sum + Number(order.total || 0), 0);
    const ordersToday = orders.filter((order) => new Date(order.placed_at).toDateString() === now.toDateString()).length;
    const avgBasket = orders.length ? revenue / orders.length : 0;

    const weekRevenue = Array.from({ length: 7 }, (_, index) => {
      const day = new Date(weekStart);
      day.setDate(weekStart.getDate() + index);
      return orders
        .filter((order) => new Date(order.placed_at).toDateString() === day.toDateString())
        .reduce((sum, order) => sum + Number(order.total || 0), 0);
    });

    const productTotals = new Map<string, number>();
    for (const order of orders) {
      for (const item of order.line_items) {
        productTotals.set(item.name, (productTotals.get(item.name) ?? 0) + Number(item.qty || 0));
      }
    }

    return {
      revenue,
      availableToWithdraw,
      ordersToday,
      avgBasket,
      weekRevenue,
      topProducts: [...productTotals.entries()].sort((a, b) => b[1] - a[1]).slice(0, 4).map(([name, sold]) => ({ name, sold })),
      recentOrders: orders.slice(0, 4),
    };
  }, [orders]);

  async function refresh() {
    if (!shopId) return;
    setRefreshing(true);
    const payload = await backendRequest<VendorSalesPayload>("/vendor/orders");
    const next = payload.orders ?? [];
    orderCache.set(shopId, next);
    setOrders(next);
    setRefreshing(false);
  }

  return { orders, summary, loading, refreshing, refresh };
}

