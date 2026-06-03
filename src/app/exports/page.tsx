"use client";

import { RiDownloadLine } from "@remixicon/react";
import { useState } from "react";

import { AppShell } from "@/components/app/app-shell";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

type ExportType = "clients" | "proposals" | "invoices" | "expenses";

type ExportConfig = {
  type: ExportType;
  title: string;
  description: string;
  recordCount: number;
};

const EXPORT_TYPES: ExportConfig[] = [
  {
    type: "clients",
    title: "Clients",
    description: "Contact information and company details",
    recordCount: 0,
  },
  {
    type: "proposals",
    title: "Proposals",
    description: "Project scope, timeline, and pricing",
    recordCount: 0,
  },
  {
    type: "invoices",
    title: "Invoices",
    description: "Payment information and transaction records",
    recordCount: 0,
  },
  {
    type: "expenses",
    title: "Expenses",
    description: "Cost tracking and reimbursement records",
    recordCount: 0,
  },
];

const FORMAT_OPTIONS = [
  { value: "csv", label: "CSV" },
  { value: "json", label: "JSON" },
];

const FIELD_OPTIONS: Record<ExportType, string[]> = {
  clients: ["Name", "Email", "Company", "Client #"],
  proposals: ["Title", "Client", "Amount", "Status", "Date"],
  invoices: ["Number", "Client", "Amount", "Status", "Date"],
  expenses: ["Category", "Amount", "Date", "Status", "Description"],
};

export default function ExportsPage() {
  const [selectedType, setSelectedType] = useState<ExportType>("clients");
  const [selectedFormat, setSelectedFormat] = useState<string>("csv");
  const [selectedFields, setSelectedFields] = useState<Set<string>>(
    new Set(FIELD_OPTIONS[selectedType]),
  );

  const currentConfig =
    EXPORT_TYPES.find((e) => e.type === selectedType) ?? EXPORT_TYPES[0];
  const availableFields = FIELD_OPTIONS[selectedType];

  const toggleField = (field: string) => {
    setSelectedFields((prev) => {
      const next = new Set(prev);
      if (next.has(field)) {
        next.delete(field);
      } else {
        next.add(field);
      }
      return next;
    });
  };

  const handleTypeSelect = (type: ExportType) => {
    setSelectedType(type);
    setSelectedFields(new Set(FIELD_OPTIONS[type]));
  };

  const handleExport = () => {
    // Placeholder for export logic
    console.log({
      type: selectedType,
      format: selectedFormat,
      fields: Array.from(selectedFields),
    });
  };

  return (
    <AppShell>
      <div className="px-2 pt-2 pb-2 sm:px-4 sm:pt-4 sm:pb-4">
        <div className="grid min-h-[calc(100svh-2rem)] overflow-hidden rounded-lg bg-card xl:grid-cols-[minmax(0,1fr)_420px]">
          <section className="min-w-0 border-border/60 border-r">
            <div className="flex flex-col gap-3 border-border/60 border-b px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="space-y-1">
                <h2 className="font-heading text-xl font-semibold">Exports</h2>
                <p className="text-base text-muted-foreground">
                  Download your data in CSV or JSON format.
                </p>
              </div>
            </div>

            <div className="overflow-auto p-3">
              <div className="space-y-1">
                {EXPORT_TYPES.map((config) => (
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
                    <CardTitle className="text-lg">
                      {currentConfig.title}
                    </CardTitle>
                    <p className="text-sm leading-6 text-muted-foreground">
                      {currentConfig.description}
                    </p>
                  </div>
                </CardHeader>

                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <p className="text-sm font-medium text-foreground">
                      Export Format
                    </p>
                    <div className="flex gap-2">
                      {FORMAT_OPTIONS.map((option) => (
                        <button
                          className={cn(
                            "flex-1 rounded-md border px-3 py-2 text-sm font-medium transition-colors",
                            selectedFormat === option.value
                              ? "border-primary/50 bg-primary/10 text-foreground"
                              : "border-border bg-muted/50 text-muted-foreground hover:bg-muted/70",
                          )}
                          key={option.value}
                          onClick={() => setSelectedFormat(option.value)}
                          type="button"
                        >
                          {option.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-3 border-border/60 border-t pt-4">
                    <p className="text-sm font-medium text-foreground">
                      Fields to Include
                    </p>
                    <div className="space-y-2">
                      {availableFields.map((field) => (
                        <label
                          className="flex items-center gap-2 cursor-pointer"
                          key={field}
                        >
                          <input
                            checked={selectedFields.has(field)}
                            className="size-4 rounded border-border bg-muted accent-primary"
                            onChange={() => toggleField(field)}
                            type="checkbox"
                          />
                          <span className="text-sm text-muted-foreground hover:text-foreground">
                            {field}
                          </span>
                        </label>
                      ))}
                    </div>
                  </div>

                  <Button
                    className="w-full"
                    onClick={handleExport}
                    size="sm"
                    type="button"
                  >
                    <RiDownloadLine />
                    Export as {selectedFormat.toUpperCase()}
                  </Button>
                </CardContent>
              </Card>
            </div>
          </aside>
        </div>
      </div>
    </AppShell>
  );
}
