"use client";

import { useState, useEffect } from "react";
import { fetchAPI } from "@/lib/api";
import Link from "next/link";

interface GRAPStage { name: string; trigger_aqi: number; color: string; actions: string[]; }
interface GRAPStatus {
  city: string; avg_aqi: number; total_stations: number;
  stations_exceeding_poor: number; stations_exceeding_severe: number;
  grap_stage: string | null; grap_details: GRAPStage | null;
  all_stages: Record<string, GRAPStage>;
}
interface ComplianceReport {
  title: string; period: string;
  executive_summary: { overall_status: string; avg_aqi: number; max_aqi: number; stations_monitored: number; hotspots_detected: number; anomalies_flagged: number; dominant_pollution_source: string; weather_outlook: string; headline: string; };
  grap_compliance: { current_stage: string | null; required_actions: string[]; };
  enforcement_recommendations: Array<{ priority: number; action: string; urgency: string }>;
  attribution_summary: Record<string, number>;
  disclaimer?: string;
}

const STAGE_COLORS: Record<string, { bg: string; fg: string }> = {
  I: { bg: "var(--entity-moderate)", fg: "#1a1a18" },
  II: { bg: "var(--entity-poor)", fg: "#ffffff" },
  III: { bg: "var(--entity-severe)", fg: "#ffffff" },
  IV: { bg: "var(--entity-charcoal)", fg: "var(--entity-charcoal-fg)" },
};

function Sticker({ children, tilt = -3, dark = false }: { children: React.ReactNode; tilt?: number; dark?: boolean }) {
  return (
    <span style={{ transform: `rotate(${tilt}deg)` }} className={`inline-flex items-center rounded-full px-2.5 py-1 font-mono text-[10px] font-semibold uppercase tracking-[0.16em] shadow-[0_1px_3px_rgba(0,0,0,0.08)] ${dark ? "bg-[#0a0a0c] text-[#f5f0e6]" : "bg-white text-[#0a0a0c]"}`}>
      {children}
    </span>
  );
}

