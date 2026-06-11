import type { ReactNode } from "react";
import type { LucideIcon } from "lucide-react";

type AccentColor =
  | "blue" | "green" | "amber" | "violet" | "rose"
  | "sky" | "emerald" | "orange" | "pink" | "indigo";

const ACCENT: Record<AccentColor, { bar: string; chipBg: string; chipText: string; iconBg: string; iconText: string }> = {
  blue:    { bar: "bg-accent-blue",    chipBg: "bg-accent-blue/10",    chipText: "text-accent-blue",    iconBg: "bg-accent-blue/10",    iconText: "text-accent-blue" },
  green:   { bar: "bg-accent-green",   chipBg: "bg-accent-green/10",   chipText: "text-accent-green",   iconBg: "bg-accent-green/10",   iconText: "text-accent-green" },
  amber:   { bar: "bg-accent-amber",   chipBg: "bg-accent-amber/10",   chipText: "text-accent-amber",   iconBg: "bg-accent-amber/10",   iconText: "text-accent-amber" },
  violet:  { bar: "bg-accent-violet",  chipBg: "bg-accent-violet/10",  chipText: "text-accent-violet",  iconBg: "bg-accent-violet/10",  iconText: "text-accent-violet" },
  rose:    { bar: "bg-accent-rose",    chipBg: "bg-accent-rose/10",    chipText: "text-accent-rose",    iconBg: "bg-accent-rose/10",    iconText: "text-accent-rose" },
  sky:     { bar: "bg-accent-sky",     chipBg: "bg-accent-sky/15",     chipText: "text-accent-sky",     iconBg: "bg-accent-sky/15",     iconText: "text-accent-sky" },
  emerald: { bar: "bg-accent-emerald", chipBg: "bg-accent-emerald/10", chipText: "text-accent-emerald", iconBg: "bg-accent-emerald/10", iconText: "text-accent-emerald" },
  orange:  { bar: "bg-accent-orange",  chipBg: "bg-accent-orange/10",  chipText: "text-accent-orange",  iconBg: "bg-accent-orange/10",  iconText: "text-accent-orange" },
  pink:    { bar: "bg-accent-pink",    chipBg: "bg-accent-pink/10",    chipText: "text-accent-pink",    iconBg: "bg-accent-pink/10",    iconText: "text-accent-pink" },
  indigo:  { bar: "bg-accent-indigo",  chipBg: "bg-accent-indigo/10",  chipText: "text-accent-indigo",  iconBg: "bg-accent-indigo/10",  iconText: "text-accent-indigo" },
};

export function KpiCard({
  label,
  value,
  hint,
  icon: Icon,
  accent = "blue",
  size = "lg",
}: {
  label: string;
  value: ReactNode;
  hint?: ReactNode;
  icon?: LucideIcon;
  accent?: AccentColor;
  size?: "sm" | "lg";
}) {
  const a = ACCENT[accent];
  return (
    <div className="kpi-card group hover:kpi-card-hover">
      <span className={`absolute inset-x-0 top-0 h-[3px] ${a.bar}`} />
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <div className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">{label}</div>
          <div className={`mt-2 font-semibold tracking-tight text-foreground ${size === "lg" ? "text-3xl" : "text-2xl"}`}>
            {value}
          </div>
          {hint && <div className="mt-2 text-xs text-muted-foreground">{hint}</div>}
        </div>
        {Icon && (
          <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${a.iconBg} ${a.iconText}`}>
            <Icon className="h-4 w-4" strokeWidth={2.25} />
          </div>
        )}
      </div>
    </div>
  );
}

export function Chip({
  children,
  accent = "blue",
}: {
  children: ReactNode;
  accent?: AccentColor;
}) {
  const a = ACCENT[accent];
  return (
    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium ${a.chipBg} ${a.chipText}`}>
      {children}
    </span>
  );
}

export function StatusBadge({ status }: { status: string }) {
  const map: Record<string, AccentColor> = {
    Active: "green",
    Verified: "green",
    Approved: "green",
    Settled: "green",
    Renewed: "green",
    Pending: "amber",
    "Under Review": "amber",
    Upcoming: "amber",
    Expired: "rose",
    Rejected: "rose",
    Overdue: "rose",
    Lapsed: "rose",
  };
  return <Chip accent={map[status] ?? "blue"}>{status}</Chip>;
}

export const ACCENT_HEX: Record<AccentColor, string> = {
  blue: "var(--color-accent-blue)",
  green: "var(--color-accent-green)",
  amber: "var(--color-accent-amber)",
  violet: "var(--color-accent-violet)",
  rose: "var(--color-accent-rose)",
  sky: "var(--color-accent-sky)",
  emerald: "var(--color-accent-emerald)",
  orange: "var(--color-accent-orange)",
  pink: "var(--color-accent-pink)",
  indigo: "var(--color-accent-indigo)",
};
