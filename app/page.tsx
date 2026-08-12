import { Instrument_Serif } from "next/font/google";
import { cn } from "@/lib/utils";
import { Navbar } from "@/components/landing/navbar";
import { Hero } from "@/components/landing/hero";
import { ProductPreview } from "@/components/landing/product-preview";
import { Problem } from "@/components/landing/problem";
import { HowItWorks } from "@/components/landing/how-it-works";
import { TwoSided } from "@/components/landing/two-sided";
import { Capabilities } from "@/components/landing/capabilities";
import { WorkflowExample } from "@/components/landing/workflow-example";
import { Trust } from "@/components/landing/trust";
import { FinalCta } from "@/components/landing/final-cta";
import { Footer } from "@/components/landing/footer";

const displaySerif = Instrument_Serif({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-display-serif",
  display: "swap",
});

export default function Home() {
  return (
    <div
      className={cn(
        "landing scroll-smooth bg-background text-foreground",
        displaySerif.variable,
      )}
    >
      <Navbar />
      <main>
        <Hero />
        <ProductPreview />
        <Problem />
        <HowItWorks />
        <TwoSided />
        <Capabilities />
        <WorkflowExample />
        <Trust />
        <FinalCta />
      </main>
      <Footer />
    </div>
  );
}
