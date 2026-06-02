import type { RemixiconComponentType } from "@remixicon/react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type EmptyStateProps = {
  title: string;
  description: string;
  action?: string;
  icon: RemixiconComponentType;
  className?: string;
};

export function EmptyState({
  title,
  description,
  action,
  icon: Icon,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex min-h-40 flex-col items-center justify-center gap-3 rounded-md border border-dashed bg-muted/20 px-6 py-8 text-center",
        className,
      )}
    >
      <div className="flex size-9 items-center justify-center rounded-md border bg-background text-muted-foreground">
        <Icon size={17} />
      </div>
      <div className="space-y-1">
        <p className="text-sm font-medium">{title}</p>
        <p className="max-w-sm text-sm text-muted-foreground">{description}</p>
      </div>
      {action ? (
        <Button size="sm" variant="outline" disabled>
          {action}
        </Button>
      ) : null}
    </div>
  );
}
