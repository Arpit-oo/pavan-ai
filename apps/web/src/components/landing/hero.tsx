"use client";

import Image from "next/image";
import Link from "next/link";
import { motion, useReducedMotion } from "motion/react";
import { CREAM, ACCENT } from "./ui";

/**
 * Hero: full-bleed Delhi-smog photograph with the page's own dark nav layered
 * on, an emotional headline, a live-AQI glass chip, and the giant "pavan"
 * wordmark bleeding off the bottom edge (Stryde-style masthead).
 */

const NAV = [
  { label: "the problem", href: "#stakes" },
  { label: "what it does", href: "#does" },
  { label: "how it works", href: "#pipeline" },
  { label: "proof", href: "#proof" },
];

const EASE = [0.21, 0.6, 0.35, 1] as const;

export function Hero() {
  const reduce = useReducedMotion();
  const enter = (delay: number) =>
    reduce
      ? {}
      : {
          initial: { opacity: 0, y: 18 },
          animate: { opacity: 1, y: 0 },
          transition: { duration: 0.7, delay, ease: EASE },
        };

  return (
    <header className="relative flex h-[92vh] min-h-[640px] flex-col overflow-hidden" style={{ background: "#0d0c0b" }}>
      {/* Background photo */}
      <motion.div
        className="absolute inset-0"
        {...(reduce
          ? {}
          : {
              initial: { scale: 1.08, opacity: 0.5 },
              animate: { scale: 1, opacity: 1 },
              transition: { duration: 1.2, ease: EASE },
            })}
      >
        <Image
          src="/landing/hero-smog.jpg"
          alt="Delhi skyline under heavy smog at dusk"
          fill
          priority
          sizes="100vw"
          className="object-cover"
          style={{ objectPosition: "50% 42%" }}
        />
        {/* Legibility + blend-to-black at the bottom for the wordmark */}
        <div aria-hidden className="absolute inset-0" style={{ background: "linear-gradient(180deg, rgba(8,7,6,0.55) 0%, rgba(8,7,6,0.15) 30%, rgba(8,7,6,0.35) 62%, rgba(8,7,6,0.92) 100%)" }} />
      </motion.div>

      {/* Foreground */}
      <div className="relative mx-auto flex h-full w-full max-w-[1240px] flex-col px-5 sm:px-8" style={{ color: CREAM }}>
        {/* Nav */}
        <motion.nav className="flex h-[76px] items-center justify-between" {...enter(0.05)}>
          <Link href="/" className="flex items-baseline gap-[1px] text-[24px]" style={{ fontVariationSettings: "'wght' 720, 'wdth' 94" }}>
            pavan<span style={{ color: ACCENT }}>.</span>
          </Link>
          <div className="hidden items-center gap-[30px] text-[14px] md:flex" style={{ color: "rgba(245,240,230,0.8)" }}>
            {NAV.map((n) => (
              <a key={n.href} href={n.href} className="transition-colors hover:text-[color:var(--cream)]" style={{ ["--cream" as string]: CREAM }}>
                {n.label}
              </a>
            ))}
          </div>
          <Link
            href="/dashboard"
            className="inline-flex h-[42px] items-center rounded-full px-[20px] text-[14px] font-medium transition-transform hover:-translate-y-[1px]"
            style={{ background: CREAM, color: "#12110f" }}
          >
            open dashboard →
          </Link>
        </motion.nav>

        <div className="h-px w-full" style={{ background: "rgba(245,240,230,0.16)" }} />

        {/* Sub row */}
        <motion.div className="flex h-[46px] items-center justify-between font-mono text-[11px] uppercase tracking-[0.2em]" style={{ color: "rgba(245,240,230,0.68)" }} {...enter(0.12)}>
          <span>urban air intelligence</span>
          <span className="hidden sm:block">57 cities · 105 stations · india</span>
        </motion.div>

        {/* Headline block */}
        <div className="relative flex flex-1 flex-col justify-center py-6">
          <motion.h1
            className="max-w-[16ch] lowercase"
            style={{ fontSize: "clamp(40px, 6vw, 78px)", lineHeight: 0.98, letterSpacing: "-0.04em", fontVariationSettings: "'wght' 680, 'wdth' 92, 'opsz' 72" }}
            {...enter(0.2)}
          >
            the air india breathes,
            <br />
            <span style={{ color: ACCENT }}>understood</span> in real time.
          </motion.h1>
          <motion.p
            className="mt-6 max-w-[54ch] text-[17px] leading-relaxed sm:text-[19px]"
            style={{ color: "rgba(245,240,230,0.82)", fontVariationSettings: "'wght' 460" }}
            {...enter(0.28)}
          >
            pavan fuses five live data sources through a six-agent AI pipeline — turning raw pollution
            numbers into source attribution, forecasts, and enforcement-ready action, in under three seconds.
          </motion.p>
          <motion.div className="mt-8 flex flex-wrap items-center gap-3" {...enter(0.36)}>
            <a href="#stakes" className="inline-flex h-[50px] items-center gap-[10px] rounded-full pl-[22px] pr-[8px] text-[15px] font-medium" style={{ background: ACCENT, color: "#12110f" }}>
              see why it matters
              <span className="flex h-[36px] w-[36px] items-center justify-center rounded-full" style={{ background: "rgba(0,0,0,0.12)" }}>↓</span>
            </a>
            <a href="https://t.me/PavanETbot" target="_blank" rel="noopener noreferrer" className="inline-flex h-[50px] items-center rounded-full border px-[22px] text-[15px] font-medium transition-colors hover:bg-white/10" style={{ borderColor: "rgba(245,240,230,0.35)", color: CREAM }}>
              try the telegram bot →
            </a>
          </motion.div>

          {/* Live AQI chip */}
          <motion.div
            className="pointer-events-none absolute right-0 top-1/2 hidden -translate-y-1/2 lg:block"
            {...(reduce ? {} : { initial: { opacity: 0, x: 24 }, animate: { opacity: 1, x: 0 }, transition: { duration: 0.8, delay: 0.5, ease: EASE } })}
          >
            <div className="rounded-[20px] border border-white/15 bg-black/35 p-[18px] backdrop-blur-md" style={{ width: 232 }}>
              <div className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.18em]" style={{ color: "rgba(245,240,230,0.7)" }}>
                <span className="ping-dot inline-block h-[7px] w-[7px] rounded-full" style={{ background: "#ef4444" }} />
                live · delhi · now
              </div>
              <div className="mt-3 flex items-end gap-2">
                <span className="font-display text-[52px] leading-[0.8]" style={{ color: CREAM }}>312</span>
                <span className="mb-1 text-[13px]" style={{ color: "#fca5a5" }}>very poor</span>
              </div>
              <div className="mt-3 h-[6px] w-full overflow-hidden rounded-full" style={{ background: "rgba(255,255,255,0.12)" }}>
                <span className="block h-full rounded-full" style={{ width: "78%", background: "linear-gradient(90deg,#fb923c,#ef4444)" }} />
              </div>
              <p className="mt-3 text-[12px]" style={{ color: "rgba(245,240,230,0.6)" }}>pm2.5 187 µg/m³ — 37× the WHO limit</p>
            </div>
          </motion.div>
        </div>

        {/* Giant wordmark bleeding off the bottom */}
        <motion.div
          aria-hidden
          className="pointer-events-none select-none text-center font-display"
          style={{ fontSize: "min(27vw, 30rem)", lineHeight: 0.78, letterSpacing: "-0.04em", color: CREAM, marginBottom: "-0.16em" }}
          {...(reduce ? {} : { initial: { opacity: 0, y: 40 }, animate: { opacity: 1, y: 0 }, transition: { duration: 0.9, delay: 0.42, ease: EASE } })}
        >
          pavan
        </motion.div>
      </div>
    </header>
  );
}
