import { notFound } from "next/navigation";
import { DealerImportDialog } from "@/components/product/dealer-import-dialog";
import { DocumentUploadDialog } from "@/components/product/document-upload-dialog";

export default async function ImportModalPreviewPage({
  searchParams,
}: {
  searchParams: Promise<{ state?: string; view?: string }>;
}) {
  if (process.env.VERCEL_ENV === "production") notFound();
  const { state, view } = await searchParams;

  return (
    <main className="grid min-h-screen place-items-center bg-background p-6">
      {view === "document" ? (
        <DocumentUploadDialog dealershipId="preview-dealership" defaultOpen />
      ) : (
        <DealerImportDialog
          dealershipId="preview-dealership"
          reportingPeriodId="preview-period"
          defaultOpen
          previewMode
          defaultAttachment={state === "attached" ? { name: "ry_foreign_carriers_for_highway.csv", size: 60 * 1024 } : null}
        />
      )}
    </main>
  );
}
