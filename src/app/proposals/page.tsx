import { RiFileList3Line } from "@remixicon/react";

import { AppShell } from "@/components/app/app-shell";
import { RecordWorkspace } from "@/components/app/record-workspace";
import { buildFormOptions } from "@/lib/creation";
import { loadWorkspaceSnapshot } from "@/lib/database";
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
  const snapshot = await loadWorkspaceSnapshot();
  const selectedFilterGroup = getQueryValue(query.filter);
  const selectedId = getQueryValue(query.record);
  const sidebarState = getQueryValue(query.sidebar);
  const archivedProposals = snapshot.proposals.filter(
    (proposal) => proposal.archived,
  );
  const missingDocuments = snapshot.proposals.filter(
    (proposal) => !proposal.archived && !proposal.documentLink,
  );
  const openProposals = snapshot.proposals.filter(
    (proposal) =>
      !proposal.archived && !["accepted", "declined"].includes(proposal.status),
  );
  const activeProposals = snapshot.proposals.filter(
    (proposal) => !proposal.archived,
  );
  const clientOptions = snapshot.proposals.reduce<Record<string, number>>(
    (clients, proposal) => {
      const client =
        snapshot.clients.find((item) => item.id === proposal.clientId) ?? null;
      const label = client?.company ?? client?.fullName ?? "Unknown client";
      clients[label] = (clients[label] ?? 0) + 1;
      return clients;
    },
    {},
  );
  const yearOptions = snapshot.proposals.reduce<Record<string, number>>(
    (years, proposal) => {
      const year = getYearFromNumber(proposal.proposalNumber);
      years[year] = (years[year] ?? 0) + 1;
      return years;
    },
    {},
  );
  const records = await getWorkspaceRecords("proposal", snapshot);
  const formOptions = buildFormOptions(snapshot);

  return (
    <AppShell formOptions={formOptions}>
      <RecordWorkspace
        basePath="/proposals"
        creationTarget="proposal"
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
            title: "Date",
            options: Object.entries(yearOptions).map(([label, count]) => ({
              label,
              count,
            })),
          },
          {
            title: "Status",
            options: ["draft", "sent", "accepted", "declined"].map(
              (status) => ({
                label: status,
                count: snapshot.proposals.filter(
                  (proposal) => proposal.status === status,
                ).length,
              }),
            ),
          },
          {
            title: "State",
            options: [
              { label: "Active", count: activeProposals.length },
              { label: "Archived", count: archivedProposals.length },
            ],
          },
        ]}
        filters={[
          { label: "Open", count: openProposals.length, active: true },
          { label: "Missing docs", count: missingDocuments.length },
          { label: "Archived", count: archivedProposals.length },
          { label: "All", count: snapshot.proposals.length },
        ]}
        icon={RiFileList3Line}
        records={records}
        selectedFilterGroup={selectedFilterGroup}
        selectedId={selectedId}
        sidebarOpen={sidebarState !== "closed"}
        sortOptions={[
          {
            label: "Newest date",
            value: "date-desc",
            key: "date",
            direction: "desc",
          },
          {
            label: "Oldest date",
            value: "date-asc",
            key: "date",
            direction: "asc",
          },
          {
            label: "Client A-Z",
            value: "client-asc",
            key: "client",
            direction: "asc",
          },
          {
            label: "Status A-Z",
            value: "status-asc",
            key: "status",
            direction: "asc",
          },
          {
            label: "Active first",
            value: "state-asc",
            key: "state",
            direction: "asc",
          },
        ]}
        title="Proposals"
      />
    </AppShell>
  );
}
