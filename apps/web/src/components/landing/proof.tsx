"use client";

import { Reveal, Eyebrow, StatNumber, ACCENT } from "./ui";

/**
 * Proof & trust: the credibility band. Real coverage / validation numbers plus
 * the named, verifiable data sources , the "this is real, and defensible"
 * section for judges.
 */

const NUMBERS = [
  { value: "105", label: "monitoring stations" },
  { value: "57", label: "cities · every state capital" },
  { value: "27", label: "live API endpoints" },
  { value: "86%", label: "lower forecast error vs baseline", accent: true },
];

const SOURCES = ["CPCB CAAQMS", "Sentinel-5P TROPOMI", "MODIS / VIIRS", "OpenWeatherMap", "WHO exposure models"];

export function Proof() {
  return (
    <>
      <div aria-hidden style={{ height: 120, background: "linear-gradient(180deg, #12110f 0%, #f5f0e6 100%)" }} />
      <section id="proof" className="mx-auto max-w-[1240px] px-5 pb-24 sm:px-8">
        <Reveal>
          <Eyebrow>proof &amp; trust</Eyebrow>
          <h2
            className="mt-5 max-w-[18ch] lowercase"
            style={{ fontSize: "clamp(30px, 4vw, 52px)", lineHeight: 1.03, letterSpacing: "-0.035em", fontVariationSettings: "'wght' 660, 'wdth' 94" }}
          >
            built on verified data, validated methods.
          </h2>
        </Reveal>

        {/* Numbers */}
        <div className="mt-14 grid grid-cols-2 gap-x-6 gap-y-12 lg:grid-cols-4 lg:gap-x-0">
          {NUMBERS.map((n, i) => (
            <Reveal key={n.label} delay={i * 0.07}>
              <div className="lg:px-8" style={{ borderLeft: i === 0 ? "none" : "1px solid rgba(0,0,0,0.1)" }}>
                <StatNumber value={n.value} style={{ fontSize: "clamp(44px, 5.4vw, 76px)", color: n.accent ? ACCENT : undefined }} />
                <p className="mt-4 max-w-[20ch] text-[14px] leading-snug text-muted-foreground">{n.label}</p>
              </div>
            </Reveal>
          ))}
        </div>

        {/* Sources */}
        <Reveal delay={0.1}>
          <div className="mt-16 rounded-[24px] border border-black/8 bg-card p-8">
            <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">every number traces to a named source</p>
            <div className="mt-5 flex flex-wrap items-center gap-x-3 gap-y-3">
              {SOURCES.map((s) => (
                <span key={s} className="rounded-full border border-black/10 bg-background px-4 py-2 text-[14px]" style={{ fontVariationSettings: "'wght' 560" }}>{s}</span>
              ))}
            </div>
            <p className="mt-6 max-w-[70ch] text-[14px] leading-relaxed text-muted-foreground">
              air quality from CPCB&apos;s official CAAQMS network. source attribution validated against SAFAR&apos;s
              published apportionment studies. health impact estimated with WHO exposure-response functions. the
              full methodology is published openly.
            </p>
          </div>
        </Reveal>
      </section>
    </>
  );
}
