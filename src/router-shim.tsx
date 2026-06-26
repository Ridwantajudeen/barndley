import React from "react";
import {
  Link as RouterLink,
  Outlet as RouterOutlet,
  createBrowserRouter,
  useLoaderData,
  useLocation,
  useNavigate as useRouterNavigate,
  useParams as useRouterParams,
  useRouteError,
  useSearchParams,
} from "react-router-dom";

type RouteOptions = {
  component?: React.ComponentType<any>;
  loader?: (...args: any[]) => any;
  head?: (...args: any[]) => any;
};

type RegisteredRoute = {
  path: string;
  options: RouteOptions;
  component?: React.ComponentType<any>;
  loader?: (...args: any[]) => any;
};

const routeRegistry = new Map<string, RegisteredRoute>();

function fillPath(to: string, params?: Record<string, unknown>) {
  let output = to;
  if (params) {
    for (const [key, value] of Object.entries(params)) {
      output = output.replaceAll(`$${key}`, encodeURIComponent(String(value)));
      output = output.replaceAll(`:${key}`, encodeURIComponent(String(value)));
    }
  }
  return output.replace(/\/\$/g, "/");
}

function withSearch(to: string, search?: Record<string, unknown>) {
  if (!search) return to;
  const query = new URLSearchParams();
  for (const [key, value] of Object.entries(search)) {
    if (value == null) continue;
    query.set(key, String(value));
  }
  const qs = query.toString();
  return qs ? `${to}${to.includes("?") ? "&" : "?"}${qs}` : to;
}

export function getRegisteredRoute(path: string) {
  return routeRegistry.get(path);
}

export function getRegisteredRoutes() {
  return [...routeRegistry.values()];
}

export function createFileRoute(path: string) {
  return (options: RouteOptions) => {
    const route: RegisteredRoute = {
      path,
      options,
      component: options.component,
      loader: options.loader,
    };
    routeRegistry.set(path, route);

    return {
      path,
      options,
      useParams: () => useRouterParams(),
      useLoaderData: () => useLoaderData(),
      useSearch: () => {
        const [searchParams] = useSearchParams();
        return Object.fromEntries(searchParams.entries());
      },
    } as const;
  };
}

export function createRootRouteWithContext<T>() {
  return createFileRoute("__root__");
}

export function Link({
  to,
  params,
  search,
  ...props
}: {
  to: string;
  params?: Record<string, unknown>;
  search?: Record<string, unknown>;
} & React.ComponentProps<typeof RouterLink>) {
  const path = withSearch(fillPath(to, params), search);
  return <RouterLink to={path} {...props} />;
}

export function Outlet() {
  return <RouterOutlet />;
}

export function useNavigate() {
  const navigate = useRouterNavigate();
  return (args: string | { to: string; params?: Record<string, unknown>; search?: Record<string, unknown>; replace?: boolean }) => {
    if (typeof args === "string") {
      navigate(args);
      return;
    }
    navigate(withSearch(fillPath(args.to, args.params), args.search), { replace: args.replace });
  };
}

export function useSearch(options?: { from?: string }) {
  const [searchParams] = useSearchParams();
  const parsed = Object.fromEntries(searchParams.entries());
  if (options?.from === "/auth") {
    return {
      mode: "signin",
      role: "student",
      ...parsed,
    };
  }
  return parsed;
}

export function notFound() {
  return new Response("Not Found", { status: 404 });
}

export function useRouter() {
  const location = useLocation();
  const navigate = useRouterNavigate();
  return {
    state: { location },
    navigate,
    history: {
      go: (delta: number) => window.history.go(delta),
    },
  };
}

export function useRouterState() {
  const location = useLocation();
  return { location };
}

export function HeadContent() {
  return null;
}

export function Scripts() {
  return null;
}

export function useRouteErrorValue() {
  return useRouteError();
}

export { createBrowserRouter };
