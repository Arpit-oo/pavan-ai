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

const AQIMap = dynamic(() => import("@/components/map/aqi-map"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex items-center justify-center bg-card rounded-2xl">
      <div className="animate-pulse text-muted-foreground">Loading map...</div>
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
      <header className="flex items-center justify-between px-6 py-4">
        <div className="flex items-center gap-5">
          <h1 className="text-xl font-bold tracking-tight">
            pavan<span className="text-muted-foreground">.</span>
          </h1>

          <nav className="hidden md:flex items-center gap-0.5 bg-card rounded-full px-1 py-0.5 border border-border shadow-sm">
            {[
              { href: "/", label: "Dashboard", active: true },
              { href: "/simulate", label: "Simulator" },
              { href: "/compliance", label: "GRAP" },
              { href: "/alerts", label: "Alerts" },
              { href: "/agents", label: "Agents" },
            ].map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`px-3.5 py-1.5 rounded-full text-[13px] font-medium transition-all ${
                  item.active
                    ? "bg-foreground text-background shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </div>

        <div className="flex items-center gap-3">
          {dataSource === "mock" && (
            <span className="text-[11px] text-amber-600 font-medium bg-amber-50 dark:bg-amber-500/10 px-2.5 py-0.5 rounded-full">
              demo
            </span>
          )}
          <div className="flex items-center gap-2">
            <div className={`w-1.5 h-1.5 rounded-full ${dataSource === "live" ? "bg-green-500" : "bg-amber-500"}`} />
            <span className="text-[11px] text-muted-foreground">
              {lastUpdated ? lastUpdated.toLocaleTimeString() : "..."}
            </span>
          </div>
          <span className="text-[11px] text-muted-foreground bg-secondary px-2.5 py-1 rounded-full">
            {city}
          </span>
        </div>
      </header>

      <main className="flex-1 flex flex-col gap-4 p-4 overflow-hidden">
        <StatsBar stations={stations} city={city} />

        <div className="flex-1 min-h-0 flex gap-4">
          <div className="flex-1 flex flex-col gap-4">
            <div className="flex-1 min-h-0">
              {loading ? (
                <div className="w-full h-full flex items-center justify-center bg-card rounded-2xl">
                  <div className="text-center space-y-3">
                    <div className="w-8 h-8 border-2 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto" />
                    <p className="text-muted-foreground text-sm">
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
