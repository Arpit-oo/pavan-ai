"use client";

import { Reveal, Eyebrow, ACCENT } from "./ui";

/**
 * "What pavan does about it": the outputs, not the inputs. Three concrete
 * artifacts pavan generates for each audience, so the promise that it *acts*
 * (rather than just measuring) is shown, not just claimed:
 *   1. an enforcement directive for officials,
 *   2. an auto-tracked GRAP compliance report for government,
 *   3. the health advisory citizens actually receive.
 */

const EVIDENCE = [
  { k: "satellite no₂", v: "spike +38%" },
  { k: "wind backtrace", v: "4 km/h from NW" },
  { k: "flagged sources", v: "2 unregistered units" },
];

const GRAP_ACTIONS = [
  { label: "mechanised road sweeping", done: true },
  { label: "water sprinkling on roads", done: true },
  { label: "construction & demolition halt", done: false },
  { label: "non-essential truck entry ban", done: false },
];

const LANGS = ["english", "हिन्दी", "தமிழ்", "বাংলা"];

export function Acts() {
  return (
    <section id="acts" className="mx-auto max-w-[1240px] px-5 py-20 sm:px-8 sm:py-24">
      <Reveal>
        <Eyebrow>what pavan does about it</Eyebrow>
        <h2
          className="mt-5 max-w-[20ch] lowercase"
          style={{ fontSize: "clamp(28px, 4vw, 52px)", lineHeight: 1.03, letterSpacing: "-0.035em", fontVariationSettings: "'wght' 660, 'wdth' 94" }}
        >
          it doesn&apos;t just measure the air. it tells each side exactly what to do.
        </h2>
        <p className="mt-5 max-w-[60ch] text-[16px] leading-relaxed text-muted-foreground sm:text-[17px]">
          the moment a reading turns actionable, pavan writes the output for whoever can move on it, an
          inspector, a control room, or a family, each in the form they can act on.
        </p>
      </Reveal>

      <div className="mt-12 grid grid-cols-1 gap-5 lg:grid-cols-3">
        {/* Enforcement directive */}
        <Reveal delay={0}>
          <Artifact audience="for officials" badge="priority 1" badgeAccent>
            <p className="text-[17px] leading-snug" style={{ fontVariationSettings: "'wght' 620" }}>
              dispatch inspection team to anand vihar industrial cluster
            </p>
            <div className="mt-5 flex flex-col gap-2.5">
              {EVIDENCE.map((e) => (
                <div key={e.k} className="flex items-center justify-between border-b border-black/5 pb-2 text-[13px]">
                  <span className="text-muted-foreground">{e.k}</span>
                  <span style={{ fontVariationSettings: "'wght' 600" }}>{e.v}</span>
                </div>
              ))}
            </div>
            <p className="mt-5 font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
              confidence 87% · issued 14:32 · directive #A-1182
            </p>
          </Artifact>
        </Reveal>

        {/* GRAP report */}
        <Reveal delay={0.08}>
          <Artifact audience="for government" badge="grap stage III" badgeAccent>
            <p className="text-[17px] leading-snug" style={{ fontVariationSettings: "'wght' 620" }}>
              graded-response actions, auto-tracked
            </p>
            <div className="mt-5 flex flex-col gap-3">
              {GRAP_ACTIONS.map((a) => (
                <div key={a.label} className="flex items-center gap-3 text-[14px]">
                  {a.done ? <CheckIcon /> : <PendingIcon />}
                  <span style={a.done ? { color: "var(--muted-foreground)" } : { fontVariationSettings: "'wght' 560" }}>{a.label}</span>
                </div>
              ))}
            </div>
            <p className="mt-5 font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
              12 of 15 actions verified · report sent to DPCC
            </p>
          </Artifact>
        </Reveal>

        {/* Citizen advisory */}
        <Reveal delay={0.16}>
          <Artifact audience="for citizens" badge="4 languages">
            <div className="rounded-[16px] rounded-tl-[4px] bg-black/[0.04] p-4 text-[14px] leading-relaxed">
              <span style={{ fontVariationSettings: "'wght' 620" }}>air alert, delhi.</span> aqi 312, very poor.
              avoid outdoor exercise 6 to 9 am. sensitive groups stay indoors. an N95 mask helps.
            </div>
            <div className="mt-4 flex flex-wrap gap-2">
              {LANGS.map((l, i) => (
                <span
                  key={l}
                  className="rounded-full px-3 py-1.5 text-[12px]"
                  style={i === 0 ? { background: ACCENT, color: "#12110f" } : { background: "rgba(0,0,0,0.05)", color: "var(--muted-foreground)" }}
                >
                  {l}
                </span>
              ))}
            </div>
            <p className="mt-5 font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
              delivered on telegram, email, whatsapp
            </p>
          </Artifact>
        </Reveal>
      </div>
    </section>
  );
}

function Artifact({
  audience,
  badge,
  badgeAccent,
  children,
}: {
  audience: string;
  badge: string;
  badgeAccent?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-full flex-col rounded-[24px] border border-black/8 bg-card p-6 transition-shadow hover:shadow-[0_10px_30px_rgba(0,0,0,0.06)] sm:p-7">
      <div className="mb-5 flex items-center justify-between">
        <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">{audience}</span>
        <span
          className="rounded-full px-2.5 py-1 text-[11px] font-medium"
          style={badgeAccent ? { background: "rgba(251,146,60,0.16)", color: "#9a4a10" } : { background: "rgba(0,0,0,0.05)", color: "var(--muted-foreground)" }}
        >
          {badge}
        </span>
      </div>
      <div className="mt-auto">{children}</div>
    </div>
  );
}

function CheckIcon() {
  return (
    <span className="flex h-[20px] w-[20px] shrink-0 items-center justify-center rounded-full" style={{ background: "#16653420", color: "#166534" }}>
      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
        <path d="M20 6L9 17l-5-5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </span>
  );
}

function PendingIcon() {
  return <span className="h-[20px] w-[20px] shrink-0 rounded-full border-2 border-dashed" style={{ borderColor: "rgba(0,0,0,0.2)" }} />;
}
