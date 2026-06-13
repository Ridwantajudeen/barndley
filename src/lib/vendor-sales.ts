import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";

type OrderRow = Tables<"orders">;

export type VendorSalesLineItem = {
  name: string;
  qty: number;
  unit: string;
  price: number;
  shop?: string;
};

export type VendorOrder = Omit<OrderRow, "line_items"> & {
  line_items: VendorSalesLineItem[];
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

const orderCache = new Map<string, VendorOrder[]>();

function parseLineItems(value: OrderRow["line_items"]): VendorSalesLineItem[] {
  if (!Array.isArray(value)) return [];
  return value
    .map((item) => {
      if (!item || typeof item !== "object") return null;
      const candidate = item as Record<string, unknown>;
      const name = typeof candidate.name === "string" ? candidate.name : "";
      if (!name) return null;
      return {
        name,
        qty: Number(candidate.qty ?? 0),
        unit: typeof candidate.unit === "string" ? candidate.unit : "",
        price: Number(candidate.price ?? 0),
        shop: typeof candidate.shop === "string" ? candidate.shop : undefined,
      };
    })
    .filter((item): item is VendorSalesLineItem => Boolean(item));
}

function mapOrder(row: OrderRow): VendorOrder {
  return {
    ...row,
    line_items: parseLineItems(row.line_items),
  };
}

function isSameLocalDay(left: string, right: Date) {
  const a = new Date(left);
  return (
    a.getFullYear() === right.getFullYear() &&
    a.getMonth() === right.getMonth() &&
    a.getDate() === right.getDate()
  );
}

function startOfLocalDay(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

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
      const { data, error } = await supabase
        .from("orders")
        .select(
          "id, order_code, placed_at, status, total, subtotal, delivery_fee, items_count, hall, room, line_items, shop_name, delivery_address, rider_name, rider_phone, bundle, note",
        )
        .eq("shop_id", shopId)
        .order("placed_at", { ascending: false });

      if (cancelled) return;

      if (error) {
        setLoading(false);
        setRefreshing(false);
        return;
      }

      const next = (data ?? []).map(mapOrder);
      orderCache.set(shopId, next);
      setOrders(next);
      setLoading(false);
      setRefreshing(false);
    })();

    return () => {
      cancelled = true;
    };
  }, [shopId]);

  const summary = useMemo<VendorSalesSummary>(() => {
    const now = new Date();
    const weekStart = startOfLocalDay(now);
    weekStart.setDate(weekStart.getDate() - 6);

    const revenue = orders.reduce((sum, order) => sum + Number(order.total || 0), 0);
    const availableToWithdraw = orders
      .filter((order) => String(order.status) === "Delivered")
      .reduce((sum, order) => sum + Number(order.total || 0), 0);
    const ordersToday = orders.filter((order) => isSameLocalDay(order.placed_at, now)).length;
    const avgBasket = orders.length ? revenue / orders.length : 0;

    const dayTotals = Array.from({ length: 7 }, (_, index) => {
      const date = new Date(weekStart);
      date.setDate(weekStart.getDate() + index);
      const total = orders
        .filter((order) => {
          const placed = new Date(order.placed_at);
          return (
            placed.getFullYear() === date.getFullYear() &&
            placed.getMonth() === date.getMonth() &&
            placed.getDate() === date.getDate()
          );
        })
        .reduce((sum, order) => sum + Number(order.total || 0), 0);
      return total;
    });

    const productTotals = new Map<string, number>();
    for (const order of orders) {
      for (const item of order.line_items) {
        productTotals.set(item.name, (productTotals.get(item.name) ?? 0) + Number(item.qty || 0));
      }
    }

    const topProducts = [...productTotals.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, 4)
      .map(([name, sold]) => ({ name, sold }));

    return {
      revenue,
      availableToWithdraw,
      ordersToday,
      avgBasket,
      weekRevenue: dayTotals,
      topProducts,
      recentOrders: orders.slice(0, 4),
    };
  }, [orders]);

  async function refresh() {
    if (!shopId) return;
    setRefreshing(true);
    const { data, error } = await supabase
      .from("orders")
      .select(
        "id, order_code, placed_at, status, total, subtotal, delivery_fee, items_count, hall, room, line_items, shop_name, delivery_address, rider_name, rider_phone, bundle, note",
      )
      .eq("shop_id", shopId)
      .order("placed_at", { ascending: false });

    if (!error) {
      const next = (data ?? []).map(mapOrder);
      orderCache.set(shopId, next);
      setOrders(next);
    }
    setRefreshing(false);
  }

  return {
    orders,
    summary,
    loading,
    refreshing,
    refresh,
  };
}
