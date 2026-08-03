"use client";

import { useEffect, useMemo, useState } from "react";
import {
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
  Database,
  DownloadSimple,
  FileCsv,
  FolderOpen,
  Funnel,
  Gavel,
  Gear,
  House,
  Info,
  ListChecks,
  MagnifyingGlass,
  Package,
  PaperPlaneTilt,
  Plus,
  Rows,
  ShieldCheck,
  SidebarSimple,
  UploadSimple,
  Warning,
  X,
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

type Icon = typeof House;

const dealerNav: { id: string; label: string; icon: Icon }[] = [
  { id: "overview", label: "Overview", icon: House },
  { id: "transactions", label: "Transaction register", icon: Rows },
  { id: "vehicles", label: "Vehicles", icon: Car },
  { id: "exceptions", label: "Exceptions", icon: Warning },
  { id: "documents", label: "Documents", icon: FolderOpen },
  { id: "reports", label: "Reporting", icon: ChartBar },
  { id: "package", label: "Compliance package", icon: Package },
  { id: "imports", label: "Data imports", icon: UploadSimple },
];

const regulatorNav: { id: string; label: string; icon: Icon }[] = [
  { id: "overview", label: "Overview", icon: House },
  { id: "dealerships", label: "Dealerships", icon: Buildings },
  { id: "transactions", label: "Transactions", icon: Rows },
  { id: "exceptions", label: "Investigation desk", icon: Warning },
  { id: "audits", label: "Audits", icon: Gavel },
  { id: "documents", label: "Evidence", icon: FolderOpen },
  { id: "reports", label: "Reports", icon: ChartBar },
  { id: "imports", label: "Data imports", icon: Database },
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
    <section className="metric-card">
      <div className={`metric-icon ${tone}`}><IconComponent size={24} weight="duotone" /></div>
      <div>
        <p className="metric-label">{label}</p>
        <p className={`metric-value ${tone === "green" ? "text-green" : ""}`}>{value}</p>
        <p className="metric-note">{note}</p>
      </div>
    </section>
  );
}

function ReadinessBar() {
  const segments = [
    { label: "Exact matches", value: summary.exact, pct: 96.7, cls: "seg-green" },
    { label: "Warnings", value: summary.warnings, pct: 1.2, cls: "seg-amber" },
    { label: "Evidence required", value: summary.awaitingEvidence, pct: 0.4, cls: "seg-blue" },
    { label: "Unresolved", value: summary.unresolved, pct: 0.3, cls: "seg-red" },
    { label: "Exempt", value: summary.validExempt, pct: 0.9, cls: "seg-gray" },
    { label: "Resolved", value: summary.corrected, pct: 0.5, cls: "seg-lightgreen" },
  ];
  return (
    <section className="surface readiness">
      <div className="section-heading">
        <div><h2>Reconciliation and readiness overview</h2><span className="demo-label">Sample demonstration data</span></div>
        <button className="button ghost small">View reconciliation details <ArrowRight size={14} /></button>
      </div>
      <div className="readiness-track" aria-label="Reconciliation status breakdown">
        {segments.map((segment) => <span key={segment.label} className={segment.cls} style={{ width: `${Math.max(segment.pct, 4)}%` }} />)}
      </div>
      <div className="readiness-labels">
        {segments.map((segment) => (
          <div key={segment.label}>
            <strong>{segment.value.toLocaleString()}</strong>
            <span>{segment.label}</span>
            <small>{segment.pct}%</small>
          </div>
        ))}
      </div>
    </section>
  );
}

