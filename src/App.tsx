import { createBrowserRouter } from "react-router-dom";
import { getRegisteredRoute } from "@/router-shim";

import "./routes/index";
import "./routes/auth";
import "./routes/student";
import "./routes/student.index";
import "./routes/student.cart";
import "./routes/student.checkout";
import "./routes/student.favorites";
import "./routes/student.orders";
import "./routes/student.profile";
import "./routes/student.shop.$id";
import "./routes/student.track.$id";
import "./routes/vendor";
import "./routes/vendor.index";
import "./routes/vendor.analytics";
import "./routes/vendor.orders";
import "./routes/vendor.products";
import "./routes/vendor.profile";
import "./routes/vendor.statement";
import "./routes/rider";
import "./routes/rider.index";
import "./routes/rider.earnings";
import "./routes/rider.profile";
import "./routes/rider.statement";
import "./routes/rider.trips";
import "./routes/rider.trips.$id";
import "./routes/shop.$id";

function routeComponent(path: string) {
  const route = getRegisteredRoute(path);
  const Component = route?.component;
  return Component ? <Component /> : <div className="p-6">Route not found.</div>;
}

function routeLoader(path: string) {
  return getRegisteredRoute(path)?.loader;
}

function RootFallback() {
  return (
    <div className="min-h-screen flex items-center justify-center p-6 text-center">
      <div>
        <h1 className="font-display text-2xl">Page not found</h1>
        <p className="mt-2 text-sm text-foreground/60">The page you opened does not exist.</p>
        <a href="/" className="mt-4 inline-flex rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground">
          Go home
        </a>
      </div>
    </div>
  );
}

export const router = createBrowserRouter([
  { path: "/", element: routeComponent("/"), errorElement: <RootFallback /> },
  { path: "/auth", element: routeComponent("/auth") },
  {
    path: "/student",
    element: routeComponent("/student"),
    children: [
      { index: true, element: routeComponent("/student/") },
      { path: "cart", element: routeComponent("/student/cart") },
      { path: "checkout", element: routeComponent("/student/checkout") },
      { path: "favorites", element: routeComponent("/student/favorites") },
      { path: "orders", element: routeComponent("/student/orders") },
      { path: "profile", element: routeComponent("/student/profile") },
    ],
  },
  {
    path: "/vendor",
    element: routeComponent("/vendor"),
    children: [
      { index: true, element: routeComponent("/vendor/") },
      { path: "analytics", element: routeComponent("/vendor/analytics") },
      { path: "orders", element: routeComponent("/vendor/orders") },
      { path: "products", element: routeComponent("/vendor/products") },
      { path: "profile", element: routeComponent("/vendor/profile") },
      { path: "statement", element: routeComponent("/vendor/statement") },
    ],
  },
  {
    path: "/rider",
    element: routeComponent("/rider"),
    children: [
      { index: true, element: routeComponent("/rider/") },
      { path: "earnings", element: routeComponent("/rider/earnings") },
      { path: "profile", element: routeComponent("/rider/profile") },
      { path: "statement", element: routeComponent("/rider/statement") },
      { path: "trips", element: routeComponent("/rider/trips") },
      { path: "trips/:id", element: routeComponent("/rider/trips/$id"), loader: routeLoader("/rider/trips/$id") },
    ],
  },
  { path: "/shop/:id", element: routeComponent("/shop/$id"), loader: routeLoader("/shop/$id") },
  { path: "/student/shop/:id", element: routeComponent("/student/shop/$id"), loader: routeLoader("/student/shop/$id") },
  { path: "/student/track/:id", element: routeComponent("/student/track/$id") },
  { path: "*", element: <RootFallback /> },
]);
