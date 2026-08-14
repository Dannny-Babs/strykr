"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import {
  Archive,
  ArrowRight,
  Bell,
  Buildings,
  CalendarBlank,
  Car,
  CaretDown,
  ChartBar,
  Check,
  CheckCircle,
  ClipboardText,
  ClockCounterClockwise,
  CurrencyDollar,
  DownloadSimple,
  Eye,
  FileCsv,
  FolderOpen,
  Funnel,
  Gavel,
  House,
  ListChecks,
  MagnifyingGlass,
  Package,
  PaperPlaneTilt,
  Phone,
  PhoneDisconnect,
  Plus,
  Rows,
  ShareNetwork,
  ShieldCheck,
  Storefront,
  Tag,
  Trash,
  UploadSimple,
  UserCircle,
  Warning,
  X,
  Info,
} from "@phosphor-icons/react";
import {
  activity,
  dashboardSummary as summary,
  dealers,
  exceptions as initialExceptions,
  transactions,
  type ExceptionRecord,
  type Priority,
  type Status,
  type Workspace,
} from "../lib/demo-data";
import CordenaSidebar, { type SidebarItem } from "./cordena-sidebar";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "../src/components/ui/sidebar";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "../src/components/ui/sheet";
import {
  downloadBlob,
  formatFileSize,
} from "../lib/local-workspace";
import { EMPTY_STATE_ASSETS, EmptyState } from "../src/components/product/empty-state";

type Icon = SidebarItem["icon"];
type DocumentCategory = "Evidence" | "Report" | "Package";
type DocumentStatus = "Verified" | "Ready" | "Draft" | "Needs review" | "Approved";
type DocumentRecord = {
  id: string;
  name: string;
  category: DocumentCategory;
  dealer: string;
  updated: string;
  owner: string;
  status: DocumentStatus;
  size: string;
  locallyStored?: boolean;
};

const DOCUMENT_STORAGE_KEY = "cordena-documents-v1";

const dealerNav: SidebarItem[] = [
  { id: "overview", label: "Overview", icon: House },
  { id: "transactions", label: "Transaction register", icon: Rows },
  { id: "vehicles", label: "Vehicles", icon: Car },
  { id: "exceptions", label: "Exceptions", icon: Warning },
  { id: "documents", label: "Documents", icon: FolderOpen },
];

const regulatorNav: SidebarItem[] = [
  { id: "overview", label: "Overview", icon: House },
  { id: "dealerships", label: "Dealerships", icon: Buildings },
  { id: "transactions", label: "Transactions", icon: Rows },
  { id: "exceptions", label: "Investigation desk", icon: Warning },
  { id: "audits", label: "Audits", icon: Gavel },
  { id: "documents", label: "Documents", icon: FolderOpen },
];

const statusMeta: Record<Status, { label: string; className: string }> = {
  matched: { label: "Matched", className: "status resolved" },
  warning: { label: "Warning", className: "status warning" },
  evidence: { label: "Evidence required", className: "status info" },
  unresolved: { label: "Unresolved", className: "status critical" },
  exempt: { label: "Exempt", className: "status neutral" },
  resolved: { label: "Resolved", className: "status resolved" },
};

function money(value: number) {
  return new Intl.NumberFormat("en-CA", { style: "currency", currency: "CAD", maximumFractionDigits: 0 }).format(value);
}

function formatDueDate(value: string) {
  return /^\d{4}-\d{2}-\d{2}$/.test(value) ? value.slice(5) : value;
}

function StatusBadge({ status }: { status: Status }) {
  const meta = statusMeta[status];
  return <span className={meta.className}><span aria-hidden="true" className="status-dot" />{meta.label}</span>;
}

function PriorityBadge({ priority }: { priority: Priority }) {
  return <span className={`status ${priority === "high" ? "critical" : priority === "medium" ? "warning" : "neutral"}`}><span className="status-dot" />{priority}</span>;
}

function MetricCard({
  icon: IconComponent,
  label,
  value,
  note,
  tone = "blue",
}: {
  icon: Icon;
  label: string;
  value: string;
  note: string;
  tone?: "green" | "blue" | "red" | "amber";
}) {
  return (
    <section className={`metric-card metric-${tone}`}>
      <div className={`metric-icon ${tone}`}><IconComponent size={24} weight="duotone" /></div>
      <p className="metric-label">{label}</p>
      <p className={`metric-value ${tone === "green" ? "text-green" : ""}`}>{value}</p>
      <p className="metric-note">{note}</p>
    </section>
  );
}

type DashboardSummary = typeof summary;

function ReadinessBar({ openReview, summary }: { openReview: () => void; summary: DashboardSummary }) {
  const [breakdownOpen, setBreakdownOpen] = useState(false);
  const segments = [
    { label: "Exact matches", value: summary.exact, pct: "96.7%", tone: "resolved" },
    { label: "Warnings", value: summary.warnings, pct: "1.2%", tone: "warning" },
    { label: "Evidence required", value: summary.awaitingEvidence, pct: "0.4%", tone: "info" },
    { label: "Unresolved", value: summary.unresolved, pct: "0.3%", tone: "critical" },
    { label: "Valid exemptions", value: summary.validExempt, pct: "0.9%", tone: "neutral" },
    { label: "Resolved corrections", value: summary.corrected, pct: "0.5%", tone: "resolved" },
  ];
  return (
    <><section className="surface readiness">
      <div className="section-heading">
        <div><h2>Reconciliation health</h2><p>What is ready and what still needs review.</p></div>
        <button className="button ghost small" onClick={() => setBreakdownOpen(true)}><span className="button-label">View breakdown</span><ArrowRight size={14} /></button>
      </div>
      <div className="readiness-summary">
        <div className="readiness-primary"><strong>{summary.readiness}%</strong><span>Ready for renewal</span></div>
        <div className="readiness-progress"><div><span style={{ width: `${summary.readiness}%` }} /></div><p>{summary.exact.toLocaleString()} of {summary.detected.toLocaleString()} records reconciled</p></div>
        <div className="readiness-outcomes"><div><strong>{summary.warnings + summary.awaitingEvidence + summary.unresolved}</strong><span>Needs review</span></div><div><strong>{summary.corrected}</strong><span>Resolved</span></div></div>
      </div>
    </section><Sheet open={breakdownOpen} onOpenChange={setBreakdownOpen}><SheetContent className="document-detail-sheet"><SheetHeader className="case-drawer-header"><SheetTitle>Reconciliation breakdown</SheetTitle><SheetDescription>{summary.detected.toLocaleString()} records in the current reporting period.</SheetDescription></SheetHeader><div className="case-drawer-body"><section className="drawer-section"><h3>Current outcomes</h3><div className="breakdown-list">{segments.map((segment) => <div key={segment.label}><span className={`status ${segment.tone}`}>{segment.label}</span><strong>{segment.value.toLocaleString()}</strong><small>{segment.pct}</small></div>)}</div></section><section className="drawer-section"><h3>What to do next</h3><div className="context-note"><Info size={17} /><p>Resolve the three unmatched records and collect evidence for five cases before generating the renewal package.</p></div></section></div><div className="case-drawer-actions"><button className="button ghost" onClick={() => setBreakdownOpen(false)}>Close</button><button className="button primary" onClick={() => { setBreakdownOpen(false); openReview(); }}>Open review queue</button></div></SheetContent></Sheet></>
  );
}

