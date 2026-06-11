import { createFileRoute } from "@tanstack/react-router";
import {
  Activity, FileCheck2, FileX2, CalendarClock, FileWarning, Wallet,
  Users, UserCog, ShieldCheck, TrendingUp, Plus, FileDown, Phone, Mail, MapPin, Building2,
} from "lucide-react";
import { useRole } from "@/lib/role-context";
import { KpiCard, StatusBadge, ACCENT_HEX } from "@/components/ui-bits";
import { PageContainer, PageHeader, PrimaryButton, SecondaryButton } from "@/components/page-header";
import { formatINR } from "@/lib/mock-data";
import { getDashboardStats, getDashboardCharts, getUpcomingRenewals } from "@/lib/api/dashboard.server";
import { getPolicies } from "@/lib/api/policies.server";
import { getClaims } from "@/lib/api/claims.server";
import { useQuery } from "@tanstack/react-query";
import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid,
  PieChart, Pie, Cell, LineChart, Line,
} from "recharts";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Dashboard — SecureSuite" },
      { name: "description", content: "Insurance management dashboard with policies, renewals and claims overview." },
    ],
  }),
  component: DashboardPage,
});

function DashboardPage() {
  const { role } = useRole();
  if (role === "customer") return <CustomerDashboard />;
  if (role === "agent") return <AgentDashboard />;
  return <AdminDashboard />;
}

