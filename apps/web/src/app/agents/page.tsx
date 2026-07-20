"use client";

import { useState } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { fetchAPI } from "@/lib/api";
import NavBar from "@/components/nav/navbar";

interface AgentLog { timestamp: string; agent: string; message: string; }
interface AgentData { agent: string; data: Record<string, unknown>; reasoning: string; confidence: number; }
interface AnalysisResult {
  city: string; elapsed_seconds: number;
  summary: { status: string; urgency: string; avg_aqi: number; max_aqi: number; station_count: number; hotspot_count: number; anomaly_count: number; critical_anomalies: number; dominant_source: string; pollution_outlook: string; stagnation: boolean; grap_stage: string | null; headline: string; enforcement_recs: number; };
  agents: Record<string, AgentData>; run_log: AgentLog[];
}

const AGENTS: { key: string; icon: string; label: string; desc: string; color: string; fg: string; span: string }[] = [
  { key: "orchestrator", icon: "🧠", label: "orchestrator", desc: "coordinates all 6 agents across 3 phases. decides execution order and merges results.", color: "var(--entity-forecast)", fg: "#fff", span: "md:col-span-2 md:row-span-2" },
  { key: "sensor", icon: "📡", label: "sensor", desc: "pulls real-time data from cpcb stations", color: "var(--entity-good)", fg: "#fff", span: "md:col-span-1" },
  { key: "weather", icon: "🌤️", label: "weather", desc: "wind patterns, stagnation, inversion risk", color: "var(--entity-wind)", fg: "#0a0a08", span: "md:col-span-1" },
  { key: "anomaly", icon: "⚡", label: "anomaly", desc: "detects spatial spikes and unusual pm ratios", color: "var(--entity-poor)", fg: "#fff", span: "md:col-span-1" },
  { key: "attribution", icon: "🔍", label: "attribution", desc: "decomposes pollution by source with confidence scores", color: "var(--entity-severe)", fg: "#fff", span: "md:col-span-1 md:row-span-2" },
  { key: "enforcement", icon: "🛡️", label: "enforcement", desc: "generates prioritized inspection recommendations", color: "var(--entity-moderate)", fg: "#1a1a18", span: "md:col-span-1" },
];

function Sticker({ children, tilt = -3, dark = false }: { children: React.ReactNode; tilt?: number; dark?: boolean }) {
  return (
    <span style={{ transform: `rotate(${tilt}deg)` }} className={`inline-flex items-center rounded-full px-2.5 py-1 font-mono text-[10px] font-semibold uppercase tracking-[0.16em] shadow-[0_1px_3px_rgba(0,0,0,0.08)] ${dark ? "bg-[#0a0a0c] text-[#f5f0e6]" : "bg-white text-[#0a0a0c]"}`}>
      {children}
    </span>
  );
}

