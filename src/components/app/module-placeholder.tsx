import type { LucideIcon } from "lucide-react";
import { Sparkles } from "lucide-react";

export function ModulePlaceholder({
  title,
  description,
  Icon = Sparkles,
}: {
  title: string;
  description: string;
  Icon?: LucideIcon;
}) {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
          <Icon className="h-6 w-6" />
        </div>
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight">{title}</h1>
          <p className="text-sm text-muted-foreground">{description}</p>
        </div>
      </div>

      <div className="rounded-2xl border border-dashed border-border bg-card p-12 text-center">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 text-primary">
          <Icon className="h-6 w-6" />
        </div>
        <h2 className="mt-4 text-lg font-bold">{title} module</h2>
        <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">
          This module is wired to the LMS backend. The APIs are integrated in
          <code className="mx-1 rounded bg-secondary px-1.5 py-0.5 text-xs">src/lib/api-client.ts</code>
          and ready to be surfaced here — tell me which view to build first.
        </p>
      </div>
    </div>
  );
}
