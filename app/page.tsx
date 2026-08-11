import Link from "next/link";
import {
  ArrowRight,
  Buildings,
  CheckCircle,
  FileMagnifyingGlass,
  FolderOpen,
  Rows,
  Scales,
  ShieldCheck,
  UploadSimple,
  Warning,
} from "@phosphor-icons/react/dist/ssr";

const workflow = [
  ["01", "Import records", "Bring in the dealer register, DMS exports, accounting records, and supporting documents.", UploadSimple],
  ["02", "Match by VIN", "Normalize vehicle and transaction fields, then connect records using deterministic rules.", Rows],
  ["03", "Review exceptions", "See exactly why a record was flagged and which source fields disagree.", FileMagnifyingGlass],
  ["04", "Resolve with evidence", "Add explanations, attach documents, preserve decisions, and export a defensible package.", CheckCircle],
] as const;

const capabilities = [
  ["VIN-level matching", "Connect each transaction to its source records and history.", Rows],
  ["Explainable exceptions", "Every flag includes the rule, discrepancy, evidence, and recommended next action.", Warning],
  ["Evidence timeline", "Keep documents, observations, requests, responses, and decisions in one reviewable sequence.", FolderOpen],
  ["Audit-ready exports", "Produce a transaction register and source-linked compliance package without rebuilding spreadsheets.", ShieldCheck],
] as const;

