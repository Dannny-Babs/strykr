import Link from "next/link";
import { ArrowUpRight } from "@phosphor-icons/react/dist/ssr";
import { Reveal } from "./reveal";

export function FinalCta() {
  return (
    <section className="bg-[oklch(0.24_0.008_75)]">
      <div className="mx-auto max-w-6xl px-6 py-24 text-center sm:py-32">
        <Reveal>
          <p className="font-mono text-[11px] tracking-[0.14em] text-white/45 uppercase">
            Start with the records you already have
          </p>
          <h2 className="mx-auto mt-6 max-w-3xl font-display text-4xl leading-[1.05] font-normal tracking-[-0.02em] text-balance text-[oklch(0.96_0.004_85)] sm:text-6xl">
            Make every transaction easier to explain.
          </h2>
          <p className="mx-auto mt-6 max-w-lg text-[15px] leading-relaxed font-light text-white/55">
            See how Cordena connects source records, exceptions, evidence,
            and decisions in one workspace.
          </p>
          <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link
              href="/sign-up"
              className="inline-flex h-11 items-center gap-1.5 rounded-full bg-[oklch(0.982_0.004_85)] px-5 text-sm font-medium text-[oklch(0.3_0.012_80)] transition-opacity hover:opacity-90 active:scale-[0.98]"
            >
              <ArrowUpRight size={15} weight="bold" />
              Create an account
            </Link>
            <Link
              href="/sign-in"
              className="inline-flex h-11 items-center rounded-full border border-white/20 px-5 text-sm font-medium text-white/90 transition-colors hover:bg-white/10"
            >
              Sign in
            </Link>
          </div>
          <p className="mt-8 text-sm text-white/40">
            Explore the local prototype with seeded demonstration data.
          </p>
        </Reveal>
      </div>
    </section>
  );
}
