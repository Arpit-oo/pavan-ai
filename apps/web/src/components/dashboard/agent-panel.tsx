"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/badge";
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

const urgencyBg: Record<string, string> = {
  low: "bg-green-500",
  medium: "bg-yellow-500",
  high: "bg-orange-500",
  critical: "bg-red-500",
  emergency: "bg-rose-700",
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
    <div className="bento-tile rounded-2xl bg-card p-5 h-full flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <div>
          <p className="h-eyebrow text-muted-foreground">Agent Console</p>
          <p className="text-sm font-semibold text-foreground mt-0.5">Multi-Agent Pipeline</p>
        </div>
        <button
          onClick={runAnalysis}
          disabled={loading}
          className="px-3 py-1.5 rounded-full text-xs font-medium bg-foreground text-background hover:opacity-90 transition-opacity disabled:opacity-50"
        >
          {loading ? "Working..." : "Run"}
        </button>
      </div>

      {!analysis && !loading && (
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center space-y-2">
            <span className="text-3xl">🧠</span>
            <p className="text-xs text-muted-foreground">Tap Run to activate 6 agents</p>
          </div>
        </div>
      )}

      {loading && (
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center space-y-2">
            <div className="w-6 h-6 border-2 border-foreground border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-xs text-muted-foreground">Agents coordinating...</p>
          </div>
        </div>
      )}

      {analysis && !loading && (
        <div className="flex-1 overflow-y-auto space-y-3 fade-edge-bottom">
          {/* Headline tile — entity-colored */}
          <div className={`rounded-xl p-3 ${urgencyBg[analysis.summary.urgency] || "bg-orange-500"}`}>
            <p className="text-xs font-semibold text-white leading-snug">
              {analysis.summary.headline}
            </p>
            {analysis.summary.stagnation && (
              <Badge className="mt-1.5 bg-white/20 text-white text-[10px] rounded-full border-0">
                ⚠ STAGNATION
              </Badge>
            )}
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="bg-secondary rounded-xl p-2.5">
              <span className="text-muted-foreground">GRAP</span>
              <p className="font-semibold text-foreground truncate">{analysis.summary.grap_stage || "—"}</p>
            </div>
            <div className="bg-secondary rounded-xl p-2.5">
              <span className="text-muted-foreground">Source</span>
              <p className="font-semibold text-foreground capitalize">{analysis.summary.dominant_source}</p>
            </div>
          </div>

          {/* Agent log */}
          <div className="space-y-1.5">
            <p className="h-eyebrow text-muted-foreground">
              Run Log · {analysis.elapsed_seconds}s
            </p>
            {analysis.run_log.map((log, i) => (
              <div key={i} className="flex items-start gap-2 text-xs">
                <span className="shrink-0 text-sm">{agentIcons[log.agent] || "•"}</span>
                <span className="text-muted-foreground leading-snug">{log.message}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