function DealerOverview({
  exceptions,
  selected,
  setSelected,
  openView,
  onUpdate,
  onExport,
  summary,
}: {
  exceptions: ExceptionRecord[];
  selected: ExceptionRecord;
  setSelected: (item: ExceptionRecord) => void;
  openView: (view: string) => void;
  onUpdate: (id: string, update: Partial<ExceptionRecord>) => void;
  onExport: () => void;
  summary: DashboardSummary;
}) {
  const [query, setQuery] = useState("");
  const [blockingOnly, setBlockingOnly] = useState(false);
  const openItems = exceptions.filter((item) => item.dealerId === "dealer-1" && item.status !== "Resolved");
  const blockingCount = openItems.filter((item) => item.priority === "high").length;
  const attention = openItems.filter((item) => `${item.vin} ${item.type} ${item.requirement}`.toLowerCase().includes(query.toLowerCase())).filter((item) => !blockingOnly || item.priority === "high").slice(0, 8);
  const [detailOpen, setDetailOpen] = useState(false);
  return (
    <>
      <PageHeader
        title="Renewal readiness"
        subtitle="Your current state of compliance and what remains before submission."
        action={<button className="button ghost" onClick={onExport}><DownloadSimple size={16} /><span className="button-label">Export summary</span></button>}
      />
      <div className="metric-grid">
        <MetricCard icon={ShieldCheck} label="Readiness score" value={`${summary.readiness}%`} note="+2.1 pts vs Jun 30, 2026" tone="green" />
        <MetricCard icon={ClipboardText} label="Dealer-reported transactions" value={summary.reported.toLocaleString()} note={`${summary.detected.toLocaleString()} possible registration-linked`} />
        <MetricCard icon={Warning} label="Open items" value={openItems.length.toString()} note={`${blockingCount} blocking · ${openItems.length - blockingCount} evidence`} tone="red" />
        <MetricCard icon={CurrencyDollar} label="Expected fees" value={money(summary.expectedFees)} note="$22.00 per applicable transaction" tone="amber" />
      </div>
      <ReadinessBar openReview={() => openView("exceptions")} summary={summary} />
      <div className="work-grid work-grid-single">
        <section className="surface table-surface">
          <div className="section-heading attention-heading">
            <div><h2>Needs attention</h2><span className="count-badge">{attention.length}</span></div>
            <button className="button primary small" onClick={() => openView("exceptions")}><span className="button-label">Review {blockingCount} blocking</span><ArrowRight size={14} /></button>
          </div>
          <div className="filter-row attention-toolbar">
            <label className="search-field compact"><MagnifyingGlass size={16} /><input aria-label="Search attention items" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search VIN, reason, requirement…" /></label>
            <button className={`control ${blockingOnly ? "active-filter" : ""}`} onClick={() => setBlockingOnly((current) => !current)}><Funnel size={15} /> Blocking only</button>
          </div>
          <div className="table-wrap">
            {attention.length > 0 ? <table className="attention-table">
              <thead><tr><th>Record</th><th>Review item</th><th>Due</th><th>Exposure</th><th><span className="sr-only">Action</span></th></tr></thead>
              <tbody>
                {attention.map((item, index) => (
                  <tr key={item.id} className={selected.id === item.id && detailOpen ? "selected-row" : ""} onClick={() => { setSelected(item); setDetailOpen(true); }}>
                    <td><div className="cell-title mono link">…{item.vin.slice(-8)}</div><small>{item.vehicle}</small></td>
                    <td><div className="cell-title">{item.type}</div><small>{item.requirement}</small></td>
                    <td><span className={`due-date ${index < 3 ? "blocking" : "requested"}`}>{formatDueDate(item.dueDate)}</span><small>{index < 3 ? "Blocking" : item.evidenceStatus}</small></td>
                    <td className="fee-impact">{money(item.feeImpact)}</td>
                    <td><button className="table-action attention-action">Review <ArrowRight size={13} /></button></td>
                  </tr>
                ))}
              </tbody>
            </table> : <EmptyState
              compact
              kind={query || blockingOnly ? "no-results" : "all-clear"}
              title={query || blockingOnly ? "No attention items match" : "You’re all caught up"}
              description={query || blockingOnly ? "Try a different search or clear the blocking-only filter." : "There are no open review items for this dealership."}
              action={query || blockingOnly ? <button className="button primary" onClick={() => { setQuery(""); setBlockingOnly(false); }}>Clear filters</button> : undefined}
            />}
          </div>
        </section>
      </div>
      <Sheet open={detailOpen} onOpenChange={setDetailOpen}>
        <SheetContent className="case-detail-sheet">
          <SheetHeader className="sr-only"><SheetTitle>Exception details</SheetTitle><SheetDescription>Review the selected reconciliation exception.</SheetDescription></SheetHeader>
          <InvestigationPreview item={selected} onUpdate={onUpdate} openFull={() => openView("exceptions")} showClose={false} />
        </SheetContent>
      </Sheet>
    </>
  );
}

function InvestigationPreview({
  item,
  onUpdate,
  openFull,
  showClose = true,
}: {
  item: ExceptionRecord;
  onUpdate: (id: string, update: Partial<ExceptionRecord>) => void;
  openFull: () => void;
  showClose?: boolean;
}) {
  const [showForm, setShowForm] = useState(false);
  const [text, setText] = useState(item.explanation ?? "");
  return (
    <aside className="surface investigation-preview">
      <div className="section-heading">
        <h2>Investigation preview</h2>
        {showClose && <button className="icon-button" aria-label="Close preview"><X size={16} /></button>}
      </div>
      <div className="case-top">
        <PriorityBadge priority={item.priority} />
        <span className="status critical">{item.status}</span>
      </div>
      <h3>{item.type}</h3>
      <p className="case-meta">VIN: <span className="mono">{item.vin}</span> · {item.vehicle}</p>
      <div className="rule-box">
        <div className="rule-title"><Gavel size={16} /> Explainable rule <span>{item.rule}</span></div>
        <p>{item.rule === "RC-001" ? "Registration event found; no matching fee-register entry within the reporting period." : item.reason}</p>
      </div>
      <div className="comparison">
        <div className="comparison-head"><span>Field comparison</span><span>Registration-style</span><span>Dealer record</span></div>
        <div><span>Transaction date</span><strong>Feb 18, 2025</strong><strong className="text-red">No matching entry</strong></div>
        <div><span>Transaction type</span><strong>Used retail sale</strong><strong>—</strong></div>
        <div><span>Amount</span><strong>$22.00</strong><strong>—</strong></div>
      </div>
      <div className="context-note"><Info size={17} /><p><strong>Contextual evidence only.</strong> This is not a determination of non-compliance.</p></div>
      {showForm ? (
        <form className="explanation-form" onSubmit={(event) => {
          event.preventDefault();
          onUpdate(item.id, { explanation: text, status: "Awaiting response" });
          setShowForm(false);
        }}>
          <label htmlFor="explanation">Dealer explanation</label>
          <textarea id="explanation" value={text} onChange={(event) => setText(event.target.value)} placeholder="Explain how this transaction was handled…" required />
          <div className="button-row"><button className="button primary small" type="submit"><PaperPlaneTilt size={15} /><span className="button-label">Submit</span></button><button className="button ghost small" type="button" onClick={() => setShowForm(false)}>Cancel</button></div>
        </form>
      ) : (
        <div className="preview-actions">
          <button className="button primary" onClick={() => setShowForm(true)}><Plus size={16} /><span className="button-label">Add explanation</span></button>
          <button className="button ghost" onClick={() => onUpdate(item.id, { evidenceStatus: "Received", status: "Evidence received" })}><UploadSimple size={16} /><span className="button-label">Upload evidence</span></button>
          <button className="button ghost" onClick={openFull}>Open full review</button>
        </div>
      )}
    </aside>
  );
}

