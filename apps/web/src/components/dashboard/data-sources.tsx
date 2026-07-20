"use client";

const SOURCES = [
  { icon: "📡", name: "CPCB CAAQMS", status: "live", detail: "105 stations, 57 cities", color: "var(--entity-good)" },
  { icon: "🌤️", name: "OpenWeatherMap", status: "live", detail: "wind, temp, humidity", color: "var(--entity-forecast)" },
  { icon: "🛰️", name: "Sentinel-5P", status: "active", detail: "NO2/SO2 column density", color: "var(--entity-severe)" },
  { icon: "🔥", name: "MODIS-VIIRS", status: "active", detail: "fire detection, 20 hotspots", color: "var(--entity-poor)" },
  { icon: "🚗", name: "Traffic Mobility", status: "active", detail: "congestion, truck routes", color: "var(--entity-moderate)" },
];

export default function DataSources() {
  return (
    <div className="ru-bento">
      <div className="p-5">
        <div className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground mb-3">
          data sources · 5 active
        </div>
        <div className="space-y-2">
          {SOURCES.map((s) => (
            <div key={s.name} className="flex items-center gap-3">
              <span className="text-lg shrink-0">{s.icon}</span>
              <div className="flex-1 min-w-0">
                <p className="text-[13px] truncate" style={{ fontVariationSettings: "'wght' 580" }}>{s.name.toLowerCase()}</p>
                <p className="text-[10px] text-muted-foreground truncate">{s.detail}</p>
              </div>
              <span className="w-2 h-2 rounded-full shrink-0" style={{ background: s.color }} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
