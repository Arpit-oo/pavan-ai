"use client";

import { Reveal, Eyebrow, StatNumber, CREAM, ACCENT } from "./ui";

/**
 * The pipeline: six agents across three phases, signal → recommendation in
 * under three seconds. A dark horizontal flow band that echoes the hero/stakes
 * mood before the page returns to cream for the proof section.
 */

const PHASES = [
  { phase: "phase 1", title: "collect", agents: ["sensor agent", "weather agent"], note: "105 stations + wind, stagnation & inversion, in parallel" },
  { phase: "phase 2", title: "analyse", agents: ["anomaly agent", "attribution agent"], note: "spike detection + source decomposition with satellite & traffic" },
  { phase: "phase 3", title: "act", agents: ["enforcement agent"], note: "prioritised, evidence-backed inspector recommendations" },
];

export function Pipeline() {
  return (
    <section id="pipeline" style={{ background: "#12110f", color: CREAM }}>
      <div className="mx-auto max-w-[1240px] px-5 py-24 sm:px-8 sm:py-28">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1fr_auto] lg:items-end">
          <Reveal>
            <Eyebrow light>how it works</Eyebrow>
            <h2
              className="mt-6 max-w-[16ch] lowercase"
              style={{ fontSize: "clamp(30px, 4vw, 54px)", lineHeight: 1.02, letterSpacing: "-0.035em", fontVariationSettings: "'wght' 640, 'wdth' 92" }}
            >
              six agents. three phases. one orchestrator.
            </h2>
          </Reveal>
          <Reveal delay={0.1}>
            <div className="flex items-end gap-3">
              <StatNumber value="<3s" style={{ fontSize: "clamp(52px, 7vw, 96px)", color: ACCENT }} />
              <span className="mb-3 max-w-[14ch] text-[14px]" style={{ color: "rgba(245,240,230,0.66)" }}>signal to recommendation</span>
            </div>
          </Reveal>
        </div>

        {/* Flow */}
        <div className="mt-16 grid grid-cols-1 gap-5 lg:grid-cols-3">
          {PHASES.map((p, i) => (
            <Reveal key={p.title} delay={i * 0.1}>
              <div className="relative h-full rounded-[22px] border border-white/12 p-7" style={{ background: "rgba(255,255,255,0.03)" }}>
                <div className="flex items-center justify-between">
                  <span className="font-mono text-[10px] uppercase tracking-[0.18em]" style={{ color: "rgba(245,240,230,0.5)" }}>{p.phase}</span>
                  <span className="flex h-[26px] w-[26px] items-center justify-center rounded-full text-[12px] font-medium" style={{ background: ACCENT, color: "#12110f" }}>{i + 1}</span>
                </div>
                <h3 className="mt-3 text-[24px] lowercase" style={{ fontVariationSettings: "'wght' 640" }}>{p.title}</h3>
                <div className="mt-5 flex flex-wrap gap-2">
                  {p.agents.map((a) => (
                    <span key={a} className="rounded-full border border-white/15 px-3 py-1.5 text-[13px]" style={{ color: "rgba(245,240,230,0.9)" }}>{a}</span>
                  ))}
                </div>
                <p className="mt-5 text-[13px] leading-relaxed" style={{ color: "rgba(245,240,230,0.62)" }}>{p.note}</p>

                {/* connector arrow */}
                {i < PHASES.length - 1 && (
                  <span aria-hidden className="absolute -right-[18px] top-1/2 z-10 hidden h-[34px] w-[34px] -translate-y-1/2 items-center justify-center rounded-full lg:flex" style={{ background: ACCENT, color: "#12110f" }}>→</span>
                )}
              </div>
            </Reveal>
          ))}
        </div>

        <Reveal delay={0.1}>
          <p className="mt-8 text-[13px]" style={{ color: "rgba(245,240,230,0.5)" }}>
            <span style={{ color: ACCENT }}>+ orchestrator</span> coordinates all phases · a parallel phase-0 stream pulls satellite &amp; traffic before phase 1 even completes.
          </p>
        </Reveal>
      </div>
    </section>
  );
}
