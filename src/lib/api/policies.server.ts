import { createServerFn } from "@tanstack/react-start";
import { db } from "../db";
import { requireSession, requireRole } from "../auth-middleware";

function determineStatus(startDate: Date, endDate: Date): "Active" | "Expired" | "Pending" | "Lapsed" {
  const today = new Date();
  if (today < startDate) return "Pending";
  if (today > endDate) return "Expired";
  return "Active";
}

export const getPolicies = createServerFn({ method: "GET" }).handler(async () => {
  const session = requireSession();

  const where: any = {};
  if (session.role === "agent" && session.agentId) {
    where.refered_by = BigInt(session.agentId);
  } else if (session.role === "customer" && session.customerId) {
    where.customer_id = BigInt(session.customerId);
  }

  const policies = await db.policies.findMany({
    where,
    include: {
      customers: true,
      agents: true,
    },
  });

  return policies.map((p) => ({
    id: `P-${p.id.toString()}`,
    dbId: p.id.toString(),
    policyNumber: p.p_number,
    customer: p.customers?.name ?? "Unknown",
    type: p.p_type as "Health" | "Vehicle" | "Life" | "Travel" | "Property",
    company: p.insurer_name,
    premium: Number(p.total),
    sumInsured: Number(p.sub_ins),
    startDate: p.start_date.toISOString().split("T")[0],
    expiryDate: p.end_date.toISOString().split("T")[0],
    status: determineStatus(p.start_date, p.end_date),
    agent: p.agents?.name ?? "Direct",
  }));
});

export const getPolicyById = createServerFn({ method: "GET" })
  .inputValidator((d: string) => d)
  .handler(async ({ data: id }) => {
    const session = requireSession();
    const rawId = id.startsWith("P-") ? id.replace("P-", "") : id;

    const p = await db.policies.findUnique({
      where: { id: BigInt(rawId) },
      include: {
        customers: true,
        agents: true,
        motors: true,
        fires: true,
        healths: true,
        payments: true,
        claims_master: true,
        timeline_entries: true,
      },
    });

    if (!p) throw new Error("Policy not found");

    // Ownership check
    if (session.role === "agent" && session.agentId) {
      if (p.refered_by?.toString() !== session.agentId) {
        throw new Error("Forbidden — you do not have access to this policy");
      }
    } else if (session.role === "customer" && session.customerId) {
      if (p.customer_id?.toString() !== session.customerId) {
        throw new Error("Forbidden — you do not have access to this policy");
      }
    }

    let renewFromNumber = null;
    if (p.renew_id) {
      const parentPolicy = await db.policies.findUnique({
        where: { id: p.renew_id },
        select: { p_number: true },
      });
      if (parentPolicy) {
        renewFromNumber = parentPolicy.p_number;
      }
    }

    return {
      id: `P-${p.id.toString()}`,
      dbId: p.id.toString(),
      policyNumber: p.p_number,
      customer: p.customers?.name ?? "Unknown",
      customerId: `C-${p.customers?.id.toString()}`,
      type: p.p_type as "Health" | "Vehicle" | "Life" | "Travel" | "Property",
      company: p.insurer_name,
      premium: Number(p.total),
      sumInsured: Number(p.sub_ins),
      startDate: p.start_date.toISOString().split("T")[0],
      expiryDate: p.end_date.toISOString().split("T")[0],
      status: determineStatus(p.start_date, p.end_date),
      agent: p.agents?.name ?? "Direct",
      endorsementNo: p.endorsement_no,
      endorseDate: p.endorse_date ? p.endorse_date.toISOString().split("T")[0] : null,
      endorseDetail: p.endorse_detail,
      renewId: p.renew_id ? p.renew_id.toString() : null,
      renewFromNumber,
      details: {
        motor: p.motors[0]
          ? {
              vehicleNo: (p.motors[0] as any).vehicle_no ?? p.motors[0].vehicle_reg_no,
              engineNo: (p.motors[0] as any).engine_no ?? p.motors[0].engine_no,
              chassisNo: (p.motors[0] as any).chassis_no ?? p.motors[0].chasis_no,
              makeModel: (p.motors[0] as any).make_model ?? p.motors[0].vehicle_name,
            }
          : null,
        fire: p.fires[0]
          ? {
              riskLocation: (p.fires[0] as any).risk_location ?? p.fires[0].risk_location_address,
            }
          : null,
        health: p.healths.map((h) => ({
          member: (h as any).mamber_name ?? h.member_name,
          dob: ((h as any).dob ?? h.birthday)?.toISOString().split("T")[0],
          relation: h.relation,
        })),
      },
      payments: p.payments.map((pay) => ({
        id: pay.id.toString(),
        amount: Number(pay.amount),
        date: pay.pay_date.toISOString().split("T")[0],
        type: pay.payment_type,
      })),
      claims: p.claims_master.map((c) => ({
        id: c.id.toString(),
        claimNo: c.claim_no,
        amount: c.amount_settled
          ? Number(c.amount_settled)
          : c.estimated_loss
            ? Number(c.estimated_loss)
            : 0,
        status: c.status,
        date: c.date_of_intimation?.toISOString().split("T")[0],
      })),
      timeline: p.timeline_entries.map((t) => ({
        id: t.id.toString(),
        description: (t as any).description ?? t.content,
        date: t.created_at?.toISOString().split("T")[0],
      })),
    };
  });

