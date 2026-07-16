"use client";

import { useState, useEffect } from "react";
import { fetchAPI, getAQIGradientColor } from "@/lib/api";
import Link from "next/link";

interface InterventionType {
  type: string;
  description: string;
  pm25_reduction_pct: number;
  pm10_reduction_pct: number;
  time_to_effect: string;
}

interface StationImpact {
  station_name: string;
  before: { aqi: number; pm25: number };
  after: { aqi: number; pm25: number };
  reduction: { aqi_points: number; aqi_pct: number; pm25_pct: number };
}

interface SimResult {
  intervention: string;
  description: string;
  city_impact: {
    avg_aqi_before: number;
    avg_aqi_after: number;
    aqi_reduction: number;
    aqi_reduction_pct: number;
    stations_improved: number;
  };
  station_impacts: StationImpact[];
  implementation: { time_to_effect: string; affected_radius_km: number; precedent: string };
}

interface CompareResult {
  comparisons: {
    intervention: string;
    description: string;
    avg_aqi_reduction: number;
    reduction_pct: number;
    time_to_effect: string;
    stations_improved: number;
  }[];
  recommended: string;
}

const INTERVENTION_COLORS: Record<string, string> = {
  truck_ban: "var(--entity-forecast)",
  construction_halt: "var(--entity-moderate)",
  industrial_shutdown: "var(--entity-severe)",
  odd_even: "var(--entity-wind)",
  burning_ban: "var(--entity-poor)",
};

const INTERVENTION_FG: Record<string, string> = {
  truck_ban: "#ffffff",
  construction_halt: "#1a1a18",
  industrial_shutdown: "#ffffff",
  odd_even: "#0a0a08",
  burning_ban: "#ffffff",
};

const INTERVENTION_ICONS: Record<string, string> = {
  truck_ban: "🚛",
  construction_halt: "🏗️",
  industrial_shutdown: "🏭",
  odd_even: "🚗",
  burning_ban: "🔥",
};

