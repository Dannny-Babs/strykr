"use client";

import { type DragEvent, useState } from "react";
import { CheckCircle2, CloudUpload, FileText, LoaderCircle, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

export type AttachedFile = Pick<File, "name" | "size">;

export function FileDropzone({
  id,
  accept,
  helperText,
  onFile,
  disabled = false,
  className,
}: {
  id: string;
  accept: string;
  helperText: string;
  onFile: (file: File | null) => void;
  disabled?: boolean;
  className?: string;
}) {
  const [dragging, setDragging] = useState(false);

  function dropFile(event: DragEvent<HTMLLabelElement>) {
    event.preventDefault();
    setDragging(false);
    if (!disabled) onFile(event.dataTransfer.files?.[0] ?? null);
  }

  return (
    <>
      <label
        htmlFor={id}
        onDragEnter={(event) => {
          event.preventDefault();
          if (!disabled) setDragging(true);
        }}
        onDragOver={(event) => event.preventDefault()}
        onDragLeave={(event) => {
          event.preventDefault();
          if (event.currentTarget === event.target) setDragging(false);
        }}
        onDrop={dropFile}
        className={cn(
          "flex min-h-44 cursor-pointer flex-col items-center justify-center rounded-2xl border border-dashed border-primary-border bg-card px-10 py-8 text-center transition-[border-color,background-color,box-shadow] hover:border-primary hover:bg-primary-soft/25 focus-within:border-primary focus-within:ring-3 focus-within:ring-ring/30",
          dragging && "border-primary bg-primary-soft/40 ring-3 ring-ring/25",
          disabled && "pointer-events-none opacity-60",
          className,
        )}
      >
        <span className="grid size-12 place-items-center rounded-full bg-muted text-secondary-foreground ring-6 ring-muted/55">
          <CloudUpload className="size-5" strokeWidth={1.8} />
        </span>
        <p className="mt-5 text-[15px] leading-5 text-secondary-foreground">
          <strong className="font-medium text-foreground">Click to upload</strong> or drag and drop
        </p>
        <p className="mt-1.5 text-xs text-muted-foreground">{helperText}</p>
      </label>
      <Input
        id={id}
        type="file"
        accept={accept}
        className="sr-only"
        disabled={disabled}
        onChange={(event) => {
          onFile(event.target.files?.[0] ?? null);
          event.currentTarget.value = "";
        }}
      />
    </>
  );
}

export function AttachedFileRow({
  file,
  status = "idle",
  onRemove,
  removeDisabled = false,
}: {
  file: AttachedFile;
  status?: "idle" | "working" | "ready";
  onRemove: () => void;
  removeDisabled?: boolean;
}) {
  return (
    <div className="group flex min-h-11 items-center gap-2.5 rounded-lg bg-card px-2.5 py-1.5 ring-1 ring-transparent transition-[background-color,box-shadow] hover:bg-muted/25 hover:ring-input-hover focus-within:ring-3 focus-within:ring-ring/40">
      <FileText className="size-4 shrink-0 text-muted-foreground" strokeWidth={1.7} />
      <p className="min-w-0 flex-1 truncate text-[13px] font-medium text-foreground">{file.name}</p>
      {status === "working" ? (
        <LoaderCircle className="size-4 shrink-0 animate-spin text-primary" aria-label="Processing file" />
      ) : status === "ready" ? (
        <CheckCircle2 className="size-4 shrink-0 text-primary" aria-label="File ready" />
      ) : null}
      <span className="shrink-0 text-xs tabular-nums text-muted-foreground">{formatFileSize(file.size)}</span>
      <button
        type="button"
        className="grid size-7 shrink-0 place-items-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50"
        onClick={onRemove}
        disabled={removeDisabled}
        aria-label={`Remove ${file.name}`}
      >
        <X className="size-4" />
      </button>
    </div>
  );
}

function formatFileSize(size: number) {
  if (size < 1024) return `${size} B`;
  if (size < 1024 * 1024) return `${(size / 1024).toLocaleString(undefined, { maximumFractionDigits: 0 })} KB`;
  return `${(size / 1024 / 1024).toLocaleString(undefined, { maximumFractionDigits: 1 })} MB`;
}
