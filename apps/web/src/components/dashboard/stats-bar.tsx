"use client";

import { type StationReading, getAQICategory } from "@/lib/api";

interface StatsBarProps {
  stations: StationReading[];
  city: string;
}

function Sticker({ children, tilt = -3, dark = false }: { children: React.ReactNode; tilt?: number; dark?: boolean }) {
  return (
    <span
      style={{ transform: `rotate(${tilt}deg)` }}
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 font-mono text-[10px] font-semibold uppercase tracking-[0.16em] shadow-[0_1px_3px_rgba(0,0,0,0.08)] ${
        dark ? "bg-[#0a0a0c] text-[#f5f0e6]" : "bg-white text-[#0a0a0c]"
      }`}
    >
      {children}
    </span>
  );
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

  const aqiEntityColor = avgAQI <= 100
    ? "var(--entity-good)"
    : avgAQI <= 200
    ? "var(--entity-moderate)"
    : avgAQI <= 300
    ? "var(--entity-poor)"
    : "var(--entity-severe)";

  const aqiFgColor = avgAQI <= 200 && avgAQI > 100 ? "#1a1a18" : "#ffffff";

  return (
    <div className="grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-4">
      {/* City AQI — saturated entity tile */}
      <div
        className="ru-bento md:col-span-1"
        style={{ "--bento-bg": aqiEntityColor, "--bento-fg": aqiFgColor } as React.CSSProperties}
      >
        <div className="flex h-full flex-col p-6">
          <div className="flex items-start justify-between">
            <Sticker tilt={-3}>aqi</Sticker>
            <Sticker tilt={2} dark>{category.label.toLowerCase()}</Sticker>
          </div>
          <div className="flex-1 flex items-end mt-3">
            <span
              className="font-display leading-[0.82] tracking-[-0.04em]"
              style={{ fontSize: "clamp(72px, 10vw, 96px)" }}
            >
              {avgAQI}
            </span>
          </div>
          <p className="mt-2 font-mono text-[10px] uppercase tracking-[0.16em] opacity-70">
            {stations.length} stations · all india
          </p>
        </div>
      </div>

      {/* PM2.5 — cream tile with colored number */}
      <div className="ru-bento">
        <div className="flex h-full flex-col p-6">
          <div className="font-mono text-[10px] font-semibold uppercase tracking-[0.18em] opacity-50 mb-4">
            pm2.5 average
          </div>
          <div className="flex-1 flex items-end">
            <span
              className="font-display leading-[0.82] tracking-[-0.04em]"
              style={{ fontSize: "clamp(64px, 8vw, 80px)", color: "var(--entity-moderate)" }}
            >
              {avgPM25.toFixed(0)}
            </span>
          </div>
          <p className="mt-2 font-mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
            who limit: 15 · <span style={{ color: "var(--entity-poor)" }}>{(avgPM25 / 15).toFixed(1)}x over</span>
          </p>
        </div>
      </div>

      {/* Worst station — charcoal tile */}
      <div
        className="ru-bento"
        style={{ "--bento-bg": "var(--entity-charcoal)", "--bento-fg": "var(--entity-charcoal-fg)" } as React.CSSProperties}
      >
        <div className="flex h-full flex-col p-6">
          <div className="flex items-start justify-between">
            <Sticker tilt={-2}>worst</Sticker>
          </div>
          <div className="flex-1 flex items-end mt-3">
            <span
              className="font-display leading-[0.82] tracking-[-0.04em]"
              style={{ fontSize: "clamp(64px, 8vw, 80px)", color: "var(--entity-poor)" }}
            >
              {worstStation.aqi}
            </span>
          </div>
          <p className="mt-2 font-mono text-[10px] uppercase tracking-[0.16em] opacity-60 truncate">
            {worstStation.station_name.split(",")[0].toLowerCase()}
          </p>
        </div>
      </div>

      {/* Best station — teal entity tile */}
      <div
        className="ru-bento"
        style={{ "--bento-bg": "var(--entity-wind)", "--bento-fg": "var(--entity-wind-fg)" } as React.CSSProperties}
      >
        <div className="flex h-full flex-col p-6">
          <div className="flex items-start justify-between">
            <Sticker tilt={-2}>best</Sticker>
            <Sticker tilt={3} dark>cleanest</Sticker>
          </div>
          <div className="flex-1 flex items-end mt-3">
            <span
              className="font-display leading-[0.82] tracking-[-0.04em]"
              style={{ fontSize: "clamp(64px, 8vw, 80px)" }}
            >
              {bestStation.aqi}
            </span>
          </div>
          <p className="mt-2 font-mono text-[10px] uppercase tracking-[0.16em] opacity-60 truncate">
            {bestStation.station_name.split(",")[0].toLowerCase()}
          </p>
        </div>
      </div>
    </div>
  );
}
