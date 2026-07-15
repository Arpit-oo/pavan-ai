"use client";

import { useEffect, useState, useCallback } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { fetchAPI, type StationReading, type HeatmapData } from "@/lib/api";
import { MOCK_STATIONS, generateMockHeatmapPoints } from "@/lib/mock-data";
import StatsBar from "@/components/dashboard/stats-bar";
import AgentPanel from "@/components/dashboard/agent-panel";
import ForecastChart from "@/components/dashboard/forecast-chart";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

const AQIMap = dynamic(() => import("@/components/map/aqi-map"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex items-center justify-center bg-zinc-900 rounded-xl">
      <div className="animate-pulse text-zinc-500">Loading map...</div>
    </div>
  ),
});

export default function Dashboard() {
  const [stations, setStations] = useState<StationReading[]>([]);
  const [heatmapPoints, setHeatmapPoints] = useState<HeatmapData["points"]>([]);
  const [selectedStation, setSelectedStation] =
    useState<StationReading | null>(null);
  const [city] = useState("Delhi");
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [dataSource, setDataSource] = useState<"live" | "mock">("live");

  const fetchData = useCallback(async () => {
    try {
      const [aqiRes, heatmap] = await Promise.all([
        fetchAPI<{ stations: StationReading[] }>(`/api/v1/aqi/live?city=${city}`),
        fetchAPI<HeatmapData>(`/api/v1/aqi/heatmap?city=${city}`),
      ]);
      setStations(aqiRes.stations);
      setHeatmapPoints(heatmap.points);
      setLastUpdated(new Date());
      setDataSource("live");
    } catch {
      setStations(MOCK_STATIONS);
      setHeatmapPoints(generateMockHeatmapPoints());
      setLastUpdated(new Date());
      setDataSource("mock");
    } finally {
      setLoading(false);
    }
  }, [city]);

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, [fetchData]);

  return (
    <div className="flex flex-col h-screen">
      <header className="flex items-center justify-between px-6 py-3 border-b border-zinc-800 bg-zinc-950">
        <div className="flex items-center gap-3">
          <h1 className="text-xl font-bold tracking-tight">
            <span className="text-orange-400">Pa</span>
            <span className="text-zinc-100">van</span>
          </h1>
          <Badge
            variant="outline"
            className="text-xs text-zinc-400 border-zinc-700"
          >
            Air Quality Intelligence
          </Badge>
          <nav className="hidden md:flex items-center gap-1 ml-4">
            <Link href="/">
              <Button variant="ghost" size="sm" className="text-xs text-zinc-300 h-7">
                Dashboard
              </Button>
            </Link>
            <Link href="/simulate">
              <Button variant="ghost" size="sm" className="text-xs text-zinc-500 h-7">
                Simulator
              </Button>
            </Link>
            <Link href="/compliance">
              <Button variant="ghost" size="sm" className="text-xs text-zinc-500 h-7">
                GRAP
              </Button>
            </Link>
            <Link href="/alerts">
              <Button variant="ghost" size="sm" className="text-xs text-zinc-500 h-7">
                Alerts
              </Button>
            </Link>
            <Link href="/agents">
              <Button variant="ghost" size="sm" className="text-xs text-zinc-500 h-7">
                Agents
              </Button>
            </Link>
          </nav>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full animate-pulse ${dataSource === "live" ? "bg-green-500" : "bg-yellow-500"}`} />
            <span className="text-xs text-zinc-500">
              {lastUpdated
                ? `${dataSource === "mock" ? "Demo " : ""}Updated ${lastUpdated.toLocaleTimeString()}`
                : "Connecting..."}
            </span>
          </div>
          {dataSource === "mock" && (
            <Badge className="bg-yellow-500/20 text-yellow-400 text-[10px]">
              DEMO MODE
            </Badge>
          )}
          <Badge className="bg-zinc-800 text-zinc-300 hover:bg-zinc-700">
            {city}
          </Badge>
        </div>
      </header>

      <main className="flex-1 flex flex-col gap-4 p-4 overflow-hidden">
        <StatsBar stations={stations} city={city} />

        <div className="flex-1 min-h-0 flex gap-4">
          <div className="flex-1 flex flex-col gap-4">
            <div className="flex-1 min-h-0">
              {loading ? (
                <div className="w-full h-full flex items-center justify-center bg-zinc-900 rounded-xl border border-zinc-800">
                  <div className="text-center space-y-3">
                    <div className="w-8 h-8 border-2 border-orange-400 border-t-transparent rounded-full animate-spin mx-auto" />
                    <p className="text-zinc-500 text-sm">
                      Loading air quality data...
                    </p>
                  </div>
                </div>
              ) : (
                <AQIMap
                  stations={stations}
                  heatmapPoints={heatmapPoints}
                  onStationClick={setSelectedStation}
                />
              )}
            </div>
            <ForecastChart />
          </div>

          <div className="w-80 shrink-0 hidden lg:block">
            <AgentPanel />
          </div>
        </div>
      </main>
    </div>
  );
}
