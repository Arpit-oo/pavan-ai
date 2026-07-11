"use client";

import { useEffect, useState, useCallback } from "react";
import dynamic from "next/dynamic";
import { fetchAPI, type StationReading, type HeatmapData } from "@/lib/api";
import StatsBar from "@/components/dashboard/stats-bar";
import AgentPanel from "@/components/dashboard/agent-panel";
import { Badge } from "@/components/ui/badge";

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
  const [heatmapData, setHeatmapData] = useState<HeatmapData | null>(null);
  const [selectedStation, setSelectedStation] =
    useState<StationReading | null>(null);
  const [city] = useState("Delhi");
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const fetchData = useCallback(async () => {
    try {
      const [aqiRes, heatmap] = await Promise.all([
        fetchAPI<{ stations: StationReading[] }>(`/api/v1/aqi/live?city=${city}`),
        fetchAPI<HeatmapData>(`/api/v1/aqi/heatmap?city=${city}`),
      ]);
      setStations(aqiRes.stations);
      setHeatmapData(heatmap);
      setLastUpdated(new Date());
    } catch (err) {
      console.error("Failed to fetch AQI data:", err);
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
            <span className="text-orange-400">Vayu</span>
            <span className="text-zinc-100">Budhi</span>
          </h1>
          <Badge
            variant="outline"
            className="text-xs text-zinc-400 border-zinc-700"
          >
            Air Quality Intelligence
          </Badge>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            <span className="text-xs text-zinc-500">
              {lastUpdated
                ? `Updated ${lastUpdated.toLocaleTimeString()}`
                : "Connecting..."}
            </span>
          </div>
          <Badge className="bg-zinc-800 text-zinc-300 hover:bg-zinc-700">
            {city}
          </Badge>
        </div>
      </header>

      <main className="flex-1 flex flex-col gap-4 p-4 overflow-hidden">
        <StatsBar stations={stations} city={city} />

        <div className="flex-1 min-h-0 flex gap-4">
          <div className="flex-1">
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
                heatmapPoints={heatmapData?.points}
                onStationClick={setSelectedStation}
              />
            )}
          </div>

          <div className="w-80 shrink-0 hidden lg:block">
            <AgentPanel />
          </div>
        </div>
      </main>
    </div>
  );
}
