"use client";

import { useState, useCallback } from "react";
import Map, { Marker, Popup, NavigationControl, Source, Layer } from "react-map-gl/mapbox";
import {
  type StationReading,
  type HeatmapPoint,
  getAQICategory,
  getAQIGradientColor,
} from "@/lib/api";
import "mapbox-gl/dist/mapbox-gl.css";

const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_TOKEN || "";

const INDIA_CENTER = {
  longitude: 78.9629,
  latitude: 22.5,
  zoom: 4.5,
  pitch: 0,
  bearing: 0,
};

interface AQIMapProps {
  stations: StationReading[];
  heatmapPoints?: HeatmapPoint[];
  onStationClick?: (station: StationReading) => void;
}

function stationToGeoJSON(stations: StationReading[]) {
  return {
    type: "FeatureCollection" as const,
    features: stations.map((s) => ({
      type: "Feature" as const,
      properties: {
        aqi: s.aqi,
        pm25: s.pm25 || 0,
        name: s.station_name.split(",")[0],
        color: getAQIGradientColor(s.aqi),
      },
      geometry: {
        type: "Point" as const,
        coordinates: [s.longitude, s.latitude],
      },
    })),
  };
}

export default function AQIMap({
  stations,
  onStationClick,
}: AQIMapProps) {
  const [viewState, setViewState] = useState(INDIA_CENTER);
  const [selectedStation, setSelectedStation] =
    useState<StationReading | null>(null);

  const handleStationClick = useCallback(
    (station: StationReading) => {
      setSelectedStation(station);
      onStationClick?.(station);
    },
    [onStationClick]
  );

  if (!MAPBOX_TOKEN) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-card rounded-[28px] border border-border">
        <div className="text-center space-y-2">
          <p className="text-muted-foreground text-sm">mapbox token not configured</p>
          <p className="text-muted-foreground/60 text-xs">
            add NEXT_PUBLIC_MAPBOX_TOKEN to .env.local
          </p>
        </div>
      </div>
    );
  }

  const geojson = stationToGeoJSON(stations);

  return (
    <div className="w-full h-full relative rounded-[28px] overflow-hidden shadow-[0_1px_0_var(--hairline-soft)]">
      <Map
        {...viewState}
        onMove={(evt) => setViewState(evt.viewState)}
        mapboxAccessToken={MAPBOX_TOKEN}
        mapStyle="mapbox://styles/mapbox/light-v11"
        style={{ width: "100%", height: "100%" }}
      >
        <NavigationControl position="top-right" />

        {/* AQI layers */}
        <Source id="aqi-zones" type="geojson" data={geojson}>
          {/* Subtle heatmap overlay — light, readable */}
          <Layer
            id="aqi-heatmap"
            type="heatmap"
            paint={{
              "heatmap-weight": ["interpolate", ["linear"], ["get", "aqi"], 0, 0.1, 200, 0.5, 500, 1],
              "heatmap-intensity": 0.6,
              "heatmap-radius": ["interpolate", ["linear"], ["zoom"], 4, 25, 8, 40, 12, 60],
              "heatmap-opacity": ["interpolate", ["linear"], ["zoom"], 4, 0.25, 10, 0.15, 14, 0.05],
              "heatmap-color": [
                "interpolate", ["linear"], ["heatmap-density"],
                0, "rgba(0,0,0,0)",
                0.1, "rgba(0,228,0,0.3)",
                0.3, "rgba(255,255,0,0.4)",
                0.5, "rgba(255,126,0,0.4)",
                0.7, "rgba(255,0,0,0.4)",
                0.9, "rgba(143,63,151,0.4)",
                1, "rgba(126,0,35,0.4)",
              ],
            }}
          />
          {/* Soft glow per station */}
          <Layer
            id="aqi-glow"
            type="circle"
            paint={{
              "circle-radius": ["interpolate", ["linear"], ["zoom"],
                4, ["interpolate", ["linear"], ["get", "aqi"], 0, 4, 200, 8, 500, 14],
                10, ["interpolate", ["linear"], ["get", "aqi"], 0, 20, 200, 35, 500, 55],
              ],
              "circle-color": ["get", "color"],
              "circle-opacity": 0.12,
              "circle-blur": 0.8,
            }}
          />
          {/* Core dot */}
          <Layer
            id="aqi-core"
            type="circle"
            paint={{
              "circle-radius": ["interpolate", ["linear"], ["zoom"],
                4, 3,
                8, 6,
                12, 10,
              ],
              "circle-color": ["get", "color"],
              "circle-opacity": 0.7,
              "circle-stroke-width": 1.5,
              "circle-stroke-color": "#ffffff",
              "circle-stroke-opacity": 0.9,
            }}
          />
        </Source>

        {/* Station markers — scale with zoom */}
        {stations.map((station) => (
          <Marker
            key={station.station_id}
            longitude={station.longitude}
            latitude={station.latitude}
            anchor="center"
            onClick={(e) => {
              e.originalEvent.stopPropagation();
              handleStationClick(station);
            }}
          >
            <div className="cursor-pointer group flex flex-col items-center">
              <div
                className="flex items-center justify-center rounded-full shadow-md transition-transform group-hover:scale-125 border-[1.5px] border-white"
                style={{
                  width: viewState.zoom > 8 ? 30 : viewState.zoom > 6 ? 20 : 12,
                  height: viewState.zoom > 8 ? 30 : viewState.zoom > 6 ? 20 : 12,
                  backgroundColor: getAQIGradientColor(station.aqi),
                }}
              >
                {viewState.zoom > 7 && (
                  <span className="text-[8px] font-bold text-white drop-shadow-sm" style={{ fontVariationSettings: "'wght' 700" }}>
                    {station.aqi}
                  </span>
                )}
              </div>
              {viewState.zoom > 9 && (
                <span className="mt-0.5 text-[8px] text-foreground/60 whitespace-nowrap font-mono uppercase tracking-wider">
                  {station.station_name.split(",")[0].toLowerCase()}
                </span>
              )}
            </div>
          </Marker>
        ))}

        {selectedStation && (
          <Popup
            longitude={selectedStation.longitude}
            latitude={selectedStation.latitude}
            anchor="bottom"
            onClose={() => setSelectedStation(null)}
            closeOnClick={false}
            className="!bg-transparent"
            offset={20}
          >
            <StationPopup station={selectedStation} />
          </Popup>
        )}
      </Map>

      <AQILegend />

      {/* Station count badge */}
      <div className="absolute top-4 left-4 bg-card/90 backdrop-blur rounded-full px-3 py-1.5 shadow-sm border border-border">
        <span className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
          {stations.length} stations · {new Set(stations.map(s => (s as StationReading & {city?: string}).city).filter(Boolean)).size || 1} cities · all india
        </span>
      </div>
    </div>
  );
}

