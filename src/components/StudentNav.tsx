import { Home, ShoppingBasket, Package, Heart } from "lucide-react";
import type { NavItem } from "./MobileShell";

export const studentNav: NavItem[] = [
  { to: "/student", label: "Home", icon: <Home className="size-4" /> },
  { to: "/student/cart", label: "Basket", icon: <ShoppingBasket className="size-4" /> },
  { to: "/student/orders", label: "Orders", icon: <Package className="size-4" /> },
  { to: "/student/favorites", label: "Saved", icon: <Heart className="size-4" /> },
];