export default function AgentsPage() {
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [activeAgent, setActiveAgent] = useState<string | null>(null);
  const [phase, setPhase] = useState(0);

  const runAnalysis = async () => {
    setLoading(true); setResult(null); setPhase(0);
    setPhase(1); await new Promise(r => setTimeout(r, 700));
    setPhase(2); await new Promise(r => setTimeout(r, 600));
    setPhase(3); await new Promise(r => setTimeout(r, 500));
    try {
      setResult(await fetchAPI<AnalysisResult>("/api/v1/agents/analyze?city=Delhi"));
    } catch {
      const { MOCK_AGENT_LOG, MOCK_ANALYSIS_SUMMARY } = await import("@/lib/mock-data");
      setResult({ city: "Delhi", elapsed_seconds: 2.3, summary: MOCK_ANALYSIS_SUMMARY, agents: {}, run_log: MOCK_AGENT_LOG } as unknown as AnalysisResult);
    } finally { setLoading(false); }
  };

  return (
    <div className="flex flex-col min-h-screen">
      <NavBar />
      <main className="flex-1 overflow-y-auto">
        <div className="mx-auto max-w-7xl px-4 pt-8 pb-20 sm:px-6 space-y-8">
          <div className="flex items-end justify-between">
            <header>
              <div className="font-mono text-[11px] uppercase tracking-[0.22em] text-muted-foreground mb-3">intelligence</div>
              <h1 className="lowercase leading-[0.95]" style={{ fontSize: "clamp(40px, 6vw, 64px)", fontVariationSettings: "'wght' 760, 'wdth' 94, 'opsz' 72", letterSpacing: "-0.035em" }}>
                multi-agent pipeline
              </h1>
              <p className="mt-3 max-w-[60ch] text-[15px] leading-[1.5] text-muted-foreground">
                6 specialized agents coordinate in 3 phases to analyze air quality across india
              </p>
            </header>
            <button onClick={runAnalysis} disabled={loading} className="ru-pill shrink-0 !text-[14px] !px-5 !py-3">
              {loading ? "agents working..." : "run full analysis →"}
            </button>
          </div>

          {/* Agent cards, bento grid with varied sizes */}
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            {AGENTS.map((a) => {
              const agentData = result?.agents?.[a.key];
              const isDone = !!agentData;
              return (
                <div
                  key={a.key}
                  className={`ru-bento cursor-pointer ${a.span} ${activeAgent === a.key ? "ring-2 ring-foreground/20" : ""}`}
                  style={{ "--bento-bg": a.color, "--bento-fg": a.fg } as React.CSSProperties}
                  onClick={() => isDone && setActiveAgent(activeAgent === a.key ? null : a.key)}
                >
                  <div className="flex flex-col p-7 min-h-[140px] justify-center">
                    <div className="flex items-start justify-between">
                      <span className="text-3xl">{a.icon}</span>
                      {isDone && <Sticker tilt={2}>{(agentData!.confidence * 100).toFixed(0)}%</Sticker>}
                      {loading && !isDone && <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
                    </div>
                    <div className="flex-1 flex flex-col justify-end mt-3">
                      <p className="text-[18px] lowercase" style={{ fontVariationSettings: "'wght' 660" }}>{a.label}</p>
                      <p className="text-[13px] opacity-65 leading-relaxed mt-1 lowercase">{a.desc}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Results */}
          {result && (
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-5">
              {/* Run log, wider */}
              <div className="lg:col-span-3 ru-bento" style={{ "--bento-bg": "var(--entity-forecast)", "--bento-fg": "#ffffff" } as React.CSSProperties}>
                <div className="flex flex-col p-8 min-h-[450px]">
                  <div className="flex items-center justify-between mb-5">
                    <div className="font-mono text-[12px] uppercase tracking-[0.18em] opacity-90">execution log</div>
                    <span className="font-mono text-[12px] tabular-nums opacity-70">{result.elapsed_seconds}s total</span>
                  </div>
                  <ScrollArea className="flex-1">
                    <div className="space-y-3 pr-4">
                      {result.run_log.map((log, i) => {
                        const agent = AGENTS.find(a => a.key === log.agent);
                        return (
                          <div key={i} className="flex items-start gap-3">
                            <span className="shrink-0 text-lg mt-0.5">{agent?.icon || "•"}</span>
                            <div>
                              <span className="font-mono text-[12px] uppercase tracking-wider opacity-60" style={{fontVariationSettings:"'wght' 600"}}>{log.agent}</span>
                              <p className="text-[15px] opacity-85 leading-relaxed lowercase" style={{fontVariationSettings:"'wght' 500"}}>{log.message.toLowerCase()}</p>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </ScrollArea>
                </div>
              </div>

              {/* Summary or agent detail */}
              <div className="lg:col-span-2 ru-bento">
                <div className="flex flex-col p-8 min-h-[450px]">
                  {activeAgent && result.agents[activeAgent] ? (
                    <>
                      <div className="flex items-start justify-between mb-5">
                        <div className="flex items-center gap-2">
                          <span className="text-2xl">{AGENTS.find(a => a.key === activeAgent)?.icon}</span>
                          <span className="text-[17px] lowercase" style={{ fontVariationSettings: "'wght' 640" }}>{activeAgent}</span>
                        </div>
                        <Sticker tilt={2} dark>{(result.agents[activeAgent].confidence * 100).toFixed(0)}%</Sticker>
                      </div>
                      <div className="mb-4">
                        <div className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground mb-2">reasoning</div>
                        <p className="text-[14px] leading-relaxed lowercase">{result.agents[activeAgent].reasoning.toLowerCase()}</p>
                      </div>
                      <div className="flex-1 overflow-auto">
                        <div className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground mb-2">raw output</div>
                        <pre className="text-[11px] text-muted-foreground bg-secondary rounded-2xl p-4 overflow-x-auto max-h-[250px] leading-relaxed">
                          {JSON.stringify(result.agents[activeAgent].data, null, 2).slice(0, 3000)}
                        </pre>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="font-mono text-[11px] uppercase tracking-[0.18em] text-muted-foreground mb-5">analysis summary</div>
                      <div className="bg-secondary rounded-2xl p-5 mb-5">
                        <p className="text-[15px] leading-relaxed lowercase" style={{ fontVariationSettings: "'wght' 540" }}>
                          {result.summary.headline.toLowerCase()}
                        </p>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        {[
                          ["status", result.summary.status.toLowerCase()],
                          ["avg aqi", String(result.summary.avg_aqi)],
                          ["source", result.summary.dominant_source],
                          ["grap", result.summary.grap_stage?.toLowerCase() || ", "],
                          ["anomalies", String(result.summary.anomaly_count)],
                          ["enforcement", `${result.summary.enforcement_recs} recs`],
                          ["hotspots", String(result.summary.hotspot_count)],
                          ["stations", String(result.summary.station_count)],
                        ].map(([k, v]) => (
                          <div key={k}>
                            <span className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">{k}</span>
                            <p className="text-[14px] mt-0.5" style={{ fontVariationSettings: "'wght' 580" }}>{v}</p>
                          </div>
                        ))}
                      </div>
                      <p className="mt-auto pt-5 font-mono text-[10px] text-muted-foreground opacity-40">click an agent card to inspect its output</p>
                    </>
                  )}
                </div>
              </div>
            </div>
          )}

          {loading && (
            <div className="ru-bento" style={{ "--bento-bg": "var(--card)" } as React.CSSProperties}>
              <div className="p-8">
                <div className="font-mono text-[11px] uppercase tracking-[0.18em] text-muted-foreground mb-6">pipeline execution</div>
                <div className="space-y-4">
                  <div className="flex items-center gap-4"><div className={`w-3 h-3 rounded-full transition-all duration-300 ${phase >= 1 ? "bg-[var(--entity-good)] scale-125" : "bg-muted"}`}/><div><p className={`text-[15px] ${phase >= 1 ? "" : "text-muted-foreground"}`} style={{fontVariationSettings: phase >= 1 ? "'wght' 600" : "'wght' 440"}}>phase 1, data collection</p><p className="text-[12px] text-muted-foreground">📡 sensor agent + 🌤️ weather agent (parallel)</p></div></div>
                  <div className="flex items-center gap-4"><div className={`w-3 h-3 rounded-full transition-all duration-300 ${phase >= 2 ? "bg-[var(--entity-forecast)] scale-125" : "bg-muted"}`}/><div><p className={`text-[15px] ${phase >= 2 ? "" : "text-muted-foreground"}`} style={{fontVariationSettings: phase >= 2 ? "'wght' 600" : "'wght' 440"}}>phase 2, analysis</p><p className="text-[12px] text-muted-foreground">⚡ anomaly agent + 🔍 attribution agent (parallel)</p></div></div>
                  <div className="flex items-center gap-4"><div className={`w-3 h-3 rounded-full transition-all duration-300 ${phase >= 3 ? "bg-[var(--entity-moderate)] scale-125" : "bg-muted"}`}/><div><p className={`text-[15px] ${phase >= 3 ? "" : "text-muted-foreground"}`} style={{fontVariationSettings: phase >= 3 ? "'wght' 600" : "'wght' 440"}}>phase 3, enforcement</p><p className="text-[12px] text-muted-foreground">🛡️ enforcement agent → 🧠 orchestrator merges</p></div></div>
                </div>
              </div>
            </div>
          )}

          {!result && !loading && (
            <div className="flex items-center justify-center py-24">
              <div className="text-center space-y-5">
                <span className="text-7xl">🧠</span>
                <p className="text-muted-foreground text-[16px] lowercase">tap &quot;run full analysis&quot; to see all 6 agents coordinate</p>
                <div className="flex gap-4 justify-center font-mono text-[11px] uppercase tracking-wider text-muted-foreground">
                  <span className="bg-secondary px-3 py-1.5 rounded-full">phase 1: data</span>
                  <span className="mt-1.5">→</span>
                  <span className="bg-secondary px-3 py-1.5 rounded-full">phase 2: analysis</span>
                  <span className="mt-1.5">→</span>
                  <span className="bg-secondary px-3 py-1.5 rounded-full">phase 3: enforcement</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
