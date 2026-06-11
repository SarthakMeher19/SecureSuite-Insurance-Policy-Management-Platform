import { createServerFn } from "@tanstack/react-start";
import { db } from "../db";
import { requireSession, requireRole } from "../auth-middleware";

export const getAgentBrokerages = createServerFn({ method: "GET" }).handler(async () => {
  const session = requireRole("admin", "agent");

  const where: any = {};
  if (session.role === "agent" && session.agentId) {
    where.agent_id = BigInt(session.agentId);
  }

  const agentBrokerages = await db.agent_brokerages.findMany({
    where,
    include: { agents: true },
  });

  return agentBrokerages.map((ab) => ({
    id: `AB-${ab.id.toString()}`,
    agentName: ab.agents.name,
    amount: Number(ab.total_brokerage_amount),
    paymentDate: ab.payment_date.toISOString().split("T")[0],
  }));
});

export const getCompanyBrokerages = createServerFn({ method: "GET" }).handler(async () => {
  requireRole("admin");

  const companyBrokerages = await db.company_brokerages.findMany();

  return companyBrokerages.map((cb) => ({
    id: `CB-${cb.id.toString()}`,
    amount: Number(cb.received_amount),
    paymentDate: cb.payment_date.toISOString().split("T")[0],
  }));
});

export const createAgentBrokerage = createServerFn({ method: "POST" })
  .inputValidator((d: any) => d)
  .handler(async ({ data }) => {
    requireRole("admin");

    const b = await db.agent_brokerages.create({
      data: {
        agent_id: BigInt(data.agentId),
        policy_ids: JSON.stringify(data.policyIds || []),
        total_brokerage_amount: Number(data.amount),
        payment_method: data.paymentMethod || "bank_transfer",
        payment_details: data.paymentDetails || "",
        payment_date: new Date(data.paymentDate),
        created_at: new Date(),
        updated_at: new Date(),
      },
    });
    return b.id.toString();
  });

export const createCompanyBrokerage = createServerFn({ method: "POST" })
  .inputValidator((d: any) => d)
  .handler(async ({ data }) => {
    requireRole("admin");

    const b = await db.company_brokerages.create({
      data: {
        policy_ids: JSON.stringify(data.policyIds || []),
        received_amount: Number(data.amount),
        gst: Number(data.gst || 0),
        payment_method: data.paymentMethod || "bank_transfer",
        payment_details: data.paymentDetails || "",
        payment_date: new Date(data.paymentDate),
        created_at: new Date(),
        updated_at: new Date(),
      },
    });
    return b.id.toString();
  });
