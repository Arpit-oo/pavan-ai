"use client";

import { useState } from "react";
import NavBar from "@/components/nav/navbar";
import { MOCK_STATIONS } from "@/lib/mock-data";
import { getAQIGradientColor, getAQICategory } from "@/lib/api";

const CITIES = [
  "Delhi", "Mumbai", "Bangalore", "Chennai", "Kolkata", "Hyderabad",
  "Pune", "Ahmedabad", "Lucknow", "Jaipur", "Patna", "Chandigarh",
  "Dehradun", "Shimla", "Bhubaneswar", "Raipur", "Guwahati", "Thiruvananthapuram",
  "Srinagar", "Kochi", "Indore", "Nagpur",
];

function getCityStats(city: string) {
  const stations = MOCK_STATIONS.filter((s) =>
    s.station_name.toLowerCase().includes(city.toLowerCase())
  );
  if (!stations.length) return null;
  const avgAqi = Math.round(stations.reduce((a, s) => a + s.aqi, 0) / stations.length);
  const avgPm25 = Math.round(stations.reduce((a, s) => a + (s.pm25 || 0), 0) / stations.length);
  const worst = Math.max(...stations.map((s) => s.aqi));
  const best = Math.min(...stations.map((s) => s.aqi));
  return { city, avgAqi, avgPm25, worst, best, count: stations.length, category: getAQICategory(avgAqi) };
}

function Sticker({ children, tilt = -3 }: { children: React.ReactNode; tilt?: number }) {
  return (
    <span style={{ transform: `rotate(${tilt}deg)` }} className="inline-flex items-center rounded-full px-2.5 py-1 font-mono text-[10px] font-semibold uppercase tracking-[0.16em] shadow-[0_1px_3px_rgba(0,0,0,0.08)] bg-white text-[#0a0a0c]">
      {children}
    </span>
  );
}

