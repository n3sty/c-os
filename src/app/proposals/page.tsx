import { RiFileList3Line } from "@remixicon/react";

import { AppShell } from "@/components/app/app-shell";
import { EntityPage } from "@/components/app/entity-page";

export default function ProposalsPage() {
  return (
    <AppShell>
      <EntityPage
        actionLabel="New proposal"
        columns={[
          { label: "Proposal #" },
          { label: "Client" },
          { label: "Document link" },
          { align: "right", label: "State", width: "8rem" },
        ]}
        description="Proposal numbers are unique, linked to clients, and never reused."
        detailDescription="Selecting a proposal will show its client, document link, invoice relationship, and archive state."
        detailTitle="Select a proposal"
        emptyLabel="No active proposals yet."
        icon={RiFileList3Line}
        title="Proposals"
      />
    </AppShell>
  );
}