function DealerOverview({
  exceptions,
  selected,
  setSelected,
  openView,
  onUpdate,
}: {
  exceptions: ExceptionRecord[];
  selected: ExceptionRecord;
  setSelected: (item: ExceptionRecord) => void;
  openView: (view: string) => void;
  onUpdate: (id: string, update: Partial<ExceptionRecord>) => void;
}) {
  const attention = exceptions.filter((item) => item.dealerId === "dealer-1" && item.status !== "Resolved").slice(0, 8);
  return (
    <>
      <PageHeader
        title="Renewal readiness"
        subtitle="Your current state of compliance and what remains before submission."
        action={<button className="button ghost"><DownloadSimple size={16} /> Export summary</button>}
      />
      <div className="metric-grid">
        <MetricCard icon={ShieldCheck} label="Readiness score" value={`${summary.readiness}%`} note="+2.1 pts vs Jun 30, 2026" tone="green" />
        <MetricCard icon={ClipboardText} label="Dealer-reported transactions" value={summary.reported.toLocaleString()} note={`${summary.detected.toLocaleString()} possible registration-linked`} />
        <MetricCard icon={Warning} label="Open items" value="8" note="3 blocking · 5 evidence" tone="red" />
        <MetricCard icon={CurrencyDollar} label="Expected fees" value={money(summary.expectedFees)} note="$22.00 per applicable transaction" tone="green" />
      </div>
      <ReadinessBar />
      <div className="work-grid">
        <section className="surface table-surface">
          <div className="section-heading attention-heading">
            <div><h2>What needs attention</h2><span className="demo-label">Sample data</span></div>
            <button className="button primary small" onClick={() => openView("exceptions")}>Resolve 3 blocking items <ArrowRight size={14} /></button>
          </div>
          <div className="filter-row">
            <label className="search-field compact"><MagnifyingGlass size={16} /><input aria-label="Search attention items" placeholder="Search VIN, reason, requirement…" /></label>
            <button className="control">Status <CaretDown size={13} /></button>
            <button className="control">Priority <CaretDown size={13} /></button>
            <button className="control icon-only" aria-label="More filters"><Funnel size={15} /></button>
          </div>
          <div className="table-wrap">
            <table>
              <thead><tr><th>VIN</th><th>Reason</th><th>Requirement</th><th>Due</th><th>Impact</th><th>Next action</th></tr></thead>
              <tbody>
                {attention.map((item, index) => (
                  <tr key={item.id} className={selected.id === item.id ? "selected-row" : ""} onClick={() => setSelected(item)}>
                    <td className="mono link">{item.vin.slice(-10)}</td>
                    <td><div className="cell-title">{item.type}</div><small>{index < 3 ? "Blocking" : item.evidenceStatus}</small></td>
                    <td>{item.requirement}</td>
                    <td><span className={index < 3 ? "text-red" : "text-amber"}>{item.dueDate.slice(5)}</span></td>
                    <td className="mono">{money(item.feeImpact)}</td>
                    <td><button className="table-action">{item.evidenceStatus === "Missing" ? "Add explanation" : "Upload evidence"}</button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
        <InvestigationPreview item={selected} onUpdate={onUpdate} openFull={() => openView("exceptions")} />
      </div>
    </>
  );
}

function InvestigationPreview({
  item,
  onUpdate,
  openFull,
}: {
  item: ExceptionRecord;
  onUpdate: (id: string, update: Partial<ExceptionRecord>) => void;
  openFull: () => void;
}) {
  const [showForm, setShowForm] = useState(false);
  const [text, setText] = useState(item.explanation ?? "");
  return (
    <aside className="surface investigation-preview">
      <div className="section-heading">
        <h2>Investigation preview</h2>
        <button className="icon-button" aria-label="Close preview"><X size={16} /></button>
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
          <div className="button-row"><button className="button primary small" type="submit"><PaperPlaneTilt size={15} /> Submit</button><button className="button ghost small" type="button" onClick={() => setShowForm(false)}>Cancel</button></div>
        </form>
      ) : (
        <div className="preview-actions">
          <button className="button primary" onClick={() => setShowForm(true)}><Plus size={16} /> Add explanation</button>
          <button className="button ghost" onClick={() => onUpdate(item.id, { evidenceStatus: "Received", status: "Evidence received" })}><UploadSimple size={16} /> Upload evidence</button>
          <button className="button ghost" onClick={openFull}>Open full review</button>
        </div>
      )}
    </aside>
  );
}

function RegulatorOverview({ openView }: { openView: (view: string) => void }) {
  return (
    <>
      <PageHeader title="Regulatory review" subtitle="Prioritize dealership submissions and evidence-backed discrepancies." action={<button className="button primary" onClick={() => openView("exceptions")}>Review high-priority exceptions <ArrowRight size={15} /></button>} />
      <div className="metric-grid">
        <MetricCard icon={Buildings} label="Dealerships reviewed" value="142" note="100% of current sample cohort" />
        <MetricCard icon={ClipboardText} label="Transactions analyzed" value="186,532" note="Across selected reporting period" />
        <MetricCard icon={Warning} label="Open exceptions" value="1,248" note="187 high priority" tone="amber" />
        <MetricCard icon={CurrencyDollar} label="Estimated fee variance" value="$27,456" note="At $22 per applicable transaction" tone="red" />
      </div>
      <section className="surface table-surface">
        <div className="section-heading"><div><h2>Dealership attention</h2><p>Explainable ranking based on unresolved material exceptions and submission completeness.</p></div><button className="button ghost small" onClick={() => openView("dealerships")}>Open directory <ArrowRight size={14} /></button></div>
        <div className="filter-row"><label className="search-field compact"><MagnifyingGlass size={16} /><input placeholder="Search dealerships" /></label><button className="control">Audit status <CaretDown size={13} /></button><button className="control">Attention <CaretDown size={13} /></button></div>
        <div className="table-wrap"><table><thead><tr><th>Dealership</th><th>Reported</th><th>Potential records</th><th>Open</th><th>Est. variance</th><th>Reconciled</th><th>Audit status</th><th>Attention</th></tr></thead>
          <tbody>{dealers.slice(0, 10).map((dealer) => <tr key={dealer.id} onClick={() => openView("dealerships")}><td><div className="cell-title link">{dealer.name}</div><small>{dealer.registration} · {dealer.city}</small></td><td className="mono">{dealer.reported.toLocaleString()}</td><td className="mono">{dealer.detected.toLocaleString()}</td><td className="mono">{dealer.exceptions}</td><td className="mono">{money(dealer.variance)}</td><td className="mono">{dealer.reconciliation}%</td><td><span className="status info">{dealer.auditStatus}</span></td><td><span className={`status ${dealer.attention === "High" ? "critical" : dealer.attention === "Medium" ? "warning" : "neutral"}`}>{dealer.attention}</span></td></tr>)}</tbody>
        </table></div>
      </section>
      <div className="two-column">
        <section className="surface panel"><div className="section-heading"><h2>Upcoming work</h2><CalendarBlank size={18} /></div>{["Dealer response · Northfield Auto Group", "Audit scope approval · Mapleview Motors", "Missing submission · Pine Ridge Ford"].map((item, index) => <div className="list-row" key={item}><div><strong>{item}</strong><small>{index + 3} days remaining</small></div><span className={index === 0 ? "status critical" : "status warning"}>{index === 0 ? "Overdue soon" : "Upcoming"}</span></div>)}</section>
        <section className="surface panel"><div className="section-heading"><h2>Recent activity</h2><ClockCounterClockwise size={18} /></div>{activity.map((item) => <div className="list-row" key={item.action}><div><strong>{item.action}</strong><small>{item.detail}</small></div><small>{item.time}</small></div>)}</section>
      </div>
    </>
  );
}

function DataTableView({ kind }: { kind: "transactions" | "dealerships" }) {
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);
  const pageSize = 12;
  const filteredTransactions = transactions.filter((item) => `${item.vin} ${item.vehicle} ${item.dealerName} ${item.stock}`.toLowerCase().includes(query.toLowerCase()));
  const filteredDealers = dealers.filter((item) => `${item.name} ${item.registration} ${item.city} ${item.region}`.toLowerCase().includes(query.toLowerCase()));
  const count = kind === "transactions" ? filteredTransactions.length : filteredDealers.length;
  const start = (page - 1) * pageSize;
  return (
    <>
      <PageHeader title={kind === "transactions" ? "Transactions" : "Dealerships"} subtitle={kind === "transactions" ? "Review normalized VIN-level records across every connected source." : "Monitor submissions, reconciliation quality, and current review status."} action={<button className="button ghost"><DownloadSimple size={16} /> Export current view</button>} />
      <section className="surface table-surface">
        <div className="filter-row roomy"><label className="search-field"><MagnifyingGlass size={17} /><input value={query} onChange={(event) => { setQuery(event.target.value); setPage(1); }} placeholder={kind === "transactions" ? "Search VIN, stock number, dealership, or vehicle…" : "Search dealership, registration, city, or region…"} /></label><button className="control"><Funnel size={15} /> Filters</button><button className="control">Saved views <CaretDown size={13} /></button></div>
        <div className="table-wrap">{kind === "transactions" ? (
          <table><thead><tr><th>Status</th><th>VIN / vehicle</th><th>Dealership</th><th>Type</th><th>Reported date</th><th>Registration date</th><th>Expected</th><th>Reported</th><th>Evidence</th><th>Source</th></tr></thead>
            <tbody>{filteredTransactions.slice(start, start + pageSize).map((item) => <tr key={item.id}><td><StatusBadge status={item.status} /></td><td><div className="cell-title mono link">{item.vin}</div><small>{item.vehicle} · {item.stock}</small></td><td>{item.dealerName}</td><td>{item.type}</td><td className="mono">{item.reportedDate}</td><td className="mono">{item.registrationDate}</td><td className="mono">{money(item.expectedFee)}</td><td className="mono">{money(item.reportedFee)}</td><td>{item.evidence}</td><td>{item.source}</td></tr>)}</tbody>
          </table>
        ) : (
          <table><thead><tr><th>Dealership</th><th>Region</th><th>Reported</th><th>Potential</th><th>Exceptions</th><th>Reconciliation</th><th>Assigned reviewer</th><th>Status</th></tr></thead>
            <tbody>{filteredDealers.slice(start, start + pageSize).map((dealer) => <tr key={dealer.id}><td><div className="cell-title link">{dealer.name}</div><small>{dealer.legalName} · {dealer.registration}</small></td><td>{dealer.city}<small>{dealer.region}</small></td><td className="mono">{dealer.reported.toLocaleString()}</td><td className="mono">{dealer.detected.toLocaleString()}</td><td>{dealer.exceptions}</td><td className="mono">{dealer.reconciliation}%</td><td>{dealer.reviewer}</td><td><span className="status info">{dealer.auditStatus}</span></td></tr>)}</tbody>
          </table>
        )}</div>
        <div className="pagination"><span>Showing {Math.min(start + 1, count)}–{Math.min(start + pageSize, count)} of {count.toLocaleString()}</span><div><button disabled={page === 1} onClick={() => setPage((value) => value - 1)}>Previous</button><span>Page {page}</span><button disabled={start + pageSize >= count} onClick={() => setPage((value) => value + 1)}>Next</button></div></div>
      </section>
    </>
  );
}

