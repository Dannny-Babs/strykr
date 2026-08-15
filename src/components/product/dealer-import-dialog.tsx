"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  AlertCircle,
  ArrowRight,
  CheckCircle2,
  LoaderCircle,
  Upload,
} from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AttachedFileRow, FileDropzone, type AttachedFile } from "@/components/product/file-dropzone";

type SourceType = "TRANSACTION_REGISTER" | "REGISTRATION_RECORD";
type Preview = {
  mapping: Record<string, string>;
  summary: {
    totalRows: number;
    validRows: number;
    warningRows: number;
    rejectedRows: number;
    duplicateRows: number;
  };
};

const SOURCE_LABELS: Record<SourceType, string> = {
  TRANSACTION_REGISTER: "Transaction register",
  REGISTRATION_RECORD: "Registration records",
};

const PREVIEW_RESULT: Preview = {
  mapping: {
    vin: "VIN",
    transaction_date: "Date of sale",
    transaction_type: "Transaction category",
    source_record_id: "Record ID",
    reported_fee: "Reported fee",
  },
  summary: {
    totalRows: 248,
    validRows: 232,
    warningRows: 9,
    rejectedRows: 4,
    duplicateRows: 3,
  },
};

export function DealerImportDialog({
  dealershipId,
  reportingPeriodId,
  defaultOpen = false,
  previewMode = false,
  defaultAttachment = null,
}: {
  dealershipId: string;
  reportingPeriodId: string;
  defaultOpen?: boolean;
  previewMode?: boolean;
  defaultAttachment?: AttachedFile | null;
}) {
  const router = useRouter();
  const requestController = useRef<AbortController | null>(null);
  const [open, setOpen] = useState(defaultOpen);
  const [file, setFile] = useState<AttachedFile | null>(defaultAttachment);
  const [sourceType, setSourceType] = useState<SourceType>("TRANSACTION_REGISTER");
  const [preview, setPreview] = useState<Preview | null>(null);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [completedRows, setCompletedRows] = useState<number | null>(null);

  const importableRows = preview ? preview.summary.validRows + preview.summary.warningRows : 0;

  function reset() {
    requestController.current?.abort();
    requestController.current = null;
    setFile(null);
    setPreview(null);
    setError("");
    setBusy(false);
    setCompletedRows(null);
  }

  function handleOpenChange(nextOpen: boolean) {
    setOpen(nextOpen);
    if (!nextOpen) reset();
  }

  function chooseFile(nextFile: File | null) {
    if (!nextFile) return;
    const isCsv = nextFile.name.toLowerCase().endsWith(".csv") || nextFile.type === "text/csv";
    if (!isCsv) {
      setFile(null);
      setPreview(null);
      setError("Choose a CSV file to continue.");
      return;
    }
    if (nextFile.size > 10 * 1024 * 1024) {
      setFile(null);
      setPreview(null);
      setError("Choose a CSV file that is 10 MB or smaller.");
      return;
    }

    setFile(nextFile);
    setPreview(null);
    setError("");
    setCompletedRows(null);
  }

  function removeFile() {
    requestController.current?.abort();
    requestController.current = null;
    setBusy(false);
    setFile(null);
    setPreview(null);
    setError("");
  }

  async function request(mode: "preview" | "commit") {
    if (!file) return;
    const controller = new AbortController();
    requestController.current = controller;
    setBusy(true);
    setError("");

    const form = new FormData();
    form.set("file", file instanceof File ? file : new File([], file.name, { type: "text/csv" }));
    form.set("sourceType", sourceType);
    form.set("mode", mode);
    form.set("dealershipId", dealershipId);
    form.set("reportingPeriodId", reportingPeriodId);
    if (preview) form.set("mapping", JSON.stringify(preview.mapping));

    try {
      if (previewMode) {
        await new Promise<void>((resolve, reject) => {
          const timer = window.setTimeout(resolve, 850);
          controller.signal.addEventListener("abort", () => {
            window.clearTimeout(timer);
            reject(new DOMException("Preview cancelled", "AbortError"));
          }, { once: true });
        });
        if (mode === "preview") setPreview(PREVIEW_RESULT);
        else {
          setCompletedRows(importableRows);
          setPreview(null);
          setFile(null);
        }
        return;
      }

      const response = await fetch("/api/imports", { method: "POST", body: form, signal: controller.signal });
      const body = await response.json();
      if (!response.ok) throw new Error(body.error);

      if (mode === "preview") {
        setPreview(body);
      } else {
        setCompletedRows(importableRows);
        setPreview(null);
        setFile(null);
        router.refresh();
      }
    } catch (reason) {
      if (reason instanceof DOMException && reason.name === "AbortError") return;
      setError(reason instanceof Error ? reason.message : "The import could not be completed.");
    } finally {
      if (requestController.current === controller) {
        requestController.current = null;
        setBusy(false);
      }
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button><Upload className="size-4" /> Import records</Button>
      </DialogTrigger>
      <DialogContent className="top-1/2 max-h-[calc(100dvh-32px)] max-w-2xl -translate-y-1/2">
        <div className="border-b px-6 py-5 pr-14">
          <DialogTitle>{completedRows !== null ? "Records imported" : preview ? "Review source records" : "Import source records"}</DialogTitle>
          <DialogDescription className="mt-1 max-w-xl leading-5">
            {completedRows !== null
              ? "The source file and its validation results are now in import history."
              : preview
                ? "Check the validation results before adding these records to the ledger."
                : "Choose the kind of records you are importing, then add a CSV file to validate."}
          </DialogDescription>
        </div>

        <div className="max-h-[calc(100dvh-180px)] overflow-y-auto">
          {completedRows !== null ? (
            <div className="px-6 py-10 text-center">
              <span className="mx-auto grid size-12 place-items-center rounded-full bg-primary-soft text-primary">
                <CheckCircle2 className="size-6" />
              </span>
              <h3 className="mt-4 text-base font-medium text-foreground">
                {completedRows.toLocaleString()} source records added
              </h3>
              <p className="mx-auto mt-1 max-w-sm text-[13px] leading-5 text-secondary-foreground">
                Original values, warnings, and rejected rows remain attached to this import for review.
              </p>
              <Button className="mt-6" onClick={() => handleOpenChange(false)}>Done</Button>
            </div>
          ) : preview ? (
            <>
              <div className="space-y-5 px-6 py-5">
                {error ? (
                  <Alert variant="destructive">
                    <AlertCircle className="size-4" />
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                ) : null}

                {file ? (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between gap-4">
                      <Label>Attached file</Label>
                      <span className="text-xs text-muted-foreground">
                        {SOURCE_LABELS[sourceType]} · {preview.summary.totalRows.toLocaleString()} rows
                      </span>
                    </div>
                    <AttachedFileRow file={file} status="ready" onRemove={removeFile} />
                  </div>
                ) : null}

                <div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="size-4 text-primary" />
                    <h3 className="text-sm font-medium text-foreground">{importableRows.toLocaleString()} records are ready</h3>
                  </div>
                  <p className="mt-1 text-xs leading-4 text-muted-foreground">
                    Rejected and duplicate rows stay in import history but will not enter the ledger.
                  </p>
                </div>

                <dl className="grid grid-cols-2 gap-px overflow-hidden rounded-xl border bg-border sm:grid-cols-4">
                  {[
                    ["Ready", importableRows],
                    ["Warnings", preview.summary.warningRows],
                    ["Rejected", preview.summary.rejectedRows],
                    ["Duplicates", preview.summary.duplicateRows],
                  ].map(([label, value]) => (
                    <div key={label} className="bg-card px-4 py-3">
                      <dt className="text-xs text-muted-foreground">{label}</dt>
                      <dd className="mt-1 text-lg font-medium tabular-nums text-foreground">{Number(value).toLocaleString()}</dd>
                    </div>
                  ))}
                </dl>

                <div>
                  <div className="mb-2 flex items-center justify-between gap-4">
                    <h3 className="text-[13px] font-medium text-foreground">Matched columns</h3>
                    <span className="text-xs text-muted-foreground">Source → Cordena</span>
                  </div>
                  <dl className="grid gap-2 text-xs sm:grid-cols-2">
                    {Object.entries(preview.mapping).map(([field, column]) => (
                      <div key={field} className="flex items-center gap-2 rounded-lg border bg-muted px-3 py-2.5">
                        <dt className="min-w-0 flex-1 truncate text-muted-foreground">{column}</dt>
                        <ArrowRight className="size-3 shrink-0 text-muted-foreground" />
                        <dd className="min-w-0 flex-1 truncate text-right font-medium text-foreground">{field.replaceAll("_", " ")}</dd>
                      </div>
                    ))}
                  </dl>
                </div>
              </div>
              <div className="flex items-center justify-between gap-3 border-t bg-card px-6 py-4">
                <Button type="button" variant="ghost" onClick={() => setPreview(null)}>Back</Button>
                <Button disabled={busy || importableRows === 0} onClick={() => void request("commit")}>
                  {busy ? <LoaderCircle className="size-3.5 animate-spin" /> : <Upload className="size-4" />}
                  {busy ? "Importing" : `Import ${importableRows.toLocaleString()} records`}
                </Button>
              </div>
            </>
          ) : (
            <>
              <div className="space-y-5 px-6 py-5">
                <div className="space-y-2">
                  <Label htmlFor="source-record-type">Record type</Label>
                  <Select
                    value={sourceType}
                    onValueChange={(value) => {
                      setSourceType(value as SourceType);
                      setError("");
                    }}
                  >
                    <SelectTrigger id="source-record-type" className="w-full" aria-label="Source record type">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="TRANSACTION_REGISTER">Transaction register</SelectItem>
                      <SelectItem value="REGISTRATION_RECORD">Registration records</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {file ? (
                  <div className="space-y-2">
                    <Label>Attached file</Label>
                    <AttachedFileRow file={file} status={busy ? "working" : "idle"} onRemove={removeFile} />
                  </div>
                ) : (
                  <FileDropzone
                    id="source-record-file"
                    accept=".csv,text/csv"
                    helperText="CSV files up to 10 MB"
                    onFile={chooseFile}
                    disabled={busy}
                  />
                )}

                {error ? (
                  <Alert variant="destructive">
                    <AlertCircle className="size-4" />
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                ) : null}

                <p className="text-xs leading-4 text-muted-foreground">
                  We’ll check the file first. You’ll review any warnings or rejected rows before anything is added.
                </p>
              </div>
              <div className="flex items-center justify-end gap-3 border-t bg-card px-6 py-4">
                <Button type="button" variant="ghost" onClick={() => handleOpenChange(false)}>Cancel</Button>
                <Button disabled={!file || busy} onClick={() => void request("preview")}>
                  {busy ? <LoaderCircle className="size-3.5 animate-spin" /> : null}
                  {busy ? "Validating" : "Validate file"}
                </Button>
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
