"use client";

import { useCallback, useRef } from "react";

import { EditableDescription } from "@/components/app/editable-description";
import { RecordFocusProvider } from "@/components/app/record-focus-context";
import type { WorkspaceRecord } from "@/components/app/record-workspace";
import { DetailSectionCards } from "@/components/app/record-workspace";

function DescriptionDisplay({ value }: { value: React.ReactNode }) {
  return (
    <div className="-mx-2 rounded-md px-2 py-2 text-base leading-7 text-muted-foreground transition-colors duration-150 hover:bg-muted/20">
      {value}
    </div>
  );
}

export function RecordDetail({ record }: { record: WorkspaceRecord }) {
  const titleRef = useRef<HTMLHeadingElement>(null);

  const focusTitle = useCallback(() => {
    titleRef.current?.focus();
  }, []);

  return (
    <RecordFocusProvider value={focusTitle}>
      <article className="min-h-full">
        <div className="mx-auto max-w-3xl px-4 pt-12 pb-8 sm:px-8 lg:px-0">
          <div className="space-y-4">
            <h1
              ref={titleRef}
              tabIndex={-1}
              className="font-heading text-2xl font-semibold tracking-normal outline-none"
            >
              {record.detailTitle}
            </h1>
            {record.descriptionSaveTarget &&
            typeof record.detailDescription === "string" ? (
              <EditableDescription
                saveTarget={record.descriptionSaveTarget}
                value={record.detailDescription}
              />
            ) : record.detailDescription ? (
              <DescriptionDisplay value={record.detailDescription} />
            ) : null}
          </div>

          <div className="mt-10 border-t border-border/60 pt-6">
            <h2 className="font-heading text-base font-semibold">Activity</h2>
            <div className="mt-5 rounded-md bg-muted/20 p-4 text-sm leading-6 text-muted-foreground">
              {record.activity ?? "No activity has been recorded yet."}
            </div>
          </div>

          <div className="mt-6 xl:hidden">
            <DetailSectionCards record={record} />
          </div>
        </div>
      </article>
    </RecordFocusProvider>
  );
}
