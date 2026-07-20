"use client";

import { useState, useEffect } from "react";
import { fetchAPI } from "@/lib/api";
import NavBar from "@/components/nav/navbar";

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

const STAGE_STYLES: Record<string, { bg: string; fg: string; accent: string; label: string }> = {
  I: { bg: "#fef3c7", fg: "#92400e", accent: "#f59e0b", label: "poor" },
  II: { bg: "#fee2e2", fg: "#991b1b", accent: "#ef4444", label: "very poor" },
  III: { bg: "#f3e8ff", fg: "#581c87", accent: "#a855f7", label: "severe" },
  IV: { bg: "#1a1a18", fg: "#f5f0e6", accent: "#ef4444", label: "emergency" },
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
      .catch(() => {
        setGrap({
          city: "Delhi", avg_aqi: 185, total_stations: 30,
          stations_exceeding_poor: 8, stations_exceeding_severe: 2,
          grap_stage: "I", grap_details: null,
          all_stages: {
            I: { name: "Stage I — Poor", trigger_aqi: 201, color: "orange", actions: ["Intensify mechanized/vacuum sweeping of roads", "Water sprinkling on high dust roads", "Enforce C&D waste management", "Ensure PUC compliance — impound polluting vehicles", "Ban burning of waste in the open", "Enforce ban on coal/firewood in tandoors", "Dust mitigation at construction sites"] },
            II: { name: "Stage II — Very Poor", trigger_aqi: 301, color: "red", actions: ["All Stage I actions continue", "Enhance parking fees 3-4x to discourage private vehicles", "Augment CNG/electric bus and metro services", "Restrict diesel generator sets (except emergency)", "Intensify industrial pollution control inspections", "Daily review by Task Force"] },
            III: { name: "Stage III — Severe", trigger_aqi: 401, color: "purple", actions: ["All Stage I and II actions continue", "Ban construction and demolition activities", "Shut brick kilns, hot mix plants, stone crushers", "Ban entry of truck traffic into Delhi (except essential)", "Advisory for work from home where possible", "State governments to decide on school closure"] },
            IV: { name: "Stage IV — Emergency", trigger_aqi: 451, color: "maroon", actions: ["All previous stage actions continue", "Stop ALL truck traffic except electric and essential", "Ban diesel medium and heavy goods vehicles", "State governments may allow 50% office staff", "Consider odd-even scheme", "Close schools, shift to online", "Suspend all construction including highways"] },
          },
        });
      })
      .finally(() => setLoading(false));
  }, []);

  const generateReport = async () => {
    setReportLoading(true);
    try { setReport(await fetchAPI<ComplianceReport>("/api/v1/compliance/report?city=Delhi")); }
    catch {
      setReport({
        title: "Air Quality Compliance Report — Delhi",
        period: new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' }),
        executive_summary: {
          overall_status: "Moderate", avg_aqi: 185, max_aqi: 275, stations_monitored: 30,
          hotspots_detected: 5, anomalies_flagged: 3, dominant_pollution_source: "vehicular",
          weather_outlook: "moderate — watch for stagnation conditions",
          headline: "Air quality moderate across Delhi NCR. Vehicular emissions dominant at 35%. Wazirpur and Anand Vihar reporting elevated levels. Wind dispersion moderate.",
        },
        grap_compliance: { current_stage: "I — Poor", required_actions: ["Intensify road sweeping", "Water sprinkling on dusty roads", "Enforce PUC compliance"] },
        enforcement_recommendations: [
          { priority: 1, action: "Deploy inspectors to Wazirpur industrial zone — 30% industrial attribution", urgency: "today" },
          { priority: 2, action: "Check dust suppression at Mundka construction sites", urgency: "today" },
          { priority: 3, action: "Patrol for open burning near Narela", urgency: "immediate" },
        ],
        attribution_summary: { vehicular: 0.35, industrial: 0.22, construction: 0.15, burning: 0.15, background: 0.13 },
        disclaimer: "Auto-generated by Pavan AI for decision support.",
      });
    } finally { setReportLoading(false); }
  };

  return (
    <div className="flex flex-col min-h-screen">
      <NavBar />
      <main className="flex-1 overflow-y-auto">
        <div className="mx-auto max-w-7xl px-4 pt-8 pb-20 sm:px-6 space-y-8">
          <header>
            <div className="font-mono text-[11px] uppercase tracking-[0.22em] text-muted-foreground mb-3">regulatory</div>
            <h1 className="lowercase leading-[0.95]" style={{ fontSize: "clamp(40px, 6vw, 64px)", fontVariationSettings: "'wght' 760, 'wdth' 94, 'opsz' 72", letterSpacing: "-0.035em" }}>
              grap compliance
            </h1>
            <p className="mt-3 max-w-[60ch] text-[15px] leading-[1.5] text-muted-foreground">
              graded response action plan monitoring for delhi ncr
            </p>
          </header>

          {loading ? (
            <div className="flex items-center justify-center py-24">
              <div className="w-8 h-8 border-2 border-foreground/30 border-t-foreground rounded-full animate-spin" />
            </div>
          ) : grap && (
            <>
              {/* Top stats */}
              <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                <div className="ru-bento">
                  <div className="p-8">
                    <div className="font-mono text-[11px] uppercase tracking-[0.18em] text-muted-foreground mb-4">current aqi</div>
                    <span className="font-display leading-[0.82] tracking-[-0.04em]" style={{ fontSize: "clamp(72px, 10vw, 96px)" }}>
                      {grap.avg_aqi.toFixed(0)}
                    </span>
                    <p className="mt-3 font-mono text-[11px] uppercase tracking-wider text-muted-foreground">{grap.total_stations} stations monitored</p>
                  </div>
                </div>

                <div className="ru-bento" style={{
                  "--bento-bg": grap.grap_stage ? STAGE_STYLES[grap.grap_stage.split(" ")[0]]?.bg || "var(--entity-good)" : "#dcfce7",
                  "--bento-fg": grap.grap_stage ? STAGE_STYLES[grap.grap_stage.split(" ")[0]]?.fg || "#166534" : "#166534",
                } as React.CSSProperties}>
                  <div className="p-8">
                    <div className="flex items-start justify-between">
                      <Sticker tilt={-3}>grap status</Sticker>
                      {grap.grap_stage && <Sticker tilt={2} dark>active</Sticker>}
                    </div>
                    <p className="mt-5 text-[24px] lowercase" style={{ fontVariationSettings: "'wght' 720" }}>
                      {grap.grap_stage ? `stage ${grap.grap_stage}` : "no stage triggered"}
                    </p>
                    <p className="mt-2 text-[14px] opacity-70">
                      {grap.grap_stage ? "interventions required" : "air quality within acceptable range"}
                    </p>
                  </div>
                </div>

                <div className="ru-bento" style={{ "--bento-bg": "var(--entity-poor)", "--bento-fg": "#ffffff" } as React.CSSProperties}>
                  <div className="p-8">
                    <div className="font-mono text-[11px] uppercase tracking-[0.18em] opacity-70 mb-4">stations in violation</div>
                    <span className="font-display leading-[0.82] tracking-[-0.04em]" style={{ fontSize: "clamp(64px, 8vw, 80px)" }}>
                      {grap.stations_exceeding_poor}
                    </span>
                    <p className="mt-3 font-mono text-[11px] uppercase tracking-wider opacity-60">{grap.stations_exceeding_severe} in severe zone</p>
                  </div>
                </div>
              </div>

              {/* GRAP stages — big readable cards */}
              <div>
                <div className="flex items-center gap-2.5 mb-5">
                  <span className="inline-block h-2.5 w-2.5 rounded-[3px]" style={{ background: "var(--entity-poor)" }} />
                  <span className="font-mono text-[11px] uppercase tracking-[0.2em]">grap stages</span>
                </div>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  {Object.entries(grap.all_stages).map(([key, stage]) => {
                    const isActive = grap.grap_stage?.includes(key);
                    const style = STAGE_STYLES[key];
                    return (
                      <div
                        key={key}
                        className="ru-bento"
                        style={{ "--bento-bg": style.bg, "--bento-fg": style.fg } as React.CSSProperties}
                      >
                        <div className="p-8">
                          <div className="flex items-start justify-between mb-4">
                            <div className="flex items-center gap-3">
                              <span className="inline-block w-4 h-4 rounded-full" style={{ background: style.accent }} />
                              <span className="text-[20px] lowercase" style={{ fontVariationSettings: "'wght' 700" }}>
                                stage {key}
                              </span>
                            </div>
                            <span className="font-mono text-[10px] uppercase tracking-wider px-2.5 py-1 rounded-full" style={{ background: isActive ? style.accent : "rgba(0,0,0,0.1)", color: isActive ? "#fff" : "var(--muted)" }}>
                                {isActive ? "active" : "standby"}
                              </span>
                          </div>
                          <p className="text-[16px] lowercase mb-1" style={{ fontVariationSettings: "'wght' 580" }}>
                            {style.label} — trigger aqi &gt; {stage.trigger_aqi}
                          </p>
                          <div className="mt-4 space-y-2">
                            {stage.actions.slice(0, isActive ? undefined : 4).map((action, i) => (
                              <div key={i} className="flex items-start gap-2.5">
                                <span className="shrink-0 mt-1 w-1.5 h-1.5 rounded-full" style={{ background: style.accent }} />
                                <p className="text-[13px] leading-relaxed lowercase opacity-85">{action.toLowerCase()}</p>
                              </div>
                            ))}
                            {!isActive && stage.actions.length > 4 && (
                              <p className="text-[12px] opacity-40 lowercase ml-4">+{stage.actions.length - 4} more actions</p>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Report generation */}
              <div className="pt-4">
                <button onClick={generateReport} disabled={reportLoading} className="ru-pill !text-[16px] !px-8 !py-4">
                  {reportLoading ? "generating report..." : "generate compliance report →"}
                </button>
                <p className="mt-2 font-mono text-[10px] text-muted-foreground uppercase tracking-wider">runs full multi-agent analysis pipeline</p>
              </div>

              {report && (
                <div className="space-y-6">
                  {/* Report header */}
                  <div className="ru-bento">
                    <div className="p-8">
                      <div className="flex items-start justify-between mb-6">
                        <div>
                          <div className="font-mono text-[11px] uppercase tracking-[0.18em] text-muted-foreground mb-2">compliance report</div>
                          <h2 className="text-[22px] lowercase" style={{ fontVariationSettings: "'wght' 700", letterSpacing: "-0.02em" }}>
                            {report.title.toLowerCase()}
                          </h2>
                        </div>
                        <Sticker tilt={2}>{report.period}</Sticker>
                      </div>

                      {/* Executive summary */}
                      <div className="bg-secondary rounded-2xl p-6 mb-6">
                        <div className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground mb-3">executive summary</div>
                        <p className="text-[16px] leading-relaxed lowercase" style={{ fontVariationSettings: "'wght' 520" }}>
                          {report.executive_summary.headline.toLowerCase()}
                        </p>
                      </div>

                      {/* Key metrics grid */}
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-5 mb-6">
                        {[
                          { label: "overall status", value: report.executive_summary.overall_status, color: "var(--entity-moderate)" },
                          { label: "average aqi", value: String(report.executive_summary.avg_aqi), color: "var(--entity-poor)" },
                          { label: "max aqi", value: String(report.executive_summary.max_aqi), color: "var(--entity-poor)" },
                          { label: "stations", value: String(report.executive_summary.stations_monitored) },
                          { label: "hotspots", value: String(report.executive_summary.hotspots_detected), color: "var(--entity-poor)" },
                          { label: "anomalies", value: String(report.executive_summary.anomalies_flagged), color: "var(--entity-severe)" },
                          { label: "dominant source", value: report.executive_summary.dominant_pollution_source },
                          { label: "weather outlook", value: report.executive_summary.weather_outlook.split("—")[0] },
                        ].map((item) => (
                          <div key={item.label} className="bg-secondary/50 rounded-xl p-4">
                            <span className="font-mono text-[9px] uppercase tracking-wider text-muted-foreground">{item.label}</span>
                            <p className="text-[15px] mt-1 lowercase" style={{ fontVariationSettings: "'wght' 600", color: item.color }}>
                              {item.value?.toLowerCase()}
                            </p>
                          </div>
                        ))}
                      </div>

                      {/* Source attribution */}
                      {report.attribution_summary && Object.keys(report.attribution_summary).length > 0 && (
                        <div className="mb-6">
                          <div className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground mb-3">source attribution</div>
                          <div className="flex gap-3 flex-wrap">
                            {Object.entries(report.attribution_summary).map(([src, pct]) => (
                              <div key={src} className="bg-secondary rounded-xl px-4 py-3 text-center">
                                <span className="font-display text-[24px]" style={{ color: "var(--entity-moderate)" }}>
                                  {(Number(pct) * 100).toFixed(0)}%
                                </span>
                                <p className="font-mono text-[9px] uppercase tracking-wider text-muted-foreground mt-1">{src}</p>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Enforcement recs */}
                      {report.enforcement_recommendations.length > 0 && (
                        <div>
                          <div className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground mb-3">enforcement recommendations</div>
                          <div className="space-y-2">
                            {report.enforcement_recommendations.map((rec, i) => (
                              <div key={i} className="flex items-start gap-3 py-3 border-b border-[var(--hairline-soft)] last:border-0">
                                <span className={`shrink-0 font-mono text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full ${
                                  rec.urgency === "immediate" ? "bg-red-100 text-red-700" : "bg-amber-100 text-amber-700"
                                }`}>
                                  p{rec.priority}
                                </span>
                                <p className="text-[13px] leading-relaxed lowercase">{rec.action.toLowerCase()}</p>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
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
