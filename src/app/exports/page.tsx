import { AppShell } from "@/components/app/app-shell";
import { buildFormOptions } from "@/lib/creation";
import { loadWorkspaceSnapshot } from "@/lib/database";

import { ExportsClient } from "./exports-client";

export default async function ExportsPage() {
  const snapshot = await loadWorkspaceSnapshot();

  return (
    <AppShell formOptions={buildFormOptions(snapshot)}>
      <div className="px-2 pt-2 pb-2 sm:px-4 sm:pt-4 sm:pb-4">
        <ExportsClient snapshot={snapshot} />
      </div>
    </AppShell>
  );
}
