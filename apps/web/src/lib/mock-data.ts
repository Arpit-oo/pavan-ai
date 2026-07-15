import type { StationReading, HeatmapPoint } from "./api";

export const MOCK_STATIONS: StationReading[] = [
  { station_id: "site_1544", station_name: "Anand Vihar, Delhi - DPCC", latitude: 28.6468, longitude: 77.3160, timestamp: new Date().toISOString(), pm25: 142, pm10: 245, no2: 68, so2: 18, co: 2.1, o3: 32, aqi: 267, temperature: 40, humidity: 25, wind_speed: 3.2, wind_direction: 290 },
  { station_id: "site_1545", station_name: "Ashok Vihar, Delhi - DPCC", latitude: 28.6953, longitude: 77.1818, timestamp: new Date().toISOString(), pm25: 95, pm10: 168, no2: 52, so2: 14, co: 1.8, o3: 28, aqi: 172, temperature: 39, humidity: 28, wind_speed: 4.1, wind_direction: 300 },
  { station_id: "site_1546", station_name: "Bawana, Delhi - DPCC", latitude: 28.7763, longitude: 77.0513, timestamp: new Date().toISOString(), pm25: 118, pm10: 210, no2: 72, so2: 22, co: 2.5, o3: 25, aqi: 221, temperature: 41, humidity: 22, wind_speed: 2.8, wind_direction: 310 },
  { station_id: "site_1548", station_name: "DTU, Delhi - CPCB", latitude: 28.7500, longitude: 77.1112, timestamp: new Date().toISOString(), pm25: 78, pm10: 145, no2: 45, so2: 11, co: 1.5, o3: 35, aqi: 156, temperature: 38, humidity: 30, wind_speed: 5.2, wind_direction: 280 },
  { station_id: "site_1549", station_name: "Dwarka Sector 8, Delhi - DPCC", latitude: 28.5700, longitude: 77.0700, timestamp: new Date().toISOString(), pm25: 62, pm10: 118, no2: 38, so2: 9, co: 1.2, o3: 42, aqi: 126, temperature: 39, humidity: 26, wind_speed: 4.8, wind_direction: 270 },
  { station_id: "site_1551", station_name: "ITO, Delhi - CPCB", latitude: 28.6285, longitude: 77.2413, timestamp: new Date().toISOString(), pm25: 108, pm10: 195, no2: 82, so2: 20, co: 2.8, o3: 22, aqi: 198, temperature: 40, humidity: 24, wind_speed: 3.5, wind_direction: 295 },
  { station_id: "site_1553", station_name: "JLN Stadium, Delhi - DPCC", latitude: 28.5820, longitude: 77.2340, timestamp: new Date().toISOString(), pm25: 72, pm10: 130, no2: 42, so2: 10, co: 1.4, o3: 38, aqi: 142, temperature: 39, humidity: 27, wind_speed: 4.5, wind_direction: 285 },
  { station_id: "site_1554", station_name: "Lodhi Road, Delhi - IMD", latitude: 28.5918, longitude: 77.2273, timestamp: new Date().toISOString(), pm25: 55, pm10: 98, no2: 35, so2: 8, co: 1.0, o3: 45, aqi: 108, temperature: 38, humidity: 29, wind_speed: 5.5, wind_direction: 275 },
  { station_id: "site_1556", station_name: "Mundka, Delhi - DPCC", latitude: 28.6844, longitude: 77.0315, timestamp: new Date().toISOString(), pm25: 125, pm10: 220, no2: 65, so2: 19, co: 2.3, o3: 28, aqi: 232, temperature: 41, humidity: 21, wind_speed: 2.5, wind_direction: 305 },
  { station_id: "site_1559", station_name: "Narela, Delhi - DPCC", latitude: 28.8225, longitude: 77.1025, timestamp: new Date().toISOString(), pm25: 135, pm10: 238, no2: 70, so2: 21, co: 2.6, o3: 24, aqi: 248, temperature: 42, humidity: 20, wind_speed: 2.2, wind_direction: 315 },
  { station_id: "site_1561", station_name: "North Campus DU, Delhi - IMD", latitude: 28.6580, longitude: 77.2112, timestamp: new Date().toISOString(), pm25: 68, pm10: 125, no2: 40, so2: 10, co: 1.3, o3: 40, aqi: 135, temperature: 39, humidity: 27, wind_speed: 4.8, wind_direction: 280 },
  { station_id: "site_1563", station_name: "Patparganj, Delhi - DPCC", latitude: 28.6237, longitude: 77.2873, timestamp: new Date().toISOString(), pm25: 98, pm10: 175, no2: 55, so2: 15, co: 1.9, o3: 30, aqi: 178, temperature: 40, humidity: 25, wind_speed: 3.8, wind_direction: 290 },
  { station_id: "site_1564", station_name: "Punjabi Bagh, Delhi - DPCC", latitude: 28.6729, longitude: 77.1318, timestamp: new Date().toISOString(), pm25: 88, pm10: 158, no2: 48, so2: 13, co: 1.7, o3: 33, aqi: 165, temperature: 39, humidity: 26, wind_speed: 4.2, wind_direction: 285 },
  { station_id: "site_1566", station_name: "RK Puram, Delhi - DPCC", latitude: 28.5633, longitude: 77.1866, timestamp: new Date().toISOString(), pm25: 82, pm10: 148, no2: 50, so2: 12, co: 1.6, o3: 36, aqi: 158, temperature: 38, humidity: 28, wind_speed: 4.6, wind_direction: 278 },
  { station_id: "site_1567", station_name: "Rohini, Delhi - DPCC", latitude: 28.7329, longitude: 77.1197, timestamp: new Date().toISOString(), pm25: 105, pm10: 188, no2: 58, so2: 16, co: 2.0, o3: 27, aqi: 192, temperature: 40, humidity: 23, wind_speed: 3.3, wind_direction: 300 },
  { station_id: "site_1570", station_name: "Sonia Vihar, Delhi - DPCC", latitude: 28.7100, longitude: 77.2493, timestamp: new Date().toISOString(), pm25: 112, pm10: 198, no2: 62, so2: 17, co: 2.2, o3: 26, aqi: 205, temperature: 41, humidity: 22, wind_speed: 3.0, wind_direction: 305 },
  { station_id: "site_1572", station_name: "Vivek Vihar, Delhi - DPCC", latitude: 28.6724, longitude: 77.3150, timestamp: new Date().toISOString(), pm25: 128, pm10: 225, no2: 68, so2: 20, co: 2.4, o3: 24, aqi: 238, temperature: 41, humidity: 21, wind_speed: 2.6, wind_direction: 310 },
  { station_id: "site_1573", station_name: "Wazirpur, Delhi - DPCC", latitude: 28.6997, longitude: 77.1640, timestamp: new Date().toISOString(), pm25: 145, pm10: 258, no2: 75, so2: 24, co: 2.9, o3: 20, aqi: 275, temperature: 41, humidity: 20, wind_speed: 2.0, wind_direction: 315 },
];

