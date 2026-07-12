"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { fetchAPI } from "@/lib/api";
import Link from "next/link";

interface AgentLog {
  timestamp: string;
  agent: string;
  message: string;
}

interface AgentData {
  agent: string;
  data: Record<string, unknown>;
  reasoning: string;
  confidence: number;
  timestamp: string;
}

interface AnalysisResult {
  city: string;
  timestamp: string;
  elapsed_seconds: number;
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
    stagnation: boolean;
    grap_stage: string | null;
    headline: string;
    enforcement_recs: number;
  };
  agents: Record<string, AgentData>;
  run_log: AgentLog[];
}

const agentMeta: Record<string, { icon: string; color: string; desc: string }> = {
  orchestrator: { icon: "🧠", color: "bg-blue-500/20 text-blue-400 border-blue-500/30", desc: "Coordinates all agents" },
  sensor: { icon: "📡", color: "bg-green-500/20 text-green-400 border-green-500/30", desc: "CPCB station data" },
  weather: { icon: "🌤️", color: "bg-cyan-500/20 text-cyan-400 border-cyan-500/30", desc: "Wind & weather" },
  anomaly: { icon: "⚡", color: "bg-red-500/20 text-red-400 border-red-500/30", desc: "Spike detection" },
  attribution: { icon: "🔍", color: "bg-purple-500/20 text-purple-400 border-purple-500/30", desc: "Source decomposition" },
  enforcement: { icon: "🛡️", color: "bg-orange-500/20 text-orange-400 border-orange-500/30", desc: "Inspector recs" },
};