function ExceptionsDesk({
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
  const visible = exceptions.filter((item) => `${item.vin} ${item.dealerName} ${item.type}`.toLowerCase().includes(query.toLowerCase())).slice(0, 18);
  return (
    <>
      <PageHeader title="Investigation desk" subtitle="Resolve explainable discrepancies using authorized records and contextual evidence." action={<button className="button ghost"><DownloadSimple size={16} /> Export queue</button>} />
      <div className="desk-grid">
        <section className="surface queue">
          <div className="section-heading"><div><h2>Exception queue</h2><span className="count-badge">{exceptions.filter((item) => item.status !== "Resolved").length}</span></div><button className="control icon-only"><Funnel size={15} /></button></div>
          <label className="search-field compact"><MagnifyingGlass size={16} /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search exceptions" /></label>
          <div className="queue-list">
            {visible.map((item) => <button key={item.id} className={`queue-item ${selected.id === item.id ? "active" : ""}`} onClick={() => setSelected(item)}><span className={`priority-marker ${item.priority}`} /><div><div><span className="mono">…{item.vin.slice(-6)}</span><strong>{item.dealerName}</strong></div><p>{item.type}</p><small>{money(item.feeImpact)} impact · Due {item.dueDate.slice(5)}</small></div><span className="status neutral">{item.status}</span></button>)}
          </div>
        </section>
        <section className="surface full-review">
          <div className="review-header"><div><PriorityBadge priority={selected.priority} /><span className="case-id">{selected.id}</span><h2>{selected.type}</h2><p>{selected.vehicle} · VIN <span className="mono">{selected.vin}</span> · {selected.dealerName}</p></div><select value={selected.status} onChange={(event) => onUpdate(selected.id, { status: event.target.value as ExceptionRecord["status"] })}><option>New</option><option>Under review</option><option>Awaiting response</option><option>Evidence received</option><option>Resolved</option></select></div>
          <div className="tabs"><button className="active">Comparison</button><button>Evidence</button><button>Activity</button></div>
          <div className="rule-box wide"><div className="rule-title"><Gavel size={17} /> Explainable rule <span>{selected.rule}</span></div><p>{selected.reason}. The system surfaced this record for human review; it has not made a compliance determination.</p></div>
          <div className="record-comparison">
            <div className="record-head"><span>Data element</span><span>Dealer-reported</span><span>Registration-style</span><span>DMS / accounting</span><span>Public observation</span></div>
            {[
              ["Transaction type", "No record", "Used retail sale", "Retail sale", "Used vehicle listing"],
              ["Transaction date", "—", "Feb 18, 2025", "Feb 20, 2025", "Removed Feb 18"],
              ["Fee-register entry", "No record found", "N/A", "No record found", "N/A"],
              ["Fee amount", "$0.00", "$22.00 expected", "$0.00", "N/A"],
            ].map((row) => <div key={row[0]}>{row.map((cell, index) => <span key={index} className={cell.includes("No record") ? "diff" : ""}>{cell}</span>)}</div>)}
          </div>
          <div className="review-bottom">
            <div><h3>Evidence timeline</h3>{["Public listing captured · Feb 2, 2025", "Registration event observed · Feb 18, 2025", "Fee-register comparison completed · Jul 27, 2026", selected.explanation ? "Dealer explanation received · Today" : "Information request not yet sent"].map((event, index) => <div className="timeline-event" key={event}><span className={index === 3 && !selected.explanation ? "pending" : ""}><Check size={12} /></span><p>{event}</p></div>)}</div>
            <div className="action-panel"><h3>Actions</h3><button className="button primary" onClick={() => onUpdate(selected.id, { status: "Awaiting response" })}><PaperPlaneTilt size={16} /> Request information</button><button className="button ghost" onClick={() => onUpdate(selected.id, { status: "Resolved", evidenceStatus: "Accepted" })}><CheckCircle size={16} /> Accept and resolve</button><p>Public observations are contextual evidence only and cannot independently establish non-compliance.</p></div>
          </div>
        </section>
      </div>
    </>
  );
}

function ImportsView() {
  const [step, setStep] = useState(1);
  const steps = ["Choose file", "Map columns", "Validate", "Complete"];
  return (
    <>
      <PageHeader title="Data imports" subtitle="Validate transaction records before they enter the reconciliation ledger." action={<span className="status info">Local simulation</span>} />
      <section className="surface import-card">
        <div className="stepper">{steps.map((label, index) => <div key={label} className={step >= index + 1 ? "active" : ""}><span>{step > index + 1 ? <Check size={14} /> : index + 1}</span><p>{label}</p></div>)}</div>
        {step === 1 && <div className="drop-zone"><FileCsv size={42} weight="duotone" /><h2>Import a transaction register</h2><p>Use the included sample CSV or choose a local file. Nothing leaves this device.</p><button className="button primary" onClick={() => setStep(2)}><UploadSimple size={16} /> Use sample Northfield CSV</button></div>}
        {step === 2 && <div className="mapping"><h2>Map source columns</h2>{[["Vehicle Identification Number", "VIN"], ["Date of sale", "Transaction date"], ["Fee paid", "Reported fee"], ["Transaction category", "Transaction type"]].map(([source, target]) => <div key={source}><span>{source}</span><ArrowRight size={14} /><select defaultValue={target}><option>{target}</option></select><CheckCircle size={17} className="text-green" /></div>)}<button className="button primary" onClick={() => setStep(3)}>Validate 1,142 rows <ArrowRight size={15} /></button></div>}
        {step === 3 && <div className="validation"><CheckCircle size={38} className="text-green" weight="duotone" /><h2>1,136 rows are ready</h2><p>Six rows need review before import.</p><div className="validation-stats"><span><strong>1,136</strong> valid</span><span><strong>4</strong> missing dates</span><span><strong>2</strong> invalid VINs</span></div><button className="button primary" onClick={() => setStep(4)}>Import valid rows</button></div>}
        {step === 4 && <div className="validation"><CheckCircle size={42} className="text-green" weight="fill" /><h2>Import completed</h2><p>1,136 records were added and 8 review items were generated.</p><button className="button primary" onClick={() => setStep(1)}>Start another import</button></div>}
      </section>
    </>
  );
}

function GenericView({ view, workspace }: { view: string; workspace: Workspace }) {
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
      <PageHeader title={title} subtitle={subtitle} action={<button className="button primary"><Plus size={16} /> New {view === "audits" ? "audit" : "export"}</button>} />
      <div className="three-column">
        {[
          ["Ready for review", workspace === "dealer" ? "24" : "17", "Items with complete supporting records"],
          ["Action required", workspace === "dealer" ? "8" : "31", "Items blocked by a response or document"],
          ["Completed this period", workspace === "dealer" ? "1,133" : "284", "Decisions preserved in the activity history"],
        ].map(([label, value, note], index) => <section className="surface stat-panel" key={label}><IconComponent size={22} weight="duotone" /><span>{label}</span><strong>{value}</strong><p>{note}</p><button className="table-action">{index === 1 ? "Review now" : "View records"}</button></section>)}
      </div>
      <section className="surface panel">
        <div className="section-heading"><div><h2>Recent {title.toLowerCase()}</h2><p>Demonstration records from the selected reporting period.</p></div><button className="button ghost small">View all</button></div>
        {activity.map((item, index) => <div className="list-row" key={item.action}><div className="list-icon"><IconComponent size={17} /></div><div><strong>{item.action}</strong><small>{item.detail}</small></div><span className={index === 0 ? "status resolved" : "status neutral"}>{index === 0 ? "Ready" : "Recorded"}</span><small>{item.time}</small></div>)}
      </section>
    </>
  );
}

