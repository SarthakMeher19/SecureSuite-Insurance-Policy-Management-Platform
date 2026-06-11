import { createServerFn } from "@tanstack/react-start";
import { db } from "../db";
import { requireSession, requireRole } from "../auth-middleware";

export const getPayments = createServerFn({ method: "GET" }).handler(async () => {
  const session = requireSession();

  const where: any = {};
  if (session.role === "agent" && session.agentId) {
    const agentPolicies = await db.policies.findMany({
      where: { refered_by: BigInt(session.agentId) },
      select: { id: true },
    });
    where.policy_id = { in: agentPolicies.map((p) => p.id) };
  } else if (session.role === "customer" && session.customerId) {
    const custPolicies = await db.policies.findMany({
      where: { customer_id: BigInt(session.customerId) },
      select: { id: true },
    });
    where.policy_id = { in: custPolicies.map((p) => p.id) };
  }

  const payments = await db.payments.findMany({
    where,
    include: { policies: true },
  });

  return payments.map((p) => ({
    id: `PAY-${p.id.toString()}`,
    policyNumber: p.policies?.p_number ?? "Unknown",
    paymentType: p.payment_type,
    amount: Number(p.amount),
    payDate: p.pay_date.toISOString().split("T")[0],
  }));
});

export const createPayment = createServerFn({ method: "POST" })
  .inputValidator((d: any) => d)
  .handler(async ({ data }) => {
    requireRole("admin", "agent");

    const p = await db.payments.create({
      data: {
        policy_id: BigInt(data.policyId),
        payment_type: data.paymentType,
        cheque_no: data.chequeNo || "",
        bank_name: data.bankName || "",
        branch_name: data.branchName || "",
        pay_date: new Date(data.payDate),
        amount: Number(data.amount),
        note: data.note || "",
        created_at: new Date(),
        updated_at: new Date(),
      },
    });
    return p.id.toString();
  });