export default function AgentsPage() {
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [activeAgent, setActiveAgent] = useState<string | null>(null);

  const runAnalysis = async () => {
    setLoading(true);
    setResult(null);
    try {
      const res = await fetchAPI<AnalysisResult>("/api/v1/agents/analyze?city=Delhi");
      setResult(res);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-screen">
      <header className="flex items-center justify-between px-6 py-3 border-b border-zinc-800 bg-zinc-950">
        <div className="flex items-center gap-3">
          <Link href="/" className="text-xl font-bold tracking-tight">
            <span className="text-orange-400">Pa</span>
            <span className="text-zinc-100">van</span>
          </Link>
          <Badge variant="outline" className="text-xs text-zinc-400 border-zinc-700">
            Agent Console
          </Badge>
        </div>
        <Link href="/">
          <Button variant="outline" size="sm" className="text-xs border-zinc-700">Dashboard</Button>
        </Link>
      </header>

      <main className="flex-1 overflow-hidden p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-lg font-semibold text-zinc-200">Multi-Agent Intelligence Pipeline</h2>
            <p className="text-xs text-zinc-500 mt-1">
              6 specialized agents coordinate in 3 phases to analyze Delhi&apos;s air quality
            </p>
          </div>
          <Button onClick={runAnalysis} disabled={loading} className="bg-orange-500 hover:bg-orange-600">
            {loading ? "Agents Working..." : "Run Full Analysis"}
          </Button>
        </div>

        <div className="grid grid-cols-3 lg:grid-cols-6 gap-3 mb-6">
          {Object.entries(agentMeta).map(([name, meta]) => {
            const agentData = result?.agents?.[name];
            const isActive = loading && !result;
            const isDone = !!agentData;

            return (
              <Card
                key={name}
                className={`p-3 cursor-pointer transition-all border ${
                  activeAgent === name ? "border-orange-500" : "border-zinc-800"
                } ${isDone ? "bg-zinc-900/80" : "bg-zinc-900/30"}`}
                onClick={() => isDone && setActiveAgent(activeAgent === name ? null : name)}
              >
                <div className="text-center">
                  <span className="text-2xl">{meta.icon}</span>
                  <p className="text-xs font-medium text-zinc-300 mt-1 capitalize">{name}</p>
                  <p className="text-[10px] text-zinc-600">{meta.desc}</p>
                  {isDone && (
                    <Badge className="mt-1 text-[10px] bg-green-500/20 text-green-400">
                      {(agentData!.confidence * 100).toFixed(0)}%
                    </Badge>
                  )}
                  {isActive && (
                    <div className="w-3 h-3 border border-orange-400 border-t-transparent rounded-full animate-spin mx-auto mt-1" />
                  )}
                </div>
              </Card>
            );
          })}
        </div>

        {result && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 h-[calc(100%-200px)]">
            <Card className="p-4 bg-zinc-900/50 border-zinc-800 flex flex-col">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-semibold text-zinc-300">Run Log</h3>
                <span className="text-xs text-zinc-600">{result.elapsed_seconds}s</span>
              </div>
              <ScrollArea className="flex-1">
                <div className="space-y-1.5 pr-4">
                  {result.run_log.map((log, i) => {
                    const meta = agentMeta[log.agent];
                    return (
                      <div key={i} className="flex items-start gap-2">
                        <Badge className={`shrink-0 text-[10px] px-1.5 py-0 border ${meta?.color || "bg-zinc-500/20 text-zinc-400"}`}>
                          {meta?.icon || "?"} {log.agent}
                        </Badge>
                        <span className="text-xs text-zinc-500">{log.message}</span>
                      </div>
                    );
                  })}
                </div>
              </ScrollArea>
            </Card>

            <Card className="p-4 bg-zinc-900/50 border-zinc-800 flex flex-col">
              <h3 className="text-sm font-semibold text-zinc-300 mb-3">
                {activeAgent ? `${agentMeta[activeAgent]?.icon || ""} ${activeAgent} — Details` : "Summary"}
              </h3>
              <ScrollArea className="flex-1">
                {activeAgent && result.agents[activeAgent] ? (
                  <div className="space-y-3 pr-4">
                    <div>
                      <p className="text-xs text-zinc-500">Reasoning</p>
                      <p className="text-sm text-zinc-300">{result.agents[activeAgent].reasoning}</p>
                    </div>
                    <div>
                      <p className="text-xs text-zinc-500">Confidence</p>
                      <div className="flex items-center gap-2 mt-1">
                        <div className="flex-1 h-2 bg-zinc-800 rounded-full">
                          <div
                            className="h-2 bg-green-500 rounded-full"
                            style={{ width: `${result.agents[activeAgent].confidence * 100}%` }}
                          />
                        </div>
                        <span className="text-xs text-zinc-400">
                          {(result.agents[activeAgent].confidence * 100).toFixed(0)}%
                        </span>
                      </div>
                    </div>
                    <div>
                      <p className="text-xs text-zinc-500">Raw Output</p>
                      <pre className="text-[10px] text-zinc-500 mt-1 bg-zinc-800/50 rounded p-2 overflow-x-auto max-h-[300px]">
                        {JSON.stringify(result.agents[activeAgent].data, null, 2).slice(0, 3000)}
                      </pre>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3 pr-4">
                    <div className="bg-zinc-800/50 rounded-lg p-3">
                      <p className="text-sm font-medium text-zinc-200">{result.summary.headline}</p>
                    </div>
                    <div className="grid grid-cols-2 gap-3 text-xs">
                      <div><span className="text-zinc-500">Status:</span> <span className="text-zinc-300">{result.summary.status}</span></div>
                      <div><span className="text-zinc-500">AQI:</span> <span className="text-zinc-300">{result.summary.avg_aqi}</span></div>
                      <div><span className="text-zinc-500">Source:</span> <span className="text-zinc-300">{result.summary.dominant_source}</span></div>
                      <div><span className="text-zinc-500">Outlook:</span> <span className="text-zinc-300">{result.summary.pollution_outlook}</span></div>
                      <div><span className="text-zinc-500">GRAP:</span> <span className="text-zinc-300">{result.summary.grap_stage || "None"}</span></div>
                      <div><span className="text-zinc-500">Enforcement:</span> <span className="text-zinc-300">{result.summary.enforcement_recs} recs</span></div>
                      <div><span className="text-zinc-500">Anomalies:</span> <span className="text-zinc-300">{result.summary.anomaly_count}</span></div>
                      <div><span className="text-zinc-500">Wind:</span> <span className="text-zinc-300">{result.summary.stagnation ? "STAGNANT" : "Normal"}</span></div>
                    </div>
                    <p className="text-[10px] text-zinc-600">Click an agent card above to inspect its output</p>
                  </div>
                )}
              </ScrollArea>
            </Card>
          </div>
        )}

        {!result && !loading && (
          <div className="flex items-center justify-center h-[400px]">
            <div className="text-center space-y-4">
              <div className="text-6xl">🧠</div>
              <p className="text-zinc-500">Click &quot;Run Full Analysis&quot; to see all 6 agents coordinate</p>
              <div className="flex gap-2 justify-center text-xs text-zinc-600">
                <span>Phase 1: Data Collection</span>
                <span>→</span>
                <span>Phase 2: Analysis</span>
                <span>→</span>
                <span>Phase 3: Enforcement</span>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
