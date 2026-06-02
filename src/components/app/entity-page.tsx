import type { RemixiconComponentType } from "@remixicon/react";
import { RiAddLine } from "@remixicon/react";

import { EmptyDetail } from "@/components/app/empty-detail";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

type EntityColumn = {
  label: string;
  align?: "left" | "right";
  width?: string;
};

type EntityPageProps = {
  title: string;
  description: string;
  icon: RemixiconComponentType;
  actionLabel: string;
  emptyLabel: string;
  detailTitle: string;
  detailDescription: string;
  columns: EntityColumn[];
};

export function EntityPage({
  title,
  description,
  icon: Icon,
  actionLabel,
  emptyLabel,
  detailTitle,
  detailDescription,
  columns,
}: EntityPageProps) {
  return (
    <div className="p-5 sm:p-8">
      <div className="grid min-h-[calc(100svh-8rem)] overflow-hidden rounded-lg border bg-card xl:grid-cols-[minmax(0,1fr)_420px]">
        <section className="min-w-0 border-r">
          <div className="flex flex-col gap-3 border-b px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="space-y-1">
              <h2 className="font-heading text-xl font-semibold">
                Active {title.toLowerCase()}
              </h2>
              <p className="text-base text-muted-foreground">{description}</p>
            </div>
            <div className="flex items-center gap-2">
              <Button size="sm" type="button">
                <RiAddLine />
                {actionLabel}
              </Button>
              <Badge variant="secondary">Active</Badge>
              <Badge variant="outline">Archived</Badge>
              <Badge variant="outline">All</Badge>
            </div>
          </div>

          <Table>
            <TableHeader>
              <TableRow>
                {columns.map((column) => (
                  <TableHead
                    className={column.align === "right" ? "text-right" : ""}
                    key={column.label}
                    style={column.width ? { width: column.width } : undefined}
                  >
                    {column.label}
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell
                  className="h-24 text-center text-base text-muted-foreground"
                  colSpan={columns.length}
                >
                  {emptyLabel}
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </section>

        <aside className="hidden bg-card/60 xl:block">
          <EmptyDetail
            description={detailDescription}
            icon={Icon}
            title={detailTitle}
          />
        </aside>
      </div>
    </div>
  );
}
