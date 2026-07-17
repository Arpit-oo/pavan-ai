"use client";

import { useState, useEffect } from "react";
import { fetchAPI, getAQIGradientColor } from "@/lib/api";
import NavBar from "@/components/nav/navbar";

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

const CARDS: { type: string; icon: string; color: string; fg: string; span?: string }[] = [
  { type: "truck_ban", icon: "🚛", color: "var(--entity-forecast)", fg: "#fff", span: "md:col-span-1 md:row-span-2" },
  { type: "construction_halt", icon: "🏗️", color: "var(--entity-moderate)", fg: "#1a1a18" },
  { type: "industrial_shutdown", icon: "🏭", color: "var(--entity-severe)", fg: "#fff" },
  { type: "odd_even", icon: "🚗", color: "var(--entity-wind)", fg: "#0a0a08" },
  { type: "burning_ban", icon: "🔥", color: "var(--entity-poor)", fg: "#fff", span: "md:col-span-1 md:row-span-2" },
];

const COLORS: Record<string, string> = {
  truck_ban: "var(--entity-forecast)", construction_halt: "var(--entity-moderate)",
  industrial_shutdown: "var(--entity-severe)", odd_even: "var(--entity-wind)", burning_ban: "var(--entity-poor)",
};

const MOCK_TYPES: InterventionType[] = [
  { type: "truck_ban", description: "Ban heavy trucks from city limits during specified hours", pm25_reduction_pct: 12, pm10_reduction_pct: 18, time_to_effect: "4-6 hours" },
  { type: "construction_halt", description: "Halt construction activity and mandate dust suppression", pm25_reduction_pct: 5, pm10_reduction_pct: 25, time_to_effect: "2-4 hours" },
  { type: "industrial_shutdown", description: "Temporary shutdown of non-essential industrial units", pm25_reduction_pct: 15, pm10_reduction_pct: 10, time_to_effect: "12-24 hours" },
  { type: "odd_even", description: "Odd-even vehicle rationing scheme", pm25_reduction_pct: 8, pm10_reduction_pct: 6, time_to_effect: "24-48 hours" },
  { type: "burning_ban", description: "Strict enforcement against open burning (waste, crop residue)", pm25_reduction_pct: 20, pm10_reduction_pct: 15, time_to_effect: "immediate" },
];

function Sticker({ children, tilt = -3 }: { children: React.ReactNode; tilt?: number }) {
  return (
    <span style={{ transform: `rotate(${tilt}deg)` }} className="inline-flex items-center rounded-full px-2.5 py-1 font-mono text-[10px] font-semibold uppercase tracking-[0.16em] shadow-[0_1px_3px_rgba(0,0,0,0.08)] bg-white text-[#0a0a0c]">
      {children}
    </span>
  );
}

