import { StickyNav } from "@/components/landing/nav";
import { Hero } from "@/components/landing/hero";
import { Stakes } from "@/components/landing/stakes";
import { Fusion } from "@/components/landing/fusion";
import { Capabilities } from "@/components/landing/capabilities";
import { Acts } from "@/components/landing/acts";
import { Pipeline } from "@/components/landing/pipeline";
import { Proof } from "@/components/landing/proof";
import { Cta } from "@/components/landing/cta";

export default function LandingPage() {
  return (
    <main className="bg-background text-foreground">
      <StickyNav />
      <Hero />
      {/* the problem → what it sees → what it works out → what it does about it → how → proof */}
      <Stakes />
      <Fusion />
      <Capabilities />
      <Acts />
      <Pipeline />
      <Proof />
      <Cta />
    </main>
  );
}
