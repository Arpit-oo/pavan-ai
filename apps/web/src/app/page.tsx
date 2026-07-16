"use client";

import { useEffect, useState, useCallback } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { fetchAPI, type StationReading, type HeatmapData } from "@/lib/api";
import { MOCK_STATIONS, generateMockHeatmapPoints } from "@/lib/mock-data";
import StatsBar from "@/components/dashboard/stats-bar";
import AgentPanel from "@/components/dashboard/agent-panel";
import ForecastChart from "@/components/dashboard/forecast-chart";

const AQIMap = dynamic(() => import("@/components/map/aqi-map"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex items-center justify-center bg-card rounded-[28px]">
      <div className="animate-pulse text-muted-foreground">loading map...</div>
    </div>
  ),
});

const NAV_ITEMS = [
  { href: "/", label: "dashboard", tone: "var(--entity-moderate)" },
  { href: "/simulate", label: "simulator", tone: "var(--entity-forecast)" },
  { href: "/compliance", label: "grap", tone: "var(--entity-poor)" },
  { href: "/alerts", label: "alerts", tone: "var(--entity-alert)" },
  { href: "/agents", label: "agents", tone: "var(--entity-wind)" },
];

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

  const activeIdx = 0;

  return (
    <div className="flex flex-col h-screen">
      {/* Nav — Ru's entity-colored dot pattern */}
      <header className="sticky top-0 z-50 bg-background/85 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6">
          <div className="flex items-center gap-5">
            {/* Brand with entity-colored dot */}
            <Link href="/" className="flex items-baseline gap-0.5 text-lg">
              <span style={{ fontVariationSettings: "'wght' 720, 'wdth' 94" }}>pavan</span>
              <span
                className="inline-block h-[8px] w-[8px] translate-y-[-2px] rounded-full transition-colors duration-500"
                style={{ background: NAV_ITEMS[activeIdx].tone }}
              />
            </Link>

            <nav className="hidden md:flex items-center gap-5">
              {NAV_ITEMS.map((item, i) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="relative flex flex-col items-center gap-0.5"
                >
                  <span
                    className={`text-[13px] transition-colors ${
                      i === activeIdx
                        ? "text-foreground"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                    style={{ fontVariationSettings: i === activeIdx ? "'wght' 620" : "'wght' 440" }}
                  >
                    {item.label}
                  </span>
                  {i === activeIdx && (
                    <span
                      className="absolute -bottom-[8px] left-1/2 block h-1.5 w-1.5 -translate-x-1/2 rounded-full"
                      style={{ background: item.tone }}
                    />
                  )}
                </Link>
              ))}
            </nav>
          </div>

          <div className="flex items-center gap-3">
            {dataSource === "mock" && (
              <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground bg-secondary px-2.5 py-1 rounded-full">
                demo
              </span>
            )}
            <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
              {lastUpdated ? lastUpdated.toLocaleTimeString() : "..."}
            </span>
            <span className="font-mono text-[10px] uppercase tracking-[0.16em] bg-secondary px-2.5 py-1 rounded-full">
              {city.toLowerCase()}
            </span>
          </div>
        </div>
        {/* Entity-colored bottom tint — Ru pattern */}
        <div
          className="pointer-events-none h-[2px] opacity-90 transition-colors duration-500"
          style={{
            background: `linear-gradient(90deg, transparent 0%, ${NAV_ITEMS[activeIdx].tone} 30%, ${NAV_ITEMS[activeIdx].tone} 70%, transparent 100%)`,
          }}
        />
      </header>

      <main className="flex-1 overflow-hidden">
        <div className="mx-auto max-w-7xl px-4 pt-4 pb-8 sm:px-6 h-full flex flex-col gap-4">
          <StatsBar stations={stations} city={city} />

          <div className="flex-1 min-h-0 flex gap-4">
            <div className="flex-1 flex flex-col gap-4">
              <div className="flex-1 min-h-0">
                {loading ? (
                  <div className="w-full h-full flex items-center justify-center bg-card rounded-[28px]">
                    <div className="text-center space-y-3">
                      <div className="w-8 h-8 border-2 border-[var(--entity-moderate)] border-t-transparent rounded-full animate-spin mx-auto" />
                      <p className="text-muted-foreground text-sm">loading...</p>
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
        </div>
      </main>
    </div>
  );
}
