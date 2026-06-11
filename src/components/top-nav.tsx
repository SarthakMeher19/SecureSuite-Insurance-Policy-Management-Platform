import { Link, useRouterState, useNavigate, useRouter } from "@tanstack/react-router";
import { Shield, ChevronDown, Search, Bell, Sun, Moon, LogOut } from "lucide-react";
import { useRole } from "@/lib/role-context";
import { useState, useRef, useEffect } from "react";
import { logout } from "@/lib/api/auth.server";
import { GlobalSearch } from "@/components/global-search";

type NavItem = { label: string; to?: string; children?: { label: string; to: string }[] };

const ADMIN_NAV: NavItem[] = [
  { label: "Home", to: "/" },
  {
    label: "Masters",
    children: [
      { label: "Agent Master", to: "/masters/agents" },
      { label: "Customer Master", to: "/masters/customers" },
      { label: "Insurance Companies", to: "/masters/companies" },
      { label: "Policy Types", to: "/masters/policy-types" },
      { label: "Bank Master", to: "/masters/banks" },
      { label: "TPA Master", to: "/masters/tpa" },
    ],
  },
  {
    label: "Accounts",
    children: [
      { label: "Company Brokerage", to: "/accounts/company-brokerage" },
      { label: "Agent Brokerage", to: "/accounts/agent-brokerage" },
    ],
  },
  { label: "Agents", to: "/agents" },
  { label: "Customers", to: "/customers" },
  { label: "Policies", to: "/policies" },
  { label: "Quotations", to: "/quotations" },
  { label: "Claims", to: "/claims" },
  { label: "Renewals", to: "/renewals" },
  { label: "Reports", to: "/reports" },
];

const AGENT_NAV: NavItem[] = [
  { label: "Home", to: "/" },
  { label: "My Customers", to: "/customers" },
  { label: "My Policies", to: "/policies" },
  { label: "Quotations", to: "/quotations" },
  { label: "Renewals", to: "/renewals" },
  { label: "Claims", to: "/claims" },
  { label: "Commissions", to: "/accounts/agent-brokerage" },
];

const CUSTOMER_NAV: NavItem[] = [
  { label: "Home", to: "/" },
  { label: "My Policies", to: "/policies" },
  { label: "Renewals", to: "/renewals" },
  { label: "Claims", to: "/claims" },
];

export function TopNav() {
  const { role, user } = useRole();
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const navigate = useNavigate();
  const router = useRouter();
  const nav = role === "admin" ? ADMIN_NAV : role === "agent" ? AGENT_NAV : CUSTOMER_NAV;
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const [profileOpen, setProfileOpen] = useState(false);
  const [isDark, setIsDark] = useState(false);
  const navRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (typeof document !== "undefined") {
      setIsDark(document.documentElement.classList.contains("dark"));
    }
  }, []);

  const toggleTheme = () => {
    const next = !isDark;
    setIsDark(next);
    if (typeof document !== "undefined") {
      if (next) {
        document.documentElement.classList.add("dark");
      } else {
        document.documentElement.classList.remove("dark");
      }
    }
  };

  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (!navRef.current?.contains(e.target as Node)) {
        setOpenDropdown(null);
        setProfileOpen(false);
      }
    }
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  const isActive = (to?: string) => {
    if (!to) return false;
    if (to === "/") return pathname === "/";
    return pathname === to || pathname.startsWith(to + "/");
  };

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-surface/85 backdrop-blur-xl" ref={navRef}>
      <div className="mx-auto flex h-16 w-full max-w-[1600px] items-center justify-between px-6">
        {/* Logo */}
        <div className="flex flex-1 justify-start">
          <Link to="/" className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-primary-foreground">
              <Shield className="h-4.5 w-4.5" strokeWidth={2.25} />
            </div>
            <div className="leading-tight">
              <div className="text-[15px] font-semibold tracking-tight">SecureSuite</div>
              <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Insurance Portal</div>
            </div>
          </Link>
        </div>

        {/* Centered nav */}
        <nav className="hidden flex-1 items-center justify-evenly lg:flex">
          {nav.map((item) =>
            item.children ? (
              <div key={item.label} className="relative">
                <button
                  onClick={() => setOpenDropdown(openDropdown === item.label ? null : item.label)}
                  className={`flex items-center gap-1 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                    item.children.some((c) => isActive(c.to))
                      ? "bg-secondary text-foreground"
                      : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                  }`}
                >
                  {item.label}
                  <ChevronDown className="h-3.5 w-3.5" />
                </button>
                {openDropdown === item.label && (
                  <div className="absolute left-1/2 top-full z-50 mt-2 w-56 -translate-x-1/2 overflow-hidden rounded-xl border border-border bg-surface shadow-lg">
                    {item.children.map((c) => (
                      <Link
                        key={c.to}
                        to={c.to}
                        onClick={() => setOpenDropdown(null)}
                        className="block px-4 py-2.5 text-sm text-foreground transition-colors hover:bg-secondary"
                      >
                        {c.label}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <Link
                key={item.label}
                to={item.to!}
                className={`rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                  isActive(item.to)
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                }`}
              >
                {item.label}
              </Link>
            ),
          )}
        </nav>

        {/* Right cluster */}
        <div className="flex flex-1 items-center justify-end gap-2">
          <button 
            onClick={toggleTheme}
            className="flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
          >
            {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </button>
          
          <div className="hidden md:block w-64 lg:w-80">
            <GlobalSearch />
          </div>

          <button className="relative hidden h-9 w-9 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground md:flex">
            <Bell className="h-4 w-4" />
            <span className="absolute right-2 top-2 h-1.5 w-1.5 rounded-full bg-accent-rose" />
          </button>

          <div className="relative">
            <button
              onClick={() => setProfileOpen((s) => !s)}
              className="flex items-center gap-2.5 rounded-full border border-border bg-surface py-1 pl-1 pr-3 transition-colors hover:bg-secondary"
            >
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-primary text-[11px] font-semibold text-primary-foreground uppercase">
                {user?.name?.substring(0, 2) || "U"}
              </span>
              <span className="hidden text-sm font-medium sm:block">{user?.name || "User"}</span>
              <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
            </button>
            {profileOpen && (
              <div className="absolute right-0 top-full z-50 mt-2 w-64 overflow-hidden rounded-xl border border-border bg-surface shadow-lg">
                <div className="border-b border-border px-4 py-3">
                  <div className="text-sm font-semibold">{user?.name || "User"}</div>
                  <div className="text-xs text-muted-foreground capitalize">{user?.role || "Guest"}</div>
                </div>
                <div className="p-2">
                  <button
                    onClick={async () => {
                      await logout();
                      await router.invalidate();
                      await navigate({ to: "/login" });
                    }}
                    className="flex w-full items-center justify-start gap-2 rounded-lg px-2.5 py-2 text-left text-sm text-accent-rose transition-colors hover:bg-accent-rose/10"
                  >
                    <LogOut className="h-4 w-4" />
                    Sign out
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
