import { createFileRoute, useNavigate, redirect } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Search, Plus, FileDown, MoreHorizontal, Filter } from "lucide-react";
import { PageContainer, PageHeader, PrimaryButton, SecondaryButton } from "@/components/page-header";
import { StatusBadge } from "@/components/ui-bits";
import { useRole } from "@/lib/role-context";
import { getCustomers } from "@/lib/api/customers.server";
import { useQuery } from "@tanstack/react-query";
import { CustomerForm } from "@/components/forms/customer-form";
import { exportToCSV } from "@/lib/utils";
import { toast } from "sonner";

export const Route = createFileRoute("/customers")({
  beforeLoad: ({ context }) => {
    const session = (context as any).session;
    if (!session || session.role === "customer") throw redirect({ to: "/" });
  },
  head: () => ({
    meta: [
      { title: "Customers — SecureSuite" },
      { name: "description", content: "Manage customer master, KYC and policy mapping." },
    ],
  }),
  component: CustomersPage,
});

function CustomersPage() {
  const { role } = useRole();
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const [tab, setTab] = useState<"All" | "Verified" | "Pending" | "Rejected">("All");
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [page, setPage] = useState(1);
  const itemsPerPage = 10;

  const { data: customers, isLoading } = useQuery({ queryKey: ["customers"], queryFn: () => getCustomers() });

  const list = useMemo(() => {
    let l = customers ?? [];
    // Server already filters by role — no client-side agent filtering needed
    if (tab !== "All") l = l.filter((c) => c.kycStatus === tab);
    if (query) {
      const q = query.toLowerCase();
      l = l.filter((c) => c.name.toLowerCase().includes(q) || c.email.toLowerCase().includes(q) || c.id.toLowerCase().includes(q) || c.city.toLowerCase().includes(q));
    }
    return l;
  }, [query, tab, customers]);

  const totalPages = Math.ceil(list.length / itemsPerPage);
  const paginatedList = useMemo(() => {
    return list.slice((page - 1) * itemsPerPage, page * itemsPerPage);
  }, [list, page]);

  useMemo(() => setPage(1), [query, tab]);

  return (
    <PageContainer>
      <PageHeader
        title={role === "agent" ? "My Customers" : "Customers"}
        subtitle={role === "agent" ? "Customers in your book" : "Manage customer profiles, KYC and document records"}
        actions={
          <>
            <SecondaryButton 
              icon={FileDown}
              onClick={() => {
                if (exportToCSV("customers", list)) {
                  toast.success("Customers exported successfully");
                } else {
                  toast.error("No data available to export");
                }
              }}
            >
              Export
            </SecondaryButton>
            <PrimaryButton icon={Plus} onClick={() => setIsAddOpen(true)}>Add Customer</PrimaryButton>
          </>
        }
      />

      <div className="surface-card">
        {/* Toolbar */}
        <div className="flex flex-wrap items-center gap-3 border-b border-border px-5 py-4">
          <div className="relative flex-1 min-w-[220px]">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by name, email, ID or city..."
              className="h-10 w-full rounded-xl border border-border bg-background pl-9 pr-3 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>
          <SecondaryButton icon={Filter}>Advanced</SecondaryButton>
          <div className="flex items-center gap-1 rounded-xl bg-secondary p-1">
            {(["All", "Verified", "Pending", "Rejected"] as const).map((t) => (
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

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-secondary/40 text-[11px] uppercase tracking-wider text-muted-foreground">
              <tr>
                <th className="px-5 py-3 text-left font-semibold">Customer</th>
                <th className="px-5 py-3 text-left font-semibold">Contact</th>
                <th className="px-5 py-3 text-left font-semibold">City</th>
                <th className="px-5 py-3 text-left font-semibold">Agent</th>
                <th className="px-5 py-3 text-right font-semibold">Policies</th>
                <th className="px-5 py-3 text-center font-semibold">KYC</th>
                <th className="px-5 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {isLoading ? (
                <tr><td colSpan={7} className="px-5 py-16 text-center text-sm text-muted-foreground">Loading customers...</td></tr>
              ) : paginatedList.map((c) => (
                <tr key={c.id} className="transition-colors hover:bg-secondary/40 cursor-pointer" onClick={() => navigate({ to: `/customers/${c.id.replace('C-','')}` })}>
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-3">
                      <div className="flex h-9 w-9 items-center justify-center rounded-full bg-accent-blue/10 text-xs font-semibold text-accent-blue">
                        {c.name.split(" ").map((w) => w[0]).join("")}
                      </div>
                      <div>
                        <div className="font-medium text-foreground">{c.name}</div>
                        <div className="text-xs text-muted-foreground">{c.id}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-3.5 text-muted-foreground">
                    <div>{c.email}</div>
                    <div className="text-xs">{c.phone}</div>
                  </td>
                  <td className="px-5 py-3.5 text-muted-foreground">{c.city}</td>
                  <td className="px-5 py-3.5 text-muted-foreground">{c.agent}</td>
                  <td className="px-5 py-3.5 text-right font-semibold tabular-nums">{c.policies}</td>
                  <td className="px-5 py-3.5 text-center"><StatusBadge status={c.kycStatus} /></td>
                  <td className="px-5 py-3.5 text-right">
                    <button className="rounded-lg p-1.5 text-muted-foreground hover:bg-secondary hover:text-foreground">
                      <MoreHorizontal className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              ))}
              {!isLoading && paginatedList.length === 0 && (
                <tr><td colSpan={7} className="px-5 py-16 text-center text-sm text-muted-foreground">No customers match your filters</td></tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="flex items-center justify-between border-t border-border px-5 py-3 text-xs text-muted-foreground">
          <div>Showing <span className="font-semibold text-foreground">{paginatedList.length}</span> of <span className="font-semibold text-foreground">{list.length}</span> customers</div>
          {totalPages > 1 && (
            <div className="flex items-center gap-2">
              <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="rounded-lg border border-border px-2.5 py-1 hover:bg-secondary disabled:opacity-50">Prev</button>
              <span>Page {page} of {totalPages}</span>
              <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="rounded-lg border border-border px-2.5 py-1 hover:bg-secondary disabled:opacity-50">Next</button>
            </div>
          )}
        </div>
      </div>
      <CustomerForm open={isAddOpen} onOpenChange={setIsAddOpen} />
    </PageContainer>
  );
}