export function generateMockHeatmapPoints(): HeatmapPoint[] {
  const points: HeatmapPoint[] = [];
  const minLat = 28.48, maxLat = 28.85;
  const minLng = 76.93, maxLng = 77.35;
  const res = 40;

  for (let i = 0; i < res; i++) {
    for (let j = 0; j < res; j++) {
      const lat = minLat + (maxLat - minLat) * (i / res);
      const lng = minLng + (maxLng - minLng) * (j / res);

      let aqi = 120;
      for (const s of MOCK_STATIONS) {
        const dist = Math.sqrt((lat - s.latitude) ** 2 + (lng - s.longitude) ** 2);
        if (dist < 0.15) {
          const weight = 1 / (dist ** 2 + 0.001);
          aqi += (s.aqi - 120) * weight * 0.002;
        }
      }
      aqi = Math.max(30, Math.min(400, aqi));

      points.push({
        lat: Math.round(lat * 100000) / 100000,
        lng: Math.round(lng * 100000) / 100000,
        aqi: Math.round(aqi),
        color: aqiColor(aqi),
      });
    }
  }
  return points;
}

function aqiColor(aqi: number): [number, number, number, number] {
  if (aqi <= 50) return [0, 228, 0, 160];
  if (aqi <= 100) return [255, 255, 0, 160];
  if (aqi <= 200) return [255, 126, 0, 180];
  if (aqi <= 300) return [255, 0, 0, 200];
  if (aqi <= 400) return [143, 63, 151, 220];
  return [126, 0, 35, 240];
}

export const MOCK_FORECAST = Array.from({ length: 24 }, (_, i) => {
  const base = 155 + Math.sin((i / 24) * Math.PI * 2 - 1) * 40 + (Math.random() - 0.5) * 20;
  return {
    time: `+${i + 1}h`,
    hour: `+${i + 1}h`,
    aqi: Math.round(base),
    lower: Math.round(base - 15 - i * 2),
    upper: Math.round(base + 15 + i * 2),
  };
});

export const MOCK_AGENT_LOG = [
  { timestamp: new Date().toISOString(), agent: "orchestrator", message: "Starting parallel data collection" },
  { timestamp: new Date().toISOString(), agent: "sensor", message: "Starting sensor" },
  { timestamp: new Date().toISOString(), agent: "weather", message: "Starting weather" },
  { timestamp: new Date().toISOString(), agent: "weather", message: "Completed weather in 0.45s — Wind 4.4m/s from WNW. Dispersion: moderate." },
  { timestamp: new Date().toISOString(), agent: "sensor", message: "Completed sensor in 2.1s — Pulled 18 stations. Avg AQI: 192.4. 5 hotspots (AQI>200)." },
  { timestamp: new Date().toISOString(), agent: "orchestrator", message: "Running analysis agents" },
  { timestamp: new Date().toISOString(), agent: "anomaly", message: "Completed anomaly in 0.01s — 3 anomalies detected. 1 critical." },
  { timestamp: new Date().toISOString(), agent: "attribution", message: "Completed attribution in 0.02s — Attributed 18 stations. Dominant source: vehicular (38%). Wind from WNW." },
  { timestamp: new Date().toISOString(), agent: "orchestrator", message: "Running enforcement agent" },
  { timestamp: new Date().toISOString(), agent: "enforcement", message: "Completed enforcement in 0.01s — 4 recs. 1 immediate priority." },
];

export const MOCK_ANALYSIS_SUMMARY = {
  status: "Poor",
  urgency: "high",
  avg_aqi: 192.4,
  max_aqi: 275,
  station_count: 18,
  hotspot_count: 5,
  anomaly_count: 3,
  critical_anomalies: 1,
  dominant_source: "vehicular",
  pollution_outlook: "worsening — stagnant conditions trapping pollutants",
  wind_speed: 2.5,
  stagnation: true,
  grap_stage: "I — Poor",
  headline: "POOR air quality — enforcement action recommended. 3 anomalies detected. Conditions expected to worsen",
  enforcement_recs: 4,
};
