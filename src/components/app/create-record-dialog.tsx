"use client";

import {
  RiAddLine,
  RiArrowRightSLine,
  RiBriefcase4Line,
  RiCalendarLine,
  RiCheckboxCircleLine,
  RiFileList3Line,
  RiMailLine,
  RiPriceTag3Line,
  RiUser3Line,
} from "@remixicon/react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import type { FormEvent } from "react";
import { useCallback, useMemo, useRef, useState, useTransition } from "react";

import { createRecordAction } from "@/app/actions/records";
import { Checkbox } from "@/components/animate-ui/components/radix/checkbox";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/animate-ui/components/radix/tooltip";
import { KeyboardShortcutInstructions } from "@/components/app/keyboard-shortcut-hint";
import { useKeyboardShortcut } from "@/components/app/keyboard-shortcut-provider";
import { Button } from "@/components/ui/button";
import { CreationCombobox } from "@/components/ui/combobox";
import { CreationDatePicker } from "@/components/ui/date-picker";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
  useDialogPopupContainer,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { MoneyInput } from "@/components/ui/money-input";
import {
  type CreationConfig,
  type CreationField,
  getCreationConfig,
  isCreationTarget,
} from "@/lib/creation";
import { useFormOptions } from "@/lib/form-options-context";
import type { KeyboardShortcutDefinition } from "@/lib/keyboard-shortcuts";
import { cn } from "@/lib/utils";

// Shortcut keys assigned per field name
const FIELD_SHORTCUTS: Record<string, string> = {
  clientId: "c",
  proposalId: "p",
  status: "s",
  date: "d",
};

function getFieldIcon(field: CreationField) {
  if (field.options) {
    return RiBriefcase4Line;
  }

  switch (field.type) {
    case "email":
      return RiMailLine;
    case "date":
      return RiCalendarLine;
    case "money":
      return RiPriceTag3Line;
    case "url":
      return RiFileList3Line;
    default:
      return field.name.toLowerCase().includes("name")
        ? RiUser3Line
        : RiPriceTag3Line;
  }
}

function getPrimaryField(fields: CreationField[]) {
  return (
    fields.find((field) =>
      ["projectOrClientName", "title", "invoiceNumber", "supplier"].includes(
        field.name,
      ),
    ) ?? fields[0]
  );
}

function getSecondaryField(fields: CreationField[]) {
  return fields.find((field) =>
    ["contactName", "documentLink"].includes(field.name),
  );
}

function getCreateShortcutInstructions(
  config: CreationConfig,
): KeyboardShortcutDefinition[] {
  const action = config.submitLabel.toLowerCase();

  return [
    {
      id: "create-record.submit",
      label: `to ${action}`,
      keys: { key: "Enter", modifiers: ["mod"] },
    },
    {
      id: "create-record.submit-more",
      label: "to create and draft new",
      keys: { key: "Enter", modifiers: ["mod", "shift"] },
    },
  ];
}

export type FieldImperativeHandle = {
  open: () => void;
};

