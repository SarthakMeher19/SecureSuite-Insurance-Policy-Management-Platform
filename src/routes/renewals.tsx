import { createFileRoute } from "@tanstack/react-router";
import { CalendarClock, Bell, FileDown } from "lucide-react";
import { PageContainer, PageHeader, SecondaryButton, PrimaryButton } from "@/components/page-header";
import { StatusBadge, KpiCard } from "@/components/ui-bits";
import { formatINR } from "@/lib/mock-data";
import { getUpcomingRenewals } from "@/lib/api/dashboard.server";
import { renewPolicy } from "@/lib/api/policies.server";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";
import { exportToCSV } from "@/lib/utils";

export const Route = createFileRoute("/renewals")({
  head: () => ({ meta: [{ title: "Renewals — SecureSuite" }, { name: "description", content: "Upcoming and overdue policy renewals." }] }),
  component: RenewalsPage,
});

function RenewalsPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { data: renewals, isLoading } = useQuery({ queryKey: ["renewals"], queryFn: () => getUpcomingRenewals() });

  const renewMutation = useMutation({
    mutationFn: (id: string) => renewPolicy({ data: id }),
    onSuccess: (newId) => {
      toast.success("Policy renewed successfully");
      queryClient.invalidateQueries({ queryKey: ["renewals"] });
      queryClient.invalidateQueries({ queryKey: ["policies"] });
      navigate({ to: `/policies/$id`, params: { id: newId } });
    },
    onError: (err: any) => {
      toast.error(err.message || "Failed to renew policy");
    }
  });

  const list = renewals ?? [];
  const upcoming = list.filter((r) => r.status === "Upcoming");
  const overdue = list.filter((r) => r.status === "Overdue");
  const totalPremium = list.reduce((s, r) => s + r.premium, 0);

  return (
    <PageContainer>
      <PageHeader
        title="Renewals"
        subtitle="Stay ahead of expiring policies and notify customers in time"
        actions={
          <>
            <SecondaryButton 
              icon={FileDown}
              onClick={() => {
                if (exportToCSV("renewals", list)) {
                  toast.success("Renewals exported successfully");
                } else {
                  toast.error("No data available to export");
                }
              }}
            >
              Export
            </SecondaryButton>
            <PrimaryButton icon={Bell}>Send Reminders</PrimaryButton>
          </>
        }
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <KpiCard label="Upcoming" value={upcoming.length} accent="amber" icon={CalendarClock} hint="Next 60 days" />
        <KpiCard label="Overdue" value={overdue.length} accent="rose" icon={CalendarClock} hint="Action required" />
        <KpiCard label="Premium at Risk" value={formatINR(totalPremium)} accent="violet" icon={CalendarClock} />
      </div>

      <div className="surface-card overflow-hidden">
        <div className="border-b border-border px-5 py-4">
          <h3 className="text-base font-semibold">All renewals</h3>
          <p className="mt-0.5 text-xs text-muted-foreground">Sorted by days remaining</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-secondary/40 text-[11px] uppercase tracking-wider text-muted-foreground">
              <tr>
                <th className="px-5 py-3 text-left font-semibold">Policy</th>
                <th className="px-5 py-3 text-left font-semibold">Customer</th>
                <th className="px-5 py-3 text-left font-semibold">Insurer</th>
                <th className="px-5 py-3 text-left font-semibold">Expires</th>
                <th className="px-5 py-3 text-right font-semibold">Days Left</th>
                <th className="px-5 py-3 text-right font-semibold">Premium</th>
                <th className="px-5 py-3 text-center font-semibold">Status</th>
                <th className="px-5 py-3 text-right font-semibold">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {isLoading ? (
                <tr><td colSpan={7} className="px-5 py-16 text-center text-sm text-muted-foreground">Loading renewals...</td></tr>
              ) : list.map((r) => (
                <tr key={r.id} className="hover:bg-secondary/40">
                  <td className="px-5 py-3.5 font-medium">{r.policyNumber}</td>
                  <td className="px-5 py-3.5 text-muted-foreground">{r.customer}</td>
                  <td className="px-5 py-3.5 text-muted-foreground">{r.company}</td>
                  <td className="px-5 py-3.5 text-muted-foreground">{new Date(r.expiryDate).toLocaleDateString("en-IN")}</td>
                  <td className={`px-5 py-3.5 text-right font-semibold tabular-nums ${r.daysLeft < 0 ? "text-accent-rose" : r.daysLeft <= 14 ? "text-accent-orange" : "text-foreground"}`}>
                    {r.daysLeft < 0 ? `${Math.abs(r.daysLeft)}d ago` : `${r.daysLeft}d`}
                  </td>
                  <td className="px-5 py-3.5 text-right font-semibold tabular-nums">{formatINR(r.premium)}</td>
                  <td className="px-5 py-3.5 text-center"><StatusBadge status={r.status} /></td>
                  <td className="px-5 py-3.5 text-right">
                    <button
                      onClick={() => renewMutation.mutate(r.id)}
                      disabled={renewMutation.isPending}
                      className="rounded-lg bg-primary/10 px-3 py-1.5 text-xs font-medium text-primary transition-colors hover:bg-primary/20 disabled:opacity-50"
                    >
                      {renewMutation.isPending && renewMutation.variables === r.id ? "Renewing..." : "Renew"}
                    </button>
                  </td>
                </tr>
              ))}
              {!isLoading && list.length === 0 && (
                <tr><td colSpan={8} className="px-5 py-16 text-center text-sm text-muted-foreground">No upcoming renewals found</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </PageContainer>
  );
}
