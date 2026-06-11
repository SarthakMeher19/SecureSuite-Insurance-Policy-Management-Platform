import { createServerFn } from "@tanstack/react-start";
import { db } from "../db";
import { requireSession, requireRole } from "../auth-middleware";

export const getClaims = createServerFn({ method: "GET" }).handler(async () => {
  const session = requireSession();

  const where: any = {};
  if (session.role === "agent" && session.agentId) {
    // Get policy IDs for this agent
    const agentPolicies = await db.policies.findMany({
      where: { refered_by: BigInt(session.agentId) },
      select: { id: true },
    });
    where.policy_id = { in: agentPolicies.map((p) => p.id) };
  } else if (session.role === "customer" && session.customerId) {
    where.customer_id = BigInt(session.customerId);
  }

  const claims = await db.claims_master.findMany({
    where,
    include: {
      customers: true,
      policies: true,
    },
  });

  return claims.map((c) => ({
    id: `CL-${c.id.toString()}`,
    claimNumber: c.claim_no ?? "Pending",
    customer: c.customers?.name ?? "Unknown",
    policy: c.policies?.p_number ?? "Unknown",
    amount: c.amount_settled
      ? Number(c.amount_settled)
      : c.estimated_loss
        ? Number(c.estimated_loss)
        : 0,
    filedOn: c.date_of_intimation
      ? c.date_of_intimation.toISOString().split("T")[0]
      : new Date().toISOString().split("T")[0],
    status: (c.status as "Approved" | "Under Review" | "Rejected" | "Settled") ?? "Under Review",
  }));
});

export const createClaim = createServerFn({ method: "POST" })
  .inputValidator((d: any) => d)
  .handler(async ({ data }) => {
    const session = requireSession();

    // Verify ownership of the policy
    if (session.role === "customer" && session.customerId) {
      const policy = await db.policies.findUnique({ where: { id: BigInt(data.policyId) } });
      if (policy && policy.customer_id?.toString() !== session.customerId) {
        throw new Error("Forbidden — you can only file claims for your own policies");
      }
    } else if (session.role === "agent" && session.agentId) {
      const policy = await db.policies.findUnique({ where: { id: BigInt(data.policyId) } });
      if (policy && policy.refered_by?.toString() !== session.agentId) {
        throw new Error("Forbidden — you can only file claims for your own policies");
      }
    }

    const claim = await db.claims_master.create({
      data: {
        customer_id: BigInt(data.customerId),
        policy_id: BigInt(data.policyId),
        claim_no: data.claimNo || `CL-TMP-${Date.now()}`,
        insurer_ref_no: data.insurerRefNo || "",
        claimed: data.amount ? data.amount.toString() : "0",
        date_of_intimation: data.dateOfIntimation ? new Date(data.dateOfIntimation) : new Date(),
        date_of_loss: data.dateOfLoss ? new Date(data.dateOfLoss) : new Date(),
        nature_of_loss: data.natureOfLoss || "",
        estimated_loss: data.estimatedLoss ? data.estimatedLoss.toString() : "0",
        particular_of_surveyor: data.surveyor || "",
        status: data.status || "Under Review",
        created_at: new Date(),
        updated_at: new Date(),
      },
    });
    return claim.id.toString();
  });

export const updateClaim = createServerFn({ method: "POST" })
  .inputValidator((d: any) => d)
  .handler(async ({ data }) => {
    // Only admins can update claim status/settlement
    requireRole("admin");

    const claim = await db.claims_master.update({
      where: { id: BigInt(data.id) },
      data: {
        claim_no: data.claimNo,
        insurer_ref_no: data.insurerRefNo,
        date_of_settlement: data.dateOfSettlement ? new Date(data.dateOfSettlement) : null,
        amount_settled: data.amountSettled ? data.amountSettled.toString() : null,
        status: data.status,
        updated_at: new Date(),
      },
    });
    return claim.id.toString();
  });
