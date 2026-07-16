"use client";

import { type StationReading, getAQICategory } from "@/lib/api";

interface StatsBarProps {
  stations: StationReading[];
  city: string;
}

const tileColors: Record<string, { bg: string; text: string }> = {
  Good: { bg: "bg-green-500", text: "text-white" },
  Satisfactory: { bg: "bg-yellow-400", text: "text-yellow-950" },
  Moderate: { bg: "bg-orange-500", text: "text-white" },
  Poor: { bg: "bg-red-500", text: "text-white" },
  "Very Poor": { bg: "bg-purple-500", text: "text-white" },
  Severe: { bg: "bg-rose-700", text: "text-white" },
};

export default function StatsBar({ stations, city }: StatsBarProps) {
  if (!stations.length) return null;

  const avgAQI = Math.round(
    stations.reduce((sum, s) => sum + (s.aqi || 0), 0) / stations.length
  );
  const avgPM25 =
    stations.reduce((sum, s) => sum + (s.pm25 || 0), 0) / stations.length;
  const worstStation = stations.reduce((worst, s) =>
    (s.aqi || 0) > (worst.aqi || 0) ? s : worst
  );
  const bestStation = stations.reduce((best, s) =>
    (s.aqi || 0) < (best.aqi || 0) ? s : best
  );

  const category = getAQICategory(avgAQI);
  const colors = tileColors[category.label] || tileColors.Moderate;

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
      {/* City AQI — bold entity-colored tile like Ru */}
      <div className={`bento-tile rounded-2xl p-5 ${colors.bg}`}>
        <p className={`h-eyebrow ${colors.text} opacity-70`}>City AQI</p>
        <div className="mt-1 flex items-baseline gap-2">
          <span className={`text-4xl font-bold font-heading ${colors.text}`}>
            {avgAQI}
          </span>
          <span className={`text-sm font-medium ${colors.text} opacity-80`}>
            {category.label}
          </span>
        </div>
        <p className={`text-xs mt-1 ${colors.text} opacity-60`}>
          {stations.length} stations · {city}
        </p>
      </div>

      {/* PM2.5 — warm neutral tile */}
      <div className="bento-tile rounded-2xl p-5 bg-card">
        <p className="h-eyebrow text-muted-foreground">PM2.5 Average</p>
        <span className="text-4xl font-bold font-heading text-foreground">
          {avgPM25.toFixed(1)}
        </span>
        <p className="text-xs text-muted-foreground mt-1">
          WHO limit: 15 · <span className="text-orange-500 font-semibold">{(avgPM25 / 15).toFixed(1)}x over</span>
        </p>
      </div>

      {/* Worst Station — coral/red entity */}
      <div className="bento-tile rounded-2xl p-5 bg-card">
        <p className="h-eyebrow text-muted-foreground">Worst Station</p>
        <span className="text-3xl font-bold font-heading text-red-500">
          {worstStation.aqi}
        </span>
        <p className="text-xs text-muted-foreground mt-1 truncate">
          {worstStation.station_name.split(",")[0]}
        </p>
      </div>

      {/* Best Station — green entity */}
      <div className="bento-tile rounded-2xl p-5 bg-card">
        <p className="h-eyebrow text-muted-foreground">Best Station</p>
        <span className="text-3xl font-bold font-heading text-green-500">
          {bestStation.aqi}
        </span>
        <p className="text-xs text-muted-foreground mt-1 truncate">
          {bestStation.station_name.split(",")[0]}
        </p>
      </div>
    </div>
  );
}
