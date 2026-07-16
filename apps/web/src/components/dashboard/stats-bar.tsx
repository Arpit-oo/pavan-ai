"use client";

import { type StationReading, getAQICategory, getAQIGradientColor } from "@/lib/api";

interface StatsBarProps {
  stations: StationReading[];
  city: string;
}

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

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
      <div className="bento-tile rounded-2xl p-5 bg-card">
        <p className="h-eyebrow">City AQI</p>
        <div className="mt-2 flex items-baseline gap-3">
          <span
            className="text-5xl font-bold font-heading tracking-tight"
            style={{ color: getAQIGradientColor(avgAQI) }}
          >
            {avgAQI}
          </span>
          <span
            className="text-sm font-semibold"
            style={{ color: getAQIGradientColor(avgAQI) }}
          >
            {category.label}
          </span>
        </div>
        <p className="text-xs text-muted-foreground mt-2">
          {stations.length} stations · {city}
        </p>
      </div>

      <div className="bento-tile rounded-2xl p-5 bg-card">
        <p className="h-eyebrow">PM2.5 Average</p>
        <span className="text-5xl font-bold font-heading tracking-tight text-foreground mt-2 block">
          {avgPM25.toFixed(0)}
        </span>
        <p className="text-xs text-muted-foreground mt-2">
          WHO limit: 15 · <span className="text-amber-600 font-semibold">{(avgPM25 / 15).toFixed(1)}x over</span>
        </p>
      </div>

      <div className="bento-tile rounded-2xl p-5 bg-card">
        <p className="h-eyebrow">Worst Station</p>
        <span
          className="text-5xl font-bold font-heading tracking-tight mt-2 block"
          style={{ color: getAQIGradientColor(worstStation.aqi) }}
        >
          {worstStation.aqi}
        </span>
        <p className="text-xs text-muted-foreground mt-2 truncate">
          {worstStation.station_name.split(",")[0]}
        </p>
      </div>

      <div className="bento-tile rounded-2xl p-5 bg-card">
        <p className="h-eyebrow">Best Station</p>
        <span
          className="text-5xl font-bold font-heading tracking-tight mt-2 block"
          style={{ color: getAQIGradientColor(bestStation.aqi) }}
        >
          {bestStation.aqi}
        </span>
        <p className="text-xs text-muted-foreground mt-2 truncate">
          {bestStation.station_name.split(",")[0]}
        </p>
      </div>
    </div>
  );
}
