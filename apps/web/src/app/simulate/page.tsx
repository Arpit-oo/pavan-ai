"use client";

import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { fetchAPI, getAQIGradientColor, getAQICategory } from "@/lib/api";
import Link from "next/link";

interface InterventionType {
  type: string;
  description: string;
  pm25_reduction_pct: number;
  pm10_reduction_pct: number;
  time_to_effect: string;
}

interface StationImpact {
  station_name: string;
  latitude: number;
  longitude: number;
  before: { aqi: number; pm25: number; pm10: number };
  after: { aqi: number; pm25: number; pm10: number };
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
  implementation: {
    time_to_effect: string;
    affected_radius_km: number;
    precedent: string;
  };
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

export default function SimulatePage() {
  const [types, setTypes] = useState<InterventionType[]>([]);
  const [selected, setSelected] = useState<string | null>(null);
  const [result, setResult] = useState<SimResult | null>(null);
  const [comparison, setComparison] = useState<CompareResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [compareLoading, setCompareLoading] = useState(false);

  useEffect(() => {
    fetchAPI<{ interventions: InterventionType[] }>("/api/v1/simulate/types").then(
      (res) => setTypes(res.interventions)
    );
  }, []);

  const runSimulation = async (type: string) => {
    setSelected(type);
    setLoading(true);
    try {
      const res = await fetchAPI<SimResult>("/api/v1/simulate/run", {
        method: "POST",
        body: JSON.stringify({ intervention_type: type, city: "Delhi" }),
      });
      setResult(res);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const runComparison = async () => {
    setCompareLoading(true);
    try {
      const res = await fetchAPI<CompareResult>("/api/v1/simulate/compare?city=Delhi");
      setComparison(res);
    } catch (err) {
      console.error(err);
    } finally {
      setCompareLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-screen">
      <header className="flex items-center justify-between px-6 py-3 border-b border-zinc-800 bg-zinc-950">
        <div className="flex items-center gap-3">
          <Link href="/" className="text-xl font-bold tracking-tight">
            <span className="text-orange-400">Vayu</span>
            <span className="text-zinc-100">Budhi</span>
          </Link>
          <Badge variant="outline" className="text-xs text-zinc-400 border-zinc-700">
            Intervention Simulator
          </Badge>
        </div>
        <Link href="/">
          <Button variant="outline" size="sm" className="text-xs border-zinc-700">
            Back to Dashboard
          </Button>
        </Link>
      </header>

      <main className="flex-1 overflow-y-auto p-6 space-y-6">
        <div>
          <h2 className="text-lg font-semibold text-zinc-200">
            What happens if we...
          </h2>
          <p className="text-sm text-zinc-500 mt-1">
            Select an intervention to see projected AQI impact across Delhi stations
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {types.map((t) => (
            <Card
              key={t.type}
              className={`p-4 cursor-pointer transition-all border-zinc-800 hover:border-orange-500/50 ${
                selected === t.type ? "border-orange-500 bg-orange-500/5" : "bg-zinc-900/50"
              }`}
              onClick={() => runSimulation(t.type)}
            >
              <p className="font-medium text-sm text-zinc-200">
                {t.type.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())}
              </p>
              <p className="text-xs text-zinc-500 mt-1">{t.description}</p>
              <div className="flex gap-3 mt-3 text-xs">
                <Badge className="bg-green-500/10 text-green-400">
                  PM2.5 -{t.pm25_reduction_pct}%
                </Badge>
                <Badge className="bg-blue-500/10 text-blue-400">
                  PM10 -{t.pm10_reduction_pct}%
                </Badge>
              </div>
              <p className="text-[10px] text-zinc-600 mt-2">
                Effect in: {t.time_to_effect}
              </p>
            </Card>
          ))}
        </div>

        {loading && (
          <div className="flex items-center justify-center py-12">
            <div className="w-6 h-6 border-2 border-orange-400 border-t-transparent rounded-full animate-spin" />
          </div>
        )}

        {result && !loading && (
          <div className="space-y-4">
            <Card className="p-6 bg-zinc-900/50 border-zinc-800">
              <h3 className="text-sm font-semibold text-zinc-300 mb-4">
                City-Wide Impact
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <p className="text-xs text-zinc-500">Before</p>
                  <p
                    className="text-3xl font-bold"
                    style={{ color: getAQIGradientColor(result.city_impact.avg_aqi_before) }}
                  >
                    {result.city_impact.avg_aqi_before}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-zinc-500">After</p>
                  <p
                    className="text-3xl font-bold"
                    style={{ color: getAQIGradientColor(result.city_impact.avg_aqi_after) }}
                  >
                    {result.city_impact.avg_aqi_after}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-zinc-500">AQI Reduction</p>
                  <p className="text-3xl font-bold text-green-400">
                    -{result.city_impact.aqi_reduction}
                  </p>
                  <p className="text-xs text-green-500">
                    ({result.city_impact.aqi_reduction_pct}% improvement)
                  </p>
                </div>
                <div>
                  <p className="text-xs text-zinc-500">Stations Improved</p>
                  <p className="text-3xl font-bold text-zinc-200">
                    {result.city_impact.stations_improved}
                  </p>
                </div>
              </div>

              <div className="mt-4 p-3 bg-zinc-800/50 rounded-lg">
                <p className="text-xs text-zinc-400">
                  <span className="text-zinc-300 font-medium">Precedent: </span>
                  {result.implementation.precedent}
                </p>
              </div>
            </Card>

            <Card className="p-4 bg-zinc-900/50 border-zinc-800">
              <h3 className="text-sm font-semibold text-zinc-300 mb-3">
                Station-Level Impact (Top 10)
              </h3>
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="text-zinc-500 border-b border-zinc-800">
                      <th className="text-left py-2 pr-4">Station</th>
                      <th className="text-right py-2 px-2">Before</th>
                      <th className="text-right py-2 px-2">After</th>
                      <th className="text-right py-2 px-2">Change</th>
                      <th className="text-right py-2 pl-2">PM2.5 %</th>
                    </tr>
                  </thead>
                  <tbody>
                    {result.station_impacts.slice(0, 10).map((s, i) => (
                      <tr key={i} className="border-b border-zinc-800/50">
                        <td className="py-2 pr-4 text-zinc-300 truncate max-w-[200px]">
                          {s.station_name.split(",")[0]}
                        </td>
                        <td className="py-2 px-2 text-right" style={{ color: getAQIGradientColor(s.before.aqi) }}>
                          {s.before.aqi}
                        </td>
                        <td className="py-2 px-2 text-right" style={{ color: getAQIGradientColor(s.after.aqi) }}>
                          {s.after.aqi}
                        </td>
                        <td className="py-2 px-2 text-right text-green-400">
                          -{s.reduction.aqi_points}
                        </td>
                        <td className="py-2 pl-2 text-right text-green-500">
                          -{s.reduction.pm25_pct}%
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          </div>
        )}

        <div className="border-t border-zinc-800 pt-6">
          <Button
            onClick={runComparison}
            disabled={compareLoading}
            variant="outline"
            className="border-zinc-700"
          >
            {compareLoading ? "Comparing..." : "Compare All Interventions"}
          </Button>

          {comparison && (
            <Card className="mt-4 p-4 bg-zinc-900/50 border-zinc-800">
              <h3 className="text-sm font-semibold text-zinc-300 mb-3">
                Intervention Comparison
              </h3>
              <div className="space-y-2">
                {comparison.comparisons.map((c, i) => {
                  const isRecommended = c.intervention === comparison.recommended;
                  const barWidth = Math.max(
                    5,
                    (c.avg_aqi_reduction / (comparison.comparisons[0]?.avg_aqi_reduction || 1)) * 100
                  );
                  return (
                    <div
                      key={c.intervention}
                      className={`flex items-center gap-3 p-2 rounded ${
                        isRecommended ? "bg-orange-500/10 border border-orange-500/30" : ""
                      }`}
                    >
                      <div className="w-40 shrink-0">
                        <p className="text-xs font-medium text-zinc-300">
                          {c.intervention.replace(/_/g, " ")}
                          {isRecommended && (
                            <Badge className="ml-2 bg-orange-500/20 text-orange-400 text-[10px]">
                              BEST
                            </Badge>
                          )}
                        </p>
                        <p className="text-[10px] text-zinc-600">
                          {c.time_to_effect}
                        </p>
                      </div>
                      <div className="flex-1">
                        <div
                          className="h-4 rounded bg-green-500/30"
                          style={{ width: `${barWidth}%` }}
                        />
                      </div>
                      <div className="text-right shrink-0 w-20">
                        <span className="text-sm font-bold text-green-400">
                          -{c.avg_aqi_reduction.toFixed(1)}
                        </span>
                        <span className="text-[10px] text-zinc-500 ml-1">AQI</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </Card>
          )}
        </div>
      </main>
    </div>
  );
}
