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

export default function ForecastChart() {
  const [data, setData] = useState<ForecastResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [hours, setHours] = useState(24);

  const loadForecast = async () => {
    setLoading(true);
    try {
      const res = await fetchAPI<ForecastResponse>(
        `/api/v1/forecast/city?city=Delhi&hours=${hours}`
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
  }, [hours]);

  const getChartData = () => {
    if (useMock) {
      const { MOCK_FORECAST } = require("@/lib/mock-data");
      return MOCK_FORECAST.slice(0, hours);
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
    <div className="bento-tile rounded-2xl bg-card p-5">
      <div className="flex items-center justify-between mb-3">
        <div>
          <p className="h-eyebrow text-muted-foreground">Forecast</p>
          <h3 className="text-sm font-semibold text-foreground">
            AQI Forecast — Delhi
          </h3>
          {data?.model_info?.metrics && (
            <p className="text-[10px] text-muted-foreground mt-0.5">
              XGBoost v1 · MAE: {data.model_info.metrics.mae}
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
        <ResponsiveContainer width="100%" height={200}>
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
            <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
            <XAxis
              dataKey="hour"
              tick={{ fontSize: 10, fill: "#71717a" }}
              interval={Math.floor(chartData.length / 6)}
            />
            <YAxis tick={{ fontSize: 10, fill: "#71717a" }} domain={[0, "auto"]} />
            <Tooltip
              contentStyle={{
                backgroundColor: "#18181b",
                border: "1px solid #3f3f46",
                borderRadius: 8,
                fontSize: 12,
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
    </div>
  );
}
