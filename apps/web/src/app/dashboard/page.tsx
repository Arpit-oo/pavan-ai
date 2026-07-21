"use client";

import { useEffect, useState, useCallback } from "react";
import dynamic from "next/dynamic";
import { fetchAPI, type StationReading } from "@/lib/api";
import { MOCK_STATIONS } from "@/lib/mock-data";
import StatsBar from "@/components/dashboard/stats-bar";
import AgentPanel from "@/components/dashboard/agent-panel";
import ForecastChart from "@/components/dashboard/forecast-chart";
import DataSources from "@/components/dashboard/data-sources";
import CitySelector from "@/components/dashboard/city-selector";
import NavBar from "@/components/nav/navbar";

const AQIMap = dynamic(() => import("@/components/map/aqi-map"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex items-center justify-center bg-card rounded-[28px]">
      <div className="animate-pulse text-muted-foreground">loading map...</div>
    </div>
  ),
});

export default function Dashboard() {
  const [stations, setStations] = useState<StationReading[]>([]);
  const [filteredStations, setFilteredStations] = useState<StationReading[]>([]);
  const [selectedStation, setSelectedStation] = useState<StationReading | null>(null);
  const [dashCity, setDashCity] = useState("All India");
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    try {
      const allIndia = await fetchAPI<{ stations: StationReading[] }>("/api/v1/aqi/all-india");
      setStations(allIndia.stations);
    } catch {
      setStations(MOCK_STATIONS);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, [fetchData]);

  useEffect(() => {
    if (dashCity === "All India") {
      setFilteredStations(stations);
    } else {
      const filtered = stations.filter(s =>
        s.station_name.toLowerCase().includes(dashCity.toLowerCase())
      );
      setFilteredStations(filtered.length > 0 ? filtered : stations);
    }
  }, [dashCity, stations]);

  return (
    <div className="flex flex-col min-h-screen">
      <NavBar />
      <main className="flex-1 overflow-y-auto">
        <div className="mx-auto max-w-7xl px-4 pt-4 pb-8 sm:px-6 h-full flex flex-col gap-4">
          <StatsBar stations={filteredStations} city={dashCity} />
          <CitySelector
            selected={dashCity}
            onChange={setDashCity}
            label="filter by city"
            showAll
          />
          <div className="flex-1 min-h-0 flex flex-col lg:flex-row gap-4" style={{minHeight: "65vh"}}>
            <div className="flex-1 flex flex-col gap-4">
              <div style={{height: "60vh", minHeight: "320px"}}>
                {loading ? (
                  <div className="w-full h-full flex items-center justify-center bg-card rounded-[28px]">
                    <div className="w-8 h-8 border-2 border-[var(--entity-moderate)] border-t-transparent rounded-full animate-spin" />
                  </div>
                ) : (
                  <AQIMap stations={filteredStations} onStationClick={setSelectedStation} />
                )}
              </div>
              <ForecastChart selectedCity={dashCity} />
            </div>
            <div className="w-full lg:w-[340px] shrink-0 flex flex-col gap-4">
              <AgentPanel city={dashCity === "All India" ? "Delhi" : dashCity} />
              <DataSources />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
