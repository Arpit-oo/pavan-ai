"use client";

import Link from "next/link";
import { Reveal, Eyebrow, Pill, CREAM, ACCENT } from "./ui";

/**
 * Closing CTA + footer: warm-cream → dark transition, the final call to
 * action, and the giant "pavan" wordmark repeated as a masthead (Stryde-style
 * footer bookend).
 */

const FOOTER_LINKS = [
  { label: "dashboard", href: "/dashboard" },
  { label: "simulator", href: "/simulate" },
  { label: "grap compliance", href: "/compliance" },
  { label: "city compare", href: "/compare" },
  { label: "architecture", href: "/architecture" },
];

export function Cta() {
  return (
    <>
      <div aria-hidden style={{ height: 120, background: "linear-gradient(180deg, #f5f0e6 0%, #12110f 100%)" }} />
      <footer style={{ background: "#12110f", color: CREAM }} className="relative overflow-hidden">
        <div className="mx-auto max-w-[1240px] px-5 sm:px-8">
          {/* CTA */}
          <Reveal>
            <div className="pt-6">
              <Eyebrow light>see your city&apos;s air</Eyebrow>
              <h2
                className="mt-6 max-w-[16ch] lowercase"
                style={{ fontSize: "clamp(34px, 5vw, 66px)", lineHeight: 1.0, letterSpacing: "-0.04em", fontVariationSettings: "'wght' 660, 'wdth' 92" }}
              >
                stop watching the air. start <span style={{ color: ACCENT }}>acting</span> on it.
              </h2>
              <div className="mt-9 flex flex-wrap items-center gap-3">
                <Pill href="/dashboard" accent>open the dashboard</Pill>
                <Pill href="https://t.me/PavanETbot" external>try the telegram bot</Pill>
              </div>
            </div>
          </Reveal>

          {/* Footer meta */}
          <div className="mt-24 flex flex-col gap-8 border-t border-white/10 pt-10 md:flex-row md:items-start md:justify-between">
            <div>
              <Link href="/" className="text-[22px]" style={{ fontVariationSettings: "'wght' 720, 'wdth' 94" }}>
                pavan<span style={{ color: ACCENT }}>.</span>
              </Link>
              <p className="mt-3 max-w-[36ch] text-[14px]" style={{ color: "rgba(245,240,230,0.6)" }}>
                urban air quality intelligence for india — monitoring to enforcement in under three seconds.
              </p>
            </div>
            <div className="flex flex-wrap gap-x-8 gap-y-3">
              {FOOTER_LINKS.map((l) => (
                <Link key={l.href} href={l.href} className="text-[14px] transition-colors hover:text-white" style={{ color: "rgba(245,240,230,0.72)" }}>
                  {l.label}
                </Link>
              ))}
            </div>
          </div>

          <div className="mt-10 flex flex-col gap-2 pb-2 font-mono text-[10px] uppercase tracking-[0.16em] md:flex-row md:justify-between" style={{ color: "rgba(245,240,230,0.4)" }}>
            <span>team edgerunner · ET AI hackathon 2026 · problem statement #5</span>
            <span>pavan-aqi.vercel.app</span>
          </div>
        </div>

        {/* Giant wordmark bookend */}
        <div
          aria-hidden
          className="pointer-events-none select-none px-4 text-center font-display"
          style={{ fontSize: "min(28vw, 34rem)", lineHeight: 0.72, letterSpacing: "-0.04em", color: "rgba(245,240,230,0.94)", marginBottom: "-0.14em" }}
        >
          pavan
        </div>
      </footer>
    </>
  );
}
