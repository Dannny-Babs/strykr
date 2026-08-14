import { PillLink } from "./pill-link";
import { Reveal } from "./reveal";

export function Hero() {
  return (
    <section className="relative">
      <div className="mx-auto max-w-6xl px-6 pt-36 pb-16 sm:pt-44 sm:pb-20">
        <Reveal className="mx-auto max-w-4xl text-center">
          <h1 className="font-display text-5xl leading-[1.02] font-normal tracking-[-0.02em] text-balance text-foreground sm:text-7xl">
            Know what happened in every vehicle transaction.
          </h1>
          <p className="mx-auto mt-7 max-w-xl text-base leading-relaxed font-light text-pretty text-muted-foreground sm:text-lg">
            Cordena brings transaction records, registration-style data,
            explanations, and supporting evidence into one reviewable workspace
            for dealerships and regulatory reviewers.
          </p>
          <div className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <PillLink href="/sign-up" arrow>
              Create an account
            </PillLink>
            <PillLink href="#how-it-works" variant="outline">
              See how it works
            </PillLink>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
