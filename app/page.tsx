export default function Home() {
  return (
    <div className="font-sans min-h-screen bg-white text-[#171717]">
      <main className="mx-auto max-w-6xl px-6 py-16 md:py-24">
        {/* Brand Name */}
        <div className="mb-8">
          <span className="text-sm uppercase tracking-widest text-neutral-500">Brand Name</span>
          <h1 className="mt-2 text-4xl font-extrabold tracking-tight md:text-6xl">STRYKR</h1>
          <p className="mt-2 text-neutral-600 max-w-2xl">(short for “Striker,” sharp, strong, six letters, easy to say, sports-tech vibe)</p>
        </div>

        {/* Hero Section */}
        <section className="mt-6 grid gap-6 md:grid-cols-2 md:items-center">
          <div>
            <h2 className="text-3xl md:text-5xl font-extrabold leading-tight">Train Like the Pros. Anytime. Anywhere.</h2>
            <p className="mt-4 text-lg text-neutral-700">With STRYKR, the VR-powered smart baseball tracker, your practice is no longer just reps—it’s precision, feedback, and progress you can measure.</p>
            <div className="mt-6 flex flex-wrap gap-3">
              <a href="#start" className="inline-flex items-center justify-center rounded-md bg-black text-white px-5 py-3 text-sm font-semibold shadow-sm hover:bg-neutral-800">Start Free Trial</a>
              <a href="#pricing" className="inline-flex items-center justify-center rounded-md border border-neutral-300 px-5 py-3 text-sm font-semibold text-neutral-900 hover:bg-neutral-50">See Pricing</a>
            </div>
          </div>
          <div className="aspect-[4/3] w-full rounded-xl bg-neutral-100 border border-neutral-200" aria-hidden />
        </section>

        {/* Subheadline */}
        <section className="mt-12">
          <p className="text-neutral-700 md:text-lg max-w-4xl">Step into a virtual ballpark and let advanced sensors + VR immersion transform every swing, pitch, and catch into data-driven insights. STRYKR helps athletes and coaches practice smarter, not harder.</p>
        </section>

        {/* Core Features */}
        <section className="mt-16">
          <h3 className="text-2xl font-bold">Core Features</h3>
          <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            <div className="rounded-lg border border-neutral-200 p-6">
              <div className="text-2xl mb-2">🎯</div>
              <h4 className="font-semibold">Precision Motion Tracking</h4>
              <p className="mt-2 text-neutral-700">Track bat speed, pitch velocity, reaction time, swing angle, and more—with pro-level accuracy.</p>
            </div>
            <div className="rounded-lg border border-neutral-200 p-6">
              <div className="text-2xl mb-2">🧠</div>
              <h4 className="font-semibold">AI-Powered Feedback</h4>
              <p className="mt-2 text-neutral-700">Instant analysis shows exactly where to adjust. From mechanics to timing, STRYKR acts like your personal hitting coach.</p>
            </div>
            <div className="rounded-lg border border-neutral-200 p-6">
              <div className="text-2xl mb-2">🕶</div>
              <h4 className="font-semibold">Immersive VR Drills</h4>
              <p className="mt-2 text-neutral-700">Face off against simulated pitchers, train in dynamic drills, and sharpen reaction speed in high-intensity VR sessions.</p>
            </div>
            <div className="rounded-lg border border-neutral-200 p-6">
              <div className="text-2xl mb-2">📊</div>
              <h4 className="font-semibold">Progress Dashboard</h4>
              <p className="mt-2 text-neutral-700">Set goals, review detailed reports, and monitor performance growth over time—perfect for athletes or full coaching programs.</p>
            </div>
            <div className="rounded-lg border border-neutral-200 p-6">
              <div className="text-2xl mb-2">📂</div>
              <h4 className="font-semibold">Team & Coach Tools</h4>
              <p className="mt-2 text-neutral-700">Give your whole team an edge with multi-player accounts, shared progress tracking, and custom training plans.</p>
            </div>
          </div>
        </section>

        {/* Vision Statement */}
        <section className="mt-16">
          <h3 className="text-2xl font-bold">Vision Statement</h3>
          <p className="mt-4 text-neutral-700 max-w-4xl">Baseball is evolving. STRYKR brings together VR immersion, AI insights, and cutting-edge tracking to create the next era of player development. Whether you’re a rising athlete, a weekend warrior, or a coach shaping the next generation, STRYKR makes practice powerful.</p>
        </section>

        {/* Pricing Section */}
        <section id="pricing" className="mt-16">
          <h3 className="text-2xl font-bold">Simple Plans. Serious Results.</h3>
          <div className="mt-8 grid gap-6 md:grid-cols-3">
            <div className="rounded-xl border border-neutral-200 p-6">
              <h4 className="text-xl font-semibold">Starter — $19/mo</h4>
              <ul className="mt-4 space-y-2 text-neutral-700">
                <li>VR practice environment</li>
                <li>Basic swing & pitch tracking</li>
                <li>Personal dashboard</li>
              </ul>
            </div>
            <div className="rounded-xl border-2 border-black p-6 shadow-sm">
              <h4 className="text-xl font-semibold">Pro — $49/mo</h4>
              <ul className="mt-4 space-y-2 text-neutral-700">
                <li>Advanced metrics & analytics</li>
                <li>AI-powered feedback</li>
                <li>Goal tracking & performance reports</li>
                <li>Unlimited practice sessions</li>
              </ul>
            </div>
            <div className="rounded-xl border border-neutral-200 p-6">
              <h4 className="text-xl font-semibold">Team — Custom Pricing</h4>
              <ul className="mt-4 space-y-2 text-neutral-700">
                <li>Multi-player accounts</li>
                <li>Team dashboards & reporting</li>
                <li>Coach analytics & shared drills</li>
                <li>Dedicated support & onboarding</li>
              </ul>
            </div>
          </div>
          <div className="mt-6">
            <a href="#start" className="inline-flex items-center justify-center rounded-md bg-black text-white px-5 py-3 text-sm font-semibold shadow-sm hover:bg-neutral-800">Choose Your Plan</a>
          </div>
        </section>

        {/* Social Proof / Callout */}
        <section className="mt-16">
          <blockquote className="rounded-xl border border-neutral-200 p-6 bg-neutral-50">
            <p className="text-neutral-800">“STRYKR feels like practicing inside the future of baseball. Every swing comes with insights you can’t get on the field.”</p>
            <footer className="mt-2 text-sm text-neutral-600">– Early Beta Tester</footer>
          </blockquote>
        </section>

        {/* Final CTA */}
        <section id="start" className="mt-16 text-center">
          <h3 className="text-2xl md:text-3xl font-extrabold">Ready to play smarter?</h3>
          <p className="mt-2 text-neutral-700">Level up your training with STRYKR today.</p>
          <div className="mt-6">
            <a href="#" className="inline-flex items-center justify-center rounded-md bg-black text-white px-6 py-3 text-sm font-semibold shadow-sm hover:bg-neutral-800">Start Free Trial</a>
          </div>
        </section>
      </main>
    </div>
  );
}
