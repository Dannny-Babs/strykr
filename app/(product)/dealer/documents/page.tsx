import { Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ProductPageHeader } from "@/components/product/page-primitives";
import { EmptyState } from "@/components/product/empty-state";
import { dateLabel, StatusBadge } from "@/components/product/status";
import { requireProductActor } from "@/server/auth/guards";
import { getDealerProductData } from "@/server/services/product";

export default async function DealerDocumentsPage() {
  const actor = await requireProductActor(["DEALER_ADMIN", "DEALER_USER"]); const data = getDealerProductData(actor);
  return <><ProductPageHeader title="Documents" description="Supporting evidence stored inside the dealership boundary and linked to review work." actions={<Button><Upload className="size-4" /> Upload evidence</Button>} /><section className="overflow-hidden border bg-background">{data.documents.length ? <Table><TableHeader><TableRow><TableHead>Document</TableHead><TableHead>Type</TableHead><TableHead>Uploaded</TableHead><TableHead>Extraction</TableHead><TableHead>Validation</TableHead><TableHead className="text-right">Size</TableHead></TableRow></TableHeader><TableBody>{data.documents.map((item) => <TableRow key={item.id}><TableCell><a href={`/api/documents/${item.id}`} className="font-medium hover:underline">{item.fileName}</a></TableCell><TableCell>{item.documentType.replaceAll("_", " ")}</TableCell><TableCell>{dateLabel(item.uploadedAt)}</TableCell><TableCell><StatusBadge value={item.extractionStatus} /></TableCell><TableCell><StatusBadge value={item.validationStatus} /></TableCell><TableCell className="text-right font-mono">{Math.round(item.fileSize / 1024)} KB</TableCell></TableRow>)}</TableBody></Table> : <EmptyState kind="no-documents" title="No documents yet" description="Upload supporting evidence from this page or attach it to an exception." />}</section></>;
}
