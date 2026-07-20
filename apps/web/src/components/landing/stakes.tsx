"use client";

import Image from "next/image";
import { Reveal, Eyebrow, StatNumber, CREAM, ACCENT } from "./ui";

/**
 * The stakes: the dark emotional gut-punch. Verified 2024 crisis numbers
 * (IQAir World Air Quality Report 2024 / State of Global Air / WHO) sold as
 * giant Fraunces figures over a cinematic haze photograph.
 */

const STATS = [
  { value: "1.6M", label: "lives lost every year in india to air pollution", source: "State of Global Air" },
  { value: "13 / 20", label: "of the world's most polluted cities are indian", source: "IQAir 2024" },
  { value: "10×", label: "india's average pm2.5 over the WHO safe limit", source: "IQAir 2024 · WHO" },
  { value: "6 yrs", label: "delhi — the world's most polluted capital, running", source: "IQAir 2024" },
];

export function Stakes() {
  return (
    <section id="stakes" className="relative" style={{ background: "#12110f", color: CREAM }}>
      <div className="mx-auto max-w-[1240px] px-5 py-24 sm:px-8 sm:py-28">
        {/* Intro row */}
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:items-end">
          <Reveal>
            <Eyebrow light>the stakes</Eyebrow>
            <h2
              className="mt-6 max-w-[15ch] lowercase"
              style={{ fontSize: "clamp(34px, 4.6vw, 60px)", lineHeight: 1.02, letterSpacing: "-0.035em", fontVariationSettings: "'wght' 640, 'wdth' 92" }}
            >
              india breathes the most dangerous air on earth.
            </h2>
            <p className="mt-6 max-w-[48ch] text-[17px] leading-relaxed" style={{ color: "rgba(245,240,230,0.72)" }}>
              this isn&apos;t a dashboard problem — it&apos;s a public-health emergency measured in millions of
              lives. and for most cities, the response is still reactive, manual, and days too late.
            </p>
          </Reveal>

          <Reveal delay={0.1}>
            <div className="relative h-[280px] w-full overflow-hidden rounded-[24px] sm:h-[340px]">
              <Image
                src="/landing/stakes-haze.jpg"
                alt="City towers disappearing into haze"
                fill
                sizes="(max-width: 1024px) 100vw, 520px"
                className="object-cover"
                style={{ objectPosition: "50% 30%" }}
              />
              <div aria-hidden className="absolute inset-0" style={{ background: "linear-gradient(180deg, transparent 40%, rgba(18,17,15,0.6) 100%)" }} />
            </div>
          </Reveal>
        </div>

        {/* Numbers band */}
        <div className="mt-20 grid grid-cols-2 gap-x-6 gap-y-12 lg:grid-cols-4 lg:gap-x-0">
          {STATS.map((s, i) => (
            <Reveal key={s.value} delay={i * 0.08}>
              <div className="lg:px-8" style={{ borderLeft: i === 0 ? "none" : "1px solid rgba(245,240,230,0.14)" }}>
                <StatNumber value={s.value} style={{ fontSize: "clamp(44px, 5.4vw, 78px)", color: i % 2 === 0 ? ACCENT : CREAM }} />
                <p className="mt-4 max-w-[22ch] text-[14px] leading-snug" style={{ color: "rgba(245,240,230,0.78)" }}>
                  {s.label}
                </p>
                <p className="mt-2 font-mono text-[10px] uppercase tracking-[0.16em]" style={{ color: "rgba(245,240,230,0.4)" }}>
                  {s.source}
                </p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
