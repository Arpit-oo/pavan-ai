"use client";

import Image from "next/image";
import Link from "next/link";
import { motion, useReducedMotion, useScroll, useTransform } from "motion/react";
import { CREAM, ACCENT } from "./ui";

/**
 * Hero: full-bleed Delhi-smog photograph with the page's own dark nav layered
 * on, an emotional headline, a live-AQI glass chip, and the giant "pavan"
 * wordmark sitting fully visible as a masthead above the next section.
 */

const NAV = [
  { label: "the problem", href: "#stakes" },
  { label: "what it does", href: "#does" },
  { label: "how it acts", href: "#acts" },
  { label: "proof", href: "#proof" },
];

const EASE = [0.21, 0.6, 0.35, 1] as const;

export function Hero() {
  const reduce = useReducedMotion();
  const { scrollY } = useScroll();
  const imgY = useTransform(scrollY, [0, 900], [0, 150]);
  const enter = (delay: number) =>
    reduce
      ? {}
      : {
          initial: { opacity: 0, y: 18 },
          animate: { opacity: 1, y: 0 },
          transition: { duration: 0.7, delay, ease: EASE },
        };

  return (
    <header className="relative flex min-h-[100svh] flex-col overflow-hidden" style={{ background: "#0d0c0b" }}>
      {/* Background photo (entrance + scroll parallax) */}
      <motion.div className="absolute inset-0 will-change-transform" style={reduce ? undefined : { y: imgY }}>
        {/* The air "clears": image starts hazy + monochrome, then resolves to
            full colour as pavan brings clarity (blooms in with the wordmark). */}
        <motion.div
          className="absolute inset-0 will-change-[filter,transform]"
          style={{ top: -80, bottom: -80 }}
          {...(reduce
            ? {}
            : {
                initial: { scale: 1.12, opacity: 0.45, filter: "grayscale(1) saturate(0.35) blur(9px) brightness(0.82)" },
                animate: { scale: 1, opacity: 1, filter: "grayscale(0) saturate(1) blur(0px) brightness(1)" },
                transition: {
                  scale: { duration: 2.6, ease: EASE },
                  opacity: { duration: 1.1, ease: EASE },
                  filter: { duration: 12, delay: 0, ease: [0.3, 0.7, 0.2, 1] },
                },
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
        </motion.div>
        {/* Flat black tint over the whole image, lifts slightly as it clears */}
        <motion.div
          aria-hidden
          className="absolute inset-0"
          {...(reduce
            ? { style: { background: "rgba(0,0,0,0.38)" } }
            : {
                initial: { backgroundColor: "rgba(0,0,0,0.62)" },
                animate: { backgroundColor: "rgba(0,0,0,0.38)" },
                transition: { duration: 2.8, delay: 0.5, ease: [0.3, 0.7, 0.2, 1] },
              })}
        />
        {/* Legibility + blend-to-black at the bottom for the wordmark */}
        <div aria-hidden className="absolute inset-0" style={{ background: "linear-gradient(180deg, rgba(8,7,6,0.58) 0%, rgba(8,7,6,0.14) 28%, rgba(8,7,6,0.35) 60%, rgba(8,7,6,0.94) 100%)" }} />
      </motion.div>

      {/* Foreground content (nav + headline) */}
      <div className="relative z-10 mx-auto flex w-full max-w-[1240px] flex-1 flex-col px-5 pt-3 sm:px-8 sm:pt-5" style={{ color: CREAM }}>
        {/* Nav */}
        <motion.nav className="flex h-[60px] items-center justify-between sm:h-[64px]" {...enter(0.05)}>
          <Link href="/" className="flex items-baseline gap-[1px] text-[22px] sm:text-[24px]" style={{ fontVariationSettings: "'wght' 720, 'wdth' 94" }}>
            pavan<span style={{ color: ACCENT }}>.</span>
          </Link>
          <div className="hidden items-center gap-[26px] text-[14px] lg:flex" style={{ color: "rgba(245,240,230,0.8)" }}>
            {NAV.map((n) => (
              <a key={n.href} href={n.href} className="transition-opacity hover:opacity-70">
                {n.label}
              </a>
            ))}
          </div>
          <Link
            href="/dashboard"
            className="inline-flex h-[40px] items-center rounded-full px-[16px] text-[13px] font-medium transition-transform hover:-translate-y-[1px] sm:h-[42px] sm:px-[20px] sm:text-[14px]"
            style={{ background: CREAM, color: "#12110f" }}
          >
            open dashboard →
          </Link>
        </motion.nav>

        <div className="h-px w-full" style={{ background: "rgba(245,240,230,0.16)" }} />

        {/* Sub row */}
        <motion.div className="flex h-[46px] items-center justify-between font-mono text-[10px] uppercase tracking-[0.16em] sm:h-[52px] sm:text-[11px] sm:tracking-[0.2em]" style={{ color: "rgba(245,240,230,0.68)" }} {...enter(0.12)}>
          <span>urban air intelligence</span>
          <span className="hidden sm:block">57 cities · 105 stations · india</span>
        </motion.div>

        {/* Headline block */}
        <div className="relative flex flex-1 flex-col justify-center py-8 sm:py-10">
          <motion.h1
            className="max-w-[16ch] lowercase"
            style={{ fontSize: "clamp(34px, 6vw, 78px)", lineHeight: 0.98, letterSpacing: "-0.04em", fontVariationSettings: "'wght' 680, 'wdth' 92, 'opsz' 72" }}
            {...enter(0.2)}
          >
            the air india breathes,
            <br />
            <span style={{ color: ACCENT }}>understood</span> in real time.
          </motion.h1>
          <motion.p
            className="mt-5 max-w-[52ch] text-[16px] leading-relaxed sm:mt-6 sm:text-[19px]"
            style={{ color: "rgba(245,240,230,0.82)", fontVariationSettings: "'wght' 460" }}
            {...enter(0.28)}
          >
            pavan fuses five live data sources through a six-agent AI pipeline that turns raw pollution
            numbers into source attribution, forecasts, and enforcement-ready action, in under three seconds.
          </motion.p>
          <motion.div className="mt-7 flex flex-wrap items-center gap-3 sm:mt-8" {...enter(0.36)}>
            <a href="#stakes" className="inline-flex h-[48px] items-center gap-[10px] rounded-full pl-[20px] pr-[8px] text-[14px] font-medium sm:h-[50px] sm:pl-[22px] sm:text-[15px]" style={{ background: ACCENT, color: "#12110f" }}>
              see why it matters
              <span className="flex h-[34px] w-[34px] items-center justify-center rounded-full sm:h-[36px] sm:w-[36px]" style={{ background: "rgba(0,0,0,0.12)" }}>↓</span>
            </a>
            <a href="https://t.me/PavanETbot" target="_blank" rel="noopener noreferrer" className="inline-flex h-[48px] items-center rounded-full border px-[20px] text-[14px] font-medium transition-colors hover:bg-white/10 sm:h-[50px] sm:px-[22px] sm:text-[15px]" style={{ borderColor: "rgba(245,240,230,0.35)", color: CREAM }}>
              try the telegram bot →
            </a>
          </motion.div>

          {/* Live AQI chip: in flow on mobile, floating on desktop */}
          <motion.div
            className="mt-8 w-full max-w-[300px] lg:absolute lg:right-0 lg:top-1/2 lg:mt-0 lg:w-[232px] lg:-translate-y-1/2"
            {...(reduce ? {} : { initial: { opacity: 0, y: 16 }, animate: { opacity: 1, y: 0 }, transition: { duration: 0.8, delay: 0.5, ease: EASE } })}
          >
            <div className="rounded-[20px] border border-white/15 bg-black/40 p-[18px] backdrop-blur-md">
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
              <p className="mt-3 text-[12px]" style={{ color: "rgba(245,240,230,0.6)" }}>pm2.5 187 µg/m³, 37× the WHO limit</p>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Giant wordmark: full-width, fully visible, sitting above the next section */}
      <div className="relative z-10 w-full overflow-hidden px-4 pb-4 sm:pb-6">
        <motion.div
          aria-hidden
          className="select-none text-center font-display leading-[0.86]"
          style={{ fontSize: "min(22vw, 15rem)", letterSpacing: "-0.05em", color: CREAM }}
          {...(reduce ? {} : { initial: { opacity: 0, y: 40 }, animate: { opacity: 1, y: 0 }, transition: { duration: 0.9, delay: 0.42, ease: EASE } })}
        >
          pavan<span style={{ color: ACCENT }}>.</span>
        </motion.div>
      </div>
    </header>
  );
}