export const createPolicy = createServerFn({ method: "POST" })
  .inputValidator((d: any) => d)
  .handler(async ({ data }) => {
    const session = requireRole("admin", "agent");

    // Agents can only create policies for their own customers
    if (session.role === "agent" && session.agentId && data.customerId) {
      const customer = await db.customers.findUnique({
        where: { id: BigInt(data.customerId) },
      });
      if (customer && customer.agent_id?.toString() !== session.agentId) {
        throw new Error("Forbidden — you can only create policies for your own customers");
      }
    }

    const policy = await db.policies.create({
      data: {
        p_number: data.policyNumber,
        c_name: data.customerName || "Unknown",
        group: data.group || "Retail",
        address: data.address || "",
        mobile_no: data.phone || "",
        insurer_name: data.company,
        p_type: data.type,
        p_name: data.policyName || `${data.type} Policy`,
        start_date: new Date(data.startDate),
        end_date: new Date(data.expiryDate),
        sub_ins: data.sumInsured,
        total: data.premium,
        companyBrokerage: data.brokerage || 0,
        tp_motor: data.tpMotor || 0,
        basic: data.basic || 0,
        terr: data.terr || 0,
        eq: data.eq || 0,
        other: data.other || 0,
        stfi: data.stfi || 0,
        gst: data.gst || 0,
        receipt_date: new Date(),
        customer_id: data.customerId ? BigInt(data.customerId) : null,
        refered_by: session.role === "agent" && session.agentId
          ? BigInt(session.agentId)
          : data.agentId
            ? BigInt(data.agentId)
            : null,
        created_at: new Date(),
        updated_at: new Date(),
      },
    });

    if (data.type === "Vehicle" && data.motorDetails) {
      await db.motors.create({
        data: {
          policy_id: policy.id,
          vehicle_reg_no: data.motorDetails.vehicleNo,
          vehicle_name: data.motorDetails.makeModel,
          mfg_year: new Date().getFullYear(),
          engine_no: data.motorDetails.engineNo,
          cc: "1000",
          chasis_no: data.motorDetails.chassisNo,
          hypothecation: "None",
          created_at: new Date(),
          updated_at: new Date(),
        },
      });
    }

    if (data.type === "Health" && data.healthMembers && data.healthMembers.length > 0) {
      for (const member of data.healthMembers) {
        await db.healths.create({
          data: {
            policy_id: policy.id,
            customer_id: data.customerId ? BigInt(data.customerId) : BigInt(1),
            member_name: member.name,
            birthday: new Date(member.dob || new Date()),
            relation: member.relation,
            sum_insured: data.sumInsured,
            created_at: new Date(),
            updated_at: new Date(),
          },
        });
      }
    }

    return policy.id.toString();
  });

