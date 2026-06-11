import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Search, Plus, FileDown, MoreHorizontal, Filter, ShieldCheck, Car, Heart, Plane, Home, Shield, Eye } from "lucide-react";
import { PageContainer, PageHeader, PrimaryButton, SecondaryButton } from "@/components/page-header";
import { StatusBadge } from "@/components/ui-bits";
import { formatINR } from "@/lib/mock-data";
import { useRole } from "@/lib/role-context";
import { getPolicies } from "@/lib/api/policies.server";
import { useQuery } from "@tanstack/react-query";
import { PolicyForm } from "@/components/forms/policy-form";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { exportToCSV } from "@/lib/utils";
import { toast } from "sonner";

const TYPE_ICON: Record<string, any> = {
  Health: Heart,
  Vehicle: Car,
  Life: ShieldCheck,
  Travel: Plane,
  Property: Home,
};

const TYPE_ACCENT: Record<string, string> = {
  Health: "bg-accent-blue/10 text-accent-blue",
  Vehicle: "bg-accent-green/10 text-accent-green",
  Life: "bg-accent-violet/10 text-accent-violet",
  Travel: "bg-accent-amber/10 text-accent-amber",
  Property: "bg-accent-rose/10 text-accent-rose",
};

export const Route = createFileRoute("/policies/")({
  head: () => ({
    meta: [
      { title: "Policies — SecureSuite" },
      { name: "description", content: "Manage policies, premiums and status across your portfolio." },
    ],
  }),
  component: PoliciesPage,
});

