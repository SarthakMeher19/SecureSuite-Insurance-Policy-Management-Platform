export type Role = "admin" | "agent" | "customer";

export const ROLES: { value: Role; label: string }[] = [
  { value: "admin", label: "Admin" },
  { value: "agent", label: "Agent / Broker" },
  { value: "customer", label: "Customer" },
];

export const CURRENT_USER = {
  admin: { name: "Priya Sharma", initials: "PS", subtitle: "Administrator" },
  agent: { name: "Rohan Mehta", initials: "RM", subtitle: "Senior Broker" },
  customer: { name: "Anita Verma", initials: "AV", subtitle: "Policyholder" },
} as const;

export function formatINR(value: number) {
  if (value >= 10000000) return `₹${(value / 10000000).toFixed(2)} Cr`;
  if (value >= 100000) return `₹${(value / 100000).toFixed(2)} L`;
  if (value >= 1000) return `₹${(value / 1000).toFixed(1)}K`;
  return `₹${value}`;
}