function RegulatorOverview({ openView }: { openView: (view: string) => void }) {
  const [query, setQuery] = useState("");
  const [highOnly, setHighOnly] = useState(false);
  const visibleDealers = dealers
    .filter((dealer) => `${dealer.name} ${dealer.city} ${dealer.registration}`.toLowerCase().includes(query.toLowerCase()))
    .filter((dealer) => !highOnly || dealer.attention === "High")
    .slice(0, 8);
  return (
    <>
      <PageHeader title="Regulatory review" subtitle="The dealerships that need attention now." action={<button className="button primary" onClick={() => openView("exceptions")}><span className="button-label">Open review queue</span><ArrowRight size={15} /></button>} />
      <div className="metric-grid metric-grid-three">
        <MetricCard icon={Buildings} label="Dealerships reviewed" value="142" note="Current Ontario cohort" />
        <MetricCard icon={Warning} label="Open exceptions" value="1,248" note="187 need priority review" tone="amber" />
        <MetricCard icon={FolderOpen} label="Missing submissions" value="2" note="Next deadline in 3 days" tone="red" />
      </div>
      <section className="surface table-surface">
        <div className="section-heading"><div><h2>Review queue</h2><p>Ranked by unresolved exceptions and submission completeness.</p></div><button className="button ghost small" onClick={() => openView("dealerships")}><span className="button-label">All dealerships</span><ArrowRight size={14} /></button></div>
        <div className="filter-row"><label className="search-field compact"><MagnifyingGlass size={16} /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search dealerships" /></label><button className={`control ${highOnly ? "active-filter" : ""}`} onClick={() => setHighOnly((current) => !current)}><Funnel size={15} /> Priority only</button></div>
        <div className="table-wrap">{visibleDealers.length > 0 ? <table><thead><tr><th>Dealership</th><th>Readiness</th><th>Open items</th><th>Reviewer</th><th>Last activity</th><th></th></tr></thead>
          <tbody>{visibleDealers.map((dealer, index) => <tr key={dealer.id} onClick={() => openView("dealerships")}><td><div className="cell-title link">{dealer.name}</div><small>{dealer.registration} · {dealer.city}</small></td><td><div className="readiness-cell"><span><i style={{ width: `${dealer.reconciliation}%` }} /></span><strong>{dealer.reconciliation}%</strong></div></td><td><strong className={dealer.exceptions > 15 ? "text-red" : ""}>{dealer.exceptions}</strong><small>{dealer.attention === "High" ? "Priority review" : "Open review items"}</small></td><td>{dealer.reviewer}</td><td>{index === 0 ? "18m ago" : `${index + 1}h ago`}</td><td><button className="table-action">Review <ArrowRight size={13} /></button></td></tr>)}</tbody>
        </table> : <EmptyState
          compact
          kind={query || highOnly ? "no-results" : "no-dealerships"}
          title={query || highOnly ? "No dealerships match" : "No dealerships yet"}
          description={query || highOnly ? "Try another search or include every priority level." : "Dealerships will appear here after they are added to the review cohort."}
          action={query || highOnly ? <button className="button primary" onClick={() => { setQuery(""); setHighOnly(false); }}>Clear filters</button> : undefined}
        />}</div>
      </section>
    </>
  );
}

