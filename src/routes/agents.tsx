import { createFileRoute, redirect } from "@tanstack/react-router";
import { Users, Plus } from "lucide-react";
import { PageContainer, PageHeader, PrimaryButton } from "@/components/page-header";
import { KpiCard } from "@/components/ui-bits";
import { formatINR } from "@/lib/mock-data";
import { getAgents } from "@/lib/api/agents.server";
import { useQuery } from "@tanstack/react-query";
import { AgentForm } from "@/components/forms/agent-form";
import { useState } from "react";

export const Route = createFileRoute("/agents")({
  beforeLoad: ({ context }) => {
    const session = (context as any).session;
    if (!session || session.role !== "admin") throw redirect({ to: "/" });
  },
  head: () => ({ meta: [{ title: "Agents — SecureSuite" }, { name: "description", content: "Agent performance and commissions." }] }),
  component: AgentsPage,
});

function AgentsPage() {
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [page, setPage] = useState(1);
  const itemsPerPage = 8;
  const { data: agents, isLoading } = useQuery({ queryKey: ["agents"], queryFn: () => getAgents() });
  
  const list = agents ?? [];
  const totalCommission = list.reduce((s, a) => s + a.commission, 0);

  const totalPages = Math.ceil(list.length / itemsPerPage);
  const paginatedList = list.slice((page - 1) * itemsPerPage, page * itemsPerPage);

  return (
    <PageContainer>
      <PageHeader
        title="Agents"
        subtitle="Manage agents, performance and payouts"
        actions={<PrimaryButton icon={Plus} onClick={() => setIsAddOpen(true)}>Add Agent</PrimaryButton>}
      />
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <KpiCard label="Total Agents" value={list.length} accent="blue" icon={Users} />
        <KpiCard label="Active Books" value={list.filter(a => a.policyCount > 0).length} accent="green" />
        <KpiCard label="Commission YTD" value={formatINR(Math.round(totalCommission))} accent="violet" />
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4 mt-6">
        {isLoading && <div className="col-span-full py-12 text-center text-sm text-muted-foreground">Loading agents...</div>}
        {!isLoading && paginatedList.length === 0 && <div className="col-span-full py-12 text-center text-sm text-muted-foreground">No agents found</div>}
        {paginatedList.map((a) => {
          return (
            <div key={a.id} className="surface-card p-5">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-accent-violet/10 text-base font-semibold text-accent-violet">
                  {a.name.split(" ").map((w) => w[0]).join("")}
                </div>
                <div className="min-w-0">
                  <div className="truncate font-semibold">{a.name}</div>
                  <div className="text-xs text-muted-foreground">{a.role} · {a.city}</div>
                </div>
              </div>
              <div className="mt-4 grid grid-cols-3 gap-2 border-t border-border pt-4">
                <div>
                  <div className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Customers</div>
                  <div className="mt-1 text-lg font-semibold">{a.customerCount}</div>
                </div>
                <div>
                  <div className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Policies</div>
                  <div className="mt-1 text-lg font-semibold">{a.policyCount}</div>
                </div>
                <div>
                  <div className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Comm.</div>
                  <div className="mt-1 text-lg font-semibold">{formatINR(a.commission)}</div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
      
      {totalPages > 1 && (
        <div className="mt-6 flex items-center justify-between border-t border-border pt-4 text-xs text-muted-foreground">
          <div>Showing <span className="font-semibold text-foreground">{paginatedList.length}</span> of <span className="font-semibold text-foreground">{list.length}</span> agents</div>
          <div className="flex items-center gap-2">
            <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="rounded-lg border border-border px-2.5 py-1 hover:bg-secondary disabled:opacity-50">Prev</button>
            <span>Page {page} of {totalPages}</span>
            <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="rounded-lg border border-border px-2.5 py-1 hover:bg-secondary disabled:opacity-50">Next</button>
          </div>
        </div>
      )}

      <AgentForm open={isAddOpen} onOpenChange={setIsAddOpen} />
    </PageContainer>
  );
}
