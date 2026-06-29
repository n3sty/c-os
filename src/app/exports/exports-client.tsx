"use client";

import { RiDownloadLine } from "@remixicon/react";
import { useMemo, useState } from "react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { buildCsv, type CsvColumn, downloadCsv } from "@/lib/csv-export";
import type {
  SeedClient,
  SeedExpense,
  SeedInvoice,
  SeedProposal,
  WorkspaceSnapshot,
} from "@/lib/database";
import { cn } from "@/lib/utils";

type ExportType = "clients" | "proposals" | "invoices" | "expenses";
type ExportRows = {
  clients: SeedClient;
  proposals: SeedProposal;
  invoices: SeedInvoice;
  expenses: SeedExpense;
};

type ExportConfig<TType extends ExportType = ExportType> = {
  type: TType;
  title: string;
  description: string;
  rows: ExportRows[TType][];
  columns: CsvColumn<ExportRows[TType]>[];
};

type ExportsClientProps = {
  snapshot: WorkspaceSnapshot;
};

function formatBoolean(value: boolean) {
  return value ? "yes" : "no";
}

function todayStamp() {
  return new Date().toISOString().slice(0, 10);
}

export function ExportsClient({ snapshot }: ExportsClientProps) {
  const exportConfigs = useMemo<ExportConfig[]>(
    () =>
      [
        {
          type: "clients" as const,
          title: "Clients",
          description: "Contact information and company details.",
          rows: snapshot.clients,
          columns: [
            {
              key: "clientNumber",
              label: "Client number",
              value: (client: SeedClient) => client.clientNumber,
            },
            {
              key: "fullName",
              label: "Full name",
              value: (client: SeedClient) => client.fullName,
            },
            {
              key: "email",
              label: "Email",
              value: (client: SeedClient) => client.email,
            },
            {
              key: "company",
              label: "Company",
              value: (client: SeedClient) => client.company,
            },
            {
              key: "archived",
              label: "Archived",
              value: (client: SeedClient) => formatBoolean(client.archived),
            },
          ],
        },
        {
          type: "proposals" as const,
          title: "Proposals",
          description:
            "Proposal numbers, clients, status, dates, and document links.",
          rows: snapshot.proposals,
          columns: [
            {
              key: "proposalNumber",
              label: "Proposal number",
              value: (proposal: SeedProposal) => proposal.proposalNumber,
            },
            {
              key: "title",
              label: "Title",
              value: (proposal: SeedProposal) => proposal.title,
            },
            {
              key: "client",
              label: "Client",
              value: (proposal: SeedProposal) =>
                snapshot.clients.find(
                  (client) => client.id === proposal.clientId,
                )?.company ??
                snapshot.clients.find(
                  (client) => client.id === proposal.clientId,
                )?.fullName ??
                "",
            },
            {
              key: "date",
              label: "Date",
              value: (proposal: SeedProposal) => proposal.date,
            },
            {
              key: "status",
              label: "Status",
              value: (proposal: SeedProposal) => proposal.status,
            },
            {
              key: "description",
              label: "Description",
              value: (proposal: SeedProposal) => proposal.description,
            },
            {
              key: "documentLink",
              label: "Document link",
              value: (proposal: SeedProposal) => proposal.documentLink,
            },
            {
              key: "archived",
              label: "Archived",
              value: (proposal: SeedProposal) =>
                formatBoolean(proposal.archived),
            },
          ],
        },
        {
          type: "invoices" as const,
          title: "Invoices",
          description:
            "Invoice numbers, linked clients and proposals, statuses, and document links.",
          rows: snapshot.invoices,
          columns: [
            {
              key: "invoiceNumber",
              label: "Invoice number",
              value: (invoice: SeedInvoice) => invoice.invoiceNumber,
            },
            {
              key: "client",
              label: "Client",
              value: (invoice: SeedInvoice) =>
                snapshot.clients.find(
                  (client) => client.id === invoice.clientId,
                )?.company ??
                snapshot.clients.find(
                  (client) => client.id === invoice.clientId,
                )?.fullName ??
                "",
            },
            {
              key: "proposalNumber",
              label: "Proposal number",
              value: (invoice: SeedInvoice) =>
                snapshot.proposals.find(
                  (proposal) => proposal.id === invoice.proposalId,
                )?.proposalNumber ?? "",
            },
            {
              key: "status",
              label: "Status",
              value: (invoice: SeedInvoice) => invoice.status,
            },
            {
              key: "documentLink",
              label: "Document link",
              value: (invoice: SeedInvoice) => invoice.documentLink,
            },
            {
              key: "archived",
              label: "Archived",
              value: (invoice: SeedInvoice) => formatBoolean(invoice.archived),
            },
          ],
        },
        {
          type: "expenses" as const,
          title: "Expenses",
          description:
            "Expense dates, suppliers, amounts, VAT, categories, and archive state.",
          rows: snapshot.expenses,
          columns: [
            {
              key: "date",
              label: "Date",
              value: (expense: SeedExpense) => expense.date,
            },
            {
              key: "supplier",
              label: "Supplier",
              value: (expense: SeedExpense) => expense.supplier,
            },
            {
              key: "amount",
              label: "Amount",
              value: (expense: SeedExpense) => expense.amount.toFixed(2),
            },
            {
              key: "vatAmount",
              label: "VAT amount",
              value: (expense: SeedExpense) => expense.vatAmount.toFixed(2),
            },
            {
              key: "category",
              label: "Category",
              value: (expense: SeedExpense) => expense.category,
            },
            {
              key: "archived",
              label: "Archived",
              value: (expense: SeedExpense) => formatBoolean(expense.archived),
            },
          ],
        },
      ] as ExportConfig[],
    [snapshot],
  );

  const [selectedType, setSelectedType] = useState<ExportType>("clients");
  const [selectedFields, setSelectedFields] = useState<Set<string>>(
    () => new Set(exportConfigs[0].columns.map((column) => column.key)),
  );
  const currentConfig =
    exportConfigs.find((config) => config.type === selectedType) ??
    exportConfigs[0];

  const handleTypeSelect = (type: ExportType) => {
    const nextConfig = exportConfigs.find((config) => config.type === type);
    setSelectedType(type);
    setSelectedFields(new Set(nextConfig?.columns.map((column) => column.key)));
  };

  const toggleField = (field: string) => {
    setSelectedFields((fields) => {
      const nextFields = new Set(fields);
      if (nextFields.has(field)) {
        nextFields.delete(field);
      } else {
        nextFields.add(field);
      }
      return nextFields;
    });
  };

  const exportConfig = (config: ExportConfig) => {
    const columns = config.columns.filter((column) =>
      selectedFields.has(column.key),
    );
    downloadCsv(
      `coscience-${config.type}-${todayStamp()}.csv`,
      buildCsv(columns, config.rows),
    );
  };

  const exportAll = () => {
    for (const config of exportConfigs) {
      downloadCsv(
        `coscience-${config.type}-${todayStamp()}.csv`,
        buildCsv(config.columns, config.rows),
      );
    }
  };

  return (
    <div className="grid min-h-[calc(100svh-2rem)] overflow-hidden rounded-lg bg-card xl:grid-cols-[minmax(0,1fr)_420px]">
      <section className="min-w-0 border-border/60 border-r">
        <div className="flex flex-col gap-3 border-border/60 border-b px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-1">
            <h2 className="font-heading text-xl font-semibold">Exports</h2>
            <p className="text-base text-muted-foreground">
              Download bookkeeping-ready CSV files for clients, proposals,
              invoices, and expenses.
            </p>
          </div>
          <Button onClick={exportAll} size="sm" type="button">
            <RiDownloadLine />
            Export all CSVs
          </Button>
        </div>

        <div className="overflow-auto p-3">
          <div className="space-y-1">
            {exportConfigs.map((config) => (
              <button
                className={cn(
                  "group grid min-h-12 w-full grid-cols-[minmax(0,1fr)_auto] items-center gap-3 rounded-md px-3 py-2 text-left transition-colors",
                  selectedType === config.type
                    ? "bg-muted/30"
                    : "hover:bg-muted/20",
                )}
                key={config.type}
                onClick={() => handleTypeSelect(config.type)}
                type="button"
              >
                <div className="min-w-0">
                  <p className="truncate font-medium text-foreground">
                    {config.title}
                  </p>
                  <p className="truncate text-xs text-muted-foreground">
                    {config.description}
                  </p>
                </div>
                <span className="text-xs text-muted-foreground">
                  {config.rows.length} records
                </span>
              </button>
            ))}
          </div>
        </div>
      </section>

      <aside className="hidden min-w-0 overflow-auto bg-card/70 xl:block">
        <div className="p-3">
          <Card className="shadow-none">
            <CardHeader className="space-y-2">
              <div className="flex size-10 items-center justify-center rounded-md border bg-background text-muted-foreground">
                <RiDownloadLine size={18} />
              </div>
              <div className="space-y-1">
                <CardTitle className="text-lg">{currentConfig.title}</CardTitle>
                <p className="text-sm leading-6 text-muted-foreground">
                  {currentConfig.description}
                </p>
              </div>
            </CardHeader>

            <CardContent className="space-y-4">
              <div className="space-y-3">
                <p className="text-sm font-medium text-foreground">
                  Fields to include
                </p>
                <div className="space-y-2">
                  {currentConfig.columns.map((column) => (
                    <label
                      className="flex cursor-pointer items-center gap-2"
                      key={column.key}
                    >
                      <input
                        checked={selectedFields.has(column.key)}
                        className="size-4 rounded border-border bg-muted accent-primary"
                        onChange={() => toggleField(column.key)}
                        type="checkbox"
                      />
                      <span className="text-sm text-muted-foreground hover:text-foreground">
                        {column.label}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              <Button
                className="w-full"
                disabled={selectedFields.size === 0}
                onClick={() => exportConfig(currentConfig)}
                size="sm"
                type="button"
              >
                <RiDownloadLine />
                Export {currentConfig.title} CSV
              </Button>
            </CardContent>
          </Card>
        </div>
      </aside>
    </div>
  );
}
