import { createFileRoute, redirect } from "@tanstack/react-router";
import { FileDown, FileText, Users, Shield, CalendarClock, FileWarning, Wallet, TrendingUp, Loader2 } from "lucide-react";
import { PageContainer, PageHeader, SecondaryButton } from "@/components/page-header";
import { getPolicies } from "@/lib/api/policies.server";
import { getCustomers } from "@/lib/api/customers.server";
import { getAgents } from "@/lib/api/agents.server";
import { getUpcomingRenewals } from "@/lib/api/dashboard.server";
import { getClaims } from "@/lib/api/claims.server";
import { useState } from "react";
import { toast } from "sonner";

export const Route = createFileRoute("/reports")({
  beforeLoad: ({ context }) => {
    const session = (context as any).session;
    if (!session || session.role !== "admin") throw redirect({ to: "/" });
  },
  head: () => ({ meta: [{ title: "Reports — SecureSuite" }, { name: "description", content: "Generate and export reports." }] }),
  component: ReportsPage,
});

const REPORTS = [
  { id: "policies", name: "Policy Report", desc: "All policies with status & premium", icon: Shield, accent: "bg-accent-blue/10 text-accent-blue" },
  { id: "customers", name: "Customer Report", desc: "Customer master with KYC status", icon: Users, accent: "bg-accent-green/10 text-accent-green" },
  { id: "agents", name: "Agent Report", desc: "Agent performance and book size", icon: Users, accent: "bg-accent-violet/10 text-accent-violet" },
  { id: "renewals", name: "Renewal Report", desc: "Upcoming and overdue renewals", icon: CalendarClock, accent: "bg-accent-amber/10 text-accent-amber" },
  { id: "claims", name: "Claims Report", desc: "Claims by status, amount & customer", icon: FileWarning, accent: "bg-accent-rose/10 text-accent-rose" },
  { id: "commissions", name: "Commission Report", desc: "Agent payouts and brokerage", icon: Wallet, accent: "bg-accent-emerald/10 text-accent-emerald" },
  { id: "revenue", name: "Revenue Report", desc: "Premium collected, monthly trend", icon: TrendingUp, accent: "bg-accent-orange/10 text-accent-orange" },
  { id: "audit", name: "Document Audit", desc: "KYC and policy document log", icon: FileText, accent: "bg-accent-indigo/10 text-accent-indigo" },
];

function exportToCSV(filename: string, data: any[]) {
  if (!data || !data.length) {
    toast.error("No data available to export");
    return;
  }
  
  const headers = Object.keys(data[0]);
  const csvContent = [
    headers.join(","),
    ...data.map(row => 
      headers.map(header => {
        let val = row[header];
        if (val === null || val === undefined) val = "";
        // Quote strings to avoid issues with commas
        return `"${String(val).replace(/"/g, '""')}"`;
      }).join(",")
    )
  ].join("\n");

  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const link = document.createElement("a");
  const url = URL.createObjectURL(blob);
  link.setAttribute("href", url);
  link.setAttribute("download", `${filename}_${new Date().toISOString().split("T")[0]}.csv`);
  link.style.visibility = "hidden";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

function ReportsPage() {
  const [loadingMap, setLoadingMap] = useState<Record<string, boolean>>({});

  const handleExportCSV = async (id: string, name: string) => {
    setLoadingMap(prev => ({ ...prev, [id]: true }));
    try {
      let data: any[] = [];
      switch (id) {
        case "policies": data = await getPolicies(); break;
        case "customers": data = await getCustomers(); break;
        case "agents": data = await getAgents(); break;
        case "renewals": data = await getUpcomingRenewals(); break;
        case "claims": data = await getClaims(); break;
        default:
          toast.info("This report export is not yet implemented.");
          setLoadingMap(prev => ({ ...prev, [id]: false }));
          return;
      }
      exportToCSV(name.replace(/\s+/g, '_').toLowerCase(), data);
      toast.success(`${name} exported successfully`);
    } catch (err) {
      toast.error(`Failed to export ${name}`);
    } finally {
      setLoadingMap(prev => ({ ...prev, [id]: false }));
    }
  };

  return (
    <PageContainer>
      <PageHeader title="Reports" subtitle="Generate and export reports in PDF, Excel or CSV" />
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {REPORTS.map((r) => (
          <div key={r.id} className="surface-card group p-5 transition-shadow hover:shadow-md">
            <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${r.accent}`}>
              <r.icon className="h-5 w-5" />
            </div>
            <h3 className="mt-4 text-base font-semibold">{r.name}</h3>
            <p className="mt-1 text-xs text-muted-foreground">{r.desc}</p>
            <div className="mt-5 flex items-center gap-2">
              <button onClick={() => toast.info("PDF export not implemented yet")} className="flex-1 rounded-lg border border-border bg-surface px-3 py-1.5 text-xs font-medium hover:bg-secondary">PDF</button>
              <button onClick={() => toast.info("Excel export not implemented yet, use CSV instead")} className="flex-1 rounded-lg border border-border bg-surface px-3 py-1.5 text-xs font-medium hover:bg-secondary">Excel</button>
              <button 
                onClick={() => handleExportCSV(r.id, r.name)}
                disabled={loadingMap[r.id]}
                className="flex-1 rounded-lg border border-border bg-surface px-3 py-1.5 text-xs font-medium hover:bg-secondary disabled:opacity-50 flex justify-center items-center"
              >
                {loadingMap[r.id] ? <Loader2 className="h-4 w-4 animate-spin" /> : "CSV"}
              </button>
            </div>
          </div>
        ))}
      </div>
    </PageContainer>
  );
}