export function CreateRecordDialog() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const createValue = searchParams.get("create");
  const target = isCreationTarget(createValue) ? createValue : null;
  const [createMore, setCreateMore] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [createdRecord, setCreatedRecord] = useState<{
    type: string;
    id: number;
  } | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const [isDirty, setIsDirty] = useState(false);
  const [openPopupCount, setOpenPopupCount] = useState(0);
  const formRef = useRef<HTMLFormElement>(null);
  const dialogContentRef = useRef<HTMLDivElement>(null);
  const submitIntentRef = useRef<"close" | "more" | null>(null);
  const fieldHandlesRef = useRef<Map<string, FieldImperativeHandle>>(new Map());

  const handlePopupOpenChange = useCallback((isOpen: boolean) => {
    setOpenPopupCount((n) => Math.max(0, n + (isOpen ? 1 : -1)));
  }, []);

  const formOptions = useFormOptions();
  const config = useMemo(
    () => (target ? getCreationConfig(target, formOptions) : null),
    [target, formOptions],
  );

  function closeDialog() {
    const nextParams = new URLSearchParams(searchParams);
    nextParams.delete("create");
    nextParams.delete("clientId");
    nextParams.delete("proposalId");
    nextParams.delete("status");
    nextParams.delete("returnTo");
    const query = nextParams.toString();
    router.replace(query ? `${pathname}?${query}` : pathname, {
      scroll: false,
    });
    setSubmitted(false);
    setCreatedRecord(null);
    setErrorMessage(null);
    setIsDirty(false);
  }

  function handleEscapeKeyDown(event: KeyboardEvent) {
    if (isDirty) {
      event.preventDefault();
      dialogContentRef.current?.focus();
    }
  }

  function handleFormChange() {
    setIsDirty(true);
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const form = event.currentTarget;
    if (!form.reportValidity() || !target) {
      return;
    }

    const shouldCreateMore =
      submitIntentRef.current === "more" ||
      (submitIntentRef.current === null && createMore);
    submitIntentRef.current = null;
    const formData = new FormData(form);

    setSubmitted(false);
    setErrorMessage(null);

    startTransition(async () => {
      const result = await createRecordAction(target, formData);

      if (!result.ok) {
        setErrorMessage(result.message ?? "Could not save record.");
        return;
      }

      setSubmitted(true);
      setCreatedRecord(result.record ?? null);
      setIsDirty(false);
      router.refresh();

      if (!shouldCreateMore && !searchParams.get("returnTo")) {
        window.setTimeout(closeDialog, 250);
        return;
      }

      form.reset();
      setIsDirty(false);
    });
  }

  const registerFieldHandle = useCallback(
    (name: string, handle: FieldImperativeHandle | null) => {
      if (handle) {
        fieldHandlesRef.current.set(name, handle);
      } else {
        fieldHandlesRef.current.delete(name);
      }
    },
    [],
  );

  useKeyboardShortcut({
    id: "create-record.submit",
    label: "Create record",
    keys: { key: "Enter", modifiers: ["mod"] },
    enabled: Boolean(config),
    allowInEditable: true,
    priority: 100,
    handler: () => {
      submitIntentRef.current = "close";
      formRef.current?.requestSubmit();
    },
  });

  useKeyboardShortcut({
    id: "create-record.submit-more",
    label: "Create record and draft another",
    keys: { key: "Enter", modifiers: ["mod", "shift"] },
    enabled: Boolean(config),
    allowInEditable: true,
    priority: 100,
    handler: () => {
      submitIntentRef.current = "more";
      formRef.current?.requestSubmit();
    },
  });

  const resolvedConfig = useMemo(() => {
    if (!config) return null;

    return {
      ...config,
      fields: config.fields.map((field) => {
        const value = searchParams.get(field.name);
        return value ? { ...field, value } : field;
      }),
    };
  }, [config, searchParams]);

  const metadataFields = resolvedConfig
    ? resolvedConfig.fields.filter(
        (f) =>
          f !== getPrimaryField(resolvedConfig.fields) &&
          f !== getSecondaryField(resolvedConfig.fields),
      )
    : [];

  return (
    <Dialog
      open={Boolean(config)}
      onOpenChange={(open) => !open && !isDirty && closeDialog()}
    >
      {resolvedConfig &&
        metadataFields.map((field) => {
          const shortcutKey = FIELD_SHORTCUTS[field.name];
          if (!shortcutKey) return null;
          return (
            <FieldShortcut
              key={field.name}
              fieldName={field.name}
              shortcutKey={shortcutKey}
              fieldHandlesRef={fieldHandlesRef}
              enabled={openPopupCount === 0}
            />
          );
        })}
      {resolvedConfig && (
        <DialogContent
          ref={dialogContentRef}
          className="top-[15vh] max-w-[calc(42rem*1.5)] sm:top-[15vh]"
          onEscapeKeyDown={handleEscapeKeyDown}
        >
          <form
            className="grid grid-rows-[minmax(0,1fr)_auto]"
            onChange={handleFormChange}
            onSubmit={handleSubmit}
            ref={formRef}
          >
            <div className="min-h-0 overflow-auto px-5 pt-4 pb-6 sm:px-9 sm:pt-5">
              <header className="flex items-center gap-2 pr-8 text-muted-foreground text-sm">
                <span className="inline-flex h-7 items-center gap-2 rounded-full bg-muted/40 px-2.5 font-medium">
                  <RiBriefcase4Line size={14} />
                  COS
                </span>
                <RiArrowRightSLine size={16} />
                <span className="inline-flex h-7 items-center rounded-full bg-muted/40 px-2.5 font-medium">
                  {resolvedConfig.title}
                </span>
              </header>

              <DialogTitle className="sr-only">
                {resolvedConfig.title}
              </DialogTitle>
              <DialogDescription className="sr-only">
                {resolvedConfig.description}
              </DialogDescription>

              <CreateRecordCanvas
                fields={resolvedConfig.fields}
                onPopupOpenChange={handlePopupOpenChange}
                registerFieldHandle={registerFieldHandle}
              />
            </div>

            <footer className="flex flex-col gap-3 border-border/60 border-t bg-card/95 px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-9">
              <div className="inline-flex items-center gap-2 text-muted-foreground text-sm">
                <Checkbox
                  aria-label="Create more"
                  checked={createMore}
                  id="create-more"
                  onCheckedChange={(checked) => setCreateMore(checked === true)}
                  size="sm"
                  type="button"
                />
                <label htmlFor="create-more">Create more</label>
              </div>

              <div className="flex items-center justify-end gap-2">
                {submitted && (
                  <span className="inline-flex flex-wrap items-center gap-1.5 text-muted-foreground text-sm">
                    <RiCheckboxCircleLine size={16} />
                    Saved
                    {createdRecord && (
                      <Link
                        className="font-medium text-foreground underline-offset-4 hover:underline"
                        href={`/${createdRecord.type}s?record=${createdRecord.id}`}
                      >
                        Open record
                      </Link>
                    )}
                    {searchParams.get("returnTo") && (
                      <Link
                        className="font-medium text-foreground underline-offset-4 hover:underline"
                        href={searchParams.get("returnTo") ?? pathname}
                      >
                        Return to workflow
                      </Link>
                    )}
                  </span>
                )}
                {errorMessage && (
                  <span className="text-destructive text-sm">
                    {errorMessage}
                  </span>
                )}
                <Button
                  className="h-8 rounded-full px-3"
                  onClick={closeDialog}
                  disabled={isPending}
                  type="button"
                  variant="ghost"
                >
                  Cancel
                </Button>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      className="h-8 rounded-full px-3"
                      disabled={isPending}
                      type="submit"
                    >
                      <RiAddLine />
                      {isPending ? "Saving..." : resolvedConfig.submitLabel}
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent
                    align="end"
                    arrowClassName="bg-popover fill-popover"
                    className="rounded-lg border border-border/70 bg-popover px-3 py-2.5 text-popover-foreground shadow-xl"
                    side="bottom"
                    sideOffset={8}
                  >
                    <KeyboardShortcutInstructions
                      className="gap-1.5"
                      shortcuts={[
                        ...getCreateShortcutInstructions(resolvedConfig),
                      ]}
                    />
                  </TooltipContent>
                </Tooltip>
              </div>
            </footer>
          </form>
        </DialogContent>
      )}
    </Dialog>
  );
}

