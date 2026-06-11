import { createServerFn } from "@tanstack/react-start";
import { db } from "../db";
import { requireSession } from "../auth-middleware";

function daysBetween(date: Date) {
  const d = new Date(date);
  const today = new Date();
  return Math.round((d.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
}

export const getDashboardStats = createServerFn({ method: "GET" }).handler(async () => {
  const session = requireSession();

  // Build role-based where clause for policies
  const policyWhere: any = {};
  if (session.role === "agent" && session.agentId) {
    policyWhere.refered_by = BigInt(session.agentId);
  } else if (session.role === "customer" && session.customerId) {
    policyWhere.customer_id = BigInt(session.customerId);
  }

  const policies = await db.policies.findMany({
    where: policyWhere,
    select: { id: true, total: true, start_date: true, end_date: true, customer_id: true },
  });

  // Claims filter
  const claimWhere: any = {};
  if (session.role === "agent" && session.agentId) {
    // Claims for policies assigned to this agent
    const policyIds = policies.map((p) => p.id);
    claimWhere.policy_id = { in: policyIds };
  } else if (session.role === "customer" && session.customerId) {
    claimWhere.customer_id = BigInt(session.customerId);
  }

  const claims = await db.claims_master.findMany({
    where: claimWhere,
    select: { id: true, status: true },
  });

  // Counts — admin sees all, others see filtered
  let customersCount = 0;
  let agentsCount = 0;

  if (session.role === "admin") {
    customersCount = await db.customers.count();
    agentsCount = await db.agents.count();
  } else if (session.role === "agent" && session.agentId) {
    customersCount = await db.customers.count({
      where: { agent_id: BigInt(session.agentId) },
    });
    agentsCount = 1; // Just themselves
  } else if (session.role === "customer") {
    customersCount = 1;
    agentsCount = 0;
  }

  const today = new Date();
  let activePolicies = 0;
  let expiredPolicies = 0;
  let premiumCollected = 0;
  let upcomingRenewals = 0;

  for (const p of policies) {
    if (today >= p.start_date && today <= p.end_date) {
      activePolicies++;
      premiumCollected += Number(p.total);
    } else if (today > p.end_date) {
      expiredPolicies++;
    }

    const dLeft = daysBetween(p.end_date);
    if (dLeft >= 0 && dLeft <= 60) {
      upcomingRenewals++;
    }
  }

  const pendingClaims = claims.filter(
    (c) => c.status !== "Settled" && c.status !== "Approved",
  ).length;

  return {
    totalPolicies: policies.length,
    activePolicies,
    expiredPolicies,
    premiumCollected,
    pendingPremium: 0,
    upcomingRenewals,
    totalClaims: claims.length,
    pendingClaims,
    totalCustomers: customersCount,
    totalAgents: agentsCount,
  };
});

export const getDashboardCharts = createServerFn({ method: "GET" }).handler(async () => {
  const session = requireSession();

  const policyWhere: any = {};
  if (session.role === "agent" && session.agentId) {
    policyWhere.refered_by = BigInt(session.agentId);
  } else if (session.role === "customer" && session.customerId) {
    policyWhere.customer_id = BigInt(session.customerId);
  }

  // Policy Mix
  const allPolicies = await db.policies.findMany({
    where: policyWhere,
    select: { p_type: true, total: true, start_date: true },
  });

  // Group by type manually since groupBy + where is cleaner this way
  const typeMap: Record<string, number> = {};
  for (const p of allPolicies) {
    typeMap[p.p_type] = (typeMap[p.p_type] || 0) + 1;
  }

  const colors: Record<string, string> = {
    Health: "var(--color-accent-blue)",
    Vehicle: "var(--color-accent-green)",
    Life: "var(--color-accent-violet)",
    Travel: "var(--color-accent-amber)",
    Property: "var(--color-accent-rose)",
  };

  const policyTypeDistribution = Object.entries(typeMap).map(([name, value]) => ({
    name,
    value,
    color: colors[name] || "var(--color-accent-blue)",
  }));

  // Monthly premium from actual data
  const monthlyMap: Record<string, number> = {};
  for (const p of allPolicies) {
    const month = p.start_date.toLocaleString("en-US", { month: "short" });
    monthlyMap[month] = (monthlyMap[month] || 0) + Number(p.total);
  }

  const monthlyPremium = Object.entries(monthlyMap)
    .slice(-6)
    .map(([month, value]) => ({ month, value }));

  return {
    policyTypeDistribution,
    monthlyPremium:
      monthlyPremium.length > 0
        ? monthlyPremium
        : [{ month: "—", value: 0 }],
  };
});

export const getUpcomingRenewals = createServerFn({ method: "GET" }).handler(async () => {
  const session = requireSession();

  const policyWhere: any = {};
  if (session.role === "agent" && session.agentId) {
    policyWhere.refered_by = BigInt(session.agentId);
  } else if (session.role === "customer" && session.customerId) {
    policyWhere.customer_id = BigInt(session.customerId);
  }

  const policies = await db.policies.findMany({
    where: policyWhere,
    include: { customers: true },
  });

  return policies
    .map((p) => {
      const dLeft = daysBetween(p.end_date);
      return {
        id: `R-${p.id.toString()}`,
        policyNumber: p.p_number,
        customer: p.customers?.name ?? "Unknown",
        company: p.insurer_name,
        expiryDate: p.end_date.toISOString().split("T")[0],
        daysLeft: dLeft,
        premium: Number(p.total),
        status: (dLeft < 0
          ? "Overdue"
          : dLeft <= 60
            ? "Upcoming"
            : "Renewed") as "Overdue" | "Upcoming" | "Renewed",
      };
    })
    .filter((r) => r.status !== "Renewed")
    .sort((a, b) => a.daysLeft - b.daysLeft);
});
