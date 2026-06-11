import { createServerFn } from "@tanstack/react-start";
import { db } from "../db";
import { requireRole } from "../auth-middleware";

export const getQuotations = createServerFn({ method: "GET" }).handler(async () => {
  const session = requireRole("admin", "agent");

  // Agents see only quotations for policies they manage
  let quotations;
  if (session.role === "agent" && session.agentId) {
    const agentPolicies = await db.policies.findMany({
      where: { refered_by: BigInt(session.agentId) },
      select: { id: true },
    });
    const policyIds = agentPolicies.map((p) => p.id);
    quotations = await db.quotations.findMany({
      where: { policy_id: { in: [...policyIds, 0n] } },
      orderBy: { created_at: "desc" },
    });
  } else {
    quotations = await db.quotations.findMany({
      orderBy: { created_at: "desc" },
    });
  }

  return quotations.map((q) => ({
    id: q.id.toString(),
    customerName: q.c_name,
    insurer: q.insurer_name,
    type: q.p_type,
    premium: Number(q.total),
    status: q.policy_id && q.policy_id !== 0n ? "Converted" : "Pending",
    policyId: q.policy_id?.toString() || null,
    createdAt: q.created_at
      ? q.created_at.toISOString().split("T")[0]
      : new Date().toISOString().split("T")[0],
  }));
});

export const getQuotationById = createServerFn({ method: "GET" })
  .inputValidator((d: string) => d)
  .handler(async ({ data: id }) => {
    requireRole("admin", "agent");

    const q = await db.quotations.findUnique({
      where: { id: BigInt(id) },
    });

    if (!q) throw new Error("Quotation not found");

    return {
      id: q.id.toString(),
      customerName: q.c_name,
      customerId: q.customer_id,
      address: q.address || "",
      mobile: q.mobile_no || "",
      group: q.group || "",
      insurer: q.insurer_name,
      type: q.p_type,
      productName: q.p_name,
      tpMotor: Number(q.tp_motor),
      basic: Number(q.basic),
      terr: Number(q.terr),
      eq: Number(q.eq),
      other: Number(q.other),
      stfi: Number(q.stfi),
      gst: Number(q.gst),
      total: Number(q.total),
      remark: q.remark || "",
      policyId: q.policy_id?.toString() || null,
      status: q.policy_id && q.policy_id !== 0n ? "Converted" : "Pending",
    };
  });

export const createQuotation = createServerFn({ method: "POST" })
  .inputValidator((d: any) => d)
  .handler(async ({ data }) => {
    requireRole("admin", "agent");

    const q = await db.quotations.create({
      data: {
        policy_id: 0n,
        c_name: data.customerName,
        customer_id: data.customerId || "0",
        address: data.address || "",
        mobile_no: data.mobile || "",
        group: data.group || "Retail",
        insurer_name: data.insurer,
        p_type: data.type,
        p_name: data.productName || "Standard",
        tp_motor: data.tpMotor || 0,
        basic: data.basic || 0,
        terr: data.terr || 0,
        eq: data.eq || 0,
        other: data.other || 0,
        stfi: data.stfi || 0,
        gst: data.gst || 0,
        total: data.total || 0,
        remark: data.remark || "",
        created_at: new Date(),
        updated_at: new Date(),
      },
    });
    return q.id.toString();
  });

export const convertToPolicy = createServerFn({ method: "POST" })
  .inputValidator((d: string) => d)
  .handler(async ({ data: id }) => {
    requireRole("admin", "agent");

    const q = await db.quotations.findUnique({
      where: { id: BigInt(id) },
    });

    if (!q) throw new Error("Quotation not found");
    if (q.policy_id && q.policy_id !== 0n)
      throw new Error("Quotation already converted to a policy");

    const p = await db.policies.create({
      data: {
        c_name: q.c_name,
        group: q.group || "Retail",
        address: q.address || "",
        mobile_no: q.mobile_no || "",
        insurer_name: q.insurer_name,
        p_type: q.p_type,
        p_name: q.p_name,
        tp_motor: q.tp_motor,
        basic: q.basic,
        terr: q.terr,
        eq: q.eq,
        other: q.other,
        stfi: q.stfi,
        gst: q.gst,
        total: q.total,
        remark: q.remark,
        start_date: new Date(),
        end_date: new Date(new Date().setFullYear(new Date().getFullYear() + 1)),
        created_at: new Date(),
        updated_at: new Date(),
      },
    });

    await db.quotations.update({
      where: { id: BigInt(id) },
      data: {
        policy_id: p.id,
        updated_at: new Date(),
      },
    });

    return p.id.toString();
  });
