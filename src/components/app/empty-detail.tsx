import type { RemixiconComponentType } from "@remixicon/react";

type EmptyDetailProps = {
  icon: RemixiconComponentType;
  title: string;
  description: string;
};

export function EmptyDetail({
  icon: Icon,
  title,
  description,
}: EmptyDetailProps) {
  return (
    <div className="flex h-full min-h-96 flex-col items-center justify-center gap-3 px-8 text-center">
      <div className="flex size-11 items-center justify-center rounded-lg border bg-muted/20 text-muted-foreground">
        <Icon size={20} />
      </div>
      <div className="space-y-1">
        <h2 className="font-heading text-lg font-semibold">{title}</h2>
        <p className="max-w-sm text-base text-muted-foreground">
          {description}
        </p>
      </div>
    </div>
  );
}
