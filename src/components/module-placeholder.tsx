import type { ReactNode } from "react";
import { Construction } from "lucide-react";
import { PageContainer, PageHeader } from "@/components/page-header";

export function ModulePlaceholder({
  title,
  subtitle,
  features,
  actions,
}: {
  title: string;
  subtitle: string;
  features: string[];
  actions?: ReactNode;
}) {
  return (
    <PageContainer>
      <PageHeader title={title} subtitle={subtitle} actions={actions} />
      <div className="surface-card p-10 text-center">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-accent-amber/10 text-accent-amber">
          <Construction className="h-6 w-6" />
        </div>
        <h2 className="mt-5 text-xl font-semibold">Module Preview</h2>
        <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">
          This module's UI is scaffolded with the design system. Hook it up to real data when you're ready.
        </p>
        <div className="mx-auto mt-8 grid max-w-2xl grid-cols-1 gap-2 text-left sm:grid-cols-2">
          {features.map((f) => (
            <div key={f} className="flex items-center gap-2 rounded-xl border border-border bg-background px-4 py-3 text-sm">
              <span className="h-1.5 w-1.5 rounded-full bg-primary" />
              {f}
            </div>
          ))}
        </div>
      </div>
    </PageContainer>
  );
}
