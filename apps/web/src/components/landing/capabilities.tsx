"use client";

import { motion, useReducedMotion } from "motion/react";
import { Reveal, Eyebrow, AnimatedBar, ACCENT } from "./ui";

/**
 * "What pavan works out": the analysis layer between the raw inputs and the
 * actions. Each capability is shown with a real data-style mini-visual
 * (attribution bars, a forecast sparkline with confidence band, a before/after
 * simulation, a compound risk meter). No emoji.
 */

const ATTR = [
  { label: "vehicular", pct: 34, color: "#2563eb" },
  { label: "biomass burning", pct: 26, color: "#fb923c" },
  { label: "industrial", pct: 22, color: "#7c3aed" },
  { label: "construction dust", pct: 18, color: "#6b6a64" },
];

const RISK_FACTORS = ["aqi", "weather", "population", "vulnerability", "trend"];

export function Capabilities() {
  return (
    <section id="does" className="mx-auto max-w-[1240px] px-5 py-20 sm:px-8 sm:py-24">
      <Reveal>
        <Eyebrow>the analysis</Eyebrow>
        <h2
          className="mt-5 max-w-[20ch] lowercase"
          style={{ fontSize: "clamp(28px, 4vw, 52px)", lineHeight: 1.03, letterSpacing: "-0.035em", fontVariationSettings: "'wght' 660, 'wdth' 94" }}
        >
          raw readings, turned into answers you can trust.
        </h2>
      </Reveal>

      <div className="mt-12 grid grid-cols-1 gap-5 sm:mt-14 md:grid-cols-2">
        {/* Source attribution */}
        <Reveal delay={0}>
          <Card title="source attribution" desc="decomposes every station's pollution by source using wind, satellite no₂, fire, and traffic signals.">
            <div className="flex flex-col gap-3">
              {ATTR.map((a, i) => (
                <div key={a.label}>
                  <div className="mb-1 flex items-center justify-between text-[13px]">
                    <span className="text-muted-foreground">{a.label}</span>
                    <span style={{ fontVariationSettings: "'wght' 620" }}>{a.pct}%</span>
                  </div>
                  <AnimatedBar pct={a.pct} color={a.color} delay={i * 0.1} />
                </div>
              ))}
            </div>
          </Card>
        </Reveal>

        {/* Forecast */}
        <Reveal delay={0.06}>
          <Card title="72-hour forecast" desc="an XGBoost model predicts ward-level aqi up to three days out, with confidence bands that widen over time.">
            <Sparkline />
            <div className="mt-4 flex items-center gap-6">
              <Metric big="11.74" small="forecast RMSE" />
              <Metric big="86%" small="better than baseline" accent />
            </div>
          </Card>
        </Reveal>

        {/* Simulator */}
        <Reveal delay={0.1}>
          <Card title="intervention simulator" desc="model a policy before you order it, weighted by each station's real source mix.">
            <div className="rounded-[14px] bg-black/[0.04] p-4">
              <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground">what if we ban trucks?</p>
              <div className="mt-3 flex items-center justify-between">
                <div>
                  <span className="font-display text-[34px] leading-none">312</span>
                  <p className="text-[11px] text-muted-foreground">now</p>
                </div>
                <span className="text-[22px] text-muted-foreground">→</span>
                <div className="text-right">
                  <span className="font-display text-[34px] leading-none" style={{ color: "#166534" }}>274</span>
                  <p className="text-[11px]" style={{ color: "#166534" }}>12% less pm2.5</p>
                </div>
              </div>
            </div>
          </Card>
        </Reveal>

        {/* Compound risk score */}
        <Reveal delay={0.14}>
          <Card title="compound risk score" desc="fuses aqi, weather, population, vulnerability, and forecast trend into one 0-100 number that ranks every ward by urgency.">
            <div className="flex items-end gap-3">
              <span className="font-display text-[52px] leading-none" style={{ color: "#ef4444" }}>78</span>
              <span className="mb-2 text-[13px] text-muted-foreground">/ 100 · high</span>
            </div>
            <div className="mt-4">
              <AnimatedBar pct={78} color="linear-gradient(90deg,#fb923c,#ef4444)" delay={0.1} />
            </div>
            <div className="mt-4 flex flex-wrap gap-2">
              {RISK_FACTORS.map((f) => (
                <span key={f} className="rounded-full bg-black/5 px-3 py-1 text-[12px] text-muted-foreground">{f}</span>
              ))}
            </div>
          </Card>
        </Reveal>
      </div>
    </section>
  );
}

function Card({ title, desc, children }: { title: string; desc: string; children: React.ReactNode }) {
  return (
    <div className="flex h-full flex-col rounded-[24px] border border-black/8 bg-card p-6 transition-shadow hover:shadow-[0_10px_30px_rgba(0,0,0,0.06)] sm:p-7">
      <h3 className="text-[19px] lowercase" style={{ fontVariationSettings: "'wght' 660" }}>{title}</h3>
      <p className="mt-2 mb-6 text-[14px] leading-relaxed text-muted-foreground">{desc}</p>
      <div className="mt-auto">{children}</div>
    </div>
  );
}

function Metric({ big, small, accent }: { big: string; small: string; accent?: boolean }) {
  return (
    <div>
      <span className="font-display text-[30px] leading-none" style={{ color: accent ? ACCENT : undefined }}>{big}</span>
      <p className="mt-1 text-[11px] text-muted-foreground">{small}</p>
    </div>
  );
}

/** Simple forecast sparkline with a widening confidence band. */
function Sparkline() {
  const pts = [38, 34, 40, 52, 60, 55, 48, 44, 50];
  const w = 320, h = 84, max = 72, min = 28;
  const x = (i: number) => (i / (pts.length - 1)) * w;
  const y = (v: number) => h - ((v - min) / (max - min)) * h;
  const line = pts.map((v, i) => `${i === 0 ? "M" : "L"}${x(i).toFixed(1)},${y(v).toFixed(1)}`).join(" ");
  const bandTop = pts.map((v, i) => `${i === 0 ? "M" : "L"}${x(i).toFixed(1)},${y(v + (i + 1) * 1.3).toFixed(1)}`).join(" ");
  const bandBot = pts.map((v, i) => `L${x(pts.length - 1 - i).toFixed(1)},${y(pts[pts.length - 1 - i] - (pts.length - i) * 1.3).toFixed(1)}`).join(" ");
  return <SparklineSvg w={w} h={h} line={line} band={`${bandTop} ${bandBot} Z`} />;
}

function SparklineSvg({ w, h, line, band }: { w: number; h: number; line: string; band: string }) {
  const reduce = useReducedMotion();
  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="w-full" style={{ height: 84 }} preserveAspectRatio="none">
      <motion.path
        d={band}
        fill={ACCENT}
        initial={reduce ? false : { opacity: 0 }}
        whileInView={{ opacity: 0.14 }}
        viewport={{ once: true, margin: "-40px" }}
        transition={{ duration: 0.8, delay: 0.5 }}
      />
      <motion.path
        d={line}
        fill="none"
        stroke={ACCENT}
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        initial={reduce ? false : { pathLength: 0 }}
        whileInView={{ pathLength: 1 }}
        viewport={{ once: true, margin: "-40px" }}
        transition={{ duration: 1.1, ease: [0.21, 0.6, 0.35, 1] }}
      />
    </svg>
  );
}
