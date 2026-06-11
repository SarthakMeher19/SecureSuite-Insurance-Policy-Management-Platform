import { createServerFn } from "@tanstack/react-start";
import { db } from "../db";
import { requireSession, requireRole } from "../auth-middleware";

export const getCustomers = createServerFn({ method: "GET" }).handler(async () => {
  const session = requireSession();

  // Customers cannot list other customers
  if (session.role === "customer") {
    throw new Error("Forbidden — customers cannot access customer list");
  }

  const where: any = {};
  if (session.role === "agent" && session.agentId) {
    where.agent_id = BigInt(session.agentId);
  }

  const customers = await db.customers.findMany({
    where,
    include: {
      agents: true,
      _count: {
        select: { policies: true },
      },
    },
  });

  return customers.map((c) => ({
    id: `C-${c.id.toString()}`,
    name: c.name,
    email: c.email ?? "",
    phone: c.phone_no,
    city: c.address,
    kycStatus: "Verified" as const,
    policies: c._count.policies,
    agent: c.agents?.name ?? "Direct",
    joinedAt: c.created_at
      ? c.created_at.toISOString().split("T")[0]
      : new Date().toISOString().split("T")[0],
  }));
});

export const getCustomerById = createServerFn({ method: "GET" })
  .inputValidator((d: string) => d)
  .handler(async ({ data: id }) => {
    const session = requireSession();
    const rawId = id.startsWith("C-") ? id.replace("C-", "") : id;

    const c = await db.customers.findUnique({
      where: { id: BigInt(rawId) },
      include: {
        agents: true,
        policies: {
          include: { claims_master: true },
        },
        claims_master: true,
      },
    });

    if (!c) throw new Error("Customer not found");

    // Ownership checks
    if (session.role === "customer" && session.customerId) {
      if (c.id.toString() !== session.customerId) {
        throw new Error("Forbidden — you can only view your own profile");
      }
    } else if (session.role === "agent" && session.agentId) {
      if (c.agent_id?.toString() !== session.agentId) {
        throw new Error("Forbidden — this customer is not assigned to you");
      }
    }

    return {
      id: `C-${c.id.toString()}`,
      dbId: c.id.toString(),
      name: c.name,
      email: c.email ?? "",
      phone: c.phone_no,
      address: c.address,
      agent: c.agents?.name ?? "Direct",
      joinedAt: c.created_at
        ? c.created_at.toISOString().split("T")[0]
        : new Date().toISOString().split("T")[0],
      policies: c.policies.map((p) => ({
        id: p.id.toString(),
        policyNumber: p.p_number,
        type: p.p_type,
        company: p.insurer_name,
        premium: Number(p.total),
        status: new Date() > p.end_date ? "Expired" : "Active",
      })),
      claims: c.claims_master.map((cl) => ({
        id: cl.id.toString(),
        claimNo: cl.claim_no,
        amount: cl.amount_settled
          ? Number(cl.amount_settled)
          : cl.estimated_loss
            ? Number(cl.estimated_loss)
            : 0,
        status: cl.status,
      })),
    };
  });

export const createCustomer = createServerFn({ method: "POST" })
  .inputValidator(
    (d: {
      name: string;
      email?: string;
      phone: string;
      address: string;
      agentId?: string;
    }) => d,
  )
  .handler(async ({ data }) => {
    const session = requireRole("admin", "agent");

    const customer = await db.customers.create({
      data: {
        name: data.name,
        email: data.email,
        phone_no: data.phone,
        address: data.address,
        agent_id:
          session.role === "agent" && session.agentId
            ? BigInt(session.agentId)
            : data.agentId
              ? BigInt(data.agentId)
              : null,
        created_at: new Date(),
        updated_at: new Date(),
      },
    });
    return customer.id.toString();
  });

export const updateCustomer = createServerFn({ method: "POST" })
  .inputValidator(
    (d: {
      id: string;
      name: string;
      email?: string;
      phone: string;
      address: string;
      agentId?: string;
    }) => d,
  )
  .handler(async ({ data }) => {
    const session = requireRole("admin", "agent");

    // Agents can only update their own customers
    if (session.role === "agent" && session.agentId) {
      const existing = await db.customers.findUnique({
        where: { id: BigInt(data.id) },
      });
      if (existing && existing.agent_id?.toString() !== session.agentId) {
        throw new Error("Forbidden — this customer is not assigned to you");
      }
    }

    const customer = await db.customers.update({
      where: { id: BigInt(data.id) },
      data: {
        name: data.name,
        email: data.email,
        phone_no: data.phone,
        address: data.address,
        agent_id:
          session.role === "agent" && session.agentId
            ? BigInt(session.agentId)
            : data.agentId
              ? BigInt(data.agentId)
              : null,
        updated_at: new Date(),
      },
    });
    return customer.id.toString();
  });

export const deleteCustomer = createServerFn({ method: "POST" })
  .inputValidator((d: { id: string }) => d)
  .handler(async ({ data }) => {
    requireRole("admin");

    await db.customers.delete({
      where: { id: BigInt(data.id) },
    });
    return true;
  });