export default function CompliancePage() {
  const [grap, setGrap] = useState<GRAPStatus | null>(null);
  const [report, setReport] = useState<ComplianceReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [reportLoading, setReportLoading] = useState(false);

  useEffect(() => {
    fetchAPI<GRAPStatus>("/api/v1/compliance/grap?city=Delhi")
      .then(setGrap)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const generateReport = async () => {
    setReportLoading(true);
    try { setReport(await fetchAPI<ComplianceReport>("/api/v1/compliance/report?city=Delhi")); }
    catch {} finally { setReportLoading(false); }
  };

  return (
    <div className="flex flex-col min-h-screen">
      <header className="sticky top-0 z-50 bg-background/85 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6">
          <div className="flex items-center gap-5">
            <Link href="/" className="flex items-baseline gap-0.5 text-lg">
              <span style={{ fontVariationSettings: "'wght' 720, 'wdth' 94" }}>pavan</span>
              <span className="inline-block h-[8px] w-[8px] translate-y-[-2px] rounded-full" style={{ background: "var(--entity-poor)" }} />
            </Link>
            <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground bg-secondary px-2.5 py-1 rounded-full">grap compliance</span>
          </div>
          <Link href="/" className="ru-pill !text-[12px] !px-3 !py-1.5">← dashboard</Link>
        </div>
        <div className="pointer-events-none h-[2px] opacity-90" style={{ background: "linear-gradient(90deg, transparent 0%, var(--entity-poor) 30%, var(--entity-poor) 70%, transparent 100%)" }} />
      </header>

      <main className="flex-1 overflow-y-auto">
        <div className="mx-auto max-w-7xl px-4 pt-6 pb-16 sm:px-6 space-y-6">
          <header className="flex flex-col gap-2.5">
            <div className="font-mono text-[11px] uppercase tracking-[0.22em] text-muted-foreground">regulatory</div>
            <h1 className="lowercase leading-[0.95]" style={{ fontSize: "clamp(36px, 5.6vw, 56px)", fontVariationSettings: "'wght' 760, 'wdth' 94, 'opsz' 72", letterSpacing: "-0.035em" }}>
              grap compliance
            </h1>
          </header>

          {loading ? (
            <div className="flex items-center justify-center py-20">
              <div className="w-6 h-6 border-2 border-foreground/30 border-t-foreground rounded-full animate-spin" />
            </div>
          ) : grap && (
            <>
              {/* Top stats */}
              <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
                <div className="ru-bento">
                  <div className="flex flex-col p-6">
                    <div className="font-mono text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground mb-4">current aqi</div>
                    <span className="font-display leading-[0.82] tracking-[-0.04em]" style={{ fontSize: "clamp(64px, 8vw, 80px)" }}>
                      {grap.avg_aqi.toFixed(0)}
                    </span>
                    <p className="mt-2 font-mono text-[10px] uppercase tracking-wider text-muted-foreground">{grap.total_stations} stations</p>
                  </div>
                </div>

                <div
                  className="ru-bento"
                  style={{
                    "--bento-bg": grap.grap_stage ? STAGE_COLORS[grap.grap_stage.split(" ")[0]]?.bg || "var(--card)" : "var(--entity-good)",
                    "--bento-fg": grap.grap_stage ? STAGE_COLORS[grap.grap_stage.split(" ")[0]]?.fg || "var(--card-foreground)" : "#ffffff",
                  } as React.CSSProperties}
                >
                  <div className="flex flex-col p-6">
                    <div className="flex items-start justify-between">
                      <Sticker tilt={-3}>grap</Sticker>
                      {grap.grap_stage && <Sticker tilt={2} dark>active</Sticker>}
                    </div>
                    <p className="mt-4 text-[18px] lowercase" style={{ fontVariationSettings: "'wght' 680" }}>
                      {grap.grap_stage ? `stage ${grap.grap_stage}` : "no stage triggered"}
                    </p>
                  </div>
                </div>

                <div className="ru-bento" style={{ "--bento-bg": "var(--entity-poor)", "--bento-fg": "#ffffff" } as React.CSSProperties}>
                  <div className="flex flex-col p-6">
                    <div className="font-mono text-[10px] font-semibold uppercase tracking-[0.18em] opacity-70 mb-4">violations</div>
                    <span className="font-display leading-[0.82] tracking-[-0.04em]" style={{ fontSize: "clamp(56px, 7vw, 72px)" }}>
                      {grap.stations_exceeding_poor}
                    </span>
                    <p className="mt-2 font-mono text-[10px] uppercase tracking-wider opacity-60">{grap.stations_exceeding_severe} severe</p>
                  </div>
                </div>
              </div>

              {/* GRAP stages */}
              <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                {Object.entries(grap.all_stages).map(([key, stage]) => {
                  const isActive = grap.grap_stage?.includes(key);
                  const colors = STAGE_COLORS[key] || { bg: "var(--card)", fg: "var(--card-foreground)" };
                  return (
                    <div
                      key={key}
                      className={`ru-bento ${!isActive ? "opacity-50" : ""}`}
                      style={isActive ? { "--bento-bg": colors.bg, "--bento-fg": colors.fg } as React.CSSProperties : undefined}
                    >
                      <div className="flex flex-col p-6">
                        <div className="flex items-start justify-between mb-3">
                          <Sticker tilt={-2}>stage {key}</Sticker>
                          {isActive && <Sticker tilt={3} dark>active</Sticker>}
                        </div>
                        <p className="text-[14px] lowercase mb-1" style={{ fontVariationSettings: "'wght' 600" }}>{stage.name.toLowerCase()}</p>
                        <p className="font-mono text-[10px] uppercase tracking-wider opacity-60 mb-3">trigger: aqi &gt; {stage.trigger_aqi}</p>
                        <ul className="space-y-1">
                          {stage.actions.slice(0, isActive ? undefined : 3).map((action, i) => (
                            <li key={i} className="text-[12px] leading-snug lowercase opacity-80 flex gap-2">
                              <span className="shrink-0 opacity-50">{isActive ? "→" : "·"}</span>
                              {action.toLowerCase()}
                            </li>
                          ))}
                          {!isActive && stage.actions.length > 3 && (
                            <li className="text-[11px] opacity-40 lowercase">+{stage.actions.length - 3} more</li>
                          )}
                        </ul>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Report generation */}
              <div className="pt-4">
                <button onClick={generateReport} disabled={reportLoading} className="ru-pill">
                  {reportLoading ? "generating report..." : "generate compliance report →"}
                </button>
                <p className="mt-2 font-mono text-[10px] text-muted-foreground uppercase tracking-wider">runs full multi-agent analysis pipeline</p>
              </div>

              {report && (
                <div className="ru-bento" style={{ "--bento-bg": "var(--entity-charcoal)", "--bento-fg": "var(--entity-charcoal-fg)" } as React.CSSProperties}>
                  <div className="p-6 space-y-4">
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="font-mono text-[10px] uppercase tracking-[0.18em] opacity-50 mb-1">generated report</div>
                        <p className="text-[15px] lowercase" style={{ fontVariationSettings: "'wght' 620" }}>{report.title.toLowerCase()}</p>
                      </div>
                      <Sticker tilt={2}>{report.period}</Sticker>
                    </div>

                    <div className="bg-white/10 rounded-2xl p-4">
                      <p className="text-[14px] leading-snug lowercase opacity-90">{report.executive_summary.headline.toLowerCase()}</p>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-3">
                        {[
                          ["status", report.executive_summary.overall_status],
                          ["aqi", String(report.executive_summary.avg_aqi)],
                          ["source", report.executive_summary.dominant_pollution_source],
                          ["outlook", report.executive_summary.weather_outlook.split("—")[0]],
                        ].map(([k, v]) => (
                          <div key={k}>
                            <span className="font-mono text-[9px] uppercase tracking-wider opacity-40">{k}</span>
                            <p className="text-[12px] lowercase" style={{ fontVariationSettings: "'wght' 540" }}>{v?.toLowerCase()}</p>
                          </div>
                        ))}
                      </div>
                    </div>

                    {report.enforcement_recommendations.length > 0 && (
                      <div>
                        <div className="font-mono text-[10px] uppercase tracking-wider opacity-50 mb-2">enforcement</div>
                        {report.enforcement_recommendations.map((rec, i) => (
                          <div key={i} className="flex items-start gap-2 mb-2" style={{ boxShadow: rec.urgency === "immediate" ? "inset 4px 0 0 0 var(--entity-poor)" : "inset 4px 0 0 0 var(--entity-moderate)" }}>
                            <p className="text-[12px] opacity-80 lowercase pl-4">{rec.action.toLowerCase()}</p>
                          </div>
                        ))}
                      </div>
                    )}

                    {report.attribution_summary && Object.keys(report.attribution_summary).length > 0 && (
                      <div className="flex gap-2 flex-wrap">
                        {Object.entries(report.attribution_summary).map(([src, pct]) => (
                          <span key={src} className="font-mono text-[10px] uppercase tracking-wider bg-white/10 rounded-full px-2.5 py-1">
                            {src}: {(Number(pct) * 100).toFixed(0)}%
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </main>
    </div>
  );
}