export default function ComparePage() {
  const [selected, setSelected] = useState<string[]>(["Delhi", "Mumbai", "Bangalore"]);

  const allStats = CITIES.map(getCityStats).filter(Boolean).sort((a, b) => b!.avgAqi - a!.avgAqi);
  const selectedStats = selected.map(getCityStats).filter(Boolean);
  const maxAqi = Math.max(...allStats.map((s) => s!.avgAqi), 1);

  const toggleCity = (city: string) => {
    if (selected.includes(city)) {
      if (selected.length > 1) setSelected(selected.filter((c) => c !== city));
    } else if (selected.length < 6) {
      setSelected([...selected, city]);
    }
  };

  return (
    <div className="flex flex-col min-h-screen">
      <NavBar />
      <main className="flex-1 overflow-y-auto">
        <div className="mx-auto max-w-7xl px-4 pt-8 pb-20 sm:px-6 space-y-8">
          <header>
            <div className="font-mono text-[11px] uppercase tracking-[0.22em] text-muted-foreground mb-3">comparative analysis</div>
            <h1 className="lowercase leading-[0.95]" style={{ fontSize: "clamp(40px, 6vw, 64px)", fontVariationSettings: "'wght' 760, 'wdth' 94, 'opsz' 72", letterSpacing: "-0.035em" }}>
              city comparison
            </h1>
            <p className="mt-3 max-w-[60ch] text-[15px] leading-[1.5] text-muted-foreground">
              compare air quality across indian cities. tap cities to add/remove (max 6).
            </p>
          </header>

          {/* City selector pills */}
          <div className="flex flex-wrap gap-2">
            {CITIES.map((city) => {
              const stats = getCityStats(city);
              if (!stats) return null;
              const isSelected = selected.includes(city);
              return (
                <button
                  key={city}
                  onClick={() => toggleCity(city)}
                  className={`px-3.5 py-1.5 rounded-full text-[13px] transition-all ${
                    isSelected
                      ? "bg-foreground text-background shadow-sm"
                      : "bg-secondary text-muted-foreground hover:text-foreground"
                  }`}
                  style={{ fontVariationSettings: isSelected ? "'wght' 620" : "'wght' 440" }}
                >
                  {city.toLowerCase()}
                </button>
              );
            })}
          </div>

          {/* Selected city comparison tiles */}
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            {selectedStats.map((stats, i) => {
              const colors = [
                { bg: "var(--entity-forecast)", fg: "#fff" },
                { bg: "var(--entity-moderate)", fg: "#1a1a18" },
                { bg: "var(--entity-wind)", fg: "#0a0a08" },
                { bg: "var(--entity-severe)", fg: "#fff" },
                { bg: "var(--entity-alert)", fg: "#fff" },
                { bg: "var(--entity-good)", fg: "#fff" },
              ];
              const color = colors[i % colors.length];
              return (
                <div
                  key={stats!.city}
                  className="ru-bento"
                  style={{ "--bento-bg": color.bg, "--bento-fg": color.fg } as React.CSSProperties}
                >
                  <div className="flex flex-col p-7 min-h-[220px]">
                    <div className="flex items-start justify-between">
                      <Sticker tilt={-3}>{stats!.count} stations</Sticker>
                      <Sticker tilt={2}>{stats!.category.label.toLowerCase()}</Sticker>
                    </div>
                    <div className="flex-1 flex flex-col justify-end mt-3">
                      <span
                        className="font-display leading-[0.82] tracking-[-0.04em]"
                        style={{ fontSize: "clamp(64px, 8vw, 80px)" }}
                      >
                        {stats!.avgAqi}
                      </span>
                      <p className="mt-2 text-[18px] lowercase" style={{ fontVariationSettings: "'wght' 680" }}>
                        {stats!.city.toLowerCase()}
                      </p>
                      <div className="mt-2 flex gap-4 font-mono text-[10px] uppercase tracking-wider opacity-70">
                        <span>pm2.5: {stats!.avgPm25}</span>
                        <span>best: {stats!.best}</span>
                        <span>worst: {stats!.worst}</span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Full ranking */}
          <div className="ru-bento">
            <div className="p-8">
              <div className="flex items-center gap-2.5 border-b border-[var(--hairline-soft)] pb-3 mb-6">
                <span className="inline-block h-2.5 w-2.5 rounded-[3px]" style={{ background: "var(--entity-poor)" }} />
                <span className="font-mono text-[11px] uppercase tracking-[0.2em]">all cities ranked by aqi</span>
                <span className="ml-auto font-mono text-[11px] tabular-nums text-muted-foreground">
                  {allStats.length.toString().padStart(2, "0")} cities
                </span>
              </div>
              <div className="space-y-3">
                {allStats.map((stats, i) => {
                  const barW = Math.max(5, (stats!.avgAqi / maxAqi) * 100);
                  const isSelected = selected.includes(stats!.city);
                  return (
                    <div
                      key={stats!.city}
                      className={`flex items-center gap-4 cursor-pointer transition-all ${isSelected ? "py-3 px-4 rounded-2xl bg-secondary" : "py-1"}`}
                      onClick={() => toggleCity(stats!.city)}
                    >
                      <span className="w-6 font-mono text-[11px] text-muted-foreground tabular-nums">
                        {(i + 1).toString().padStart(2, "0")}
                      </span>
                      <span className="w-36 shrink-0 text-[14px] lowercase" style={{ fontVariationSettings: isSelected ? "'wght' 620" : "'wght' 460" }}>
                        {stats!.city.toLowerCase()}
                      </span>
                      <div className="flex-1 h-4 bg-secondary rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all duration-500"
                          style={{ width: `${barW}%`, background: getAQIGradientColor(stats!.avgAqi) }}
                        />
                      </div>
                      <span
                        className="font-display text-xl tabular-nums w-14 text-right"
                        style={{ color: getAQIGradientColor(stats!.avgAqi) }}
                      >
                        {stats!.avgAqi}
                      </span>
                      <span className="font-mono text-[10px] text-muted-foreground w-20 text-right">
                        pm2.5: {stats!.avgPm25}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
