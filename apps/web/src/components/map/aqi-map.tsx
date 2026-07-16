"use client";

import { useEffect, useState, useCallback } from "react";
import Map, { Marker, Popup, NavigationControl } from "react-map-gl/mapbox";
import { HeatmapLayer } from "deck.gl";
import { DeckGL } from "@deck.gl/react";
import {
  type StationReading,
  type HeatmapPoint,
  getAQICategory,
  getAQIGradientColor,
} from "@/lib/api";
import "mapbox-gl/dist/mapbox-gl.css";

const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_TOKEN || "";

const DELHI_CENTER = {
  longitude: 77.1025,
  latitude: 28.7041,
  zoom: 10.5,
  pitch: 45,
  bearing: -15,
};

interface AQIMapProps {
  stations: StationReading[];
  heatmapPoints?: HeatmapPoint[];
  onStationClick?: (station: StationReading) => void;
}

export default function AQIMap({
  stations,
  heatmapPoints,
  onStationClick,
}: AQIMapProps) {
  const [viewState, setViewState] = useState(DELHI_CENTER);
  const [selectedStation, setSelectedStation] =
    useState<StationReading | null>(null);

  const heatmapLayer = heatmapPoints?.length
    ? new HeatmapLayer({
        id: "aqi-heatmap",
        data: heatmapPoints,
        getPosition: (d: HeatmapPoint) => [d.lng, d.lat],
        getWeight: (d: HeatmapPoint) => d.aqi / 500,
        radiusPixels: 60,
        intensity: 1.5,
        threshold: 0.05,
        colorRange: [
          [0, 228, 0],
          [255, 255, 0],
          [255, 126, 0],
          [255, 0, 0],
          [143, 63, 151],
          [126, 0, 35],
        ],
        opacity: 0.6,
      })
    : null;

  const handleStationClick = useCallback(
    (station: StationReading) => {
      setSelectedStation(station);
      onStationClick?.(station);
    },
    [onStationClick]
  );

  if (!MAPBOX_TOKEN) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-card rounded-2xl border border-border">
        <div className="text-center space-y-2">
          <p className="text-muted-foreground text-sm">Mapbox token not configured</p>
          <p className="text-muted-foreground/60 text-xs">
            Add NEXT_PUBLIC_MAPBOX_TOKEN to .env.local
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-full relative rounded-2xl overflow-hidden border border-border shadow-sm">
      <DeckGL
        viewState={viewState}
        onViewStateChange={({ viewState: vs }) => setViewState(vs as typeof viewState)}
        controller
        layers={heatmapLayer ? [heatmapLayer] : []}
      >
        <Map
          mapboxAccessToken={MAPBOX_TOKEN}
          mapStyle="mapbox://styles/mapbox/light-v11"
          style={{ width: "100%", height: "100%" }}
        >
          <NavigationControl position="top-right" />

          {stations.map((station) => {
            const category = getAQICategory(station.aqi);
            return (
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
                <div
                  className="cursor-pointer flex items-center justify-center rounded-full border-2 border-white/30 shadow-lg transition-transform hover:scale-125"
                  style={{
                    width: 36,
                    height: 36,
                    backgroundColor: getAQIGradientColor(station.aqi),
                  }}
                >
                  <span className="text-[10px] font-bold text-white drop-shadow">
                    {station.aqi}
                  </span>
                </div>
              </Marker>
            );
          })}

          {selectedStation && (
            <Popup
              longitude={selectedStation.longitude}
              latitude={selectedStation.latitude}
              anchor="bottom"
              onClose={() => setSelectedStation(null)}
              closeOnClick={false}
              className="!bg-transparent"
            >
              <StationPopup station={selectedStation} />
            </Popup>
          )}
        </Map>
      </DeckGL>

      <AQILegend />
    </div>
  );
}

function StationPopup({ station }: { station: StationReading }) {
  const category = getAQICategory(station.aqi);
  return (
    <div className="bg-card border border-border rounded-2xl p-3 min-w-[220px] shadow-lg">
      <p className="font-semibold text-sm text-foreground truncate">
        {station.station_name.split(",")[0]}
      </p>
      <div className="mt-2 flex items-center gap-2">
        <span
          className="text-2xl font-bold"
          style={{ color: getAQIGradientColor(station.aqi) }}
        >
          {station.aqi}
        </span>
        <span className={`text-xs ${category.color}`}>{category.label}</span>
      </div>
      <div className="mt-2 grid grid-cols-2 gap-1 text-xs text-muted-foreground">
        <span>PM2.5: {station.pm25 ?? "—"}</span>
        <span>PM10: {station.pm10 ?? "—"}</span>
        <span>NO2: {station.no2 ?? "—"}</span>
        <span>SO2: {station.so2 ?? "—"}</span>
        <span>Temp: {station.temperature ?? "—"}°C</span>
        <span>Wind: {station.wind_speed ?? "—"} m/s</span>
      </div>
    </div>
  );
}

function AQILegend() {
  const levels = [
    { label: "Good", color: "#00e400", range: "0-50" },
    { label: "Satisfactory", color: "#ffff00", range: "51-100" },
    { label: "Moderate", color: "#ff7e00", range: "101-200" },
    { label: "Poor", color: "#ff0000", range: "201-300" },
    { label: "Very Poor", color: "#8f3f97", range: "301-400" },
    { label: "Severe", color: "#7e0023", range: "401-500" },
  ];

  return (
    <div className="absolute bottom-4 left-4 bg-card/90 backdrop-blur border border-border rounded-2xl p-3 shadow-sm">
      <p className="h-eyebrow mb-2">AQI Scale</p>
      <div className="space-y-1">
        {levels.map((level) => (
          <div key={level.label} className="flex items-center gap-2 text-xs">
            <div
              className="w-3 h-3 rounded-sm"
              style={{ backgroundColor: level.color }}
            />
            <span className="text-muted-foreground">{level.range}</span>
            <span className="text-muted-foreground/60">{level.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
