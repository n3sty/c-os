import { RiFileList3Line } from "@remixicon/react";

import { AppShell } from "@/components/app/app-shell";
import { RecordWorkspace } from "@/components/app/record-workspace";
import { getClientById, seedProposals } from "@/lib/seed-data";
import { getWorkspaceRecords } from "@/lib/workspace-records";

type ProposalsPageProps = {
  searchParams: Promise<{
    filter?: string | string[];
    record?: string | string[];
    sidebar?: string | string[];
  }>;
};

function getQueryValue(value?: string | string[]) {
  return Array.isArray(value) ? value[0] : value;
}

function getYearFromNumber(value: string) {
  return value.match(/\d{4}/)?.[0] ?? "Unknown year";
}

export default async function ProposalsPage({
  searchParams,
}: ProposalsPageProps) {
  const query = await searchParams;
  const selectedFilterGroup = getQueryValue(query.filter);
  const selectedId = getQueryValue(query.record);
  const sidebarState = getQueryValue(query.sidebar);
  const activeProposals = seedProposals.filter(
    (proposal) => !proposal.archived,
  );
  const archivedProposals = seedProposals.filter(
    (proposal) => proposal.archived,
  );
  const missingDocuments = seedProposals.filter(
    (proposal) => !proposal.documentLink,
  );
  const clientOptions = seedProposals.reduce<Record<string, number>>(
    (clients, proposal) => {
      const client = getClientById(proposal.clientId);
      const label = client?.company ?? client?.fullName ?? "Unknown client";
      clients[label] = (clients[label] ?? 0) + 1;
      return clients;
    },
    {},
  );
  const yearOptions = seedProposals.reduce<Record<string, number>>(
    (years, proposal) => {
      const year = getYearFromNumber(proposal.proposalNumber);
      years[year] = (years[year] ?? 0) + 1;
      return years;
    },
    {},
  );
  const records = getWorkspaceRecords("proposal");

  return (
    <AppShell>
      <RecordWorkspace
        actionLabel="New proposal"
        basePath="/proposals"
        description="Proposal numbers, clients, documents, and invoice links."
        emptyLabel="No proposals yet."
        filterGroups={[
          {
            title: "Client",
            options: Object.entries(clientOptions).map(([label, count]) => ({
              label,
              count,
            })),
          },
          {
            title: "Year",
            options: Object.entries(yearOptions).map(([label, count]) => ({
              label,
              count,
            })),
          },
          {
            title: "Document",
            options: [
              {
                label: "Attached",
                count: seedProposals.length - missingDocuments.length,
              },
              { label: "Missing", count: missingDocuments.length },
            ],
          },
        ]}
        filters={[
          { label: "Active", count: activeProposals.length, active: true },
          { label: "Missing docs", count: missingDocuments.length },
          { label: "Archived", count: archivedProposals.length },
          { label: "All", count: seedProposals.length },
        ]}
        icon={RiFileList3Line}
        records={records}
        selectedFilterGroup={selectedFilterGroup}
        selectedId={selectedId}
        sidebarOpen={sidebarState !== "closed"}
        title="Proposals"
      />
    </AppShell>
  );
}
