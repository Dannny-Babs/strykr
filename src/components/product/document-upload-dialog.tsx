"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AlertCircle, LoaderCircle, Upload } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AttachedFileRow, FileDropzone } from "@/components/product/file-dropzone";

const DOCUMENT_ACCEPT = ".pdf,.csv,.xlsx,.docx,.jpg,.jpeg,.png";
const DOCUMENT_TYPES = new Set([
  "application/pdf",
  "text/csv",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "image/jpeg",
  "image/png",
]);

export function DocumentUploadDialog({
  dealershipId,
  defaultOpen = false,
}: {
  dealershipId: string;
  defaultOpen?: boolean;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(defaultOpen);
  const [file, setFile] = useState<File | null>(null);
  const [type, setType] = useState("SUPPORTING_EVIDENCE");
  const [transactionId, setTransactionId] = useState("");
  const [exceptionId, setExceptionId] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  function handleOpenChange(nextOpen: boolean) {
    if (!nextOpen && busy) return;
    setOpen(nextOpen);
    if (!nextOpen) {
      setFile(null);
      setError("");
      setTransactionId("");
      setExceptionId("");
    }
  }

  function chooseDocument(nextFile: File | null) {
    if (!nextFile) return;
    if (nextFile.size > 10 * 1024 * 1024) {
      setFile(null);
      setError("Choose a document that is 10 MB or smaller.");
      return;
    }
    if (!DOCUMENT_TYPES.has(nextFile.type)) {
      setFile(null);
      setError("Choose a PDF, CSV, XLSX, DOCX, JPG, or PNG file.");
      return;
    }
    setFile(nextFile);
    setError("");
  }

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    if (!file) {
      setError("Choose a document to upload.");
      return;
    }

    setBusy(true);
    setError("");
    const form = new FormData();
    form.set("file", file);
    form.set("dealershipId", dealershipId);
    form.set("documentType", type);
    if (transactionId.trim()) form.set("transactionId", transactionId.trim());
    if (exceptionId.trim()) form.set("exceptionId", exceptionId.trim());

    try {
      const response = await fetch("/api/documents", { method: "POST", body: form });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.error ?? "Upload failed.");
      setOpen(false);
      setFile(null);
      setTransactionId("");
      setExceptionId("");
      router.refresh();
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Upload failed.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button><Upload className="size-4" /> Upload evidence</Button>
      </DialogTrigger>
      <DialogContent className="top-1/2 max-w-md -translate-y-1/2">
        <div className="border-b p-5 pr-12">
          <DialogTitle>Upload evidence</DialogTitle>
          <DialogDescription>Attach a supported document inside this dealership workspace.</DialogDescription>
        </div>
        <form onSubmit={submit} className="space-y-4 p-5">
          {error ? (
            <Alert variant="destructive">
              <AlertCircle className="size-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          ) : null}

          <div className="space-y-1.5">
            <Label htmlFor={file ? undefined : "evidence-file"}>File</Label>
            {file ? (
              <AttachedFileRow
                file={file}
                status={busy ? "working" : "idle"}
                onRemove={() => setFile(null)}
                removeDisabled={busy}
              />
            ) : (
              <FileDropzone
                id="evidence-file"
                accept={DOCUMENT_ACCEPT}
                helperText="PDF, CSV, XLSX, DOCX, JPG, or PNG · up to 10 MB"
                onFile={chooseDocument}
                disabled={busy}
                className="min-h-40"
              />
            )}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="document-type">Document type</Label>
            <Select value={type} onValueChange={setType}>
              <SelectTrigger id="document-type" className="w-full"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="SUPPORTING_EVIDENCE">Supporting evidence</SelectItem>
                <SelectItem value="BILL_OF_SALE">Bill of sale</SelectItem>
                <SelectItem value="REGISTRATION">Registration</SelectItem>
                <SelectItem value="CORRESPONDENCE">Correspondence</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="transaction-id">Transaction ID</Label>
              <Input id="transaction-id" value={transactionId} onChange={(event) => setTransactionId(event.target.value)} placeholder="Optional" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="exception-id">Exception ID</Label>
              <Input id="exception-id" value={exceptionId} onChange={(event) => setExceptionId(event.target.value)} placeholder="Optional" />
            </div>
          </div>

          <div className="flex justify-end gap-2 border-t pt-4">
            <Button type="button" variant="ghost" onClick={() => handleOpenChange(false)}>Cancel</Button>
            <Button type="submit" disabled={busy || !file}>
              {busy ? <LoaderCircle className="size-3.5 animate-spin" /> : null}
              {busy ? "Uploading" : "Upload evidence"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
