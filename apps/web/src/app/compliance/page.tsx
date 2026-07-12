"use client";

import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { fetchAPI } from "@/lib/api";
import Link from "next/link";

interface GRAPStage {
  name: string;
  trigger_aqi: number;
  color: string;
  actions: string[];
}

interface GRAPStatus {
  city: string;
  avg_aqi: number;
  total_stations: number;
  stations_exceeding_poor: number;
  stations_exceeding_severe: number;
  grap_stage: string | null;
  grap_details: GRAPStage | null;
  all_stages: Record<string, GRAPStage>;
}

interface ComplianceReport {
  title: string;
  generated_at: string;
  period: string;
  executive_summary: {
    overall_status: string;
    avg_aqi: number;
    max_aqi: number;
    stations_monitored: number;
    hotspots_detected: number;
    anomalies_flagged: number;
    dominant_pollution_source: string;
    weather_outlook: string;
    headline: string;
  };
  grap_compliance: {
    current_stage: string | null;
    required_actions: string[];
  };
  enforcement_recommendations: Array<{
    priority: number;
    type: string;
    action: string;
    urgency: string;
  }>;
  attribution_summary: Record<string, number>;
  disclaimer?: string;
}

const stageColors: Record<string, string> = {
  I: "border-orange-500 bg-orange-500/10",
  II: "border-red-500 bg-red-500/10",
  III: "border-purple-500 bg-purple-500/10",
  IV: "border-rose-700 bg-rose-700/10",
};

const stageBadgeColors: Record<string, string> = {
  I: "bg-orange-500/20 text-orange-400",
  II: "bg-red-500/20 text-red-400",
  III: "bg-purple-500/20 text-purple-400",
  IV: "bg-rose-700/20 text-rose-400",
};