export const createEndorsement = createServerFn({ method: "POST" })
  .inputValidator((d: any) => d)
  .handler(async ({ data }) => {
    const session = requireRole("admin", "agent");
    const rawId = data.policyId.startsWith("P-") ? data.policyId.replace("P-", "") : data.policyId;

    // Ownership check for agents
    if (session.role === "agent" && session.agentId) {
      const policy = await db.policies.findUnique({ where: { id: BigInt(rawId) } });
      if (policy && policy.refered_by?.toString() !== session.agentId) {
        throw new Error("Forbidden — you can only endorse your own policies");
      }
    }

    await db.policies.update({
      where: { id: BigInt(rawId) },
      data: {
        endorsement_no: data.endorsementNo,
        endorse_date: new Date(data.endorseDate),
        endorse_detail: data.endorseDetail,
        updated_at: new Date(),
      },
    });

    await db.timeline_entries.create({
      data: {
        policy_id: BigInt(rawId),
        content: `Endorsement ${data.endorsementNo}: ${data.endorseDetail}`,
        created_at: new Date(),
        updated_at: new Date(),
      },
    });

    return true;
  });

export const renewPolicy = createServerFn({ method: "POST" })
  .inputValidator((d: string) => d)
  .handler(async ({ data: id }) => {
    const session = requireRole("admin", "agent");
    const rawId = id.startsWith("P-") ? id.replace("P-", "") : id;

    const oldPolicy = await db.policies.findUnique({
      where: { id: BigInt(rawId) },
      include: { motors: true, fires: true, healths: true },
    });

    if (!oldPolicy) throw new Error("Policy not found");

    // Ownership check for agents
    if (session.role === "agent" && session.agentId) {
      if (oldPolicy.refered_by?.toString() !== session.agentId) {
        throw new Error("Forbidden — you can only renew your own policies");
      }
    }

    const newStartDate = new Date(oldPolicy.end_date);
    const newEndDate = new Date(oldPolicy.end_date);
    newEndDate.setFullYear(newEndDate.getFullYear() + 1);

    const newPolicyNumber = `${oldPolicy.p_number}-R${Math.floor(Math.random() * 1000)}`;

    const newPolicy = await db.policies.create({
      data: {
        renew_id: oldPolicy.id,
        c_name: oldPolicy.c_name,
        group: oldPolicy.group,
        address: oldPolicy.address,
        mobile_no: oldPolicy.mobile_no,
        insurer_name: oldPolicy.insurer_name,
        p_type: oldPolicy.p_type,
        p_name: oldPolicy.p_name,
        installment: oldPolicy.installment,
        p_number: newPolicyNumber,
        company_specific_id: oldPolicy.company_specific_id,
        p_center: oldPolicy.p_center,
        tpa: oldPolicy.tpa,
        hypothecation: oldPolicy.hypothecation,
        start_date: newStartDate,
        end_date: newEndDate,
        sub_ins: oldPolicy.sub_ins,
        companyBrokerage: oldPolicy.companyBrokerage,
        tp_motor: oldPolicy.tp_motor,
        basic: oldPolicy.basic,
        terr: oldPolicy.terr,
        eq: oldPolicy.eq,
        other: oldPolicy.other,
        stfi: oldPolicy.stfi,
        gst: oldPolicy.gst,
        receipt_date: new Date(),
        total: oldPolicy.total,
        remark: oldPolicy.remark,
        customer_id: oldPolicy.customer_id,
        refered_by: oldPolicy.refered_by,
        created_at: new Date(),
        updated_at: new Date(),
      },
    });

    if (oldPolicy.motors.length > 0) {
      await db.motors.create({
        data: {
          ...oldPolicy.motors[0],
          id: undefined,
          policy_id: newPolicy.id,
          created_at: new Date(),
          updated_at: new Date(),
        },
      });
    }

    if (oldPolicy.fires.length > 0) {
      await db.fires.create({
        data: {
          ...oldPolicy.fires[0],
          id: undefined,
          policy_id: newPolicy.id,
          created_at: new Date(),
          updated_at: new Date(),
        },
      });
    }

    if (oldPolicy.healths.length > 0) {
      for (const h of oldPolicy.healths) {
        await db.healths.create({
          data: {
            ...h,
            id: undefined,
            policy_id: newPolicy.id,
            created_at: new Date(),
            updated_at: new Date(),
          },
        });
      }
    }

    await db.timeline_entries.create({
      data: {
        policy_id: oldPolicy.id,
        content: `Policy Renewed to ${newPolicyNumber}`,
        created_at: new Date(),
        updated_at: new Date(),
      },
    });

    await db.timeline_entries.create({
      data: {
        policy_id: newPolicy.id,
        content: `Policy Renewed from ${oldPolicy.p_number}`,
        created_at: new Date(),
        updated_at: new Date(),
      },
    });

    return `P-${newPolicy.id.toString()}`;
  });