function PoliciesPage() {
  const { role } = useRole();
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const [tab, setTab] = useState<"All" | "Active" | "Pending" | "Expired" | "Lapsed">("All");
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [page, setPage] = useState(1);
  const itemsPerPage = 10;

  const { data: policies, isLoading } = useQuery({ queryKey: ["policies"], queryFn: () => getPolicies() });

  const list = useMemo(() => {
    let l = policies ?? [];
    // Server already filters by role — no client-side filtering needed
    if (tab !== "All") l = l.filter((p) => p.status === tab);
    if (query) {
      const q = query.toLowerCase();
      l = l.filter((p) =>
        p.policyNumber.toLowerCase().includes(q) ||
        p.customer.toLowerCase().includes(q) ||
        p.company.toLowerCase().includes(q) ||
        p.type.toLowerCase().includes(q)
      );
    }
    return l;
  }, [query, tab, policies]);

  const totalPages = Math.ceil(list.length / itemsPerPage);
  const paginatedList = useMemo(() => {
    return list.slice((page - 1) * itemsPerPage, page * itemsPerPage);
  }, [list, page]);

  // Reset page when filters change
  useMemo(() => setPage(1), [query, tab]);

  const heading =
    role === "customer" ? "My Policies" :
    role === "agent" ? "My Policies" : "Policies";

  return (
    <PageContainer>
      <PageHeader
        title={heading}
        subtitle="Track active, pending and expired policies across customers"
        actions={
          role !== "customer" ? (
            <>
              <SecondaryButton 
                icon={FileDown}
                onClick={() => {
                  if (exportToCSV("policies", list)) {
                    toast.success("Policies exported successfully");
                  } else {
                    toast.error("No data available to export");
                  }
                }}
              >
                Export
              </SecondaryButton>
              <PrimaryButton icon={Plus} onClick={() => setIsAddOpen(true)}>Create Policy</PrimaryButton>
            </>
          ) : null
        }
      />

      <div className="surface-card">
        <div className="flex flex-wrap items-center gap-3 border-b border-border px-5 py-4">
          <div className="relative flex-1 min-w-[220px]">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by policy number, customer or insurer..."
              className="h-10 w-full rounded-xl border border-border bg-background pl-9 pr-3 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>
          <SecondaryButton icon={Filter}>Advanced</SecondaryButton>
          <div className="flex items-center gap-1 rounded-xl bg-secondary p-1">
            {(["All", "Active", "Pending", "Expired", "Lapsed"] as const).map((t) => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
                  tab === t ? "bg-primary text-primary-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {t}
              </button>
            ))}
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-secondary/40 text-[11px] uppercase tracking-wider text-muted-foreground">
              <tr>
                <th className="px-5 py-3 text-left font-semibold">Policy</th>
                <th className="px-5 py-3 text-left font-semibold">Type</th>
                <th className="px-5 py-3 text-left font-semibold">Customer</th>
                <th className="px-5 py-3 text-left font-semibold">Insurer</th>
                <th className="px-5 py-3 text-right font-semibold">Premium</th>
                <th className="px-5 py-3 text-right font-semibold">Sum Insured</th>
                <th className="px-5 py-3 text-left font-semibold">Expires</th>
                <th className="px-5 py-3 text-center font-semibold">Status</th>
                <th className="px-5 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {isLoading ? (
                <tr><td colSpan={9} className="px-5 py-16 text-center text-sm text-muted-foreground">Loading policies...</td></tr>
              ) : paginatedList.map((p) => {
                const Icon = TYPE_ICON[p.type] || Shield;
                const accent = TYPE_ACCENT[p.type] || "bg-secondary text-muted-foreground";
                return (
                  <tr key={p.id} className="transition-colors hover:bg-secondary/40 cursor-pointer" onClick={() => navigate({ to: "/policies/$id", params: { id: p.id } })}>
                    <td className="px-5 py-3.5 font-medium">{p.policyNumber}</td>
                    <td className="px-5 py-3.5">
                      <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${accent}`}>
                        <Icon className="h-3 w-3" />
                        {p.type}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-muted-foreground">{p.customer}</td>
                    <td className="px-5 py-3.5 text-muted-foreground">{p.company}</td>
                    <td className="px-5 py-3.5 text-right font-semibold tabular-nums">{formatINR(p.premium)}</td>
                    <td className="px-5 py-3.5 text-right text-muted-foreground tabular-nums">{formatINR(p.sumInsured)}</td>
                    <td className="px-5 py-3.5 text-muted-foreground">{new Date(p.expiryDate).toLocaleDateString("en-IN")}</td>
                    <td className="px-5 py-3.5 text-center"><StatusBadge status={p.status} /></td>
                    <td className="px-5 py-3.5 text-right" onClick={(e) => e.stopPropagation()}>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <button className="rounded-lg p-1.5 text-muted-foreground hover:bg-secondary hover:text-foreground">
                            <MoreHorizontal className="h-4 w-4" />
                          </button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-[160px]">
                          <DropdownMenuItem onSelect={() => navigate({ to: "/policies/$id", params: { id: p.id } })}>
                            <Eye className="mr-2 h-4 w-4 text-muted-foreground" />
                            View Details
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </td>
                  </tr>
                );
              })}
              {!isLoading && paginatedList.length === 0 && (
                <tr><td colSpan={9} className="px-5 py-16 text-center text-sm text-muted-foreground">No policies match your filters</td></tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="flex items-center justify-between border-t border-border px-5 py-3 text-xs text-muted-foreground">
          <div>Showing <span className="font-semibold text-foreground">{paginatedList.length}</span> of <span className="font-semibold text-foreground">{list.length}</span> policies</div>
          {totalPages > 1 && (
            <div className="flex items-center gap-2">
              <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="rounded-lg border border-border px-2.5 py-1 hover:bg-secondary disabled:opacity-50">Prev</button>
              <span>Page {page} of {totalPages}</span>
              <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="rounded-lg border border-border px-2.5 py-1 hover:bg-secondary disabled:opacity-50">Next</button>
            </div>
          )}
        </div>
      </div>
      <PolicyForm open={isAddOpen} onOpenChange={setIsAddOpen} />
    </PageContainer>
  );
}