function PageHeader({ title, subtitle, action }: { title: string; subtitle: string; action?: React.ReactNode }) {
  return <header className="page-header"><div><h1>{title}</h1><p>{subtitle} <span className="demo-label">Sample demonstration data</span></p></div><div>{action}</div></header>;
}

export default function DealerSyncDemo({ initialView = "overview" }: { initialView?: string }) {
  const [workspace, setWorkspace] = useState<Workspace>("dealer");
  const [view, setView] = useState(initialView);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [exceptionRecords, setExceptionRecords] = useState(initialExceptions);
  const [selectedId, setSelectedId] = useState(initialExceptions[0].id);
  const [toast, setToast] = useState("");

  useEffect(() => {
    const saved = window.localStorage.getItem("dealersync-demo-state");
    if (saved) {
      try { setExceptionRecords(JSON.parse(saved)); } catch { /* keep deterministic seed */ }
    }
  }, []);

  const selected = useMemo(() => exceptionRecords.find((item) => item.id === selectedId) ?? exceptionRecords[0], [exceptionRecords, selectedId]);
  const nav = workspace === "dealer" ? dealerNav : regulatorNav;

  function updateException(id: string, update: Partial<ExceptionRecord>) {
    setExceptionRecords((current) => {
      const next = current.map((item) => item.id === id ? { ...item, ...update } : item);
      window.localStorage.setItem("dealersync-demo-state", JSON.stringify(next));
      return next;
    });
    setToast(update.status === "Resolved" ? "Exception resolved and activity history updated." : "Review record updated.");
    window.setTimeout(() => setToast(""), 2800);
  }

  function changeWorkspace(next: Workspace) {
    setWorkspace(next);
    setView("overview");
    setSidebarOpen(false);
  }

  function renderView() {
    if (view === "overview") return workspace === "dealer"
      ? <DealerOverview exceptions={exceptionRecords} selected={selected} setSelected={(item) => setSelectedId(item.id)} openView={setView} onUpdate={updateException} />
      : <RegulatorOverview openView={setView} />;
    if (view === "transactions") return <DataTableView kind="transactions" />;
    if (view === "dealerships") return <DataTableView kind="dealerships" />;
    if (view === "exceptions") return <ExceptionsDesk exceptions={exceptionRecords} selected={selected} setSelected={(item) => setSelectedId(item.id)} onUpdate={updateException} />;
    if (view === "imports") return <ImportsView />;
    return <GenericView view={view} workspace={workspace} />;
  }

  return (
    <div className="demo-app">
      <button className="mobile-menu" onClick={() => setSidebarOpen(true)} aria-label="Open navigation"><SidebarSimple size={22} /></button>
      <aside className={`sidebar ${sidebarOpen ? "open" : ""}`}>
        <div className="brand"><span><ShieldCheck size={21} weight="fill" /></span>DealerSync<button className="sidebar-close" onClick={() => setSidebarOpen(false)} aria-label="Close navigation"><X size={18} /></button></div>
        <button className="org-button"><Buildings size={17} /><span>{workspace === "dealer" ? "Northfield Auto Group" : "Ontario review cohort"}<small>{workspace === "dealer" ? "Ontario · ON-041023" : "142 dealerships"}</small></span><CaretDown size={14} /></button>
        <nav aria-label="Primary navigation">{nav.map(({ id, label, icon: NavIcon }) => <button key={id} className={view === id ? "active" : ""} onClick={() => { setView(id); setSidebarOpen(false); }}><NavIcon size={18} weight={view === id ? "fill" : "regular"} /><span>{label}</span>{id === "exceptions" && <b>{workspace === "dealer" ? 8 : 148}</b>}</button>)}</nav>
        <div className="sidebar-bottom"><button onClick={() => setView("settings")}><Gear size={18} />Settings</button><button><Info size={18} />Help and definitions</button><button><SidebarSimple size={18} />Collapse</button></div>
      </aside>
      {sidebarOpen && <button className="sidebar-backdrop" aria-label="Close navigation" onClick={() => setSidebarOpen(false)} />}
      <div className="app-body">
        <header className="topbar">
          <button className="top-context"><Buildings size={17} /><span>{workspace === "dealer" ? "Northfield Auto Group" : "Ontario review cohort"}</span><CaretDown size={13} /></button>
          <button className="top-context"><CalendarBlank size={17} /><span>Jan 1 – Dec 31, 2025</span><CaretDown size={13} /></button>
          <label className="global-search"><MagnifyingGlass size={17} /><input placeholder="Search VIN, transaction, dealer, document, or rule…" /><kbd>⌘K</kbd></label>
          <div className="workspace-switch" aria-label="Workspace switcher">
            <button className={workspace === "dealer" ? "active dealer" : ""} onClick={() => changeWorkspace("dealer")}>Dealership Compliance</button>
            <button className={workspace === "regulator" ? "active regulator" : ""} onClick={() => changeWorkspace("regulator")}>Regulatory Review</button>
          </div>
          <button className="notification" aria-label="Notifications"><Bell size={19} /><span>3</span></button>
          <button className="profile"><span>JS</span><div>Jordan Smith<small>{workspace === "dealer" ? "Compliance manager" : "Senior reviewer"}</small></div><CaretDown size={13} /></button>
        </header>
        <main>{renderView()}</main>
      </div>
      {toast && <div className="toast"><CheckCircle size={19} weight="fill" />{toast}</div>}
    </div>
  );
}