export default function Home() {
  return (
    <div className="marketing-site">
      <header className="marketing-nav">
        <Link href="/" className="marketing-brand"><span><ShieldCheck size={20} weight="fill" /></span>DealerSync</Link>
        <nav>
          <a href="#product">Product</a>
          <a href="#workflow">How it works</a>
          <a href="#two-sided">For dealerships</a>
          <a href="#two-sided">For regulators</a>
          <Link href="/research">Research</Link>
        </nav>
        <Link href="/sign-in" className="marketing-button">Sign in <ArrowRight size={15} /></Link>
      </header>

      <main>
        <section className="marketing-hero">
          <div className="hero-copy">
            <span className="eyebrow"><Scales size={15} /> Ontario vehicle transaction reconciliation</span>
            <h1>Reconcile every vehicle transaction with the evidence behind it.</h1>
            <p>A VIN-level compliance workspace that helps dealerships prepare accurate transaction records and helps reviewers investigate discrepancies without disconnected spreadsheets and portals.</p>
            <div className="hero-actions">
              <Link href="/sign-up" className="marketing-button large">Create an account <ArrowRight size={16} /></Link>
              <a href="#workflow" className="marketing-button secondary large">See how reconciliation works</a>
            </div>
            <small>Local interactive prototype · Sample demonstration data · No live OMVIC or MTO integration</small>
          </div>
          <div className="product-preview" aria-label="DealerSync product preview">
            <div className="preview-sidebar">
              <span className="preview-logo"><ShieldCheck size={14} weight="fill" /> DealerSync</span>
              {["Overview", "Transaction register", "Exceptions", "Documents", "Reporting"].map((label, index) => <span className={index === 0 ? "active" : ""} key={label}>{label}{label === "Exceptions" && <b>8</b>}</span>)}
            </div>
            <div className="preview-main">
              <div className="preview-top"><span>Northfield Auto Group</span><span>Jan 1 – Dec 31, 2025</span></div>
              <div className="preview-title"><div><strong>Renewal readiness</strong><small>Sample demonstration data</small></div><span>96.7% ready</span></div>
              <div className="preview-metrics">
                <div><small>Reported</small><strong>1,142</strong></div>
                <div><small>Open items</small><strong className="red">8</strong></div>
                <div><small>Expected fees</small><strong>$24,882</strong></div>
              </div>
              <div className="preview-progress"><span /><span /><span /><span /></div>
              <div className="preview-table">
                <div className="preview-row head"><span>VIN</span><span>Reason</span><span>Status</span><span>Action</span></div>
                {[
                  ["…704821", "Possible unreported transaction", "Blocking", "Add explanation"],
                  ["…712345", "Missing sale date", "Blocking", "Correct date"],
                  ["…738912", "Missing bill of sale", "Evidence", "Upload document"],
                  ["…745566", "Classification variance", "Evidence", "Review"],
                ].map((row) => <div className="preview-row" key={row[0]}>{row.map((value, index) => <span className={index === 2 ? "tag" : index === 3 ? "action" : ""} key={value}>{value}</span>)}</div>)}
              </div>
            </div>
          </div>
        </section>

        <section id="product" className="problem-section">
          <div><span className="section-kicker">The operational problem</span><h2>One transaction. Too many disconnected records.</h2></div>
          <p>Dealer submissions, garage registers, registration-style events, DMS exports, accounting entries, listings, and supporting documents rarely arrive as one clean story. Staff spend hours reconstructing what happened—then repeat the work when a reviewer asks for proof.</p>
          <div className="problem-grid">
            {["Fragmented source systems", "Manual VIN comparison", "Repeated document requests", "No shared resolution history"].map((item) => <div key={item}><Warning size={18} /><span>{item}</span></div>)}
          </div>
        </section>

        <section id="workflow" className="marketing-section">
          <div className="section-heading-public"><span className="section-kicker">How it works</span><h2>From source records to a defensible ledger.</h2><p>The system reduces review load. People make the compliance decisions.</p></div>
          <div className="workflow-grid">
            {workflow.map(([number, title, description, Icon]) => <article key={number}><span>{number}</span><Icon size={22} weight="duotone" /><h3>{title}</h3><p>{description}</p></article>)}
          </div>
        </section>

        <section id="two-sided" className="two-sided-section">
          <div className="section-heading-public"><span className="section-kicker">One neutral ledger</span><h2>Built for both sides of the review.</h2></div>
          <div className="value-grid">
            <article>
              <div className="value-icon dealer"><Buildings size={25} weight="duotone" /></div>
              <span>For dealerships</span>
              <h3>Know what is outstanding before renewal or audit.</h3>
              <ul>
                <li><CheckCircle size={16} /> Find missing and inconsistent records</li>
                <li><CheckCircle size={16} /> Explain wholesale, cancelled, or exempt transactions</li>
                <li><CheckCircle size={16} /> Organize supporting documents</li>
                <li><CheckCircle size={16} /> Export a complete compliance package</li>
              </ul>
              <Link href="/sign-up">Create a dealership account <ArrowRight size={14} /></Link>
            </article>
            <article>
              <div className="value-icon regulator"><Scales size={25} weight="duotone" /></div>
              <span>For reviewers</span>
              <h3>Investigate discrepancies without jumping to conclusions.</h3>
              <ul>
                <li><CheckCircle size={16} /> Prioritize material, explainable exceptions</li>
                <li><CheckCircle size={16} /> Compare records and evidence in one workspace</li>
                <li><CheckCircle size={16} /> Track dealer responses and review decisions</li>
                <li><CheckCircle size={16} /> Produce defensible findings and exports</li>
              </ul>
              <Link href="/sign-up">Create a review account <ArrowRight size={14} /></Link>
            </article>
          </div>
        </section>

        <section className="marketing-section">
          <div className="section-heading-public"><span className="section-kicker">Core capabilities</span><h2>Workflow depth, not dashboard theatre.</h2></div>
          <div className="capability-grid">
            {capabilities.map(([title, description, Icon]) => <article key={title}><Icon size={22} weight="duotone" /><h3>{title}</h3><p>{description}</p></article>)}
          </div>
        </section>

        <section className="sample-workflow">
          <span className="section-kicker">Example workflow · Sample demonstration data</span>
          <div>
            <h2>Northfield reports 1,142 transactions. The evidence suggests 1,167 records worth checking.</h2>
            <p>DealerSync finds 25 initially unmatched records. Eleven are supported wholesale or cancelled transactions, six need corrected dates, five await documents, and three remain unresolved.</p>
          </div>
          <div className="sample-numbers">
            {[["1,128", "Exact matches"], ["11", "Valid exceptions"], ["5", "Awaiting evidence"], ["3", "Unresolved"]].map(([value, label]) => <span key={label}><strong>{value}</strong>{label}</span>)}
          </div>
        </section>

        <section className="final-cta">
          <div><span className="section-kicker">Explore the local prototype</span><h2>Follow one exception from detection through resolution.</h2><p>Switch between dealer and reviewer perspectives, compare records, add evidence, and see the shared ledger update.</p></div>
          <Link href="/sign-in" className="marketing-button large">Sign in to DealerSync <ArrowRight size={16} /></Link>
        </section>
      </main>

      <footer><Link href="/" className="marketing-brand"><span><ShieldCheck size={18} weight="fill" /></span>DealerSync</Link><p>VIN-level transaction reconciliation for Ontario · Local prototype</p></footer>
    </div>
  );
}
