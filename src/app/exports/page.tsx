import { RiDownloadLine } from "@remixicon/react";

import { AppShell } from "@/components/app/app-shell";
import { EntityPage } from "@/components/app/entity-page";

export default function ExportsPage() {
  return (
    <AppShell>
      <EntityPage
        actionLabel="Prepare export"
        columns={[
          { label: "Dataset" },
          { label: "Scope" },
          { align: "right", label: "Records", width: "8rem" },
          { align: "right", label: "Last export", width: "10rem" },
        ]}
        description="Simple exports for clients, proposals, invoices, and expenses."
        detailDescription="Selecting an export dataset will show scope, included records, and last export state."
        detailTitle="Select an export"
        emptyLabel="No exports prepared yet."
        icon={RiDownloadLine}
        title="Exports"
      />
    </AppShell>
  );
}