export default function CompliancePage() {
  const [grap, setGrap] = useState<GRAPStatus | null>(null);
  const [report, setReport] = useState<ComplianceReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [reportLoading, setReportLoading] = useState(false);

  useEffect(() => {
    fetchAPI<GRAPStatus>("/api/v1/compliance/grap?city=Delhi")
      .then(setGrap)
      .finally(() => setLoading(false));
  }, []);

  const generateReport = async () => {
    setReportLoading(true);
    try {
      const res = await fetchAPI<ComplianceReport>("/api/v1/compliance/report?city=Delhi");
      setReport(res);
    } finally {
      setReportLoading(false);
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
            GRAP Compliance
          </Badge>
        </div>
        <div className="flex gap-2">
          <Link href="/simulate">
            <Button variant="outline" size="sm" className="text-xs border-zinc-700">Simulator</Button>
          </Link>
          <Link href="/">
            <Button variant="outline" size="sm" className="text-xs border-zinc-700">Dashboard</Button>
          </Link>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto p-6 space-y-6">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-6 h-6 border-2 border-orange-400 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : grap && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card className="p-5 bg-zinc-900/50 border-zinc-800">
                <p className="text-xs text-zinc-500 uppercase tracking-wider">Current AQI</p>
                <p className="text-4xl font-bold text-zinc-100 mt-1">{grap.avg_aqi}</p>
                <p className="text-xs text-zinc-500 mt-1">{grap.total_stations} stations</p>
              </Card>
              <Card className="p-5 bg-zinc-900/50 border-zinc-800">
                <p className="text-xs text-zinc-500 uppercase tracking-wider">GRAP Stage</p>
                <p className="text-2xl font-bold text-zinc-100 mt-1">
                  {grap.grap_stage ? `Stage ${grap.grap_stage}` : "None triggered"}
                </p>
                {grap.grap_details && (
                  <Badge className={`mt-1 ${stageBadgeColors[grap.grap_stage!] || ""}`}>
                    {grap.grap_details.name}
                  </Badge>
                )}
              </Card>
              <Card className="p-5 bg-zinc-900/50 border-zinc-800">
                <p className="text-xs text-zinc-500 uppercase tracking-wider">Stations in Violation</p>
                <p className="text-4xl font-bold text-red-400 mt-1">{grap.stations_exceeding_poor}</p>
                <p className="text-xs text-zinc-500 mt-1">{grap.stations_exceeding_severe} severe</p>
              </Card>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {Object.entries(grap.all_stages).map(([key, stage]) => {
                const isActive = grap.grap_stage === key;
                return (
                  <Card
                    key={key}
                    className={`p-4 border ${isActive ? stageColors[key] : "border-zinc-800 bg-zinc-900/30 opacity-60"}`}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <Badge className={isActive ? stageBadgeColors[key] : "bg-zinc-700/30 text-zinc-500"}>
                          Stage {key}
                        </Badge>
                        <p className="text-sm font-medium text-zinc-300 mt-1">{stage.name}</p>
                        <p className="text-xs text-zinc-500">Trigger: AQI &gt; {stage.trigger_aqi}</p>
                      </div>
                      {isActive && (
                        <Badge className="bg-red-500/20 text-red-400 animate-pulse">ACTIVE</Badge>
                      )}
                    </div>
                    <ul className="mt-3 space-y-1">
                      {stage.actions.slice(0, isActive ? undefined : 3).map((action, i) => (
                        <li key={i} className="text-xs text-zinc-400 flex gap-2">
                          <span className={isActive ? "text-orange-400" : "text-zinc-600"}>
                            {isActive ? "!" : "-"}
                          </span>
                          {action}
                        </li>
                      ))}
                      {!isActive && stage.actions.length > 3 && (
                        <li className="text-xs text-zinc-600">+{stage.actions.length - 3} more actions</li>
                      )}
                    </ul>
                  </Card>
                );
              })}
            </div>

            <div className="border-t border-zinc-800 pt-6">
              <Button onClick={generateReport} disabled={reportLoading} className="bg-orange-500 hover:bg-orange-600">
                {reportLoading ? "Generating Report..." : "Generate Compliance Report"}
              </Button>
              <p className="text-xs text-zinc-600 mt-1">Runs full multi-agent analysis pipeline</p>
            </div>

            {report && (
              <Card className="p-6 bg-zinc-900/50 border-zinc-800 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-zinc-300">{report.title}</h3>
                  <span className="text-xs text-zinc-600">{report.period}</span>
                </div>

                <div className="bg-zinc-800/50 rounded-lg p-4">
                  <p className="text-sm text-zinc-200 font-medium">{report.executive_summary.headline}</p>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-3 text-xs text-zinc-400">
                    <span>Status: {report.executive_summary.overall_status}</span>
                    <span>Avg AQI: {report.executive_summary.avg_aqi}</span>
                    <span>Max AQI: {report.executive_summary.max_aqi}</span>
                    <span>Source: {report.executive_summary.dominant_pollution_source}</span>
                    <span>Hotspots: {report.executive_summary.hotspots_detected}</span>
                    <span>Anomalies: {report.executive_summary.anomalies_flagged}</span>
                    <span>Outlook: {report.executive_summary.weather_outlook}</span>
                    <span>Stations: {report.executive_summary.stations_monitored}</span>
                  </div>
                </div>

                {report.enforcement_recommendations.length > 0 && (
                  <div>
                    <p className="text-xs font-medium text-zinc-400 mb-2">Enforcement Recommendations</p>
                    {report.enforcement_recommendations.map((rec, i) => (
                      <div key={i} className="flex items-start gap-2 mb-2">
                        <Badge
                          className={`shrink-0 text-[10px] ${
                            rec.urgency === "immediate" ? "bg-red-500/20 text-red-400" : "bg-yellow-500/20 text-yellow-400"
                          }`}
                        >
                          P{rec.priority}
                        </Badge>
                        <p className="text-xs text-zinc-400">{rec.action}</p>
                      </div>
                    ))}
                  </div>
                )}

                {report.attribution_summary && Object.keys(report.attribution_summary).length > 0 && (
                  <div>
                    <p className="text-xs font-medium text-zinc-400 mb-2">Source Attribution</p>
                    <div className="flex gap-2 flex-wrap">
                      {Object.entries(report.attribution_summary).map(([src, pct]) => (
                        <Badge key={src} variant="outline" className="text-xs border-zinc-700">
                          {src}: {(Number(pct) * 100).toFixed(0)}%
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                <p className="text-[10px] text-zinc-700 italic">{report.disclaimer}</p>
              </Card>
            )}
          </>
        )}
      </main>
    </div>
  );
}
