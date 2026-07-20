"use client";

import NavBar from "@/components/nav/navbar";

const LAYERS = [
  {
    name: "presentation layer",
    color: "var(--entity-forecast)",
    fg: "#fff",
    items: ["next.js 16", "deck.gl + mapbox", "recharts", "bricolage + fraunces fonts", "shadcn/ui"],
  },
  {
    name: "api layer — fastapi",
    color: "var(--entity-moderate)",
    fg: "#1a1a18",
    items: ["/aqi (live, historical, heatmap, risk, zones)", "/forecast (city, station, model)", "/agents (ask, analyze, quick)", "/simulate (run, compare, types)", "/alerts (active, whatsapp, health-impact)", "/compliance (grap, report)"],
  },
  {
    name: "agent mesh — 6 agents",
    color: "var(--entity-severe)",
    fg: "#fff",
    items: ["orchestrator — coordinates all agents", "sensor — cpcb station data", "weather — wind analysis, stagnation", "anomaly — spike detection", "attribution — source decomposition", "enforcement — inspector recommendations"],
  },
  {
    name: "ml pipeline",
    color: "var(--entity-wind)",
    fg: "#0a0a08",
    items: ["xgboost forecast (mae 4.88)", "idw interpolation", "compound risk scoring", "intervention simulator"],
  },
  {
    name: "data layer",
    color: "var(--entity-wind)",
    fg: "#0a0a08",
    items: ["supabase (postgres + realtime)", "cpcb 105 stations / 57 cities", "openweathermap api", "sentinel-5p (no2/so2)", "modis-viirs (fire detection)", "traffic mobility (congestion)", "gpt-4o-mini (chatbot)"],
  },
];

const AGENTS = [
  { icon: "🧠", name: "orchestrator", desc: "coordinates 3-phase pipeline", phase: "all" },
  { icon: "📡", name: "sensor", desc: "cpcb real-time data", phase: "1" },
  { icon: "🌤️", name: "weather", desc: "wind + stagnation", phase: "1" },
  { icon: "⚡", name: "anomaly", desc: "spike detection", phase: "2" },
  { icon: "🔍", name: "attribution", desc: "source decomposition", phase: "2" },
  { icon: "🛡️", name: "enforcement", desc: "inspector recs", phase: "3" },
];

const DATA_FLOW = [
  { from: "cpcb api", to: "sensor agent", label: "105 stations, 6 pollutants" },
  { from: "openweathermap", to: "weather agent", label: "wind, temp, humidity, forecast" },
  { from: "sentinel-5p", to: "orchestrator", label: "no2/so2 column density, 1600 grid points" },
  { from: "modis-viirs", to: "orchestrator", label: "20 active fire detections" },
  { from: "traffic api", to: "orchestrator", label: "congestion index, truck routes" },
  { from: "sensor + weather", to: "anomaly agent", label: "readings + wind patterns" },
  { from: "sensor + weather", to: "attribution agent", label: "readings + wind + traffic" },
  { from: "anomaly + attribution", to: "enforcement agent", label: "anomalies + sources" },
  { from: "all agents", to: "orchestrator", label: "merged 5-source analysis" },
  { from: "orchestrator", to: "gpt-4o-mini", label: "natural language response" },
  { from: "xgboost", to: "forecast api", label: "24-72hr predictions (rmse 11.74)" },
  { from: "attribution", to: "simulator", label: "source weights for counterfactuals" },
];

function Sticker({ children, tilt = -3, dark = false }: { children: React.ReactNode; tilt?: number; dark?: boolean }) {
  return (
    <span style={{ transform: `rotate(${tilt}deg)` }} className={`inline-flex items-center rounded-full px-2.5 py-1 font-mono text-[10px] font-semibold uppercase tracking-[0.16em] shadow-[0_1px_3px_rgba(0,0,0,0.08)] ${dark ? "bg-[#0a0a0c] text-[#f5f0e6]" : "bg-white text-[#0a0a0c]"}`}>
      {children}
    </span>
  );
}

