import type { ReactNode } from "react";

export function PageHeader({
  title,
  subtitle,
  actions,
}: {
  title: ReactNode;
  subtitle?: ReactNode;
  actions?: ReactNode;
}) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight text-foreground sm:text-[34px]">{title}</h1>
        {subtitle && <p className="mt-1.5 text-sm text-muted-foreground">{subtitle}</p>}
      </div>
      {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
    </div>
  );
}

export function PrimaryButton({ children, icon: Icon, onClick }: { children: ReactNode; icon?: React.ComponentType<{ className?: string }>; onClick?: () => void }) {
  return (
    <button
      onClick={onClick}
      className="inline-flex h-10 items-center gap-2 rounded-xl bg-primary px-4 text-sm font-medium text-primary-foreground transition-all hover:translate-y-[-1px] hover:shadow-md"
    >
      {Icon && <Icon className="h-4 w-4" />}
      {children}
    </button>
  );
}

export function SecondaryButton({ children, icon: Icon, onClick }: { children: ReactNode; icon?: React.ComponentType<{ className?: string }>; onClick?: () => void }) {
  return (
    <button
      onClick={onClick}
      className="inline-flex h-10 items-center gap-2 rounded-xl border border-border bg-surface px-4 text-sm font-medium text-foreground transition-colors hover:bg-secondary"
    >
      {Icon && <Icon className="h-4 w-4" />}
      {children}
    </button>
  );
}

export function PageContainer({ children }: { children: ReactNode }) {
  return <div className="mx-auto w-full max-w-[1600px] space-y-6 px-6 py-8">{children}</div>;
}
