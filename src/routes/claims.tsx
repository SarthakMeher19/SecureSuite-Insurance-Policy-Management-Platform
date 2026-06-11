import { createFileRoute } from "@tanstack/react-router";
import { FileWarning, Plus, FileDown } from "lucide-react";
import { PageContainer, PageHeader, PrimaryButton, SecondaryButton } from "@/components/page-header";
import { StatusBadge, KpiCard } from "@/components/ui-bits";
import { formatINR } from "@/lib/mock-data";
import { getClaims } from "@/lib/api/claims.server";
import { useQuery } from "@tanstack/react-query";
import { ClaimForm } from "@/components/forms/claim-form";
import { useState } from "react";
import { exportToCSV } from "@/lib/utils";
import { toast } from "sonner";

export const Route = createFileRoute("/claims")({
  head: () => ({ meta: [{ title: "Claims — SecureSuite" }, { name: "description", content: "Track and manage customer claims." }] }),
  component: ClaimsPage,
});

function ClaimsPage() {
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [page, setPage] = useState(1);
  const itemsPerPage = 10;
  const { data: claims, isLoading } = useQuery({ queryKey: ["claims"], queryFn: () => getClaims() });

  const list = claims ?? [];
  const totalAmount = list.reduce((s, c) => s + c.amount, 0);

  const totalPages = Math.ceil(list.length / itemsPerPage);
  const paginatedList = list.slice((page - 1) * itemsPerPage, page * itemsPerPage);

  return (
    <PageContainer>
      <PageHeader
        title="Claims"
        subtitle="Register, track and approve customer claims"
        actions={
          <>
            <SecondaryButton 
              icon={FileDown}
              onClick={() => {
                if (exportToCSV("claims", list)) {
                  toast.success("Claims exported successfully");
                } else {
                  toast.error("No data available to export");
                }
              }}
            >
              Export
            </SecondaryButton>
            <PrimaryButton icon={Plus} onClick={() => setIsAddOpen(true)}>Register Claim</PrimaryButton>
          </>
        }
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-4">
        <KpiCard label="Total Claims" value={list.length} accent="blue" icon={FileWarning} />
        <KpiCard label="Under Review" value={list.filter((c) => c.status === "Under Review").length} accent="amber" />
        <KpiCard label="Settled" value={list.filter((c) => c.status === "Settled").length} accent="green" />
        <KpiCard label="Total Value" value={formatINR(totalAmount)} accent="violet" />
      </div>

      <div className="surface-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-secondary/40 text-[11px] uppercase tracking-wider text-muted-foreground">
              <tr>
                <th className="px-5 py-3 text-left font-semibold">Claim #</th>
                <th className="px-5 py-3 text-left font-semibold">Customer</th>
                <th className="px-5 py-3 text-left font-semibold">Policy</th>
                <th className="px-5 py-3 text-left font-semibold">Filed</th>
                <th className="px-5 py-3 text-right font-semibold">Amount</th>
                <th className="px-5 py-3 text-center font-semibold">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {isLoading ? (
                <tr><td colSpan={6} className="px-5 py-16 text-center text-sm text-muted-foreground">Loading claims...</td></tr>
              ) : paginatedList.map((c) => (
                <tr key={c.id} className="hover:bg-secondary/40">
                  <td className="px-5 py-3.5 font-medium">{c.claimNumber}</td>
                  <td className="px-5 py-3.5 text-muted-foreground">{c.customer}</td>
                  <td className="px-5 py-3.5 text-muted-foreground">{c.policy}</td>
                  <td className="px-5 py-3.5 text-muted-foreground">{new Date(c.filedOn).toLocaleDateString("en-IN")}</td>
                  <td className="px-5 py-3.5 text-right font-semibold tabular-nums">{formatINR(c.amount)}</td>
                  <td className="px-5 py-3.5 text-center"><StatusBadge status={c.status} /></td>
                </tr>
              ))}
              {!isLoading && paginatedList.length === 0 && (
                <tr><td colSpan={6} className="px-5 py-16 text-center text-sm text-muted-foreground">No claims found</td></tr>
              )}
            </tbody>
          </table>
        </div>
        
        <div className="flex items-center justify-between border-t border-border px-5 py-3 text-xs text-muted-foreground">
          <div>Showing <span className="font-semibold text-foreground">{paginatedList.length}</span> of <span className="font-semibold text-foreground">{list.length}</span> claims</div>
          {totalPages > 1 && (
            <div className="flex items-center gap-2">
              <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="rounded-lg border border-border px-2.5 py-1 hover:bg-secondary disabled:opacity-50">Prev</button>
              <span>Page {page} of {totalPages}</span>
              <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="rounded-lg border border-border px-2.5 py-1 hover:bg-secondary disabled:opacity-50">Next</button>
            </div>
          )}
        </div>
      </div>
      <ClaimForm open={isAddOpen} onOpenChange={setIsAddOpen} />
    </PageContainer>
  );
}
