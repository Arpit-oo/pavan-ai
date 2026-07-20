"use client";

import Link from "next/link";
import { motion, useReducedMotion, useInView, animate } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

/**
 * Shared atoms for the pavan landing page. Ported from the Stryde reference
 * and re-tuned to pavan's warm-cream / AQI-orange system. The landing runs
 * two moods — dark cinematic sections and warm editorial sections — so most
 * atoms take a `light` flag that flips their palette for dark backgrounds.
 */

export const INK = "#12110f"; // warm near-black used for dark sections
export const CREAM = "#f5f0e6";
export const ACCENT = "#fb923c"; // AQI orange — the brand "."

const EASE = [0.21, 0.6, 0.35, 1] as const;

/** Scroll-reveal wrapper: fade + rise once when entering the viewport. */
export function Reveal({
  children,
  delay = 0,
  y = 26,
  className,
}: {
  children: React.ReactNode;
  delay?: number;
  y?: number;
  className?: string;
}) {
  const reduce = useReducedMotion();
  if (reduce) return <div className={className}>{children}</div>;
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.65, delay, ease: EASE }}
    >
      {children}
    </motion.div>
  );
}

/** "• LABEL" mono eyebrow with a small accent marker. */
export function Eyebrow({
  children,
  light = false,
  tone = ACCENT,
  className,
}: {
  children: React.ReactNode;
  light?: boolean;
  tone?: string;
  className?: string;
}) {
  return (
    <p
      className={cn(
        "flex items-center gap-[9px] font-mono text-[11px] uppercase tracking-[0.2em]",
        className,
      )}
      style={{ color: light ? "rgba(245,240,230,0.72)" : "var(--muted-foreground)" }}
    >
      <span className="h-[6px] w-[6px] shrink-0 rounded-full" style={{ background: tone }} />
      {children}
    </p>
  );
}

/**
 * A real photo inlined inside a display heading — zooms a photo into a
 * rounded pill so a headline word carries an image. Decorative only.
 */
export function HeadingChip({
  src,
  position = "50% 50%",
  size = "260%",
  className,
}: {
  src: string;
  position?: string;
  size?: string;
  className?: string;
}) {
  return (
    <span
      aria-hidden
      className={cn(
        "mx-[0.12em] inline-block h-[0.82em] w-[1.5em] translate-y-[0.12em] rounded-full ring-1 ring-black/10",
        className,
      )}
      style={{ backgroundImage: `url(${src})`, backgroundSize: size, backgroundPosition: position }}
    />
  );
}

/** Frosted card that floats over photography. */
export function GlassCard({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "rounded-[18px] border border-white/60 bg-white/85 p-[16px] shadow-[0_12px_40px_rgba(0,0,0,0.18)] backdrop-blur-md",
        className,
      )}
    >
      {children}
    </div>
  );
}

/**
 * Giant Fraunces display number that counts up and "focuses in" from blur
 * when scrolled into view — the sharpening echoes the page's clarity theme.
 * Parses a leading/trailing non-numeric part so mixed values ("1.6M", "13 / 20",
 * "<3s", "86%") animate their numeric core while keeping their affixes.
 */
export function StatNumber({
  value,
  className,
  style,
}: {
  value: string;
  className?: string;
  style?: React.CSSProperties;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });
  const reduce = useReducedMotion();
  const m = value.match(/^(\D*)([\d.,]+)(.*)$/);
  const [display, setDisplay] = useState(reduce || !m ? value : `${m[1]}0${m[3]}`);

  useEffect(() => {
    if (reduce || !m) {
      setDisplay(value);
      return;
    }
    if (!inView) return;
    const target = parseFloat(m[2].replace(/,/g, ""));
    const decimals = (m[2].split(".")[1] || "").length;
    const controls = animate(0, target, {
      duration: 1.1,
      ease: [0.21, 0.6, 0.35, 1],
      onUpdate: (v) => setDisplay(`${m[1]}${v.toFixed(decimals)}${m[3]}`),
    });
    return () => controls.stop();
  }, [inView, value, reduce]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <motion.span
      ref={ref}
      className={cn("font-display block leading-[0.9] tracking-[-0.02em]", className)}
      style={style}
      initial={reduce ? false : { opacity: 0, filter: "blur(14px)" }}
      animate={inView ? { opacity: 1, filter: "blur(0px)" } : undefined}
      transition={{ duration: 0.7, ease: [0.21, 0.6, 0.35, 1] }}
    >
      {display}
    </motion.span>
  );
}

/** Track bar that fills from 0 to its width when scrolled into view. */
export function AnimatedBar({
  pct,
  color,
  delay = 0,
  track = "rgba(0,0,0,0.06)",
}: {
  pct: number;
  color: string;
  delay?: number;
  track?: string;
}) {
  const reduce = useReducedMotion();
  return (
    <div className="h-[8px] w-full overflow-hidden rounded-full" style={{ background: track }}>
      <motion.span
        className="block h-full rounded-full"
        style={{ background: color }}
        initial={reduce ? false : { width: 0 }}
        whileInView={{ width: `${pct}%` }}
        viewport={{ once: true, margin: "-40px" }}
        transition={{ duration: 0.9, delay, ease: [0.21, 0.6, 0.35, 1] }}
      />
    </div>
  );
}

/** Pill CTA — dark by default, `accent` for the orange primary action. */
export function Pill({
  href,
  children,
  accent = false,
  external = false,
  className,
}: {
  href: string;
  children: React.ReactNode;
  accent?: boolean;
  external?: boolean;
  className?: string;
}) {
  const cls = cn(
    "group inline-flex h-[50px] items-center gap-[10px] rounded-full pl-[22px] pr-[8px] text-[15px] font-medium transition-transform hover:-translate-y-[1px] active:translate-y-0",
    className,
  );
  const style: React.CSSProperties = accent
    ? { background: ACCENT, color: INK }
    : { background: INK, color: CREAM };
  const inner = (
    <>
      {children}
      <span
        className="flex h-[36px] w-[36px] items-center justify-center rounded-full transition-transform group-hover:translate-x-[2px]"
        style={{ background: accent ? "rgba(0,0,0,0.12)" : "rgba(255,255,255,0.14)" }}
      >
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
          <path d="M5 12h14M13 6l6 6-6 6" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </span>
    </>
  );
  if (external) {
    return (
      <a href={href} target="_blank" rel="noopener noreferrer" className={cls} style={style}>
        {inner}
      </a>
    );
  }
  return (
    <Link href={href} className={cls} style={style}>
      {inner}
    </Link>
  );
}
