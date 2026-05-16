import { LayoutGrid, Package, Inbox, BarChart3 } from "lucide-react";
import type { NavItem } from "./MobileShell";
export const vendorNav: NavItem[] = [
  { to: "/vendor", label: "Today", icon: <LayoutGrid className="size-4" /> },
  { to: "/vendor/products", label: "Products", icon: <Package className="size-4" /> },
  { to: "/vendor/orders", label: "Orders", icon: <Inbox className="size-4" /> },
  { to: "/vendor/analytics", label: "Sales", icon: <BarChart3 className="size-4" /> },
];
