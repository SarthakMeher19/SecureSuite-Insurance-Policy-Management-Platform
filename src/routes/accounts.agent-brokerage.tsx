import { createFileRoute, redirect } from "@tanstack/react-router";
import { Wallet, Plus, FileDown } from "lucide-react";
import { PageContainer, PageHeader, PrimaryButton, SecondaryButton } from "@/components/page-header";
import { KpiCard } from "@/components/ui-bits";
import { formatINR } from "@/lib/mock-data";
import { getAgentBrokerages } from "@/lib/api/brokerages.server";
import { useQuery } from "@tanstack/react-query";

export const Route = createFileRoute("/accounts/agent-brokerage")({
  beforeLoad: ({ context }) => {
    const session = (context as any).session;
    if (!session || session.role === "customer") throw redirect({ to: "/" });
  },
  head: () => ({ meta: [{ title: "Agent Brokerage — SecureSuite" }] }),
  component: AgentBrokeragePage,
});

function AgentBrokeragePage() {
  const { data: brokerages, isLoading } = useQuery({ queryKey: ["agentBrokerages"], queryFn: () => getAgentBrokerages() });

  const list = brokerages ?? [];
  const totalAmount = list.reduce((s, b) => s + b.amount, 0);

  return (
    <PageContainer>
      <PageHeader
        title="Agent Brokerage"
        subtitle="Agent commissions, payouts and statements"
        actions={
          <>
            <SecondaryButton icon={FileDown}>Export</SecondaryButton>
            <PrimaryButton icon={Plus}>Record Payout</PrimaryButton>
          </>
        }
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <KpiCard label="Total Payouts" value={list.length} accent="blue" icon={Wallet} />
        <KpiCard label="Total Paid" value={formatINR(totalAmount)} accent="green" />
        <KpiCard label="This Month" value={formatINR(list.filter(b => new Date(b.paymentDate).getMonth() === new Date().getMonth()).reduce((s, b) => s + b.amount, 0))} accent="violet" />
      </div>

      <div className="surface-card overflow-hidden mt-6">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-secondary/40 text-[11px] uppercase tracking-wider text-muted-foreground">
              <tr>
                <th className="px-5 py-3 text-left font-semibold">ID</th>
                <th className="px-5 py-3 text-left font-semibold">Agent</th>
                <th className="px-5 py-3 text-left font-semibold">Payment Date</th>
                <th className="px-5 py-3 text-right font-semibold">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {isLoading ? (
                <tr><td colSpan={4} className="px-5 py-16 text-center text-sm text-muted-foreground">Loading brokerages...</td></tr>
              ) : list.map((b) => (
                <tr key={b.id} className="hover:bg-secondary/40">
                  <td className="px-5 py-3.5 font-medium">{b.id}</td>
                  <td className="px-5 py-3.5 text-muted-foreground">{b.agentName}</td>
                  <td className="px-5 py-3.5 text-muted-foreground">{new Date(b.paymentDate).toLocaleDateString("en-IN")}</td>
                  <td className="px-5 py-3.5 text-right font-semibold tabular-nums">{formatINR(b.amount)}</td>
                </tr>
              ))}
              {!isLoading && list.length === 0 && (
                <tr><td colSpan={4} className="px-5 py-16 text-center text-sm text-muted-foreground">No agent payouts found</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </PageContainer>
  );
}
