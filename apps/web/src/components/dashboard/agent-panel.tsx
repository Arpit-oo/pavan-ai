"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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

export default function AgentPanel() {
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const [loading, setLoading] = useState(false);

  const runAnalysis = async () => {
    setLoading(true);
    try {
      const res = await fetchAPI<AnalysisResult>("/api/v1/agents/analyze?city=Delhi");
      setAnalysis(res);
    } catch (err) {
      console.error("Analysis failed:", err);
    } finally {
      setLoading(false);
    }
  };

  const urgencyColor: Record<string, string> = {
    low: "text-green-400",
    medium: "text-yellow-400",
    high: "text-orange-400",
    critical: "text-red-400",
    emergency: "text-rose-500",
  };

  const agentColor: Record<string, string> = {
    orchestrator: "bg-blue-500/20 text-blue-400",
    sensor: "bg-green-500/20 text-green-400",
    weather: "bg-cyan-500/20 text-cyan-400",
    anomaly: "bg-red-500/20 text-red-400",
    attribution: "bg-purple-500/20 text-purple-400",
  };

  return (
    <Card className="bg-zinc-900/50 border-zinc-800 p-4 h-full flex flex-col">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
          <h3 className="text-sm font-semibold text-zinc-300">Agent Console</h3>
        </div>
        <Button
          size="sm"
          variant="outline"
          onClick={runAnalysis}
          disabled={loading}
          className="text-xs h-7 border-zinc-700"
        >
          {loading ? "Analyzing..." : "Run Analysis"}
        </Button>
      </div>

      {!analysis && !loading && (
        <div className="flex-1 flex items-center justify-center text-zinc-600 text-sm">
          Click &quot;Run Analysis&quot; to activate agents
        </div>
      )}

      {loading && (
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center space-y-2">
            <div className="w-6 h-6 border-2 border-blue-400 border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-xs text-zinc-500">Agents working...</p>
          </div>
        </div>
      )}

      {analysis && !loading && (
        <div className="flex-1 overflow-y-auto space-y-3">
          <div className="bg-zinc-800/50 rounded-lg p-3">
            <p className={`text-sm font-medium ${urgencyColor[analysis.summary.urgency] || "text-zinc-300"}`}>
              {analysis.summary.headline}
            </p>
            <div className="mt-2 grid grid-cols-2 gap-2 text-xs text-zinc-400">
              <span>GRAP: {analysis.summary.grap_stage || "N/A"}</span>
              <span>Source: {analysis.summary.dominant_source}</span>
              <span>Outlook: {analysis.summary.pollution_outlook}</span>
              <span>Wind: {analysis.summary.wind_speed} m/s</span>
            </div>
            {analysis.summary.stagnation && (
              <Badge className="mt-2 bg-red-500/20 text-red-400 text-xs">
                STAGNATION ALERT
              </Badge>
            )}
          </div>

          <div className="space-y-1">
            <p className="text-xs text-zinc-500 font-medium">
              Agent Log ({analysis.elapsed_seconds}s)
            </p>
            {analysis.run_log.map((log, i) => (
              <div key={i} className="flex items-start gap-2 text-xs">
                <Badge
                  variant="outline"
                  className={`text-[10px] px-1.5 py-0 shrink-0 ${agentColor[log.agent] || "bg-zinc-500/20 text-zinc-400"}`}
                >
                  {log.agent}
                </Badge>
                <span className="text-zinc-500 truncate">{log.message}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </Card>
  );
}