function Sticker({ children, tilt = -3, dark = false }: { children: React.ReactNode; tilt?: number; dark?: boolean }) {
  return (
    <span
      style={{ transform: `rotate(${tilt}deg)` }}
      className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 font-mono text-[10px] font-semibold uppercase tracking-[0.16em] shadow-[0_1px_3px_rgba(0,0,0,0.08)] ${
        dark ? "bg-[#0a0a0c] text-[#f5f0e6]" : "bg-white text-[#0a0a0c]"
      }`}
    >
      {children}
    </span>
  );
}

export default function SimulatePage() {
  const [types, setTypes] = useState<InterventionType[]>([]);
  const [selected, setSelected] = useState<string | null>(null);
  const [result, setResult] = useState<SimResult | null>(null);
  const [comparison, setComparison] = useState<CompareResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [compareLoading, setCompareLoading] = useState(false);

  useEffect(() => {
    fetchAPI<{ interventions: InterventionType[] }>("/api/v1/simulate/types")
      .then((res) => setTypes(res.interventions))
      .catch(() => {
        setTypes([
          { type: "truck_ban", description: "Ban heavy trucks from city limits during specified hours", pm25_reduction_pct: 12, pm10_reduction_pct: 18, time_to_effect: "4-6 hours" },
          { type: "construction_halt", description: "Halt construction activity and mandate dust suppression", pm25_reduction_pct: 5, pm10_reduction_pct: 25, time_to_effect: "2-4 hours" },
          { type: "industrial_shutdown", description: "Temporary shutdown of non-essential industrial units", pm25_reduction_pct: 15, pm10_reduction_pct: 10, time_to_effect: "12-24 hours" },
          { type: "odd_even", description: "Odd-even vehicle rationing scheme", pm25_reduction_pct: 8, pm10_reduction_pct: 6, time_to_effect: "24-48 hours" },
          { type: "burning_ban", description: "Strict enforcement against open burning", pm25_reduction_pct: 20, pm10_reduction_pct: 15, time_to_effect: "immediate" },
        ]);
      });
  }, []);

  const runSimulation = async (type: string) => {
    setSelected(type);
    setLoading(true);
    try {
      const res = await fetchAPI<SimResult>("/api/v1/simulate/run", {
        method: "POST",
        body: JSON.stringify({ intervention_type: type, city: "Delhi" }),
      });
      setResult(res);
    } catch {
      setResult(null);
    } finally {
      setLoading(false);
    }
  };

  const runComparison = async () => {
    setCompareLoading(true);
    try {
      const res = await fetchAPI<CompareResult>("/api/v1/simulate/compare?city=Delhi");
      setComparison(res);
    } catch {
      setComparison(null);
    } finally {
      setCompareLoading(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen">
      <header className="sticky top-0 z-50 bg-background/85 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6">
          <div className="flex items-center gap-5">
            <Link href="/" className="flex items-baseline gap-0.5 text-lg">
              <span style={{ fontVariationSettings: "'wght' 720, 'wdth' 94" }}>pavan</span>
              <span className="inline-block h-[8px] w-[8px] translate-y-[-2px] rounded-full" style={{ background: "var(--entity-forecast)" }} />
            </Link>
            <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground bg-secondary px-2.5 py-1 rounded-full">
              simulator
            </span>
          </div>
          <Link href="/" className="ru-pill !text-[12px] !px-3 !py-1.5">← dashboard</Link>
        </div>
        <div className="pointer-events-none h-[2px] opacity-90" style={{ background: "linear-gradient(90deg, transparent 0%, var(--entity-forecast) 30%, var(--entity-forecast) 70%, transparent 100%)" }} />
      </header>

      <main className="flex-1 overflow-y-auto">
        <div className="mx-auto max-w-7xl px-4 pt-6 pb-16 sm:px-6 space-y-6">
          <header className="flex flex-col gap-2.5">
            <div className="font-mono text-[11px] uppercase tracking-[0.22em] text-muted-foreground">
              counterfactual analysis
            </div>
            <h1 className="lowercase leading-[0.95]" style={{ fontSize: "clamp(36px, 5.6vw, 56px)", fontVariationSettings: "'wght' 760, 'wdth' 94, 'opsz' 72", letterSpacing: "-0.035em" }}>
              what happens if we...
            </h1>
            <p className="max-w-[60ch] text-[14px] leading-[1.45] text-muted-foreground" style={{ fontVariationSettings: "'wght' 460, 'wdth' 96" }}>
              select an intervention to model its projected aqi impact across delhi stations
            </p>
          </header>

          <div className="grid grid-cols-1 gap-3 md:grid-cols-3 lg:grid-cols-5">
            {types.map((t) => (
              <div
                key={t.type}
                className={`ru-bento cursor-pointer ${selected === t.type ? "ring-2 ring-foreground/20" : ""}`}
                style={{
                  "--bento-bg": INTERVENTION_COLORS[t.type] || "var(--card)",
                  "--bento-fg": INTERVENTION_FG[t.type] || "var(--card-foreground)",
                } as React.CSSProperties}
                onClick={() => runSimulation(t.type)}
              >
                <div className="flex flex-col p-5">
                  <div className="flex items-start justify-between">
                    <span className="text-2xl">{INTERVENTION_ICONS[t.type]}</span>
                    <Sticker tilt={2}>{t.time_to_effect}</Sticker>
                  </div>
                  <p className="mt-3 text-[14px] lowercase" style={{ fontVariationSettings: "'wght' 620" }}>
                    {t.type.replace(/_/g, " ")}
                  </p>
                  <p className="mt-1 text-[12px] opacity-70 leading-snug lowercase">
                    {t.description.toLowerCase()}
                  </p>
                  <div className="mt-3 flex gap-2">
                    <span className="font-mono text-[10px] uppercase tracking-wider bg-white/20 rounded-full px-2 py-0.5">
                      pm2.5 -{t.pm25_reduction_pct}%
                    </span>
                    <span className="font-mono text-[10px] uppercase tracking-wider bg-white/20 rounded-full px-2 py-0.5">
                      pm10 -{t.pm10_reduction_pct}%
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {loading && (
            <div className="flex items-center justify-center py-12">
              <div className="w-6 h-6 border-2 border-foreground/30 border-t-foreground rounded-full animate-spin" />
            </div>
          )}

          {result && !loading && (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
              <div className="ru-bento" style={{ "--bento-bg": "var(--entity-good)", "--bento-fg": "#ffffff" } as React.CSSProperties}>
                <div className="p-6">
                  <div className="font-mono text-[10px] uppercase tracking-[0.18em] opacity-70 mb-2">aqi reduction</div>
                  <span className="font-display leading-[0.82] tracking-[-0.04em]" style={{ fontSize: "clamp(56px, 8vw, 72px)" }}>
                    -{result.city_impact.aqi_reduction.toFixed(0)}
                  </span>
                  <p className="mt-2 font-mono text-[10px] uppercase tracking-wider opacity-70">
                    {result.city_impact.aqi_reduction_pct.toFixed(1)}% improvement
                  </p>
                </div>
              </div>

              <div className="ru-bento">
                <div className="p-6">
                  <div className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground mb-2">before</div>
                  <span className="font-display leading-[0.82] tracking-[-0.04em]" style={{ fontSize: "clamp(48px, 6vw, 64px)", color: getAQIGradientColor(result.city_impact.avg_aqi_before) }}>
                    {result.city_impact.avg_aqi_before}
                  </span>
                </div>
              </div>

              <div className="ru-bento">
                <div className="p-6">
                  <div className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground mb-2">after</div>
                  <span className="font-display leading-[0.82] tracking-[-0.04em]" style={{ fontSize: "clamp(48px, 6vw, 64px)", color: getAQIGradientColor(result.city_impact.avg_aqi_after) }}>
                    {result.city_impact.avg_aqi_after}
                  </span>
                </div>
              </div>

              <div className="ru-bento" style={{ "--bento-bg": "var(--entity-charcoal)", "--bento-fg": "var(--entity-charcoal-fg)" } as React.CSSProperties}>
                <div className="p-6">
                  <div className="font-mono text-[10px] uppercase tracking-[0.18em] opacity-70 mb-2">precedent</div>
                  <p className="text-[13px] leading-snug opacity-80 lowercase">{result.implementation.precedent.toLowerCase()}</p>
                </div>
              </div>
            </div>
          )}

          {result && !loading && (
            <div className="ru-bento">
              <div className="p-6">
                <div className="flex items-center gap-2.5 border-b border-[var(--hairline-soft)] pb-2 mb-4">
                  <span className="inline-block h-2 w-2 rounded-[2px]" style={{ background: INTERVENTION_COLORS[selected || ""] }} />
                  <span className="font-mono text-[10px] uppercase tracking-[0.2em]">station impact</span>
                  <span className="ml-auto font-mono text-[10px] tabular-nums text-muted-foreground">
                    {result.station_impacts.length.toString().padStart(2, "0")} stations
                  </span>
                </div>
                <div className="space-y-1">
                  {result.station_impacts.slice(0, 8).map((s, i) => (
                    <div key={i} className="flex items-center gap-3 py-1.5">
                      <span className="w-4 font-mono text-[10px] text-muted-foreground tabular-nums">{(i + 1).toString().padStart(2, "0")}</span>
                      <span className="flex-1 text-[13px] truncate lowercase">{s.station_name.split(",")[0].toLowerCase()}</span>
                      <span className="font-mono text-[12px] tabular-nums" style={{ color: getAQIGradientColor(s.before.aqi) }}>{s.before.aqi}</span>
                      <span className="text-muted-foreground text-[10px]">→</span>
                      <span className="font-mono text-[12px] tabular-nums" style={{ color: getAQIGradientColor(s.after.aqi) }}>{s.after.aqi}</span>
                      <span className="font-mono text-[11px] tabular-nums text-green-600 w-12 text-right">-{s.reduction.aqi_points}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          <div className="pt-4">
            <button onClick={runComparison} disabled={compareLoading} className="ru-pill">
              {compareLoading ? "comparing..." : "compare all interventions →"}
            </button>

            {comparison && (
              <div className="mt-4 ru-bento">
                <div className="p-6">
                  <div className="flex items-center gap-2.5 border-b border-[var(--hairline-soft)] pb-2 mb-4">
                    <span className="inline-block h-2 w-2 rounded-[2px]" style={{ background: "var(--entity-forecast)" }} />
                    <span className="font-mono text-[10px] uppercase tracking-[0.2em]">comparison</span>
                  </div>
                  <div className="space-y-3">
                    {comparison.comparisons.map((c) => {
                      const isRec = c.intervention === comparison.recommended;
                      const barW = Math.max(8, (c.avg_aqi_reduction / (comparison.comparisons[0]?.avg_aqi_reduction || 1)) * 100);
                      return (
                        <div key={c.intervention} className={`flex items-center gap-4 ${isRec ? "py-2 px-3 rounded-2xl bg-secondary" : ""}`}>
                          <span className="text-xl w-8">{INTERVENTION_ICONS[c.intervention]}</span>
                          <div className="w-32 shrink-0">
                            <p className="text-[13px] lowercase" style={{ fontVariationSettings: "'wght' 580" }}>
                              {c.intervention.replace(/_/g, " ")}
                              {isRec && <span className="ml-2 font-mono text-[9px] uppercase tracking-wider text-green-600 bg-green-50 px-1.5 py-0.5 rounded-full">best</span>}
                            </p>
                            <p className="font-mono text-[10px] text-muted-foreground">{c.time_to_effect}</p>
                          </div>
                          <div className="flex-1 h-3 bg-secondary rounded-full overflow-hidden">
                            <div className="h-full rounded-full transition-all" style={{ width: `${barW}%`, background: INTERVENTION_COLORS[c.intervention] }} />
                          </div>
                          <span className="font-display text-xl tabular-nums text-green-600 w-16 text-right">-{c.avg_aqi_reduction.toFixed(0)}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
