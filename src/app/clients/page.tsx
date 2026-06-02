import { RiUser3Line } from "@remixicon/react";

import { AppShell } from "@/components/app/app-shell";
import { RecordWorkspace } from "@/components/app/record-workspace";
import { seedClients } from "@/lib/seed-data";
import { getWorkspaceRecords } from "@/lib/workspace-records";

type ClientsPageProps = {
  searchParams: Promise<{
    filter?: string | string[];
    record?: string | string[];
    sidebar?: string | string[];
  }>;
};

function getQueryValue(value?: string | string[]) {
  return Array.isArray(value) ? value[0] : value;
}

export default async function ClientsPage({ searchParams }: ClientsPageProps) {
  const query = await searchParams;
  const selectedFilterGroup = getQueryValue(query.filter);
  const selectedId = getQueryValue(query.record);
  const sidebarState = getQueryValue(query.sidebar);
  const activeClients = seedClients.filter((client) => !client.archived);
  const archivedClients = seedClients.filter((client) => client.archived);
  const records = getWorkspaceRecords("client");
  const companyOptions = seedClients.reduce<Record<string, number>>(
    (companies, client) => {
      const label = client.company ?? "Independent";
      companies[label] = (companies[label] ?? 0) + 1;
      return companies;
    },
    {},
  );

  return (
    <AppShell>
      <RecordWorkspace
        actionLabel="Add client"
        basePath="/clients"
        description="Client records and linked commercial work."
        emptyLabel="No clients yet."
        filterGroups={[
          {
            title: "Company",
            options: Object.entries(companyOptions).map(([label, count]) => ({
              label,
              count,
            })),
          },
          {
            title: "State",
            options: [
              { label: "Active", count: activeClients.length, active: true },
              { label: "Archived", count: archivedClients.length },
            ],
          },
        ]}
        filters={[
          { label: "Active", count: activeClients.length, active: true },
          { label: "Archived", count: archivedClients.length },
          { label: "All", count: seedClients.length },
        ]}
        icon={RiUser3Line}
        records={records}
        selectedFilterGroup={selectedFilterGroup}
        selectedId={selectedId}
        sidebarOpen={sidebarState !== "closed"}
        title="Clients"
      />
    </AppShell>
  );
}
