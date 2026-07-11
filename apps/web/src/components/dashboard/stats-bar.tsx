"use client";

import { type StationReading, getAQICategory } from "@/lib/api";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface StatsBarProps {
  stations: StationReading[];
  city: string;
}

export default function StatsBar({ stations, city }: StatsBarProps) {
  if (!stations.length) return null;

  const avgAQI = Math.round(
    stations.reduce((sum, s) => sum + (s.aqi || 0), 0) / stations.length
  );
  const maxAQI = Math.max(...stations.map((s) => s.aqi || 0));
  const minAQI = Math.min(...stations.map((s) => s.aqi || 0));
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
      <Card className="p-4 bg-zinc-900/50 border-zinc-800">
        <p className="text-xs text-zinc-500 uppercase tracking-wider">
          City Average AQI
        </p>
        <div className="mt-1 flex items-baseline gap-2">
          <span className={`text-3xl font-bold ${category.color}`}>
            {avgAQI}
          </span>
          <Badge variant="outline" className={category.bgColor}>
            {category.label}
          </Badge>
        </div>
        <p className="text-xs text-zinc-500 mt-1">
          {stations.length} active stations
        </p>
      </Card>

      <Card className="p-4 bg-zinc-900/50 border-zinc-800">
        <p className="text-xs text-zinc-500 uppercase tracking-wider">
          PM2.5 Average
        </p>
        <span className="text-3xl font-bold text-zinc-100">
          {avgPM25.toFixed(1)}
        </span>
        <p className="text-xs text-zinc-500 mt-1">
          WHO limit: 15 ug/m3 ({(avgPM25 / 15).toFixed(1)}x over)
        </p>
      </Card>

      <Card className="p-4 bg-zinc-900/50 border-zinc-800">
        <p className="text-xs text-zinc-500 uppercase tracking-wider">
          Worst Station
        </p>
        <span className="text-xl font-bold text-red-400">
          {worstStation.aqi}
        </span>
        <p className="text-xs text-zinc-400 mt-1 truncate">
          {worstStation.station_name.split(",")[0]}
        </p>
      </Card>

      <Card className="p-4 bg-zinc-900/50 border-zinc-800">
        <p className="text-xs text-zinc-500 uppercase tracking-wider">
          Best Station
        </p>
        <span className="text-xl font-bold text-green-400">
          {bestStation.aqi}
        </span>
        <p className="text-xs text-zinc-400 mt-1 truncate">
          {bestStation.station_name.split(",")[0]}
        </p>
      </Card>
    </div>
  );
}
