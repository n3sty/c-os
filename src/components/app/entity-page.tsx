import type { RemixiconComponentType } from "@remixicon/react";
import { RiAddLine } from "@remixicon/react";
import type { ReactNode } from "react";

import { EmptyDetail } from "@/components/app/empty-detail";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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

type EntityRecord = {
  id: string;
  cells: ReactNode[];
  detailTitle: string;
  detailDescription?: string;
  details: { label: string; value: ReactNode }[];
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
  records?: EntityRecord[];
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
  records = [],
}: EntityPageProps) {
  const selectedRecord = records[0];

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
              {records.length > 0 ? (
                records.map((record, index) => (
                  <TableRow
                    className={index === 0 ? "bg-muted/30" : undefined}
                    key={record.id}
                  >
                    {record.cells.map((cell, cellIndex) => (
                      <TableCell
                        className={
                          columns[cellIndex]?.align === "right"
                            ? "text-right"
                            : undefined
                        }
                        key={`${record.id}-${columns[cellIndex]?.label ?? cellIndex}`}
                      >
                        {cell}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell
                    className="h-24 text-center text-base text-muted-foreground"
                    colSpan={columns.length}
                  >
                    {emptyLabel}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </section>

        <aside className="hidden bg-card/60 xl:block">
          {selectedRecord ? (
            <div className="p-5">
              <Card className="shadow-none">
                <CardHeader className="space-y-2">
                  <div className="flex size-10 items-center justify-center rounded-md border bg-background text-muted-foreground">
                    <Icon size={18} />
                  </div>
                  <div className="space-y-1">
                    <CardTitle className="text-lg">
                      {selectedRecord.detailTitle}
                    </CardTitle>
                    <p className="text-sm leading-6 text-muted-foreground">
                      {selectedRecord.detailDescription}
                    </p>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  {selectedRecord.details.map((item) => (
                    <div
                      className="flex items-start justify-between gap-4 border-b pb-3 last:border-b-0 last:pb-0"
                      key={item.label}
                    >
                      <p className="text-sm text-muted-foreground">
                        {item.label}
                      </p>
                      <div className="max-w-[220px] text-right text-sm font-medium">
                        {item.value}
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
          ) : (
            <EmptyDetail
              description={detailDescription}
              icon={Icon}
              title={detailTitle}
            />
          )}
        </aside>
      </div>
    </div>
  );
}