export default function SimulatePage() {
  const [types, setTypes] = useState<InterventionType[]>(MOCK_TYPES);
  const [selected, setSelected] = useState<string | null>(null);
  const [result, setResult] = useState<SimResult | null>(null);
  const [comparison, setComparison] = useState<CompareResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [compareLoading, setCompareLoading] = useState(false);

  useEffect(() => {
    fetchAPI<{ interventions: InterventionType[] }>("/api/v1/simulate/types")
      .then((res) => setTypes(res.interventions)).catch(() => {});
  }, []);

  const runSimulation = async (type: string) => {
    setSelected(type); setLoading(true);
    try { setResult(await fetchAPI<SimResult>("/api/v1/simulate/run", { method: "POST", body: JSON.stringify({ intervention_type: type, city: "Delhi" }) })); }
    catch { setResult(null); } finally { setLoading(false); }
  };

  const runComparison = async () => {
    setCompareLoading(true);
    try { setComparison(await fetchAPI<CompareResult>("/api/v1/simulate/compare?city=Delhi")); }
    catch {} finally { setCompareLoading(false); }
  };

  return (
    <div className="flex flex-col min-h-screen">
      <NavBar />
      <main className="flex-1 overflow-y-auto">
        <div className="mx-auto max-w-7xl px-4 pt-8 pb-20 sm:px-6 space-y-8">
          <header>
            <div className="font-mono text-[11px] uppercase tracking-[0.22em] text-muted-foreground mb-3">counterfactual analysis</div>
            <h1 className="lowercase leading-[0.95]" style={{ fontSize: "clamp(40px, 6vw, 64px)", fontVariationSettings: "'wght' 760, 'wdth' 94, 'opsz' 72", letterSpacing: "-0.035em" }}>
              what happens if we...
            </h1>
            <p className="mt-3 max-w-[60ch] text-[15px] leading-[1.5] text-muted-foreground">
              select an intervention to model its projected aqi impact across delhi stations
            </p>
          </header>

          {/* 3×2 bento grid — varied heights */}
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            {CARDS.map((card) => {
              const t = types.find((x) => x.type === card.type) || MOCK_TYPES.find((x) => x.type === card.type)!;
              const isSelected = selected === card.type;
              return (
                <div
                  key={card.type}
                  className={`ru-bento cursor-pointer ${card.span || ""} ${isSelected ? "ring-2 ring-foreground/20" : ""}`}
                  style={{ "--bento-bg": card.color, "--bento-fg": card.fg } as React.CSSProperties}
                  onClick={() => runSimulation(card.type)}
                >
                  <div className="flex flex-col p-7 min-h-[200px]">
                    <div className="flex items-start justify-between">
                      <span className="text-4xl">{card.icon}</span>
                      <Sticker tilt={2}>{t.time_to_effect}</Sticker>
                    </div>
                    <div className="flex-1 flex flex-col justify-end mt-4">
                      <p className="text-[20px] lowercase mb-2" style={{ fontVariationSettings: "'wght' 680" }}>
                        {t.type.replace(/_/g, " ")}
                      </p>
                      <p className="text-[14px] opacity-70 leading-relaxed lowercase mb-4">
                        {t.description.toLowerCase()}
                      </p>
                      <div className="flex gap-2">
                        <span className="font-mono text-[11px] uppercase tracking-wider bg-white/20 rounded-full px-3 py-1">
                          pm2.5 -{t.pm25_reduction_pct}%
                        </span>
                        <span className="font-mono text-[11px] uppercase tracking-wider bg-white/20 rounded-full px-3 py-1">
                          pm10 -{t.pm10_reduction_pct}%
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {loading && (
            <div className="flex items-center justify-center py-16">
              <div className="w-8 h-8 border-2 border-foreground/30 border-t-foreground rounded-full animate-spin" />
            </div>
          )}

          {result && !loading && (
            <div className="space-y-6">
              {/* Impact stats — 4 big tiles */}
              <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
                <div className="ru-bento md:col-span-2" style={{ "--bento-bg": "var(--entity-good)", "--bento-fg": "#ffffff" } as React.CSSProperties}>
                  <div className="p-8">
                    <div className="font-mono text-[11px] uppercase tracking-[0.18em] opacity-70 mb-3">aqi reduction</div>
                    <span className="font-display leading-[0.82] tracking-[-0.04em]" style={{ fontSize: "clamp(72px, 10vw, 100px)" }}>
                      -{result.city_impact.aqi_reduction.toFixed(0)}
                    </span>
                    <p className="mt-3 text-[16px] opacity-80">{result.city_impact.aqi_reduction_pct.toFixed(1)}% improvement across {result.city_impact.stations_improved} stations</p>
                  </div>
                </div>
                <div className="ru-bento">
                  <div className="p-8">
                    <div className="font-mono text-[11px] uppercase tracking-[0.18em] text-muted-foreground mb-3">before</div>
                    <span className="font-display leading-[0.82] tracking-[-0.04em]" style={{ fontSize: "72px", color: getAQIGradientColor(result.city_impact.avg_aqi_before) }}>
                      {result.city_impact.avg_aqi_before}
                    </span>
                  </div>
                </div>
                <div className="ru-bento">
                  <div className="p-8">
                    <div className="font-mono text-[11px] uppercase tracking-[0.18em] text-muted-foreground mb-3">after</div>
                    <span className="font-display leading-[0.82] tracking-[-0.04em]" style={{ fontSize: "72px", color: getAQIGradientColor(result.city_impact.avg_aqi_after) }}>
                      {result.city_impact.avg_aqi_after}
                    </span>
                  </div>
                </div>
              </div>

              {/* Precedent */}
              <div className="ru-bento" style={{ "--bento-bg": "var(--entity-charcoal)", "--bento-fg": "var(--entity-charcoal-fg)" } as React.CSSProperties}>
                <div className="p-8">
                  <div className="font-mono text-[11px] uppercase tracking-[0.18em] opacity-50 mb-3">historical precedent</div>
                  <p className="text-[16px] leading-relaxed opacity-80 lowercase max-w-[80ch]">{result.implementation.precedent.toLowerCase()}</p>
                </div>
              </div>

              {/* Station impacts */}
              <div className="ru-bento">
                <div className="p-8">
                  <div className="flex items-center gap-2.5 border-b border-[var(--hairline-soft)] pb-3 mb-5">
                    <span className="inline-block h-2.5 w-2.5 rounded-[3px]" style={{ background: COLORS[selected || ""] }} />
                    <span className="font-mono text-[11px] uppercase tracking-[0.2em]">station impact</span>
                    <span className="ml-auto font-mono text-[11px] tabular-nums text-muted-foreground">
                      {result.station_impacts.length.toString().padStart(2, "0")} stations
                    </span>
                  </div>
                  <div className="space-y-2">
                    {result.station_impacts.slice(0, 10).map((s, i) => (
                      <div key={i} className="flex items-center gap-4 py-2 border-b border-[var(--hairline-soft)] last:border-0">
                        <span className="w-6 font-mono text-[11px] text-muted-foreground tabular-nums">{(i + 1).toString().padStart(2, "0")}</span>
                        <span className="flex-1 text-[14px] truncate lowercase">{s.station_name.split(",")[0].toLowerCase()}</span>
                        <span className="font-mono text-[14px] tabular-nums w-12 text-right" style={{ color: getAQIGradientColor(s.before.aqi) }}>{s.before.aqi}</span>
                        <span className="text-muted-foreground text-[12px]">→</span>
                        <span className="font-mono text-[14px] tabular-nums w-12 text-right" style={{ color: getAQIGradientColor(s.after.aqi) }}>{s.after.aqi}</span>
                        <span className="font-mono text-[13px] tabular-nums text-green-600 w-14 text-right font-semibold">-{s.reduction.aqi_points}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Compare all */}
          <div className="pt-4">
            <button onClick={runComparison} disabled={compareLoading} className="ru-pill !text-[14px] !px-5 !py-3">
              {compareLoading ? "comparing..." : "compare all interventions →"}
            </button>

            {comparison && (
              <div className="mt-6 ru-bento">
                <div className="p-8">
                  <div className="flex items-center gap-2.5 border-b border-[var(--hairline-soft)] pb-3 mb-6">
                    <span className="inline-block h-2.5 w-2.5 rounded-[3px]" style={{ background: "var(--entity-forecast)" }} />
                    <span className="font-mono text-[11px] uppercase tracking-[0.2em]">intervention comparison</span>
                  </div>
                  <div className="space-y-5">
                    {comparison.comparisons.map((c) => {
                      const isRec = c.intervention === comparison.recommended;
                      const barW = Math.max(10, (c.avg_aqi_reduction / (comparison.comparisons[0]?.avg_aqi_reduction || 1)) * 100);
                      return (
                        <div key={c.intervention} className={`flex items-center gap-5 ${isRec ? "py-4 px-5 rounded-2xl bg-secondary" : ""}`}>
                          <div className="w-44 shrink-0">
                            <p className="text-[15px] lowercase" style={{ fontVariationSettings: "'wght' 600" }}>
                              {c.intervention.replace(/_/g, " ")}
                              {isRec && <span className="ml-2 font-mono text-[10px] uppercase tracking-wider text-green-600 bg-green-100 px-2 py-0.5 rounded-full">best</span>}
                            </p>
                            <p className="font-mono text-[11px] text-muted-foreground mt-0.5">{c.time_to_effect}</p>
                          </div>
                          <div className="flex-1 h-5 bg-secondary rounded-full overflow-hidden">
                            <div className="h-full rounded-full transition-all duration-500" style={{ width: `${barW}%`, background: COLORS[c.intervention] }} />
                          </div>
                          <span className="font-display text-2xl tabular-nums text-green-600 w-20 text-right">-{c.avg_aqi_reduction.toFixed(0)}</span>
                          <span className="font-mono text-[11px] text-muted-foreground w-16 text-right">{c.reduction_pct.toFixed(1)}%</span>
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
