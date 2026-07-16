"use client";

import { useState } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { fetchAPI } from "@/lib/api";
import Link from "next/link";

interface AgentLog { timestamp: string; agent: string; message: string; }
interface AgentData { agent: string; data: Record<string, unknown>; reasoning: string; confidence: number; timestamp: string; }
interface AnalysisResult {
  city: string; timestamp: string; elapsed_seconds: number;
  summary: { status: string; urgency: string; avg_aqi: number; max_aqi: number; station_count: number; hotspot_count: number; anomaly_count: number; critical_anomalies: number; dominant_source: string; pollution_outlook: string; stagnation: boolean; grap_stage: string | null; headline: string; enforcement_recs: number; };
  agents: Record<string, AgentData>; run_log: AgentLog[];
}

const AGENTS: { key: string; icon: string; label: string; desc: string; color: string; fg: string }[] = [
  { key: "orchestrator", icon: "🧠", label: "orchestrator", desc: "coordinates all agents", color: "var(--entity-forecast)", fg: "#fff" },
  { key: "sensor", icon: "📡", label: "sensor", desc: "cpcb station data", color: "var(--entity-good)", fg: "#fff" },
  { key: "weather", icon: "🌤️", label: "weather", desc: "wind & weather", color: "var(--entity-wind)", fg: "#0a0a08" },
  { key: "anomaly", icon: "⚡", label: "anomaly", desc: "spike detection", color: "var(--entity-poor)", fg: "#fff" },
  { key: "attribution", icon: "🔍", label: "attribution", desc: "source decomposition", color: "var(--entity-severe)", fg: "#fff" },
  { key: "enforcement", icon: "🛡️", label: "enforcement", desc: "inspector recs", color: "var(--entity-moderate)", fg: "#1a1a18" },
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

  const runAnalysis = async () => {
    setLoading(true); setResult(null);
    try {
      const res = await fetchAPI<AnalysisResult>("/api/v1/agents/analyze?city=Delhi");
      setResult(res);
    } catch {
      const { MOCK_AGENT_LOG, MOCK_ANALYSIS_SUMMARY } = await import("@/lib/mock-data");
      setResult({ city: "Delhi", timestamp: new Date().toISOString(), elapsed_seconds: 2.3, summary: MOCK_ANALYSIS_SUMMARY, agents: {}, run_log: MOCK_AGENT_LOG } as unknown as AnalysisResult);
    } finally { setLoading(false); }
  };

  return (
    <div className="flex flex-col min-h-screen">
      <header className="sticky top-0 z-50 bg-background/85 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6">
          <div className="flex items-center gap-5">
            <Link href="/" className="flex items-baseline gap-0.5 text-lg">
              <span style={{ fontVariationSettings: "'wght' 720, 'wdth' 94" }}>pavan</span>
              <span className="inline-block h-[8px] w-[8px] translate-y-[-2px] rounded-full" style={{ background: "var(--entity-wind)" }} />
            </Link>
            <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground bg-secondary px-2.5 py-1 rounded-full">agent console</span>
          </div>
          <Link href="/" className="ru-pill !text-[12px] !px-3 !py-1.5">← dashboard</Link>
        </div>
        <div className="pointer-events-none h-[2px] opacity-90" style={{ background: "linear-gradient(90deg, transparent 0%, var(--entity-wind) 30%, var(--entity-wind) 70%, transparent 100%)" }} />
      </header>

      <main className="flex-1 overflow-y-auto">
        <div className="mx-auto max-w-7xl px-4 pt-6 pb-16 sm:px-6 space-y-6">
          <div className="flex items-end justify-between">
            <header className="flex flex-col gap-2.5">
              <div className="font-mono text-[11px] uppercase tracking-[0.22em] text-muted-foreground">intelligence</div>
              <h1 className="lowercase leading-[0.95]" style={{ fontSize: "clamp(36px, 5.6vw, 56px)", fontVariationSettings: "'wght' 760, 'wdth' 94, 'opsz' 72", letterSpacing: "-0.035em" }}>
                multi-agent pipeline
              </h1>
              <p className="max-w-[60ch] text-[14px] leading-[1.45] text-muted-foreground" style={{ fontVariationSettings: "'wght' 460, 'wdth' 96" }}>
                6 specialized agents coordinate in 3 phases to analyze delhi&apos;s air quality
              </p>
            </header>
            <button onClick={runAnalysis} disabled={loading} className="ru-pill shrink-0">
              {loading ? "agents working..." : "run full analysis →"}
            </button>
          </div>

          {/* Agent cards — entity colored bento grid */}
          <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-6">
            {AGENTS.map((a) => {
              const agentData = result?.agents?.[a.key];
              const isDone = !!agentData;
              return (
                <div
                  key={a.key}
                  className={`ru-bento cursor-pointer ${activeAgent === a.key ? "ring-2 ring-foreground/20" : ""}`}
                  style={{ "--bento-bg": a.color, "--bento-fg": a.fg } as React.CSSProperties}
                  onClick={() => isDone && setActiveAgent(activeAgent === a.key ? null : a.key)}
                >
                  <div className="flex flex-col items-center p-4 text-center">
                    <span className="text-3xl mb-2">{a.icon}</span>
                    <p className="text-[13px] lowercase" style={{ fontVariationSettings: "'wght' 600" }}>{a.label}</p>
                    <p className="text-[10px] opacity-60 mt-0.5 lowercase">{a.desc}</p>
                    {isDone && (
                      <span className="mt-2 font-mono text-[10px] uppercase tracking-wider bg-white/20 rounded-full px-2 py-0.5">
                        {(agentData!.confidence * 100).toFixed(0)}%
                      </span>
                    )}
                    {loading && !isDone && (
                      <div className="mt-2 w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Results */}
          {result && (
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
              {/* Run log */}
              <div className="ru-bento" style={{ "--bento-bg": "var(--entity-charcoal)", "--bento-fg": "var(--entity-charcoal-fg)" } as React.CSSProperties}>
                <div className="flex flex-col p-6 h-[400px]">
                  <div className="flex items-center justify-between mb-4">
                    <div className="font-mono text-[10px] uppercase tracking-[0.18em] opacity-70">run log</div>
                    <span className="font-mono text-[10px] tabular-nums opacity-50">{result.elapsed_seconds}s</span>
                  </div>
                  <ScrollArea className="flex-1">
                    <div className="space-y-2 pr-4 fade-edge-bottom">
                      {result.run_log.map((log, i) => {
                        const agent = AGENTS.find(a => a.key === log.agent);
                        return (
                          <div key={i} className="flex items-start gap-3">
                            <span className="shrink-0 text-base mt-0.5">{agent?.icon || "•"}</span>
                            <span className="text-[12px] opacity-70 leading-snug lowercase">{log.message.toLowerCase()}</span>
                          </div>
                        );
                      })}
                    </div>
                  </ScrollArea>
                </div>
              </div>

              {/* Summary or agent detail */}
              <div className="ru-bento">
                <div className="flex flex-col p-6 h-[400px]">
                  {activeAgent && result.agents[activeAgent] ? (
                    <>
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <span className="text-2xl mr-2">{AGENTS.find(a => a.key === activeAgent)?.icon}</span>
                          <span className="text-[15px] lowercase" style={{ fontVariationSettings: "'wght' 620" }}>{activeAgent}</span>
                        </div>
                        <Sticker tilt={2} dark>{(result.agents[activeAgent].confidence * 100).toFixed(0)}%</Sticker>
                      </div>
                      <div className="mb-3">
                        <div className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground mb-1">reasoning</div>
                        <p className="text-[14px] leading-snug lowercase">{result.agents[activeAgent].reasoning.toLowerCase()}</p>
                      </div>
                      <div className="flex-1 overflow-auto">
                        <div className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground mb-1">raw output</div>
                        <pre className="text-[10px] text-muted-foreground bg-secondary rounded-xl p-3 overflow-x-auto max-h-[200px]">
                          {JSON.stringify(result.agents[activeAgent].data, null, 2).slice(0, 2000)}
                        </pre>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground mb-4">summary</div>
                      <div className="bg-secondary rounded-2xl p-4 mb-4">
                        <p className="text-[14px] leading-snug lowercase" style={{ fontVariationSettings: "'wght' 540" }}>
                          {result.summary.headline.toLowerCase()}
                        </p>
                      </div>
                      <div className="grid grid-cols-2 gap-3 text-[13px]">
                        {[
                          ["status", result.summary.status.toLowerCase()],
                          ["aqi", String(result.summary.avg_aqi)],
                          ["source", result.summary.dominant_source],
                          ["grap", result.summary.grap_stage?.toLowerCase() || "—"],
                          ["anomalies", String(result.summary.anomaly_count)],
                          ["enforcement", `${result.summary.enforcement_recs} recs`],
                        ].map(([k, v]) => (
                          <div key={k}>
                            <span className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">{k}</span>
                            <p style={{ fontVariationSettings: "'wght' 580" }}>{v}</p>
                          </div>
                        ))}
                      </div>
                      <p className="mt-auto pt-4 font-mono text-[10px] text-muted-foreground opacity-50">click an agent card above to inspect output</p>
                    </>
                  )}
                </div>
              </div>
            </div>
          )}

          {!result && !loading && (
            <div className="flex items-center justify-center py-20">
              <div className="text-center space-y-4">
                <span className="text-6xl">🧠</span>
                <p className="text-muted-foreground text-[14px] lowercase">tap &quot;run full analysis&quot; to see all 6 agents coordinate</p>
                <div className="flex gap-3 justify-center font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
                  <span>phase 1: data</span><span>→</span><span>phase 2: analysis</span><span>→</span><span>phase 3: enforcement</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
