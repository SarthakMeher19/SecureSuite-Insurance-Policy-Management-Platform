import { createServerFn } from "@tanstack/react-start";
import { db } from "../db";
import { requireRole } from "../auth-middleware";

export const getCompanies = createServerFn({ method: "GET" }).handler(async () => {
  requireRole("admin");

  const policies = await db.policies.findMany({
    select: { insurer_name: true },
    distinct: ["insurer_name"],
  });
  return policies.map((p) => p.insurer_name).filter(Boolean);
});

export const getPolicyTypes = createServerFn({ method: "GET" }).handler(async () => {
  requireRole("admin");

  const policies = await db.policies.findMany({
    select: { p_type: true },
    distinct: ["p_type"],
  });
  return policies.map((p) => p.p_type).filter(Boolean);
});

export const getBanks = createServerFn({ method: "GET" }).handler(async () => {
  requireRole("admin");

  const payments = await db.payments.findMany({
    select: { bank_name: true },
    distinct: ["bank_name"],
  });
  return payments.map((p) => p.bank_name).filter(Boolean) as string[];
});

export const getTpas = createServerFn({ method: "GET" }).handler(async () => {
  requireRole("admin");

  const policies = await db.policies.findMany({
    select: { tpa: true },
    distinct: ["tpa"],
  });
  return policies.map((p) => p.tpa).filter(Boolean) as string[];
});