function DataTableView({ kind, onOpenImport }: { kind: "transactions" | "dealerships"; onOpenImport?: () => void }) {
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);
  const [selectedRows, setSelectedRows] = useState<Set<string>>(new Set());
  const [statusFilter, setStatusFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [dateFilter, setDateFilter] = useState("all");
  const [viewSaved, setViewSaved] = useState(false);
  const pageSize = 12;
  const filteredTransactions = transactions.filter((item) => {
    const matchesQuery = `${item.vin} ${item.vehicle} ${item.dealerName} ${item.stock}`.toLowerCase().includes(query.toLowerCase());
    const matchesStatus = statusFilter === "all" || item.status === statusFilter;
    const matchesType = typeFilter === "all" || item.type === typeFilter;
    const month = Number(item.reportedDate.slice(5, 7));
    const matchesDate = dateFilter === "all" || (dateFilter === "h1" ? month <= 6 : month >= 7);
    return matchesQuery && matchesStatus && matchesType && matchesDate;
  });
  const filteredDealers = dealers.filter((item) => {
    const matchesQuery = `${item.name} ${item.registration} ${item.city} ${item.region}`.toLowerCase().includes(query.toLowerCase());
    const matchesStatus = statusFilter === "all" || item.auditStatus === statusFilter;
    const matchesRegion = typeFilter === "all" || item.region === typeFilter;
    return matchesQuery && matchesStatus && matchesRegion;
  });
  const count = kind === "transactions" ? filteredTransactions.length : filteredDealers.length;
  const start = (page - 1) * pageSize;
  const totalPages = Math.max(1, Math.ceil(count / pageSize));
  const visibleRows = kind === "transactions"
    ? filteredTransactions.slice(start, start + pageSize)
    : filteredDealers.slice(start, start + pageSize);
  const visibleIds = visibleRows.map((item) => item.id);
  const allVisibleSelected = visibleIds.length > 0 && visibleIds.every((id) => selectedRows.has(id));
  const hasActiveFilters = Boolean(query) || statusFilter !== "all" || typeFilter !== "all" || dateFilter !== "all";

  function clearFilters() {
    setQuery("");
    setStatusFilter("all");
    setTypeFilter("all");
    setDateFilter("all");
    setSelectedRows(new Set());
    setPage(1);
    setViewSaved(false);
  }

  function toggleRow(id: string) {
    setSelectedRows((current) => {
      const next = new Set(current);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function toggleVisible() {
    setSelectedRows((current) => {
      const next = new Set(current);
      if (allVisibleSelected) visibleIds.forEach((id) => next.delete(id));
      else visibleIds.forEach((id) => next.add(id));
      return next;
    });
  }

  return (
    <>
      <section className="surface table-surface">
        <div className="table-page-intro">
          <div>
            <h1>{kind === "transactions" ? "Transactions" : "Dealerships"}</h1>
            <p>{kind === "transactions" ? "Review normalized VIN-level records across connected sources." : "Monitor submissions, reconciliation quality, and review status."}</p>
          </div>
          <div className="button-row">
            {kind === "transactions" && <button className="button ghost" onClick={onOpenImport}><UploadSimple size={16} /><span className="button-label">Import data</span></button>}
            <button className="button ghost"><DownloadSimple size={16} /><span className="button-label">Export</span></button>
          </div>
        </div>
        <div className="filter-row roomy">
          <label className="search-field"><MagnifyingGlass size={17} /><input value={query} onChange={(event) => { setQuery(event.target.value); setPage(1); }} placeholder={kind === "transactions" ? "Search VIN, stock number, dealership, or vehicle" : "Search dealership, registration, city, or region"} /></label>
          <div className="filter-chips">
            <label className="control select-control"><span className="filter-glyph glyph-cyan" /><select aria-label="Filter by status" value={statusFilter} onChange={(event) => { setStatusFilter(event.target.value); setPage(1); }}><option value="all">Status</option>{kind === "transactions" ? <><option value="matched">Matched</option><option value="warning">Warning</option><option value="evidence">Evidence required</option><option value="unresolved">Unresolved</option><option value="resolved">Resolved</option></> : Array.from(new Set(dealers.map((item) => item.auditStatus))).map((status) => <option key={status} value={status}>{status}</option>)}</select><CaretDown size={13} /></label>
            <label className="control select-control"><Tag size={15} /><select aria-label={kind === "transactions" ? "Filter by type" : "Filter by region"} value={typeFilter} onChange={(event) => { setTypeFilter(event.target.value); setPage(1); }}><option value="all">{kind === "transactions" ? "Type" : "Region"}</option>{Array.from(new Set((kind === "transactions" ? transactions.map((item) => item.type) : dealers.map((item) => item.region)))).map((value) => <option key={value} value={value}>{value}</option>)}</select><CaretDown size={13} /></label>
            {kind === "transactions" && <label className="control select-control"><CalendarBlank size={15} /><select aria-label="Filter by date range" value={dateFilter} onChange={(event) => { setDateFilter(event.target.value); setPage(1); }}><option value="all">Date range</option><option value="h1">Jan–Jun 2025</option><option value="h2">Jul–Dec 2025</option></select><CaretDown size={13} /></label>}
            <button className="control clear-filter" onClick={clearFilters}><Trash size={15} /> Clear all</button>
            <button className="control" onClick={() => { window.localStorage.setItem(`cordena-${kind}-view`, JSON.stringify({ query, statusFilter, typeFilter, dateFilter })); setViewSaved(true); }}><Eye size={15} /> {viewSaved ? "View saved" : "Save view"}</button>
          </div>
        </div>
        <div className="table-wrap">{count === 0 ? <EmptyState
          kind={hasActiveFilters ? "no-results" : kind === "transactions" ? "no-transactions" : "no-dealerships"}
          title={hasActiveFilters ? "No matching records" : kind === "transactions" ? "No transactions yet" : "No dealerships yet"}
          description={hasActiveFilters ? "Adjust the search or filters to see more records." : kind === "transactions" ? "Import a transaction register to start reconciliation." : "Dealerships will appear here once they join the review cohort."}
          action={hasActiveFilters ? <button className="button primary" onClick={clearFilters}>Clear filters</button> : kind === "transactions" && onOpenImport ? <button className="button primary" onClick={onOpenImport}>Import data</button> : undefined}
        /> : kind === "transactions" ? (
          <table><thead><tr><th className="checkbox-cell"><input type="checkbox" aria-label="Select visible transactions" checked={allVisibleSelected} onChange={toggleVisible} /></th><th><Car size={15} /> VIN / vehicle</th><th><Storefront size={15} /> Dealership</th><th><Tag size={15} /> Type</th><th><ShieldCheck size={15} /> Status</th><th><CalendarBlank size={15} /> Reported</th><th>Expected</th><th>Last active</th></tr></thead>
            <tbody>{filteredTransactions.slice(start, start + pageSize).map((item, index, rows) => <tr key={item.id} className={`${selectedRows.has(item.id) ? "selected-row" : ""} ${index === rows.length - 1 ? "continuation-row" : ""}`}><td className="checkbox-cell"><input type="checkbox" aria-label={`Select ${item.vin}`} checked={selectedRows.has(item.id)} onChange={() => toggleRow(item.id)} /></td><td><div className="cell-title mono link">{item.vin}</div><small>{item.vehicle} · {item.stock}</small></td><td>{item.dealerName}</td><td><span className="category-label"><Tag size={15} />{item.type}</span></td><td><StatusBadge status={item.status} /></td><td className="mono">{item.reportedDate}</td><td className="mono">{money(item.expectedFee)}</td><td>{index % 3 === 0 ? "22h ago" : `${index + 2} days ago`}</td></tr>)}</tbody>
          </table>
        ) : (
          <table><thead><tr><th className="checkbox-cell"><input type="checkbox" aria-label="Select visible dealerships" checked={allVisibleSelected} onChange={toggleVisible} /></th><th><Storefront size={15} /> Dealership</th><th>Region</th><th>Reported</th><th>Exceptions</th><th>Reconciled</th><th>Reviewer</th><th><ShieldCheck size={15} /> Status</th></tr></thead>
            <tbody>{filteredDealers.slice(start, start + pageSize).map((dealer, index, rows) => <tr key={dealer.id} className={`${selectedRows.has(dealer.id) ? "selected-row" : ""} ${index === rows.length - 1 ? "continuation-row" : ""}`}><td className="checkbox-cell"><input type="checkbox" aria-label={`Select ${dealer.name}`} checked={selectedRows.has(dealer.id)} onChange={() => toggleRow(dealer.id)} /></td><td><div className="cell-title link">{dealer.name}</div><small>{dealer.legalName} · {dealer.registration}</small></td><td>{dealer.city}<small>{dealer.region}</small></td><td className="mono">{dealer.reported.toLocaleString()}</td><td>{dealer.exceptions}</td><td className="mono">{dealer.reconciliation}%</td><td>{dealer.reviewer}</td><td><span className="status info">{dealer.auditStatus}</span></td></tr>)}</tbody>
          </table>
        )}</div>
        {count > 0 && <div className="pagination"><span>Viewing {Math.min(start + 1, count)}–{Math.min(start + pageSize, count)} of {count.toLocaleString()} results</span><div><button aria-label="Previous page" disabled={page === 1} onClick={() => setPage((value) => value - 1)}>‹</button>{[1, 2, 3].map((number) => <button key={number} className={page === number ? "current" : ""} disabled={number > totalPages} onClick={() => setPage(number)}>{number}</button>)}<button aria-label="Next page" disabled={page >= totalPages} onClick={() => setPage((value) => value + 1)}>›</button></div></div>}
      </section>
    </>
  );
}


function CaseDetailSheet({
  open,
  onOpenChange,
  item,
  onUpdate,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  item: ExceptionRecord;
  onUpdate: (id: string, update: Partial<ExceptionRecord>) => void;
}) {
  const [tab, setTab] = useState<"summary" | "evidence" | "activity">("summary");
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="case-detail-sheet">
        <SheetHeader className="case-drawer-header">
          <SheetTitle>{item.type}</SheetTitle>
          <SheetDescription>{item.dealerName} · VIN {item.vin}</SheetDescription>
        </SheetHeader>
        <div className="drawer-tabs">{(["summary", "evidence", "activity"] as const).map((value) => <button key={value} className={tab === value ? "active" : ""} onClick={() => setTab(value)}>{value}</button>)}</div>
        <div className="case-drawer-body">
          {tab === "summary" && <>
            <div className="rule-box"><div className="rule-title"><Gavel size={16} /> Rule {item.rule}</div><p>{item.reason}. This case requires human review before a decision is recorded.</p></div>
            <section className="drawer-section"><h3>Record comparison</h3>{[["Transaction type", "No dealer record", "Used retail sale"], ["Transaction date", "—", "Feb 18, 2025"], ["Fee-register entry", "No record found", "$22.00 expected"], ["Supporting evidence", item.evidenceStatus, "Registration extract"]].map(([label, dealerValue, referenceValue]) => <div className="comparison-row" key={label}><span>{label}</span><div><small>Dealer record</small><strong className={dealerValue.includes("No") ? "text-red" : ""}>{dealerValue}</strong></div><div><small>Reference</small><strong>{referenceValue}</strong></div></div>)}</section>
          </>}
          {tab === "evidence" && <section className="drawer-section"><div className="section-heading"><h3>Evidence</h3><button className="button ghost small"><UploadSimple size={15} /><span className="button-label">Add file</span></button></div>{["Registration event extract", "DMS transaction record", "Dealer explanation"].map((name, index) => <div className="document-row" key={name}><span className="document-icon"><FolderOpen size={17} /></span><div><strong>{name}</strong><small>{index === 2 && !item.explanation ? "Not received" : `Verified · ${index + 2} pages`}</small></div><span>{index === 2 && !item.explanation ? "Requested" : "Available"}</span></div>)}</section>}
          {tab === "activity" && <section className="drawer-section"><h3>Activity</h3>{activity.length > 0 ? activity.map((entry) => <div className="document-row" key={entry.action}><span className="document-icon"><ClockCounterClockwise size={17} /></span><div><strong>{entry.action}</strong><small>{entry.detail}</small></div><span>{entry.time}</span></div>) : <EmptyState compact kind="no-activity" title="No activity yet" description="Updates to this case will appear here as they happen." />}</section>}
        </div>
        <div className="case-drawer-actions"><button className="button ghost" onClick={() => onUpdate(item.id, { status: "Awaiting response" })}><PaperPlaneTilt size={16} /><span className="button-label">Request information</span></button><button className="button primary" onClick={() => { onUpdate(item.id, { status: "Resolved", evidenceStatus: "Accepted" }); onOpenChange(false); }}><CheckCircle size={16} /><span className="button-label">Resolve case</span></button></div>
      </SheetContent>
    </Sheet>
  );
}

function CallCenterDesk({
  exceptions,
  selected,
  setSelected,
  onUpdate,
}: {
  exceptions: ExceptionRecord[];
  selected: ExceptionRecord;
  setSelected: (item: ExceptionRecord) => void;
  onUpdate: (id: string, update: Partial<ExceptionRecord>) => void;
}) {
  const [query, setQuery] = useState("");
  const [priorityOnly, setPriorityOnly] = useState(false);
  const [detailOpen, setDetailOpen] = useState(false);
  const [callActive, setCallActive] = useState(false);
  const [callSeconds, setCallSeconds] = useState(0);
  const [note, setNote] = useState(selected.explanation ?? "");
  const visible = exceptions.filter((item) => `${item.vin} ${item.dealerName} ${item.type}`.toLowerCase().includes(query.toLowerCase())).filter((item) => !priorityOnly || item.priority === "high").slice(0, 18);

  useEffect(() => {
    if (!callActive) return;
    const timer = window.setInterval(() => setCallSeconds((current) => current + 1), 1000);
    return () => window.clearInterval(timer);
  }, [callActive]);

  useEffect(() => {
    setNote(selected.explanation ?? "");
    setCallActive(false);
    setCallSeconds(0);
  }, [selected.explanation, selected.id]);

  const callTime = `${String(Math.floor(callSeconds / 60)).padStart(2, "0")}:${String(callSeconds % 60).padStart(2, "0")}`;

  return (
    <>
      <PageHeader title="Investigation desk" subtitle="Work through cases one conversation at a time." action={<button className="button ghost" onClick={() => setDetailOpen(true)}><span className="button-label">Open case details</span><ArrowRight size={15} /></button>} />
      <div className="call-center-layout">
        <section className="surface call-queue">
          <div className="section-heading"><div><h2>Review queue</h2><span className="count-badge">{visible.length}</span></div><button className={`control icon-only ${priorityOnly ? "active-filter" : ""}`} aria-label="Show priority cases" onClick={() => setPriorityOnly((current) => !current)}><Funnel size={15} /></button></div>
          <label className="search-field compact"><MagnifyingGlass size={16} /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search queue" /></label>
          <div className="call-queue-list">{visible.length > 0 ? visible.map((item) => <button key={item.id} className={`call-queue-item priority-${item.priority} ${selected.id === item.id ? "active" : ""}`} onClick={() => setSelected(item)}><span className={`queue-avatar priority-${item.priority}`}>{item.dealerName.split(" ").slice(0, 2).map((word) => word[0]).join("")}</span><div><strong>{item.dealerName}</strong><p>{item.type}</p><small>Due {formatDueDate(item.dueDate)} · {item.priority} priority</small></div><span className={`queue-state ${item.status === "New" ? "new" : "open"}`}>{item.status === "New" ? "New" : "Open"}</span></button>) : <EmptyState
            compact
            kind={query || priorityOnly ? "no-results" : "all-clear"}
            title={query || priorityOnly ? "No cases match" : "Review queue cleared"}
            description={query || priorityOnly ? "Try another search or include every priority level." : "There are no cases waiting for a conversation."}
            action={query || priorityOnly ? <button className="button primary" onClick={() => { setQuery(""); setPriorityOnly(false); }}>Clear filters</button> : undefined}
          />}</div>
        </section>
        <section className="surface call-console">
          <div className="call-contact">
            <div className={`contact-avatar priority-${selected.priority}`}><UserCircle size={26} /></div>
            <div><span>Current case</span><h2>{selected.dealerName}</h2><p>{selected.type} · VIN …{selected.vin.slice(-6)}</p></div>
            <div className="contact-meta"><span>Due {formatDueDate(selected.dueDate)}</span><small>Assigned to Julia Mercer</small></div>
          </div>
          <div className={`call-bar ${callActive ? "active" : ""}`}>
            <div><span className="call-status-dot" /><div><strong>{callActive ? "Call in progress" : "Ready to contact dealership"}</strong><small>{callActive ? `${callTime} · Jordan Smith` : "Last contact 2 days ago"}</small></div></div>
            <button className={callActive ? "button call-end" : "button primary"} onClick={() => setCallActive((current) => !current)}>{callActive ? <PhoneDisconnect size={17} /> : <Phone size={17} />}<span className="button-label">{callActive ? "End call" : "Call dealership"}</span></button>
          </div>
          <div className={`case-brief priority-${selected.priority}`}>
            <div className="case-brief-main"><span>Review brief</span><h3>{selected.reason}</h3><p>Confirm how this transaction was handled and collect the supporting record before making a decision.</p></div>
            <dl><div><dt>Requirement</dt><dd>{selected.requirement}</dd></div><div><dt>Potential impact</dt><dd>{money(selected.feeImpact)}</dd></div><div><dt>Evidence</dt><dd>{selected.evidenceStatus}</dd></div></dl>
          </div>
          <form className="call-notes" onSubmit={(event) => { event.preventDefault(); onUpdate(selected.id, { explanation: note, status: "Under review" }); }}>
            <div><label htmlFor="call-note">Conversation notes</label><span>Saved to case history</span></div>
            <textarea id="call-note" value={note} onChange={(event) => setNote(event.target.value)} placeholder="Capture what the dealership confirmed, promised, or disputed…" />
            <div className="call-actions"><button type="button" className="button ghost" onClick={() => setDetailOpen(true)}>Evidence and record details</button><div><button type="submit" className="button ghost">Save note</button><button type="button" className="button primary" onClick={() => onUpdate(selected.id, { status: "Resolved", evidenceStatus: "Accepted" })}><CheckCircle size={16} /><span className="button-label">Resolve</span></button></div></div>
          </form>
        </section>
      </div>
      <CaseDetailSheet open={detailOpen} onOpenChange={setDetailOpen} item={selected} onUpdate={onUpdate} />
    </>
  );
}

type ImportPreview = { mapping: Record<string, string>; summary: { totalRows: number; validRows: number; warningRows: number; rejectedRows: number; duplicateRows: number } };

function ImportModule({ open, onOpenChange, onComplete }: { open: boolean; onOpenChange: (open: boolean) => void; onComplete: () => void }) {
  const [step, setStep] = useState(1);
  const [fileName, setFileName] = useState("Northfield-transactions.csv");
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<ImportPreview | null>(null);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const fileInput = useRef<HTMLInputElement>(null);
  const steps = ["Choose file", "Map columns", "Validate", "Complete"];

  async function previewFile(nextFile: File) {
    setBusy(true); setError(""); setFile(nextFile); setFileName(nextFile.name);
    const form = new FormData(); form.set("file", nextFile); form.set("sourceType", "TRANSACTION_REGISTER");
    try { const response = await fetch("/api/imports", { method: "POST", body: form, headers: { "x-cordena-persona": "dealer_admin" } }); const body = await response.json(); if (!response.ok) throw new Error(body.error); setPreview(body); setStep(2); }
    catch (reason) { setError(reason instanceof Error ? reason.message : "The CSV could not be previewed."); }
    finally { setBusy(false); }
  }

  async function loadSample() {
    const response = await fetch("/samples/northfield-transactions.csv"); const blob = await response.blob();
    await previewFile(new File([blob], "Northfield-transactions.csv", { type: "text/csv" }));
  }

  async function commit() {
    if (!file || !preview) return; setBusy(true); setError("");
    const form = new FormData(); form.set("file", file); form.set("sourceType", "TRANSACTION_REGISTER"); form.set("mode", "commit"); form.set("mapping", JSON.stringify(preview.mapping)); form.set("dealershipId", "dealer-1"); form.set("reportingPeriodId", "period-1-2025");
    try { const response = await fetch("/api/imports", { method: "POST", body: form, headers: { "x-cordena-persona": "dealer_admin" } }); const body = await response.json(); if (!response.ok) throw new Error(body.error); setStep(4); onComplete(); }
    catch (reason) { setError(reason instanceof Error ? reason.message : "The CSV could not be imported."); }
    finally { setBusy(false); }
  }
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="import-sheet">
        <SheetHeader className="import-sheet-header"><SheetTitle>Import transaction data</SheetTitle><SheetDescription>Validate records before they enter the reconciliation ledger.</SheetDescription></SheetHeader>
        <section className="import-module">
        <div className="stepper">{steps.map((label, index) => <div key={label} className={step >= index + 1 ? "active" : ""}><span>{step > index + 1 ? <Check size={14} /> : index + 1}</span><p>{label}</p></div>)}</div>
        {step === 1 && <div className="drop-zone"><Image className="drop-zone-illustration" src={EMPTY_STATE_ASSETS[error ? "processing-error" : "import-data"]} alt="" width={1254} height={1254} aria-hidden="true" /><h2>{error ? "The file could not be read" : "Import a transaction register"}</h2><p>{error ?? "Choose a CSV from your device or continue with the included Northfield sample. The server validates and preserves every source row locally."}</p><input ref={fileInput} type="file" accept=".csv,text/csv" hidden onChange={(event) => { const nextFile = event.target.files?.[0]; if (nextFile) void previewFile(nextFile); }} /><div className="button-row"><button className="button primary" disabled={busy} onClick={() => fileInput.current?.click()}><UploadSimple size={16} /><span className="button-label">{busy ? "Reading CSV…" : error ? "Choose another CSV" : "Choose CSV"}</span></button><button className="button ghost" disabled={busy} onClick={() => void loadSample()}>Use sample file</button></div></div>}
        {step === 2 && preview && <div className="mapping"><div className="selected-file"><FileCsv size={18} /><div><strong>{fileName}</strong><small>CSV file · persisted import preview</small></div></div><h2>Mapped source columns</h2>{Object.entries(preview.mapping).map(([target, source]) => <div key={target}><span>{source}</span><ArrowRight size={14} /><select value={target} disabled><option value={target}>{target.replaceAll("_", " ")}</option></select><CheckCircle size={17} className="text-green" /></div>)}<button className="button primary" onClick={() => setStep(3)}><span className="button-label">Review {preview.summary.totalRows} validated rows</span><ArrowRight size={15} /></button></div>}
        {step === 3 && preview && <div className="validation"><CheckCircle size={38} className="text-green" weight="duotone" /><h2>{preview.summary.validRows + preview.summary.warningRows} rows can be imported</h2><p>Errors remain preserved in import history and do not enter reconciliation.</p><div className="validation-stats"><span><strong>{preview.summary.validRows}</strong> valid</span><span><strong>{preview.summary.warningRows}</strong> warnings</span><span><strong>{preview.summary.rejectedRows}</strong> rejected</span><span><strong>{preview.summary.duplicateRows}</strong> duplicates</span></div><button className="button primary" disabled={busy} onClick={() => void commit()}>{busy ? "Importing…" : "Import valid rows"}</button>{error && <p className="text-red">{error}</p>}</div>}
        {step === 4 && preview && <div className="validation"><CheckCircle size={42} className="text-green" weight="fill" /><h2>Import completed</h2><p>{preview.summary.validRows + preview.summary.warningRows} canonical records were persisted. Run a new reconciliation to produce a separate, versioned result.</p><div className="button-row"><button className="button ghost" onClick={() => { setStep(1); setFile(null); setPreview(null); }}>Import another</button><button className="button primary" onClick={() => onOpenChange(false)}>Done</button></div></div>}
        </section>
      </SheetContent>
    </Sheet>
  );
}

const initialDocumentRecords: DocumentRecord[] = [
  { id: "DOC-1048", name: "Northfield fee register — July 2026", category: "Evidence", dealer: "Northfield Auto Group", updated: "18m ago", owner: "Jordan Smith", status: "Verified", size: "1.8 MB" },
  { id: "DOC-1047", name: "Renewal readiness report", category: "Report", dealer: "Northfield Auto Group", updated: "2h ago", owner: "Jordan Smith", status: "Ready", size: "842 KB" },
  { id: "DOC-1046", name: "Registration event extract", category: "Evidence", dealer: "Mapleview Motors", updated: "Yesterday", owner: "Amira Patel", status: "Verified", size: "3.2 MB" },
  { id: "DOC-1045", name: "2025 compliance submission", category: "Package", dealer: "Northfield Auto Group", updated: "Yesterday", owner: "Julia Mercer", status: "Draft", size: "12 files" },
  { id: "DOC-1044", name: "Exception disposition report", category: "Report", dealer: "Lakeshore Auto Centre", updated: "Aug 8", owner: "Daniel Cho", status: "Ready", size: "1.1 MB" },
  { id: "DOC-1043", name: "Bill of sale — TXN-2025-01002", category: "Evidence", dealer: "Capital City Ford", updated: "Aug 8", owner: "Ethan Wong", status: "Needs review", size: "624 KB" },
  { id: "DOC-1042", name: "Dealer explanation bundle", category: "Package", dealer: "Stonebridge Chevrolet", updated: "Aug 7", owner: "Julia Mercer", status: "Draft", size: "8 files" },
  { id: "DOC-1041", name: "Audit scope and findings", category: "Report", dealer: "Hillcrest Toyota", updated: "Aug 6", owner: "Amira Patel", status: "Approved", size: "2.4 MB" },
];

function DocumentsView({
  documents,
  onOpenImport,
  onUploadFiles,
  onDownloadDocument,
  initialCategory = "All",
}: {
  documents: DocumentRecord[];
  onOpenImport: () => void;
  onUploadFiles: (files: File[]) => void;
  onDownloadDocument: (document: DocumentRecord) => void;
  initialCategory?: "All" | DocumentCategory;
}) {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<"All" | "Evidence" | "Report" | "Package">(initialCategory);
  const [selectedDocument, setSelectedDocument] = useState<DocumentRecord | null>(null);
  const uploadInput = useRef<HTMLInputElement>(null);
  const visibleDocuments = documents.filter((document) => (category === "All" || document.category === category) && `${document.name} ${document.dealer} ${document.owner}`.toLowerCase().includes(query.toLowerCase()));
  const hasDocumentFilters = Boolean(query) || category !== "All";
  return (
    <>
      <PageHeader title="Documents" subtitle="Evidence, reports, and submission packages in one place." action={<div className="button-row"><button className="button ghost" onClick={onOpenImport}><UploadSimple size={16} /><span className="button-label">Import data</span></button><button className="button primary" onClick={() => uploadInput.current?.click()}><Plus size={16} /><span className="button-label">Upload document</span></button><input ref={uploadInput} type="file" hidden multiple accept=".pdf,.csv,.xlsx,.xls,.doc,.docx,image/*" onChange={(event) => { const files = Array.from(event.target.files ?? []); if (files.length) onUploadFiles(files); event.target.value = ""; }} /></div>} />
      <section className="surface document-library">
        <div className="document-folders">{(["All", "Evidence", "Report", "Package"] as const).map((value) => <button key={value} className={`folder-${value.toLowerCase()} ${category === value ? "active" : ""}`} onClick={() => setCategory(value)}><span className="folder-mark">{value === "Package" ? <Archive size={18} /> : <FolderOpen size={18} />}</span><div><strong>{value === "All" ? "All documents" : value === "Report" ? "Reports" : value === "Package" ? "Packages" : value}</strong><small>{value === "All" ? documents.length : documents.filter((item) => item.category === value).length} items</small></div></button>)}</div>
        <div className="document-toolbar"><div><h2>Recent documents</h2><p>Files updated across the current review period.</p></div><label className="search-field"><MagnifyingGlass size={16} /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search documents" /></label></div>
        <div className="table-wrap">{visibleDocuments.length > 0 ? <table className="documents-table"><thead><tr><th>Name</th><th>Type</th><th>Dealership</th><th>Owner</th><th>Updated</th><th>Status</th></tr></thead><tbody>{visibleDocuments.map((document) => <tr key={document.id} onClick={() => setSelectedDocument(document)}><td><div className="document-name"><span className={`document-icon category-${document.category.toLowerCase()}`}><FolderOpen size={17} /></span><div><strong>{document.name}</strong><small>{document.id} · {document.size}</small></div></div></td><td><span className={`document-type category-${document.category.toLowerCase()}`}>{document.category}</span></td><td>{document.dealer}</td><td>{document.owner}</td><td>{document.updated}</td><td><span className={`status ${document.status === "Needs review" ? "warning" : document.status === "Draft" ? "neutral" : "resolved"}`}>{document.status}</span></td></tr>)}</tbody></table> : <EmptyState
          kind={hasDocumentFilters ? "no-results" : "no-documents"}
          title={hasDocumentFilters ? `No ${category === "All" ? "documents" : category.toLowerCase()} match` : "No documents yet"}
          description={hasDocumentFilters ? "Try another search or return to all documents." : "Upload evidence, reports, or submission packages to build this library."}
          action={<button className="button primary" onClick={hasDocumentFilters ? () => { setQuery(""); setCategory("All"); } : () => uploadInput.current?.click()}>{hasDocumentFilters ? "Clear filters" : "Upload document"}</button>}
        />}</div>
      </section>
      <Sheet open={Boolean(selectedDocument)} onOpenChange={(open) => { if (!open) setSelectedDocument(null); }}>
        <SheetContent className="document-detail-sheet">
          {selectedDocument && <><SheetHeader className="case-drawer-header"><SheetTitle>{selectedDocument.name}</SheetTitle><SheetDescription>{selectedDocument.id} · {selectedDocument.category}</SheetDescription></SheetHeader><div className="case-drawer-body"><section className="document-preview"><span><FolderOpen size={26} /></span><p>{selectedDocument.locallyStored ? "Stored locally and ready to download" : "Document record preview"}</p><small>{selectedDocument.size}</small></section><section className="drawer-section"><h3>Details</h3><dl className="document-details"><div><dt>Dealership</dt><dd>{selectedDocument.dealer}</dd></div><div><dt>Owner</dt><dd>{selectedDocument.owner}</dd></div><div><dt>Updated</dt><dd>{selectedDocument.updated}</dd></div><div><dt>Status</dt><dd>{selectedDocument.status}</dd></div></dl></section><section className="drawer-section"><h3>Recent activity</h3><div className="document-row"><span className="document-icon"><ClockCounterClockwise size={17} /></span><div><strong>{selectedDocument.locallyStored ? "File stored in this workspace" : "Document record verified"}</strong><small>{selectedDocument.locallyStored ? "Available after refresh on this device" : "Demonstration metadata is available"}</small></div><span>{selectedDocument.updated}</span></div><div className="document-row"><span className="document-icon"><UserCircle size={17} /></span><div><strong>Uploaded by {selectedDocument.owner}</strong><small>Added to the current review period</small></div><span>Recorded</span></div></section></div><div className="case-drawer-actions"><button className="button ghost" onClick={() => onDownloadDocument(selectedDocument)}><DownloadSimple size={16} /><span className="button-label">Download</span></button><button className="button primary" onClick={() => onDownloadDocument(selectedDocument)}>Open document</button></div></>}
        </SheetContent>
      </Sheet>
    </>
  );
}

function GenericView({ view, workspace, onOpenImport }: { view: string; workspace: Workspace; onOpenImport: () => void }) {
  const copy: Record<string, [string, string, Icon]> = {
    vehicles: ["Vehicles", "Follow VIN-level history across inventory, transactions, and evidence.", Car],
    documents: ["Documents and evidence", "Review uploaded records, extracted fields, and validation status.", FolderOpen],
    reports: ["Reports", "Generate defensible local summaries and transaction-fee register exports.", ChartBar],
    package: ["Compliance package", "Package the register, supporting evidence, explanations, and activity history.", Package],
    audits: ["Audit workspace", "Track scope, checklists, findings, dealer responses, and final decisions.", Gavel],
  };
  const [title, subtitle, IconComponent] = copy[view] ?? ["Workspace", "A structured compliance operations surface.", ListChecks];
  return (
    <>
      <PageHeader title={title} subtitle={subtitle} action={<button className="button primary" onClick={view === "vehicles" ? onOpenImport : undefined}><Plus size={16} /><span className="button-label">{view === "vehicles" ? "Import data" : `New ${view === "audits" ? "audit" : "export"}`}</span></button>} />
      <div className="three-column">
        {[
          ["Ready for review", workspace === "dealer" ? "24" : "17", "Items with complete supporting records"],
          ["Action required", workspace === "dealer" ? "8" : "31", "Items blocked by a response or document"],
          ["Completed this period", workspace === "dealer" ? "1,133" : "284", "Decisions preserved in the activity history"],
        ].map(([label, value, note], index) => <section className="surface stat-panel" key={label}><IconComponent size={22} weight="duotone" /><span>{label}</span><strong>{value}</strong><p>{note}</p><button className="table-action">{index === 1 ? "Review now" : "View records"}</button></section>)}
      </div>
      <section className="surface panel">
        <div className="section-heading"><div><h2>Recent {title.toLowerCase()}</h2><p>Demonstration records from the selected reporting period.</p></div><button className="button ghost small">View all</button></div>
        {view === "vehicles" ? <EmptyState kind="no-vehicles" title="No vehicles yet" description="Vehicle records will appear after you import a transaction register." action={<button className="button primary" onClick={onOpenImport}>Import data</button>} /> : activity.length > 0 ? activity.map((item, index) => <div className="list-row" key={item.action}><div className="list-icon"><IconComponent size={17} /></div><div><strong>{item.action}</strong><small>{item.detail}</small></div><span className={index === 0 ? "status resolved" : "status neutral"}>{index === 0 ? "Ready" : "Recorded"}</span><small>{item.time}</small></div>) : <EmptyState kind="no-activity" title="No activity yet" description="Workspace changes will appear here as they happen." />}
      </section>
    </>
  );
}

function PageHeader({ title, subtitle, action }: { title: string; subtitle: string; action?: React.ReactNode }) {
  return <header className="page-header"><div><h1>{title}</h1><p>{subtitle} <span className="demo-label">Local workspace</span></p></div><div>{action}</div></header>;
}

export default function CordenaDemo({ initialView = "overview" }: { initialView?: string }) {
  const router = useRouter();
  const pathname = usePathname();
  const [workspace, setWorkspace] = useState<Workspace>("dealer");
  const [view, setView] = useState(initialView === "imports" ? "overview" : initialView);
  const [importOpen, setImportOpen] = useState(initialView === "imports");
  const [exceptionRecords, setExceptionRecords] = useState(initialExceptions);
  const [documents, setDocuments] = useState<DocumentRecord[]>(initialDocumentRecords);
  const [selectedId, setSelectedId] = useState(initialExceptions[0].id);
  const [toast, setToast] = useState("");
  const [workspaceRevision, setWorkspaceRevision] = useState(0);
  const [workspaceSummary, setWorkspaceSummary] = useState<DashboardSummary>(summary);

  useEffect(() => {
    const savedDocuments = window.localStorage.getItem(DOCUMENT_STORAGE_KEY);
    if (savedDocuments) {
      try { setDocuments(JSON.parse(savedDocuments)); } catch { /* keep deterministic seed */ }
    }
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    fetch("/api/workspace?dealershipId=dealer-1", { headers: { "x-cordena-persona": workspace === "dealer" ? "dealer_admin" : "regulator_reviewer" }, signal: controller.signal })
      .then(async (response) => { const body = await response.json(); if (!response.ok) throw new Error(body.error); return body; })
      .then((body) => {
        setExceptionRecords(body.exceptions);
        setWorkspaceSummary((current) => ({ ...current, readiness: body.metrics.matchRate, reported: body.metrics.totalTransactions, detected: Math.max(body.metrics.totalTransactions, body.latestRun?.registrationRecordCount ?? 0), exact: body.latestRun?.matchedCount ?? 0, warnings: body.latestRun?.warningCount ?? 0, awaitingEvidence: body.exceptions.filter((item: ExceptionRecord) => item.rule === "DOC001" && item.status !== "Resolved").length, unresolved: body.metrics.openExceptions, corrected: body.exceptions.filter((item: ExceptionRecord) => item.status === "Resolved").length, expectedFees: body.metrics.expectedFees }));
      })
      .catch((reason) => { if (reason instanceof Error && reason.name !== "AbortError") showToast(`Persisted workspace unavailable: ${reason.message}`); });
    return () => controller.abort();
  }, [workspace, workspaceRevision]);

  useEffect(() => {
    const routeView = pathname.split("/").filter(Boolean)[1] ?? "overview";
    setView(routeView === "imports" ? "overview" : routeView);
    setImportOpen(routeView === "imports");
  }, [pathname]);

  const selected = useMemo(() => exceptionRecords.find((item) => item.id === selectedId) ?? exceptionRecords[0], [exceptionRecords, selectedId]);
  const nav = workspace === "dealer" ? dealerNav : regulatorNav;
  const openExceptionCount = exceptionRecords.filter((item) => item.status !== "Resolved" && (workspace === "regulator" || item.dealerId === "dealer-1")).length;

  function showToast(message: string) {
    setToast(message);
    window.setTimeout(() => setToast(""), 2800);
  }

  function navigate(next: string) {
    setView(next);
    router.push(next === "overview" ? "/demo" : `/demo/${next}`);
  }

  async function updateException(id: string, update: Partial<ExceptionRecord>) {
    setExceptionRecords((current) => {
      const next = current.map((item) => item.id === id ? { ...item, ...update } : item);
      return next;
    });
    const operation = update.status === "Resolved"
      ? { operation: "transition", status: "RESOLVED", resolutionType: "EXPLANATION_ACCEPTED", resolutionReason: update.explanation ?? "Reviewer accepted the available evidence and explanation." }
      : workspace === "regulator" && update.status === "Awaiting response"
        ? { operation: "transition", status: "AWAITING_DEALER" }
        : workspace === "regulator" && update.status === "Under review"
          ? { operation: "transition", status: "UNDER_REVIEW" }
      : update.explanation
        ? { operation: "submit_response", explanationCategory: "OTHER", explanation: update.explanation }
        : null;
    if (!operation) { showToast("The local preview changed; use the structured response or resolution action to persist this workflow step."); return; }
    try {
      const response = await fetch(`/api/exceptions/${id}`, { method: "PATCH", headers: { "content-type": "application/json", "x-cordena-persona": workspace === "dealer" ? "dealer_admin" : "regulator_reviewer" }, body: JSON.stringify(operation) });
      const body = await response.json(); if (!response.ok) throw new Error(body.error); setWorkspaceRevision((current) => current + 1); showToast(update.status === "Resolved" ? "Exception resolved and appended to activity history." : "Dealer response submitted and appended to activity history.");
    } catch (reason) { setWorkspaceRevision((current) => current + 1); showToast(reason instanceof Error ? reason.message : "The exception update failed."); }
  }

  function exportSummary() {
    window.location.assign("/api/reports/reconciliation?dealershipId=dealer-1");
    showToast("Persisted reconciliation report requested.");
  }

  async function uploadDocuments(files: File[]) {
    try {
      const uploaded = await Promise.all(files.map(async (file) => { const form = new FormData(); form.set("file", file); form.set("dealershipId", "dealer-1"); form.set("documentType", "SUPPORTING_EVIDENCE"); const response = await fetch("/api/documents", { method: "POST", body: form, headers: { "x-cordena-persona": "dealer_admin" } }); const body = await response.json(); if (!response.ok) throw new Error(body.error); return { id: body.id, name: body.fileName, category: "Evidence", dealer: "Northfield Auto Group", updated: "Just now", owner: "Jordan Smith", status: "Needs review", size: formatFileSize(body.size), locallyStored: true } as DocumentRecord; }));
      setDocuments((current) => {
        const next = [...uploaded, ...current];
        window.localStorage.setItem(DOCUMENT_STORAGE_KEY, JSON.stringify(next));
        return next;
      });
      showToast(`${uploaded.length} document${uploaded.length === 1 ? "" : "s"} persisted with an activity event.`);
    } catch (reason) {
      showToast(reason instanceof Error ? reason.message : "The document could not be stored.");
    }
  }

  async function downloadDocument(documentRecord: DocumentRecord) {
    if (documentRecord.locallyStored) {
      window.location.assign(`/api/documents/${documentRecord.id}`);
      showToast(`${documentRecord.name} requested from protected storage.`);
      return;
    }

    const manifest = JSON.stringify(documentRecord, null, 2);
    downloadBlob(new Blob([manifest], { type: "application/json" }), `${documentRecord.id.toLowerCase()}-record.json`);
    showToast("Downloaded the document record manifest.");
  }

  async function shareCurrentView() {
    try {
      await navigator.clipboard.writeText(window.location.href);
      showToast("Current workspace link copied.");
    } catch {
      showToast("Copying is unavailable in this browser.");
    }
  }

  function changeWorkspace(next: Workspace) {
    setWorkspace(next);
    setImportOpen(false);
    navigate("overview");
  }

  function renderView() {
    if (view === "overview") return workspace === "dealer"
      ? <DealerOverview exceptions={exceptionRecords} selected={selected} setSelected={(item) => setSelectedId(item.id)} openView={navigate} onUpdate={updateException} onExport={exportSummary} summary={workspaceSummary} />
      : <RegulatorOverview openView={navigate} />;
    if (view === "transactions") return <DataTableView kind="transactions" onOpenImport={() => setImportOpen(true)} />;
    if (view === "dealerships") return <DataTableView kind="dealerships" />;
    if (view === "exceptions") return <CallCenterDesk exceptions={exceptionRecords} selected={selected} setSelected={(item) => setSelectedId(item.id)} onUpdate={updateException} />;
    if (["documents", "reports", "package"].includes(view)) return <DocumentsView documents={documents} onOpenImport={() => setImportOpen(true)} onUploadFiles={uploadDocuments} onDownloadDocument={downloadDocument} initialCategory={view === "reports" ? "Report" : view === "package" ? "Package" : "All"} />;
    return <GenericView view={view} workspace={workspace} onOpenImport={() => setImportOpen(true)} />;
  }

  return (
    <SidebarProvider
      defaultOpen
      style={{ "--sidebar-width": "272px", "--sidebar-width-icon": "64px" } as React.CSSProperties}
      className="demo-app"
    >
      <CordenaSidebar
        workspace={workspace}
        nav={nav}
        view={view}
        exceptionCount={openExceptionCount}
        onNavigate={navigate}
        onWorkspaceChange={changeWorkspace}
      />
      <SidebarInset className="app-body">
        <header className="topbar">
          <SidebarTrigger className="sidebar-trigger" />
          <div className="topbar-title"><span>{workspace === "dealer" ? "Dealership compliance" : "Regulatory review"}</span><strong>{nav.find((item) => item.id === view)?.label ?? "Workspace"}</strong></div>
          <button className="notification" aria-label="Notifications"><Bell size={19} /><span>3</span></button>
          <button className="notification share-action" aria-label="Share current view" onClick={shareCurrentView}><ShareNetwork size={19} /></button>
          <button className="profile" aria-label="Open profile menu"><span>JS</span></button>
        </header>
        <div className="app-main">{renderView()}</div>
      </SidebarInset>
      <ImportModule open={importOpen} onOpenChange={setImportOpen} onComplete={() => setWorkspaceRevision((current) => current + 1)} />
      {toast && <div className="toast"><CheckCircle size={19} weight="fill" />{toast}</div>}
    </SidebarProvider>
  );
}
