import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { PageFrame, ProductPageHeader } from "@/components/product/page-primitives";
import { EmptyState } from "@/components/product/empty-state";
import { dateLabel, StatusBadge } from "@/components/product/status";
import { requireProductActor } from "@/server/auth/guards";
import { getDealerProductData } from "@/server/services/product";
import { EntityLink } from "@/components/product/entity-link";
import { DocumentUploadDialog } from "@/components/product/document-upload-dialog";

export default async function DealerDocumentsPage() {
  const actor = await requireProductActor(["DEALER_ADMIN", "DEALER_USER"]); const data = getDealerProductData(actor);
  return <PageFrame><ProductPageHeader title="Documents" description="Supporting evidence stored inside the dealership boundary and linked to review work." actions={<DocumentUploadDialog dealershipId={data.dealership.id} />} /><section className="overflow-hidden rounded-[14px] border bg-white">{data.documents.length ? <><div className="hidden overflow-x-auto md:block"><Table><TableHeader><TableRow><TableHead>Document</TableHead><TableHead>Type</TableHead><TableHead>Uploaded</TableHead><TableHead>Extraction</TableHead><TableHead>Validation</TableHead><TableHead className="text-right">Size</TableHead></TableRow></TableHeader><TableBody>{data.documents.map((item) => <TableRow key={item.id}><TableCell><EntityLink type="document" id={item.id}>{item.fileName}</EntityLink></TableCell><TableCell>{item.documentType.replaceAll("_", " ")}</TableCell><TableCell>{dateLabel(item.uploadedAt)}</TableCell><TableCell><StatusBadge value={item.extractionStatus} /></TableCell><TableCell><StatusBadge value={item.validationStatus} /></TableCell><TableCell className="text-right font-mono">{Math.round(item.fileSize / 1024)} KB</TableCell></TableRow>)}</TableBody></Table></div><div className="divide-y md:hidden">{data.documents.map((item) => <article key={item.id} className="p-4"><EntityLink type="document" id={item.id}>{item.fileName}</EntityLink><p className="mt-1 text-xs text-muted-foreground">{item.documentType.replaceAll("_", " ")} · {dateLabel(item.uploadedAt)}</p><div className="mt-3"><StatusBadge value={item.validationStatus} /></div></article>)}</div></> : <EmptyState kind="no-documents" title="No documents yet" description="Upload supporting evidence from this page or attach it to an exception." compact />}</section></PageFrame>;
}