export default function ArchitecturePage() {
  return (
    <div className="flex flex-col min-h-screen">
      <NavBar />
      <main className="flex-1 overflow-y-auto">
        <div className="mx-auto max-w-7xl px-4 pt-8 pb-20 sm:px-6 space-y-10">
          <header>
            <div className="font-mono text-[11px] uppercase tracking-[0.22em] text-muted-foreground mb-3">system design</div>
            <h1 className="lowercase leading-[0.95]" style={{ fontSize: "clamp(40px, 6vw, 64px)", fontVariationSettings: "'wght' 760, 'wdth' 94, 'opsz' 72", letterSpacing: "-0.035em" }}>
              architecture
            </h1>
            <p className="mt-3 max-w-[60ch] text-[15px] leading-[1.5] text-muted-foreground">
              pavan&apos;s multi-agent ai architecture for urban air quality intelligence
            </p>
          </header>

          {/* Stack layers */}
          <div className="space-y-3">
            {LAYERS.map((layer, i) => (
              <div
                key={layer.name}
                className="ru-bento"
                style={{ "--bento-bg": layer.color, "--bento-fg": layer.fg } as React.CSSProperties}
              >
                <div className="p-8 flex flex-col md:flex-row md:items-center gap-5">
                  <div className="md:w-64 shrink-0">
                    <Sticker tilt={-2}>layer {i + 1}</Sticker>
                    <p className="mt-3 text-[20px] lowercase" style={{ fontVariationSettings: "'wght' 700" }}>
                      {layer.name}
                    </p>
                  </div>
                  <div className="flex-1 flex flex-wrap gap-2.5">
                    {layer.items.map((item) => (
                      <span key={item} className="font-mono text-[12px] bg-white/30 rounded-full px-4 py-2 lowercase" style={{fontVariationSettings:"'wght' 560"}}>
                        {item}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Agent pipeline */}
          <div>
            <div className="flex items-center gap-2.5 mb-5">
              <span className="inline-block h-2.5 w-2.5 rounded-[3px]" style={{ background: "var(--entity-severe)" }} />
              <span className="font-mono text-[11px] uppercase tracking-[0.2em]">3-phase agent pipeline</span>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              {["1", "2", "3"].map((phase) => {
                const phaseAgents = AGENTS.filter((a) => a.phase === phase || a.phase === "all");
                const phaseNames = ["data collection", "analysis", "enforcement"];
                const phaseColors = ["var(--entity-good)", "var(--entity-forecast)", "var(--entity-moderate)"];
                return (
                  <div key={phase} className="ru-bento">
                    <div className="p-6">
                      <div className="flex items-center gap-2 mb-4">
                        <span className="inline-block w-3 h-3 rounded-full" style={{ background: phaseColors[Number(phase) - 1] }} />
                        <span className="font-mono text-[11px] uppercase tracking-wider text-muted-foreground">phase {phase}</span>
                      </div>
                      <p className="text-[16px] lowercase mb-4" style={{ fontVariationSettings: "'wght' 640" }}>
                        {phaseNames[Number(phase) - 1]}
                      </p>
                      <div className="space-y-3">
                        {phaseAgents.map((agent) => (
                          <div key={agent.name} className="flex items-center gap-3">
                            <span className="text-xl">{agent.icon}</span>
                            <div>
                              <p className="text-[13px] lowercase" style={{ fontVariationSettings: "'wght' 580" }}>{agent.name}</p>
                              <p className="text-[11px] text-muted-foreground lowercase">{agent.desc}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Data flow */}
          <div className="ru-bento" style={{ "--bento-bg": "var(--entity-forecast)", "--bento-fg": "#ffffff" } as React.CSSProperties}>
            <div className="p-10">
              <div className="font-mono text-[12px] uppercase tracking-[0.18em] opacity-80 mb-8">data flow</div>
              <div className="space-y-3">
                {DATA_FLOW.map((flow, i) => (
                  <div key={i} className="flex items-center gap-4">
                    <span className="font-mono text-[13px] opacity-80 w-44 text-right shrink-0 lowercase">{flow.from}</span>
                    <span className="text-[14px] opacity-50">→</span>
                    <span className="font-mono text-[13px] opacity-80 w-44 shrink-0 lowercase">{flow.to}</span>
                    <span className="font-mono text-[11px] bg-white/15 rounded-full px-3 py-1 lowercase">{flow.label}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Tech stack summary */}
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            {[
              { label: "stations", value: "105", sub: "across india" },
              { label: "cities", value: "57", sub: "all state capitals" },
              { label: "agents", value: "6", sub: "coordinated" },
              { label: "endpoints", value: "27", sub: "rest api" },
              { label: "data sources", value: "5", sub: "fused" },
              { label: "rmse improvement", value: "86%", sub: "vs persistence" },
            ].map((stat) => (
              <div key={stat.label} className="ru-bento">
                <div className="p-6 text-center">
                  <span className="font-display leading-[0.82] tracking-[-0.04em]" style={{ fontSize: "48px", color: "var(--entity-forecast)" }}>
                    {stat.value}
                  </span>
                  <p className="mt-2 text-[14px] lowercase" style={{ fontVariationSettings: "'wght' 620" }}>{stat.label}</p>
                  <p className="font-mono text-[10px] text-muted-foreground uppercase tracking-wider mt-1">{stat.sub}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
