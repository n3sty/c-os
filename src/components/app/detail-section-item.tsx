"use client";

import Link from "next/link";
import type { ReactNode } from "react";

import {
  PropertyDateField,
  PropertyMoneyField,
  PropertySelectField,
  PropertyTextField,
} from "@/components/app/detail-property-field";
import { ShortcutKeycap } from "@/components/app/keyboard-shortcut-hint";
import type { EditableFieldDescriptor } from "@/components/app/record-workspace";

export type DetailItemLink = {
  href: string;
  label: string;
  meta?: ReactNode;
};

export type DetailItem = {
  label: string;
  value?: ReactNode;
  editable?: EditableFieldDescriptor;
  links?: DetailItemLink[];
};

function isVisibleValue(value: ReactNode) {
  return value !== null && value !== undefined && value !== "";
}

function renderEditableField(
  descriptor: EditableFieldDescriptor,
  value: string,
) {
  if (descriptor.type === "select") {
    return (
      <PropertySelectField
        options={descriptor.options}
        shortcutKey={descriptor.shortcutKey}
        target={descriptor.target}
        value={value}
      />
    );
  }

  if (descriptor.type === "date") {
    return (
      <PropertyDateField
        shortcutKey={descriptor.shortcutKey}
        target={descriptor.target}
        value={value}
      />
    );
  }

  if (descriptor.type === "money") {
    return (
      <PropertyMoneyField
        shortcutKey={descriptor.shortcutKey}
        target={descriptor.target}
        value={value}
      />
    );
  }

  return (
    <PropertyTextField
      placeholder={descriptor.placeholder}
      shortcutKey={descriptor.shortcutKey}
      target={descriptor.target}
      type={descriptor.inputType}
      value={value}
    />
  );
}

export function DetailSectionItem({ item }: { item: DetailItem }) {
  if (item.links && item.links.length > 0) {
    return (
      <div className="min-w-0 space-y-2 text-sm">
        <span className="text-muted-foreground">{item.label}</span>
        <div className="flex flex-wrap gap-1.5">
          {item.links.map((link) => (
            <Link
              className="inline-flex min-h-7 min-w-0 max-w-full items-center gap-2 rounded-md bg-muted/30 px-2 text-sm font-medium transition-colors hover:bg-muted/50 hover:text-foreground"
              href={link.href}
              key={`${link.href}-${link.label}`}
            >
              <span className="min-w-0 truncate">{link.label}</span>
              {isVisibleValue(link.meta) && (
                <span className="shrink-0 text-xs text-muted-foreground">
                  {link.meta}
                </span>
              )}
            </Link>
          ))}
        </div>
      </div>
    );
  }

  const editableValue =
    item.editable && typeof item.value === "string"
      ? renderEditableField(item.editable, item.value)
      : null;

  const shortcutKey =
    item.editable && "shortcutKey" in item.editable
      ? item.editable.shortcutKey
      : undefined;

  return (
    <div className="group flex min-w-0 items-start justify-between gap-4 text-sm">
      <span className="flex shrink-0 items-center gap-1.5 text-muted-foreground">
        {item.label}
        {shortcutKey && (
          <span className="opacity-0 transition-opacity group-hover:opacity-100">
            <ShortcutKeycap>{shortcutKey.toUpperCase()}</ShortcutKeycap>
          </span>
        )}
      </span>
      {editableValue ?? (
        <span className="min-w-0 max-w-44 break-words text-right font-medium">
          {item.value}
        </span>
      )}
    </div>
  );
}
