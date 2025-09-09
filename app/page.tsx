import Image from "next/image";

export default function Home() {
  return (
    <div className="font-sans min-h-screen bg-white text-[#171717]">
      <header className="border-b border-neutral-200">
        <div className="mx-auto max-w-7xl px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-lg font-extrabold tracking-tight">STRYKR</span>
          </div>
          <nav className="hidden md:flex items-center gap-6 text-sm">
            <a href="#features" className="hover:text-black">Features</a>
            <a href="#video" className="hover:text-black">Video</a>
            <a href="#pricing" className="hover:text-black">Pricing</a>
          </nav>
          <div className="flex items-center gap-3">
            <a href="#buy" className="inline-flex items-center justify-center rounded-md bg-black text-white px-4 py-2 text-sm font-semibold shadow-sm hover:bg-neutral-800">Buy Now</a>
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-7xl px-6 py-16 md:py-24">
        {/* Brand Name */}
        <div className="mb-8">
          <h1 className="mt-2 text-4xl font-extrabold tracking-tight md:text-6xl">STRYKR</h1>

        </div>

        {/* Hero Section */
        }
        <section className="mt-6 grid gap-6 md:grid-cols-2 md:items-center">
          <div>
            <h2 className="text-3xl md:text-5xl font-extrabold leading-tight">Train Like the Pros. Anytime. Anywhere.</h2>
            <p className="mt-4 text-lg text-neutral-700">With STRYKR, the VR-powered smart baseball tracker, your practice is no longer just reps—it’s precision, feedback, and progress you can measure.</p>
            <div className="mt-6 flex flex-wrap gap-3">
              <a href="#buy" className="inline-flex items-center justify-center rounded-md bg-black text-white px-5 py-3 text-sm font-semibold shadow-sm hover:bg-neutral-800">Buy Now — $299.99</a>
              <a href="#pricing" className="inline-flex items-center justify-center rounded-md border border-neutral-300 px-5 py-3 text-sm font-semibold text-neutral-900 hover:bg-neutral-50">Learn More</a>
            </div>
          </div>
          <div className="relative aspect-[4/3] w-full overflow-hidden rounded-xl border border-neutral-200">
            <Image
              src="https://img.baba-blog.com/2024/07/A-smart-baseball-bat-on-a-table-with-a-charger.jpg?x-oss-process=style%2Ffull"
              alt="Smart baseball bat and charger on a table"
              fill
              priority
              sizes="(min-width: 768px) 50vw, 100vw"
              className="object-cover"
            />
          </div>
        </section>

        {/* Subheadline */}
        <section className="mt-12">
          <p className="text-neutral-700 md:text-lg max-w-4xl">Step into a virtual ballpark and let advanced sensors + VR immersion transform every swing, pitch, and catch into data-driven insights. STRYKR helps athletes and coaches practice smarter, not harder.</p>
        </section>

        {/* Video Section */}
        <section id="video" className="mt-16">
          <div className="mt-6 aspect-[16/9] w-full rounded-xl border border-neutral-200 overflow-hidden">
            <iframe
              className="h-full w-full"
              src="https://www.youtube.com/embed/OhWvYUazTiw?autoplay=1&mute=1&playsinline=1&controls=1&rel=0"
              title="STRYKR Demo"
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              referrerPolicy="strict-origin-when-cross-origin"
              allowFullScreen
            />
          </div>
        </section>

        {/* Core Features */}
        <section id="features" className="mt-16">
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

        {/* Pricing / Buy Now */}
        <section id="pricing" className="mt-16">
          <h3 className="text-2xl font-bold">Own STRYKR. One-Time Purchase.</h3>
          <div className="mt-8 grid gap-6 md:grid-cols-2">
            <div className="rounded-xl border-2 border-black p-6 shadow-sm">
              <h4 className="text-2xl font-semibold">STRYKR — $299.99</h4>
              <ul className="mt-4 space-y-2 text-neutral-700">
                <li>VR practice environment</li>
                <li>Advanced swing & pitch tracking</li>
                <li>AI-powered feedback and coaching tips</li>
                <li>Personal progress dashboard & reports</li>
              </ul>
              <div className="mt-6">
                <a id="buy" href="#" className="inline-flex items-center justify-center rounded-md bg-black text-white px-5 py-3 text-sm font-semibold shadow-sm hover:bg-neutral-800">Buy Now — $299.99</a>
              </div>
              <p className="mt-2 text-xs text-neutral-500">One-time payment. No subscription required.</p>
            </div>
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
            <a href="#buy" className="inline-flex items-center justify-center rounded-md bg-black text-white px-6 py-3 text-sm font-semibold shadow-sm hover:bg-neutral-800">Buy Now — $299.99</a>
          </div>
        </section>
      </main>
    </div>
  );
}
