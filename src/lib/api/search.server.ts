import { createServerFn } from "@tanstack/react-start";
import { db } from "../db";
import { requireSession } from "../auth-middleware";

export const globalSearch = createServerFn({ method: "GET" })
  .inputValidator((q: string) => q)
  .handler(async ({ data: query }) => {
    if (!query || query.length < 2) {
      return { policies: [], customers: [], agents: [], claims: [] };
    }

    const session = requireSession();

    // Build role-based where clauses
    const policyWhere: any = {
      OR: [
        { p_number: { contains: query } },
        { c_name: { contains: query } },
        { insurer_name: { contains: query } },
      ],
    };

    if (session.role === "agent" && session.agentId) {
      policyWhere.refered_by = BigInt(session.agentId);
    } else if (session.role === "customer" && session.customerId) {
      policyWhere.customer_id = BigInt(session.customerId);
    }

    const policies = await db.policies.findMany({
      where: policyWhere,
      take: 5,
    });

    // Customers search — agents see their customers, customers see none
    let customers: any[] = [];
    if (session.role !== "customer") {
      const customerWhere: any = {
        OR: [
          { name: { contains: query } },
          { phone_no: { contains: query } },
          { email: { contains: query } },
        ],
      };
      if (session.role === "agent" && session.agentId) {
        customerWhere.agent_id = BigInt(session.agentId);
      }
      customers = await db.customers.findMany({
        where: customerWhere,
        take: 5,
      });
    }

    // Agents search — admin only
    let agents: any[] = [];
    if (session.role === "admin") {
      agents = await db.agents.findMany({
        where: {
          OR: [
            { name: { contains: query } },
            { phone_no: { contains: query } },
            { email: { contains: query } },
          ],
        },
        take: 5,
      });
    }

    // Claims search — filtered by role
    const claimWhere: any = {
      OR: [
        { claim_no: { contains: query } },
        { insurer_ref_no: { contains: query } },
      ],
    };

    if (session.role === "agent" && session.agentId) {
      const agentPolicies = await db.policies.findMany({
        where: { refered_by: BigInt(session.agentId) },
        select: { id: true },
      });
      claimWhere.policy_id = { in: agentPolicies.map((p) => p.id) };
    } else if (session.role === "customer" && session.customerId) {
      claimWhere.customer_id = BigInt(session.customerId);
    }

    const claims = await db.claims_master.findMany({
      where: claimWhere,
      take: 5,
    });

    return {
      policies: policies.map((p) => ({
        id: p.id.toString(),
        display: `${p.p_number || "Unknown"} - ${p.c_name}`,
        sub: p.insurer_name,
        type: "policy",
      })),
      customers: customers.map((c: any) => ({
        id: c.id.toString(),
        display: c.name,
        sub: c.phone_no,
        type: "customer",
      })),
      agents: agents.map((a: any) => ({
        id: a.id.toString(),
        display: a.name,
        sub: a.phone_no,
        type: "agent",
      })),
      claims: claims.map((c) => ({
        id: c.id.toString(),
        display: c.claim_no || "Unknown",
        sub: c.status,
        type: "claim",
      })),
    };
  });
