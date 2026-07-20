"use client";

import { useState, useEffect } from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from "recharts";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { fetchAPI, getAQIGradientColor } from "@/lib/api";

interface ForecastPoint {
  timestamp: string;
  hours_ahead: number;
  predicted_aqi: number;
  confidence_lower: number;
  confidence_upper: number;
}

interface StationForecast {
  station_name: string;
  current_aqi: number;
  forecasts: ForecastPoint[];
}

interface ForecastResponse {
  city: string;
  hours: number;
  forecasts: Record<string, StationForecast>;
  model_info: { status: string; metrics?: { mae: number; rmse: number } };
}

const CITIES = ["Delhi", "Mumbai", "Bangalore", "Chennai", "Kolkata", "Hyderabad", "Pune", "Lucknow", "Jaipur", "Ahmedabad"];

const CITY_MOCK_BASE: Record<string, number> = {
  Delhi: 185, Mumbai: 95, Bangalore: 55, Chennai: 60, Kolkata: 140,
  Hyderabad: 80, Pune: 90, Lucknow: 175, Jaipur: 70, Ahmedabad: 100,
};

export default function ForecastChart() {
  const [data, setData] = useState<ForecastResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [hours, setHours] = useState(24);
  const [city, setCity] = useState("Delhi");

  const loadForecast = async () => {
    setLoading(true);
    try {
      const res = await fetchAPI<ForecastResponse>(
        `/api/v1/forecast/city?city=${city}&hours=${hours}`
      );
      setData(res);
      setUseMock(false);
    } catch {
      setUseMock(true);
    } finally {
      setLoading(false);
    }
  };

  const [useMock, setUseMock] = useState(false);

  useEffect(() => {
    loadForecast();
  }, [hours, city]);

  const getChartData = () => {
    if (useMock) {
      const base = CITY_MOCK_BASE[city] || 120;
      return Array.from({ length: Math.min(hours, 24) }, (_, i) => {
        const val = base + Math.sin((i / 24) * Math.PI * 2 - 1) * (base * 0.2) + (Math.random() - 0.5) * 15;
        return {
          time: `+${i + 1}h`,
          hour: `+${i + 1}h`,
          aqi: Math.round(val),
          lower: Math.round(val - 15 - i * 1.5),
          upper: Math.round(val + 15 + i * 1.5),
        };
      });
    }
    if (!data) return [];

    const stationIds = Object.keys(data.forecasts);
    if (!stationIds.length) return [];

    // Average across all stations for city-level forecast
    const firstStation = data.forecasts[stationIds[0]];
    if (!firstStation?.forecasts?.length) return [];

    return firstStation.forecasts.map((f, i) => {
      const allPreds = stationIds
        .map((id) => data.forecasts[id]?.forecasts?.[i]?.predicted_aqi)
        .filter((v): v is number => v != null);

      const avg = allPreds.reduce((a, b) => a + b, 0) / allPreds.length;
      const lower = Math.min(
        ...stationIds
          .map((id) => data.forecasts[id]?.forecasts?.[i]?.confidence_lower)
          .filter((v): v is number => v != null)
      );
      const upper = Math.max(
        ...stationIds
          .map((id) => data.forecasts[id]?.forecasts?.[i]?.confidence_upper)
          .filter((v): v is number => v != null)
      );

      const time = new Date(f.timestamp);
      return {
        time: time.toLocaleTimeString("en-IN", {
          hour: "2-digit",
          minute: "2-digit",
        }),
        hour: `+${f.hours_ahead}h`,
        aqi: Math.round(avg),
        lower: Math.round(lower),
        upper: Math.round(upper),
        band: Math.round(upper - lower),
      };
    });
  };

  const chartData = getChartData();

  return (
    <div className="ru-bento p-6">
      <div className="flex items-center justify-between mb-3">
        <div>
          <div className="font-mono text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground mb-1">forecast</div>
          <h3 className="text-[15px]" style={{ fontVariationSettings: "'wght' 620" }}>
            aqi forecast, {city.toLowerCase()}
          </h3>
          {data?.model_info?.metrics && (
            <p className="font-mono text-[10px] text-muted-foreground mt-0.5 uppercase tracking-wider">
              xgboost v1 · mae: {data.model_info.metrics.mae}
            </p>
          )}
        </div>
        <div className="flex gap-1">
          {[24, 48, 72].map((h) => (
            <button
              key={h}
              onClick={() => setHours(h)}
              className={`px-2.5 py-1 rounded-full text-xs font-medium transition-all ${
                hours === h
                  ? "bg-foreground text-background"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {h}h
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="h-48 flex items-center justify-center">
          <div className="w-5 h-5 border-2 border-orange-400 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : chartData.length ? (
        <ResponsiveContainer width="100%" height={280}>
          <AreaChart data={chartData} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="aqiGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#f97316" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#f97316" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="bandGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#f97316" stopOpacity={0.1} />
                <stop offset="95%" stopColor="#f97316" stopOpacity={0.02} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.06)" />
            <XAxis
              dataKey="hour"
              tick={{ fontSize: 10, fill: "#6b6a64" }}
              interval={Math.floor(chartData.length / 6)}
              axisLine={{ stroke: "rgba(0,0,0,0.08)" }}
              tickLine={false}
            />
            <YAxis tick={{ fontSize: 10, fill: "#6b6a64" }} domain={[0, "auto"]} axisLine={false} tickLine={false} />
            <Tooltip
              contentStyle={{
                backgroundColor: "#ffffff",
                border: "1px solid rgba(0,0,0,0.08)",
                borderRadius: 12,
                fontSize: 12,
                boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
              }}
              formatter={(value, name) => {
                const labels: Record<string, string> = {
                  aqi: "Predicted AQI",
                  upper: "Upper bound",
                  lower: "Lower bound",
                };
                return [String(value), labels[String(name)] || String(name)];
              }}
            />
            <ReferenceLine y={200} stroke="#ef4444" strokeDasharray="5 5" label={{ value: "Poor", fill: "#ef4444", fontSize: 10 }} />
            <ReferenceLine y={100} stroke="#eab308" strokeDasharray="5 5" label={{ value: "Moderate", fill: "#eab308", fontSize: 10 }} />
            <Area type="monotone" dataKey="upper" stroke="none" fill="url(#bandGrad)" />
            <Area type="monotone" dataKey="lower" stroke="none" fill="transparent" />
            <Area type="monotone" dataKey="aqi" stroke="#f97316" strokeWidth={2} fill="url(#aqiGrad)" />
          </AreaChart>
        </ResponsiveContainer>
      ) : (
        <div className="h-48 flex items-center justify-center text-zinc-600 text-sm">
          No forecast data
        </div>
      )}

      {/* City selector */}
      <div className="mt-4 flex gap-2 flex-wrap">
        {CITIES.map((c) => (
          <button
            key={c}
            onClick={() => setCity(c)}
            className={`px-3 py-1.5 rounded-full text-[12px] transition-all ${
              city === c
                ? "bg-foreground text-background shadow-sm"
                : "bg-secondary text-muted-foreground hover:text-foreground"
            }`}
            style={{ fontVariationSettings: city === c ? "'wght' 620" : "'wght' 440" }}
          >
            {c.toLowerCase()}
          </button>
        ))}
      </div>
    </div>
  );
}