/* ---------------- Admin ---------------- */
function AdminDashboard() {
  const { user } = useRole();
  const { data: stats } = useQuery({ queryKey: ["adminStats"], queryFn: () => getDashboardStats() });
  const { data: charts } = useQuery({ queryKey: ["adminCharts"], queryFn: () => getDashboardCharts() });
  const { data: renewals } = useQuery({ queryKey: ["adminRenewals"], queryFn: () => getUpcomingRenewals() });

  const today = new Date();
  const greeting = today.getHours() < 12 ? "Good Morning" : "Good Afternoon";

  return (
    <PageContainer>
      <PageHeader
        title={<>{greeting}, {user?.name?.split(" ")[0] || "Admin"} <span className="inline-block">👋</span></> }
        subtitle={`${today.toLocaleDateString("en-IN", { weekday: "long", year: "numeric", month: "long", day: "numeric" })} · Here's your portfolio overview`}
        actions={
          <>
            <SecondaryButton icon={FileDown}>Export</SecondaryButton>
            <PrimaryButton icon={Plus}>New Policy</PrimaryButton>
          </>
        }
      />

      {/* Big KPIs */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard label="Total Policies" value={stats?.totalPolicies ?? 0} accent="blue" icon={ShieldCheck} hint={<span>Across all customers</span>} />
        <KpiCard label="Active Policies" value={stats?.activePolicies ?? 0} accent="green" icon={FileCheck2} hint={<span className="text-accent-green">{Math.round(((stats?.activePolicies ?? 0) / (stats?.totalPolicies || 1)) * 100)}% of portfolio</span>} />
        <KpiCard label="Premium Collected" value={formatINR(stats?.premiumCollected ?? 0)} accent="amber" icon={Wallet} hint="From active policies" />
        <KpiCard label="Upcoming Renewals" value={stats?.upcomingRenewals ?? 0} accent="violet" icon={CalendarClock} hint="Next 60 days" />
      </div>

      {/* Small KPIs */}
      <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-6">
        <KpiCard size="sm" label="Expired" value={stats?.expiredPolicies ?? 0} accent="rose" />
        <KpiCard size="sm" label="Pending Premium" value={formatINR(stats?.pendingPremium ?? 0)} accent="pink" />
        <KpiCard size="sm" label="Total Claims" value={stats?.totalClaims ?? 0} accent="sky" />
        <KpiCard size="sm" label="Pending Claims" value={stats?.pendingClaims ?? 0} accent="orange" />
        <KpiCard size="sm" label="Customers" value={stats?.totalCustomers ?? 0} accent="emerald" />
        <KpiCard size="sm" label="Agents" value={stats?.totalAgents ?? 0} accent="indigo" />
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="surface-card p-6 lg:col-span-2">
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-2">
                <Activity className="h-4 w-4 text-accent-blue" />
                <h3 className="text-base font-semibold">Premium Collection</h3>
              </div>
              <p className="mt-1 text-xs text-muted-foreground">Monthly collection trend (₹)</p>
            </div>
            <div className="text-right">
              <div className="text-xs text-muted-foreground">This month</div>
              <div className="text-lg font-semibold tracking-tight">{charts?.monthlyPremium ? formatINR(charts.monthlyPremium[charts.monthlyPremium.length - 1].value) : "—"}</div>
            </div>
          </div>
          <div className="mt-6 h-64">
            {charts?.monthlyPremium && (
              <ResponsiveContainer>
                <BarChart data={charts.monthlyPremium} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                  <CartesianGrid stroke="var(--color-border)" vertical={false} />
                  <XAxis dataKey="month" tick={{ fontSize: 11, fill: "var(--color-muted-foreground)" }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 11, fill: "var(--color-muted-foreground)" }} axisLine={false} tickLine={false} tickFormatter={(v) => `${(v / 1000).toFixed(0)}K`} />
                  <Tooltip
                    cursor={{ fill: "var(--color-secondary)" }}
                    contentStyle={{ background: "var(--color-surface)", border: "1px solid var(--color-border)", borderRadius: 12, fontSize: 12 }}
                    formatter={(v: number) => formatINR(v)}
                  />
                  <Bar dataKey="value" fill={ACCENT_HEX.blue} radius={[8, 8, 0, 0]} maxBarSize={36} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        <div className="surface-card p-6">
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-4 w-4 text-accent-violet" />
            <h3 className="text-base font-semibold">Policy Mix</h3>
          </div>
          <p className="mt-1 text-xs text-muted-foreground">Distribution by type</p>
          <div className="mt-4 h-44">
            {charts?.policyTypeDistribution && (
              <ResponsiveContainer>
                <PieChart>
                  <Pie data={charts.policyTypeDistribution} dataKey="value" innerRadius={45} outerRadius={70} paddingAngle={3} stroke="var(--color-surface)" strokeWidth={2}>
                    {charts.policyTypeDistribution.map((e, i) => <Cell key={i} fill={e.color} />)}
                  </Pie>
                  <Tooltip contentStyle={{ background: "var(--color-surface)", border: "1px solid var(--color-border)", borderRadius: 12, fontSize: 12 }} />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
          <div className="mt-2 grid grid-cols-2 gap-2">
            {charts?.policyTypeDistribution?.map((p) => (
              <div key={p.name} className="flex items-center gap-2 text-xs">
                <span className="h-2 w-2 rounded-full" style={{ background: p.color as string }} />
                <span className="text-muted-foreground">{p.name}</span>
                <span className="ml-auto font-medium">{p.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Claims trend + Upcoming renewals */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="surface-card p-6">
          <div className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-accent-emerald" />
            <h3 className="text-base font-semibold">Claim Trend</h3>
          </div>
          <p className="mt-1 text-xs text-muted-foreground">Claims filed by month</p>
          <div className="mt-4 h-44">
            <ResponsiveContainer>
              <LineChart data={[{m:"Jan",v:6},{m:"Feb",v:9},{m:"Mar",v:5},{m:"Apr",v:11},{m:"May",v:14},{m:"Jun",v:8}]} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}>
                <CartesianGrid stroke="var(--color-border)" vertical={false} />
                <XAxis dataKey="m" tick={{ fontSize: 11, fill: "var(--color-muted-foreground)" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: "var(--color-muted-foreground)" }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ background: "var(--color-surface)", border: "1px solid var(--color-border)", borderRadius: 12, fontSize: 12 }} />
                <Line type="monotone" dataKey="v" stroke={ACCENT_HEX.emerald} strokeWidth={2.5} dot={{ r: 3, fill: ACCENT_HEX.emerald }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="surface-card p-6 lg:col-span-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CalendarClock className="h-4 w-4 text-accent-violet" />
              <h3 className="text-base font-semibold">Upcoming Renewals</h3>
            </div>
            <a href="/renewals" className="text-xs font-medium text-accent-blue hover:underline">View all →</a>
          </div>
          <div className="mt-4 overflow-hidden rounded-xl border border-border">
            <table className="w-full text-sm">
              <thead className="bg-secondary/60 text-[11px] uppercase tracking-wider text-muted-foreground">
                <tr>
                  <th className="px-4 py-2.5 text-left font-semibold">Policy</th>
                  <th className="px-4 py-2.5 text-left font-semibold">Customer</th>
                  <th className="px-4 py-2.5 text-left font-semibold">Expiry</th>
                  <th className="px-4 py-2.5 text-right font-semibold">Days</th>
                  <th className="px-4 py-2.5 text-right font-semibold">Premium</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {renewals?.slice(0, 5).map((r) => (
                  <tr key={r.id} className="transition-colors hover:bg-secondary/40">
                    <td className="px-4 py-3 font-medium">{r.policyNumber}</td>
                    <td className="px-4 py-3 text-muted-foreground">{r.customer}</td>
                    <td className="px-4 py-3 text-muted-foreground">{new Date(r.expiryDate).toLocaleDateString("en-IN")}</td>
                    <td className="px-4 py-3 text-right">
                      <StatusBadge status={r.status} />
                    </td>
                    <td className="px-4 py-3 text-right font-semibold">{formatINR(r.premium)}</td>
                  </tr>
                ))}
                {!renewals?.length && <tr><td colSpan={5} className="p-4 text-center text-muted-foreground">No upcoming renewals</td></tr>}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </PageContainer>
  );
}

/* ---------------- Agent ---------------- */
function AgentDashboard() {
  const { user } = useRole();
  const me = user?.name || "Agent";
  // Server functions already filter by agent session — no client-side filtering needed
  const { data: stats } = useQuery({ queryKey: ["agentStats"], queryFn: () => getDashboardStats() });
  const { data: myPolicies } = useQuery({ queryKey: ["policies"], queryFn: () => getPolicies() });
  const { data: myRenewals } = useQuery({ queryKey: ["renewals"], queryFn: () => getUpcomingRenewals() });
  const { data: myClaims } = useQuery({ queryKey: ["claims"], queryFn: () => getClaims() });
  const policyList = myPolicies ?? [];
  const commission = Math.round(policyList.reduce((s, p) => s + p.premium * 0.12, 0));

  return (
    <PageContainer>
      <PageHeader
        title={<>Welcome back, {me.split(" ")[0]}</>}
        subtitle="Your customers, policies and earnings at a glance"
        actions={<PrimaryButton icon={Plus}>Add Customer</PrimaryButton>}
      />
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <KpiCard label="My Customers" value={stats?.totalCustomers ?? 0} accent="blue" icon={Users} />
        <KpiCard label="Active Policies" value={stats?.activePolicies ?? 0} accent="green" icon={ShieldCheck} />
        <KpiCard label="Expiring Soon" value={stats?.upcomingRenewals ?? 0} accent="amber" icon={CalendarClock} />
        <KpiCard label="Pending Claims" value={stats?.pendingClaims ?? 0} accent="rose" icon={FileWarning} />
        <KpiCard label="Commission (YTD)" value={formatINR(commission)} accent="violet" icon={Wallet} />
      </div>
      <div className="surface-card p-6">
        <h3 className="text-base font-semibold">Recent activity from your book</h3>
        <p className="mt-1 text-xs text-muted-foreground">{policyList.length} policies under your management</p>
        <div className="mt-4 overflow-hidden rounded-xl border border-border">
          <table className="w-full text-sm">
            <thead className="bg-secondary/60 text-[11px] uppercase tracking-wider text-muted-foreground">
              <tr>
                <th className="px-4 py-2.5 text-left font-semibold">Policy</th>
                <th className="px-4 py-2.5 text-left font-semibold">Customer</th>
                <th className="px-4 py-2.5 text-left font-semibold">Type</th>
                <th className="px-4 py-2.5 text-right font-semibold">Premium</th>
                <th className="px-4 py-2.5 text-right font-semibold">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {policyList.slice(0, 6).map((p) => (
                <tr key={p.id} className="hover:bg-secondary/40">
                  <td className="px-4 py-3 font-medium">{p.policyNumber}</td>
                  <td className="px-4 py-3 text-muted-foreground">{p.customer}</td>
                  <td className="px-4 py-3 text-muted-foreground">{p.type}</td>
                  <td className="px-4 py-3 text-right font-semibold">{formatINR(p.premium)}</td>
                  <td className="px-4 py-3 text-right"><StatusBadge status={p.status} /></td>
                </tr>
              ))}
              {!policyList.length && <tr><td colSpan={5} className="p-4 text-center text-muted-foreground">No policies found</td></tr>}
            </tbody>
          </table>
        </div>
      </div>
    </PageContainer>
  );
}

/* ---------------- Customer ---------------- */
function CustomerDashboard() {
  const { user } = useRole();
  const me = user?.name || "Customer";
  // Server functions already filter by customer session — no client-side filtering needed
  const { data: myPolicies = [] } = useQuery({ queryKey: ["policies"], queryFn: () => getPolicies() });
  const { data: myRenewals = [] } = useQuery({ queryKey: ["renewals"], queryFn: () => getUpcomingRenewals() });
  const { data: myClaims = [] } = useQuery({ queryKey: ["claims"], queryFn: () => getClaims() });

  const insurer = myPolicies[0]?.company ?? "Your Insurer";
  const myAgent = myPolicies[0]?.agent ?? "Direct";

  return (
    <PageContainer>
      <PageHeader title={<>Hi {me.split(" ")[0]} 👋</>} subtitle="Your policies, renewals and claims in one place" />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <KpiCard label="My Policies" value={myPolicies.length} accent="blue" icon={ShieldCheck} />
        <KpiCard label="Upcoming Renewal" value={myRenewals[0] ? `${myRenewals[0].daysLeft}d` : "—"} accent="amber" icon={CalendarClock} hint={myRenewals[0]?.policyNumber} />
        <KpiCard label="My Claims" value={myClaims.length} accent="violet" icon={FileWarning} />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="surface-card p-6 lg:col-span-2">
          <h3 className="text-base font-semibold">My Policies</h3>
          <div className="mt-4 space-y-3">
            {myPolicies.map((p) => (
              <div key={p.id} className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border p-4">
                <div>
                  <div className="text-sm font-semibold">{p.policyNumber}</div>
                  <div className="mt-0.5 text-xs text-muted-foreground">{p.type} · {p.company}</div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-semibold">{formatINR(p.premium)}<span className="text-xs font-normal text-muted-foreground">/yr</span></div>
                  <div className="mt-0.5 text-xs text-muted-foreground">Expires {new Date(p.expiryDate).toLocaleDateString("en-IN")}</div>
                </div>
                <StatusBadge status={p.status} />
              </div>
            ))}
            {myPolicies.length === 0 && <div className="rounded-xl border border-dashed border-border p-8 text-center text-sm text-muted-foreground">No policies yet</div>}
          </div>
        </div>

        <div className="space-y-6">
          <div className="surface-card p-6">
            <div className="flex items-center gap-2">
              <Building2 className="h-4 w-4 text-accent-blue" />
              <h3 className="text-base font-semibold">My Insurance Company</h3>
            </div>
            <div className="mt-4">
              <div className="text-sm font-semibold">{insurer}</div>
              <div className="mt-2 space-y-1.5 text-xs text-muted-foreground">
                <div className="flex items-center gap-2"><Phone className="h-3 w-3" /> 1800-425-2255</div>
                <div className="flex items-center gap-2"><Mail className="h-3 w-3" /> care@{insurer.toLowerCase().replace(/\s/g, "")}.com</div>
              </div>
            </div>
          </div>

          <div className="surface-card p-6">
            <div className="flex items-center gap-2">
              <UserCog className="h-4 w-4 text-accent-violet" />
              <h3 className="text-base font-semibold">My Agent</h3>
            </div>
            <div className="mt-4 flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-full bg-accent-violet/10 text-sm font-semibold text-accent-violet">
                {myAgent.split(" ").map((w) => w[0]).join("")}
              </div>
              <div>
                <div className="text-sm font-semibold">{myAgent}</div>
                <div className="text-xs text-muted-foreground">Agent / Broker</div>
              </div>
            </div>
            <div className="mt-4 space-y-1.5 text-xs text-muted-foreground">
              <div className="flex items-center gap-2"><Phone className="h-3 w-3" /> +91 98765 43210</div>
              <div className="flex items-center gap-2"><Mail className="h-3 w-3" /> hello@securesuite.in</div>
              <div className="flex items-center gap-2"><MapPin className="h-3 w-3" /> Mumbai, MH</div>
            </div>
          </div>
        </div>
      </div>
    </PageContainer>
  );
}