function StationPopup({ station }: { station: StationReading }) {
  const category = getAQICategory(station.aqi);
  return (
    <div className="bg-card border border-border rounded-2xl p-4 min-w-[240px] shadow-lg">
      <p className="text-[14px] truncate lowercase" style={{ fontVariationSettings: "'wght' 620" }}>
        {station.station_name.split(",")[0].toLowerCase()}
      </p>
      <div className="mt-2 flex items-baseline gap-2">
        <span
          className="font-display text-3xl tracking-tight"
          style={{ color: getAQIGradientColor(station.aqi) }}
        >
          {station.aqi}
        </span>
        <span className="font-mono text-[10px] uppercase tracking-wider" style={{ color: getAQIGradientColor(station.aqi) }}>
          {category.label}
        </span>
      </div>
      <div className="mt-3 grid grid-cols-3 gap-2">
        {[
          { label: "pm2.5", value: station.pm25 },
          { label: "pm10", value: station.pm10 },
          { label: "no2", value: station.no2 },
          { label: "temp", value: station.temperature, unit: "°" },
          { label: "wind", value: station.wind_speed, unit: "m/s" },
          { label: "humidity", value: station.humidity, unit: "%" },
        ].map((item) => (
          <div key={item.label}>
            <span className="font-mono text-[8px] uppercase tracking-wider text-muted-foreground">{item.label}</span>
            <p className="text-[12px] tabular-nums" style={{ fontVariationSettings: "'wght' 540" }}>
              {item.value != null ? `${item.value}${item.unit || ""}` : "—"}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

function AQILegend() {
  const levels = [
    { label: "good", color: "#00e400", range: "0–50" },
    { label: "satisfactory", color: "#ffff00", range: "51–100" },
    { label: "moderate", color: "#ff7e00", range: "101–200" },
    { label: "poor", color: "#ff0000", range: "201–300" },
    { label: "very poor", color: "#8f3f97", range: "301–400" },
    { label: "severe", color: "#7e0023", range: "401–500" },
  ];

  return (
    <div className="absolute bottom-4 left-4 bg-card/90 backdrop-blur border border-border rounded-2xl p-3 shadow-sm">
      <p className="font-mono text-[9px] uppercase tracking-wider text-muted-foreground mb-2">aqi scale</p>
      <div className="flex gap-1.5">
        {levels.map((level) => (
          <div key={level.label} className="flex flex-col items-center gap-0.5">
            <div
              className="w-5 h-5 rounded-lg"
              style={{ backgroundColor: level.color }}
            />
            <span className="text-[8px] text-muted-foreground tabular-nums">{level.range}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
