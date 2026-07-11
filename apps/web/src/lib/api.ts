const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export async function fetchAPI<T>(
  endpoint: string,
  options?: RequestInit
): Promise<T> {
  const res = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options?.headers,
    },
  });

  if (!res.ok) {
    throw new Error(`API error: ${res.status} ${res.statusText}`);
  }

  return res.json();
}

export interface StationReading {
  station_id: string;
  station_name: string;
  latitude: number;
  longitude: number;
  timestamp: string;
  pm25: number | null;
  pm10: number | null;
  no2: number | null;
  so2: number | null;
  co: number | null;
  o3: number | null;
  aqi: number;
  temperature: number | null;
  humidity: number | null;
  wind_speed: number | null;
  wind_direction: number | null;
  _synthetic?: boolean;
}

export interface HeatmapPoint {
  lat: number;
  lng: number;
  aqi: number;
  color: [number, number, number, number];
}

export interface HeatmapData {
  points: HeatmapPoint[];
  bounds: {
    min_lat: number;
    max_lat: number;
    min_lng: number;
    max_lng: number;
  };
  stations: StationReading[];
  resolution: number;
}

export interface AQIResponse {
  city: string;
  stations: StationReading[];
  count: number;
}

export function getAQICategory(aqi: number): {
  label: string;
  color: string;
  bgColor: string;
} {
  if (aqi <= 50)
    return { label: "Good", color: "text-green-400", bgColor: "bg-green-500/20" };
  if (aqi <= 100)
    return {
      label: "Satisfactory",
      color: "text-yellow-400",
      bgColor: "bg-yellow-500/20",
    };
  if (aqi <= 200)
    return {
      label: "Moderate",
      color: "text-orange-400",
      bgColor: "bg-orange-500/20",
    };
  if (aqi <= 300)
    return { label: "Poor", color: "text-red-400", bgColor: "bg-red-500/20" };
  if (aqi <= 400)
    return {
      label: "Very Poor",
      color: "text-purple-400",
      bgColor: "bg-purple-500/20",
    };
  return { label: "Severe", color: "text-rose-400", bgColor: "bg-rose-500/20" };
}

export function getAQIGradientColor(aqi: number): string {
  if (aqi <= 50) return "#00e400";
  if (aqi <= 100) return "#ffff00";
  if (aqi <= 200) return "#ff7e00";
  if (aqi <= 300) return "#ff0000";
  if (aqi <= 400) return "#8f3f97";
  return "#7e0023";
}