function FieldShortcut({
  fieldName,
  shortcutKey,
  fieldHandlesRef,
  enabled,
}: {
  fieldName: string;
  shortcutKey: string;
  fieldHandlesRef: React.RefObject<Map<string, FieldImperativeHandle>>;
  enabled: boolean;
}) {
  useKeyboardShortcut({
    id: `create-record.field.${fieldName}`,
    keys: { key: shortcutKey },
    enabled,
    allowInEditable: false,
    priority: 90,
    handler: () => {
      fieldHandlesRef.current.get(fieldName)?.open();
    },
  });
  return null;
}

type CreateRecordCanvasProps = {
  fields: CreationField[];
  onPopupOpenChange: (isOpen: boolean) => void;
  registerFieldHandle: (
    name: string,
    handle: FieldImperativeHandle | null,
  ) => void;
};

function CreateRecordCanvas({
  fields,
  onPopupOpenChange,
  registerFieldHandle,
}: CreateRecordCanvasProps) {
  const portalContainer = useDialogPopupContainer();
  const primaryField = getPrimaryField(fields);
  const secondaryField = getSecondaryField(fields);
  const metadataFields = fields.filter(
    (field) => field !== primaryField && field !== secondaryField,
  );
  const PrimaryIcon = getFieldIcon(primaryField);

  return (
    <div className="pt-8">
      <div className="flex items-start gap-4">
        <div className="mt-1 flex size-9 shrink-0 items-center justify-center rounded-md bg-muted/55 text-muted-foreground">
          <PrimaryIcon size={20} />
        </div>
        <div className="min-w-0 flex-1 space-y-1.5">
          <CreatePrimaryField field={primaryField} />
          {secondaryField && <CreateSecondaryField field={secondaryField} />}
        </div>
      </div>

      {metadataFields.length > 0 && (
        <div className="mt-5 flex flex-wrap gap-2">
          {metadataFields.map((field) => (
            <CreateMetadataField
              field={field}
              key={field.name}
              onPopupOpenChange={onPopupOpenChange}
              portalContainer={portalContainer}
              registerHandle={registerFieldHandle}
            />
          ))}
        </div>
      )}

      {fields.some((field) => field.name === "title") && (
        <div className="mt-7 border-border/60 border-t pt-5">
          <textarea
            aria-label="Description"
            className="h-28 w-full resize-none bg-transparent text-base leading-7 text-foreground outline-none placeholder:text-muted-foreground"
            name="description"
            placeholder="Write a description, brief, or collect ideas..."
          />
        </div>
      )}
    </div>
  );
}

