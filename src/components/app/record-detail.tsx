"use client";

import { useCallback, useRef } from "react";

import { EditableDescription } from "@/components/app/editable-description";
import { RecordFocusProvider } from "@/components/app/record-focus-context";
import type { WorkspaceRecord } from "@/components/app/record-workspace";

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
        <div className="px-4 pt-8 pb-8 sm:px-8 sm:pt-12">
          <div className="mx-auto max-w-3xl">
            <div className="space-y-4">
              <h1
                ref={titleRef}
                tabIndex={-1}
                className="break-words font-heading text-xl font-semibold tracking-normal outline-none sm:text-2xl"
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
          </div>
        </div>
      </article>
    </RecordFocusProvider>
  );
}
