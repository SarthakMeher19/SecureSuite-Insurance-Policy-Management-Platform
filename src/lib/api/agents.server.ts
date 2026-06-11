import { createServerFn } from "@tanstack/react-start";
import { db } from "../db";
import { requireRole, requireSession } from "../auth-middleware";

export const getAgents = createServerFn({ method: "GET" }).handler(async () => {
  const session = requireSession();

  // Customers cannot view agents list
  if (session.role === "customer") {
    throw new Error("Forbidden — customers cannot access agent list");
  }

  const where: any = {};
  // Agents can only see themselves
  if (session.role === "agent" && session.agentId) {
    where.id = BigInt(session.agentId);
  }

  const agents = await db.agents.findMany({
    where,
    include: {
      _count: {
        select: { customers: true, policies: true },
      },
      agent_brokerages: {
        select: { total_brokerage_amount: true },
      },
    },
  });

  return agents.map((a) => {
    const commission = a.agent_brokerages.reduce(
      (sum, b) => sum + Number(b.total_brokerage_amount),
      0,
    );
    return {
      id: a.id.toString(),
      name: a.name,
      role: "Agent",
      email: a.email ?? "",
      phone: a.phone_no,
      city: a.address,
      brokerage_rate: a.brokerage_rate ? Number(a.brokerage_rate) : 0,
      customerCount: a._count.customers,
      policyCount: a._count.policies,
      commission,
    };
  });
});

export const createAgent = createServerFn({ method: "POST" })
  .inputValidator(
    (d: { name: string; email?: string; phone: string; city: string; rate: number }) => d,
  )
  .handler(async ({ data }) => {
    requireRole("admin");

    const agent = await db.agents.create({
      data: {
        name: data.name,
        email: data.email,
        phone_no: data.phone,
        address: data.city,
        brokerage_rate: data.rate,
        created_at: new Date(),
        updated_at: new Date(),
      },
    });
    return agent.id.toString();
  });

export const updateAgent = createServerFn({ method: "POST" })
  .inputValidator(
    (d: {
      id: string;
      name: string;
      email?: string;
      phone: string;
      city: string;
      rate: number;
    }) => d,
  )
  .handler(async ({ data }) => {
    requireRole("admin");

    const agent = await db.agents.update({
      where: { id: BigInt(data.id) },
      data: {
        name: data.name,
        email: data.email,
        phone_no: data.phone,
        address: data.city,
        brokerage_rate: data.rate,
        updated_at: new Date(),
      },
    });
    return agent.id.toString();
  });

export const deleteAgent = createServerFn({ method: "POST" })
  .inputValidator((d: { id: string }) => d)
  .handler(async ({ data }) => {
    requireRole("admin");

    await db.agents.delete({
      where: { id: BigInt(data.id) },
    });
    return true;
  });
