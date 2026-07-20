"use client";

import { useState } from "react";
import { fetchAPI } from "@/lib/api";

interface AgentLog {
  timestamp: string;
  agent: string;
  message: string;
}

interface AnalysisResult {
  summary: {
    status: string;
    urgency: string;
    avg_aqi: number;
    max_aqi: number;
    station_count: number;
    hotspot_count: number;
    anomaly_count: number;
    critical_anomalies: number;
    dominant_source: string;
    pollution_outlook: string;
    wind_speed: number;
    stagnation: boolean;
    grap_stage: string | null;
    headline: string;
  };
  run_log: AgentLog[];
  elapsed_seconds: number;
}

const agentIcons: Record<string, string> = {
  orchestrator: "🧠",
  sensor: "📡",
  weather: "🌤️",
  anomaly: "⚡",
  attribution: "🔍",
  enforcement: "🛡️",
};

export default function AgentPanel() {
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const [loading, setLoading] = useState(false);

  const runAnalysis = async () => {
    setLoading(true);
    try {
      const res = await fetchAPI<AnalysisResult>("/api/v1/agents/analyze?city=Delhi");
      setAnalysis(res);
    } catch {
      const { MOCK_AGENT_LOG, MOCK_ANALYSIS_SUMMARY } = await import("@/lib/mock-data");
      setAnalysis({
        summary: MOCK_ANALYSIS_SUMMARY,
        run_log: MOCK_AGENT_LOG,
        elapsed_seconds: 2.3,
      } as AnalysisResult);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="ru-bento h-full flex flex-col"
      style={{ "--bento-bg": "var(--entity-forecast)", "--bento-fg": "var(--entity-forecast-fg)" } as React.CSSProperties}
    >
      <div className="flex h-full flex-col p-6">
        <div className="flex items-start justify-between mb-4">
          <div>
            <div className="font-mono text-[10px] font-semibold uppercase tracking-[0.18em] opacity-70 mb-1">
              agents
            </div>
            <p className="text-[15px]" style={{ fontVariationSettings: "'wght' 620" }}>
              multi-agent pipeline
            </p>
          </div>
          <button
            onClick={runAnalysis}
            disabled={loading}
            className="ru-pill !bg-white/20 !text-white text-[12px] !px-3 !py-1.5 backdrop-blur-sm disabled:opacity-50"
          >
            {loading ? "..." : "run"}
          </button>
        </div>

        {!analysis && !loading && (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center space-y-2 opacity-80">
              <span className="text-4xl">🧠</span>
              <p className="text-[12px] opacity-70">tap run to activate 6 agents</p>
            </div>
          </div>
        )}

        {loading && (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center space-y-2">
              <div className="w-5 h-5 border-2 border-white/40 border-t-white rounded-full animate-spin mx-auto" />
              <p className="text-[12px] opacity-70">coordinating...</p>
            </div>
          </div>
        )}

        {analysis && !loading && (
          <div className="flex-1 overflow-y-auto space-y-3 fade-edge-bottom">
            <div className="rounded-2xl bg-white/15 backdrop-blur-sm p-3">
              <p className="text-[13px] leading-snug" style={{ fontVariationSettings: "'wght' 540" }}>
                {analysis.summary.headline.toLowerCase()}
              </p>
              {analysis.summary.stagnation && (
                <span className="inline-flex items-center mt-1.5 rounded-full bg-white/20 px-2 py-0.5 text-[10px] font-mono uppercase tracking-wider">
                  ⚠ stagnation
                </span>
              )}
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div className="rounded-xl bg-white/10 p-2.5">
                <span className="font-mono text-[9px] uppercase tracking-wider opacity-60">grap</span>
                <p className="text-[12px] truncate" style={{ fontVariationSettings: "'wght' 580" }}>
                  {analysis.summary.grap_stage?.toLowerCase() || ", "}
                </p>
              </div>
              <div className="rounded-xl bg-white/10 p-2.5">
                <span className="font-mono text-[9px] uppercase tracking-wider opacity-60">source</span>
                <p className="text-[12px]" style={{ fontVariationSettings: "'wght' 580" }}>
                  {analysis.summary.dominant_source}
                </p>
              </div>
            </div>

            <div className="space-y-1.5 pt-1">
              <div className="font-mono text-[9px] uppercase tracking-wider opacity-50">
                log · {analysis.elapsed_seconds}s
              </div>
              {analysis.run_log.map((log, i) => (
                <div key={i} className="flex items-start gap-2">
                  <span className="shrink-0 text-sm leading-none mt-0.5">{agentIcons[log.agent] || "•"}</span>
                  <span className="text-[11px] opacity-70 leading-snug">{log.message.toLowerCase()}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
