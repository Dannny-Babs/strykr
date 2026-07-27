import Link from "next/link";

export default function Home() {
  return (
    <div className="font-sans min-h-screen bg-white text-[#171717]">
      <header className="border-b border-neutral-200">
        <div className="mx-auto max-w-7xl px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-lg font-extrabold tracking-tight">DealerSync</span>
          </div>
          <nav className="hidden md:flex items-center gap-6 text-sm">
            <a href="#value" className="hover:text-black">Why It Matters</a>
            <a href="#how" className="hover:text-black">How It Works</a>
            <a href="#trust" className="hover:text-black">Neutral Ledger</a>
            <Link href="/research" className="hover:text-black">Research</Link>
          </nav>
          <div className="flex items-center gap-3">
            <a href="#start" className="inline-flex items-center justify-center rounded-md bg-black text-white px-4 py-2 text-sm font-semibold shadow-sm hover:bg-neutral-800">Book a Walkthrough</a>
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-7xl px-6 py-16 md:py-24">

        {/* Hero Section */}
        <section className="mt-6 grid gap-6 md:grid-cols-2 md:items-center">
          <div>
            <h2 className="text-3xl md:text-5xl font-semibold leading-tight text-slate-500">
              A VIN-level ledger <br />
              <strong className="text-black font-semibold">every party can trust.</strong>
            </h2>
            <p className="mt-4 text-lg text-neutral-700">
              DealerSync reconciles your DMS, accounting, and bills of sale into one
              defensible OMVIC Transaction Fee Register — so you stop overpaying, kill
              the manual reconstruction at renewal, and walk into an audit with proof
              instead of paperwork.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <a href="#start" className="inline-flex items-center justify-center rounded-md bg-black text-white px-5 py-3 text-sm font-semibold shadow-sm hover:bg-neutral-800">Book a Walkthrough</a>
              <a href="#how" className="inline-flex items-center justify-center rounded-md border border-neutral-300 px-5 py-3 text-sm font-semibold text-neutral-900 hover:bg-neutral-50">See How It Works</a>
            </div>
          </div>
          <div className="rounded-xl border border-neutral-200 p-6 bg-neutral-50">
            <p className="text-sm font-semibold text-neutral-500 uppercase tracking-wide">Since Jan 6, 2025</p>
            <p className="mt-2 text-neutral-800">
              The Transaction Fee Register is a mandatory renewal submission. Most
              dealers are still building it by hand — and the per-vehicle fee just
              rose to <strong>$22</strong>, up from $12.50 in 2024.
            </p>
          </div>
        </section>

        {/* Why It Matters */}
        <section id="value" className="mt-20">
          <h3 className="text-2xl font-bold">Where dealers are actually losing money</h3>
          <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            <div className="rounded-lg border border-neutral-200 p-6">
              <div className="text-2xl mb-2">💸</div>
              <h4 className="font-semibold">Stop Overpaying</h4>
              <p className="mt-2 text-neutral-700">
                Flag genuinely exempt transactions — dealer-to-dealer consignments,
                most commercial/bus sales — so you don&apos;t remit $22 on transactions
                you never owed.
              </p>
            </div>
            <div className="rounded-lg border border-neutral-200 p-6">
              <div className="text-2xl mb-2">🛡️</div>
              <h4 className="font-semibold">Audit-Proof</h4>
              <p className="mt-2 text-neutral-700">
                Hand an inspector a defensible, VIN-level evidence pack in minutes —
                every figure source-linked and rule-cited, not reconstructed from memory.
              </p>
            </div>
            <div className="rounded-lg border border-neutral-200 p-6">
              <div className="text-2xl mb-2">⏱️</div>
              <h4 className="font-semibold">Kill the Admin</h4>
              <p className="mt-2 text-neutral-700">
                The Register became a mandatory renewal submission in 2025. Stop
                rebuilding it by hand every renewal cycle.
              </p>
            </div>
          </div>
        </section>

        {/* How It Works */}
        <section id="how" className="mt-20">
          <h3 className="text-2xl font-bold">How it works</h3>
          <p className="mt-4 text-neutral-700 max-w-4xl">
            DealerSync ingests the dealer&apos;s own authorized records — DMS exports,
            accounting, bills of sale — and reconciles them at the VIN level against
            the OMVIC registrant search to classify each transaction as fee-applicable
            or exempt. The output is the Transaction Fee Register itself, plus an
            exception queue for anything that doesn&apos;t reconcile cleanly.
          </p>
          <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-lg border border-neutral-200 p-6">
              <p className="text-sm font-semibold text-neutral-500">01</p>
              <h4 className="mt-1 font-semibold">Ingest</h4>
              <p className="mt-2 text-neutral-700 text-sm">DMS export, accounting ledger, bills of sale.</p>
            </div>
            <div className="rounded-lg border border-neutral-200 p-6">
              <p className="text-sm font-semibold text-neutral-500">02</p>
              <h4 className="mt-1 font-semibold">Classify</h4>
              <p className="mt-2 text-neutral-700 text-sm">Match each VIN against the OMVIC registrant search to determine exempt vs. fee-applicable.</p>
            </div>
            <div className="rounded-lg border border-neutral-200 p-6">
              <p className="text-sm font-semibold text-neutral-500">03</p>
              <h4 className="mt-1 font-semibold">Reconcile</h4>
              <p className="mt-2 text-neutral-700 text-sm">Surface mismatches between sources into a reviewable exception queue.</p>
            </div>
            <div className="rounded-lg border border-neutral-200 p-6">
              <p className="text-sm font-semibold text-neutral-500">04</p>
              <h4 className="mt-1 font-semibold">Export</h4>
              <p className="mt-2 text-neutral-700 text-sm">Produce the Transaction Fee Register and a source-linked audit evidence pack.</p>
            </div>
          </div>
        </section>

        {/* Neutral Ledger / Trust */}
        <section id="trust" className="mt-20">
          <h3 className="text-2xl font-bold">The moat is neutrality</h3>
          <p className="mt-4 text-neutral-700 max-w-4xl">
            Right now neither side trusts the number. It&apos;s reconstructed by hand
            from fragmented sources — the dealer doesn&apos;t know if they overpaid,
            OMVIC doesn&apos;t know if the dealer underpaid. DealerSync isn&apos;t a
            dashboard or a scraper — it&apos;s a defensible, explainable transaction
            number that both sides accept because every figure is source-linked and
            rule-cited. Same function as a tax return: the taxpayer accepts it because
            it follows the rules, the regulator accepts it because it follows the rules.
          </p>
        </section>

        {/* Final CTA */}
        <section id="start" className="mt-20 text-center">
          <h3 className="text-2xl md:text-3xl font-extrabold">Reconcile your first renewal in minutes, not hours.</h3>
          <p className="mt-2 text-neutral-700">Bring one anonymized reconciliation. We&apos;ll show you the exception queue live.</p>
          <div className="mt-6">
            <a href="mailto:hello@dealersync.app" className="inline-flex items-center justify-center rounded-md bg-black text-white px-6 py-3 text-sm font-semibold shadow-sm hover:bg-neutral-800">Book a Walkthrough</a>
          </div>
        </section>
      </main>
    </div>
  );
}