function CreatePrimaryField({ field }: { field: CreationField }) {
  const inputId = `create-${field.name}`;
  const value = field.value ?? (field.readOnly ? field.placeholder : undefined);

  return (
    <Input
      aria-label={field.label}
      className="h-auto border-0 px-0 py-0 font-heading text-2xl font-semibold shadow-none placeholder:text-muted-foreground/70 focus-visible:ring-0 sm:text-3xl"
      defaultValue={value}
      id={inputId}
      name={field.name}
      placeholder={field.placeholder ?? field.label}
      readOnly={field.readOnly}
      required={field.required}
      type={field.type ?? "text"}
    />
  );
}

function CreateSecondaryField({ field }: { field: CreationField }) {
  const inputId = `create-${field.name}`;
  const value = field.value ?? (field.readOnly ? field.placeholder : undefined);

  return (
    <Input
      aria-label={field.label}
      className="h-auto border-0 px-0 py-0 text-base text-muted-foreground shadow-none placeholder:text-muted-foreground/70 focus-visible:ring-0"
      defaultValue={value}
      id={inputId}
      name={field.name}
      placeholder={field.placeholder ?? field.label}
      readOnly={field.readOnly}
      required={field.required}
      type={field.type ?? "text"}
    />
  );
}

type CreateMetadataFieldProps = {
  field: CreationField;
  onPopupOpenChange: (isOpen: boolean) => void;
  registerHandle: (name: string, handle: FieldImperativeHandle | null) => void;
  portalContainer?: HTMLElement | null;
};

function CreateMetadataField({
  field,
  onPopupOpenChange,
  registerHandle,
  portalContainer,
}: CreateMetadataFieldProps) {
  const Icon = getFieldIcon(field);
  const inputId = `create-${field.name}`;
  const readOnlyValue = field.readOnly ? field.placeholder : undefined;
  const defaultValue =
    field.value ??
    (field.type === "date" && field.placeholder
      ? field.placeholder
      : readOnlyValue);
  const shortcutKey = FIELD_SHORTCUTS[field.name];
  const fieldName = field.name;
  const handleRegister = useCallback(
    (handle: FieldImperativeHandle | null) => registerHandle(fieldName, handle),
    [fieldName, registerHandle],
  );

  if (field.options) {
    return (
      <CreationCombobox
        icon={Icon}
        id={inputId}
        label={field.label}
        name={field.name}
        options={field.options}
        placeholder={`Select ${field.label.toLowerCase()}`}
        portalContainer={portalContainer}
        required={field.required}
        shortcutKey={shortcutKey}
        onRegisterHandle={handleRegister}
        onOpenChange={onPopupOpenChange}
      />
    );
  }

  if (field.type === "date") {
    return (
      <CreationDatePicker
        defaultValue={defaultValue}
        icon={Icon}
        id={inputId}
        label={field.label}
        name={field.name}
        placeholder={field.placeholder}
        portalContainer={portalContainer}
        required={field.required}
        shortcutKey={shortcutKey}
        onRegisterHandle={handleRegister}
        onOpenChange={onPopupOpenChange}
      />
    );
  }

  return (
    <label
      className="inline-flex h-8 max-w-full items-center gap-2 rounded-full border border-border/55 bg-muted/35 px-2.5 text-muted-foreground text-sm transition-colors focus-within:border-ring/60 focus-within:bg-muted/50 hover:bg-muted/45"
      htmlFor={inputId}
    >
      <Icon className="shrink-0" size={14} />
      <span className="sr-only">{field.label}</span>
      {field.type === "money" ? (
        <MoneyInput
          className="h-7 min-w-0 w-44 border-0 bg-transparent px-0 py-0 text-sm shadow-none focus-visible:ring-0"
          defaultValue={defaultValue}
          id={inputId}
          name={field.name}
          placeholder={field.placeholder}
          readOnly={field.readOnly}
          required={field.required}
        />
      ) : (
        <Input
          className={cn(
            "h-7 min-w-0 border-0 bg-transparent px-0 py-0 text-sm shadow-none focus-visible:ring-0",
            field.readOnly ? "w-32" : "w-44",
          )}
          defaultValue={defaultValue}
          id={inputId}
          name={field.name}
          placeholder={field.placeholder}
          readOnly={field.readOnly}
          required={field.required}
          type={field.type ?? "text"}
        />
      )}
    </label>
  );
}
