import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  HeadContent,
  Scripts,
  redirect,
} from "@tanstack/react-router";
import { useEffect, type ReactNode } from "react";
import { getSession } from "@/lib/api/auth.server";
import { Toaster } from "sonner";

import appCss from "../styles.css?url";
import { RoleProvider } from "../lib/role-context";
import { TopNav } from "../components/top-nav";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-7xl font-bold text-foreground">404</h1>
        <h2 className="mt-4 text-xl font-semibold text-foreground">Page not found</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <div className="mt-6">
          <Link to="/" className="inline-flex items-center justify-center rounded-xl bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90">
            Go home
          </Link>
        </div>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  console.error(error);
  const router = useRouter();
  useEffect(() => {
    // Error reporting removed
  }, [error]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-xl font-semibold tracking-tight text-foreground">This page didn't load</h1>
        <p className="mt-2 text-sm text-muted-foreground">Something went wrong on our end.</p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <button
            onClick={() => { router.invalidate(); reset(); }}
            className="inline-flex items-center justify-center rounded-xl bg-primary px-4 py-2 text-sm font-medium text-primary-foreground"
          >
            Try again
          </button>
          <a href="/" className="inline-flex items-center justify-center rounded-xl border border-input bg-surface px-4 py-2 text-sm font-medium text-foreground hover:bg-secondary">
            Go home
          </a>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "SecureSuite — Insurance Management Portal" },
      { name: "description", content: "Modern role-based insurance management portal for admins, brokers and customers." },
    ],
    links: [{ rel: "stylesheet", href: appCss }],
  }),
  beforeLoad: async ({ location }) => {
    const session = await getSession();
    
    // If not logged in and not on login page, redirect to login
    if (!session && location.pathname !== "/login") {
      throw redirect({ to: "/login" });
    }
    
    // If logged in and on login page, redirect to home
    if (session && location.pathname === "/login") {
      throw redirect({ to: "/" });
    }
    
    return { session };
  },
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <head><HeadContent /></head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  const ctx = Route.useRouteContext() as any;
  const { queryClient, session } = ctx;
  const isLogin = useRouter().state.location.pathname === "/login";

  return (
    <QueryClientProvider client={queryClient}>
      <RoleProvider initialSession={session}>
        <div className="min-h-screen bg-background">
          {!isLogin && <TopNav />}
          <Outlet />
        </div>
        <Toaster position="top-center" richColors />
      </RoleProvider>
    </QueryClientProvider>
  );
}
