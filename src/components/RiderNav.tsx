import { Compass, ListChecks, Wallet, User } from "lucide-react";
import type { NavItem } from "./MobileShell";
export const riderNav: NavItem[] = [
  { to: "/rider", label: "Go", icon: <Compass className="size-4" /> },
  { to: "/rider/trips", label: "Trips", icon: <ListChecks className="size-4" /> },
  { to: "/rider/earnings", label: "Wallet", icon: <Wallet className="size-4" /> },
  { to: "/rider/profile", label: "You", icon: <User className="size-4" /> },
];
