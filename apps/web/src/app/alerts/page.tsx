"use client";

import { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { fetchAPI } from "@/lib/api";
import { getCityAlertData, getCityHealthData } from "@/lib/city-mock-data";
import NavBar from "@/components/nav/navbar";
import CitySelector from "@/components/dashboard/city-selector";

interface AlertData {
  city: string;
  alerts: {
    avg_aqi: number;
    level: string;
    alert_count: number;
    city_advisory: Record<string, string>;
    zone_alerts: Array<{ station: string; aqi: number; level: string; message_en: string; message_hi: string }>;
    whatsapp_message: Record<string, string>;
    languages: string[];
  };
}

interface HealthImpact {
  avg_aqi: number;
  avg_pm25: number;
  who_pm25_limit: number;
  excess_over_who: number;
  total_population: number;
  estimated_excess_hospital_visits_24h: number;
  schools_in_affected_zones: number;
  hospitals_nearby: number;
}

const levelEmoji: Record<string, string> = { good: "✅", moderate: "⚠️", poor: "🟠", very_poor: "🔴", severe: "🚨" };
const langNames: Record<string, string> = { en: "english", hi: "हिन्दी", ta: "தமிழ்", bn: "বাংলা" };

function Sticker({ children, tilt = -3, dark = false }: { children: React.ReactNode; tilt?: number; dark?: boolean }) {
  return (
    <span
      style={{ transform: `rotate(${tilt}deg)` }}
      className={`inline-flex items-center rounded-full px-2.5 py-1 font-mono text-[10px] font-semibold uppercase tracking-[0.16em] shadow-[0_1px_3px_rgba(0,0,0,0.08)] ${
        dark ? "bg-[#0a0a0c] text-[#f5f0e6]" : "bg-white text-[#0a0a0c]"
      }`}
    >
      {children}
    </span>
  );
}

export default function AlertsPage() {
  const [data, setData] = useState<AlertData | null>(null);
  const [health, setHealth] = useState<HealthImpact | null>(null);
  const [alertCity, setAlertCity] = useState("Delhi");
  const [loading, setLoading] = useState(true);
  const [lang, setLang] = useState("en");

  useEffect(() => {
    setLoading(true);
    Promise.all([
      fetchAPI<AlertData>(`/api/v1/alerts/active?city=${alertCity}`),
      fetchAPI<HealthImpact>(`/api/v1/alerts/health-impact?city=${alertCity}`),
    ]).then(([alerts, impact]) => { setData(alerts); setHealth(impact); })
      .catch(() => {
        setData(getCityAlertData(alertCity));
        setHealth(getCityHealthData(alertCity));
      })
      .finally(() => setLoading(false));
  }, [alertCity]);

  return (
    <div className="flex flex-col min-h-screen">
      <NavBar />

      <main className="flex-1 overflow-y-auto">
        <div className="mx-auto max-w-7xl px-4 pt-6 pb-16 sm:px-6 space-y-6">
          <header className="flex flex-col gap-2.5">
            <div className="font-mono text-[11px] uppercase tracking-[0.22em] text-muted-foreground">public health</div>
            <h1 className="lowercase leading-[0.95]" style={{ fontSize: "clamp(36px, 5.6vw, 56px)", fontVariationSettings: "'wght' 760, 'wdth' 94, 'opsz' 72", letterSpacing: "-0.035em" }}>
              citizen alerts
            </h1>
            <div className="mt-4">
              <CitySelector selected={alertCity} onChange={setAlertCity} label="select city" />
            </div>
          </header>

          {loading ? (
            <div className="flex items-center justify-center py-20">
              <div className="w-6 h-6 border-2 border-foreground/30 border-t-foreground rounded-full animate-spin" />
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
                {/* Alert level tile — entity colored */}
                <div
                  className="ru-bento"
                  style={{ "--bento-bg": "var(--entity-alert)", "--bento-fg": "var(--entity-alert-fg)" } as React.CSSProperties}
                >
                  <div className="flex flex-col p-6">
                    <div className="flex items-start justify-between">
                      <Sticker tilt={-3}>level</Sticker>
                      <Sticker tilt={2} dark>{data?.alerts.level || "—"}</Sticker>
                    </div>
                    <div className="flex-1 flex items-end mt-4">
                      <span className="text-5xl">{levelEmoji[data?.alerts.level || "moderate"]}</span>
                      <span className="font-display ml-3 leading-[0.82] tracking-[-0.04em]" style={{ fontSize: "clamp(48px, 6vw, 64px)" }}>
                        {data?.alerts.avg_aqi.toFixed(0)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* PM2.5 exposure — cream tile */}
                {health && (
                  <div className="ru-bento">
                    <div className="flex flex-col p-6">
                      <div className="font-mono text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground mb-4">pm2.5 exposure</div>
                      <span className="font-display leading-[0.82] tracking-[-0.04em]" style={{ fontSize: "clamp(56px, 7vw, 72px)", color: "var(--entity-poor)" }}>
                        {health.avg_pm25.toFixed(0)}
                      </span>
                      <p className="mt-3 font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
                        {health.excess_over_who.toFixed(1)}x over who limit
                      </p>
                    </div>
                  </div>
                )}

                {/* Hospital visits — charcoal tile */}
                {health && (
                  <div className="ru-bento" style={{ "--bento-bg": "var(--entity-charcoal)", "--bento-fg": "var(--entity-charcoal-fg)" } as React.CSSProperties}>
                    <div className="flex flex-col p-6">
                      <div className="flex items-start justify-between">
                        <Sticker tilt={-2}>health impact</Sticker>
                      </div>
                      <span className="font-display leading-[0.82] tracking-[-0.04em] mt-4" style={{ fontSize: "clamp(48px, 6vw, 64px)", color: "var(--entity-moderate)" }}>
                        +{health.estimated_excess_hospital_visits_24h}
                      </span>
                      <p className="mt-2 font-mono text-[10px] uppercase tracking-wider opacity-60">
                        est. excess hospital visits · 24h
                      </p>
                      <p className="mt-1 font-mono text-[10px] uppercase tracking-wider opacity-40">
                        {health.schools_in_affected_zones} schools in zone
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* Advisory in multiple languages */}
              {data && (
                <div className="ru-bento">
                  <div className="p-6">
                    <div className="flex items-center gap-2.5 border-b border-[var(--hairline-soft)] pb-2 mb-4">
                      <span className="inline-block h-2 w-2 rounded-[2px]" style={{ background: "var(--entity-alert)" }} />
                      <span className="font-mono text-[10px] uppercase tracking-[0.2em]">health advisory</span>
                      <span className="ml-auto font-mono text-[10px] tabular-nums text-muted-foreground">
                        {data.alerts.languages.length.toString().padStart(2, "0")} languages
                      </span>
                    </div>
                    <Tabs defaultValue="en" onValueChange={setLang}>
                      <TabsList className="bg-secondary rounded-full p-0.5 h-auto">
                        {data.alerts.languages.map((l) => (
                          <TabsTrigger key={l} value={l} className="rounded-full text-[12px] px-3 py-1 data-[state=active]:bg-foreground data-[state=active]:text-background">
                            {langNames[l] || l}
                          </TabsTrigger>
                        ))}
                      </TabsList>
                      {data.alerts.languages.map((l) => (
                        <TabsContent key={l} value={l} className="mt-4">
                          <p className="text-[15px] leading-relaxed" style={{ fontVariationSettings: "'wght' 460, 'wdth' 96" }}>
                            {data.alerts.city_advisory[l] || data.alerts.city_advisory.en}
                          </p>
                        </TabsContent>
                      ))}
                    </Tabs>
                  </div>
                </div>
              )}

              {/* WhatsApp preview — switches with language tab */}
              {data && (
                <div className="ru-bento" style={{ "--bento-bg": "var(--entity-good)", "--bento-fg": "#ffffff" } as React.CSSProperties}>
                  <div className="p-6">
                    <div className="font-mono text-[10px] font-semibold uppercase tracking-[0.18em] opacity-70 mb-4">whatsapp broadcast preview · {langNames[lang] || lang}</div>
                    <div className="space-y-4">
                      <div className="bg-white/15 backdrop-blur-sm rounded-2xl p-4">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-sm">🚨</span>
                          <span className="font-mono text-[9px] uppercase tracking-wider opacity-60">threshold alert</span>
                        </div>
                        <pre className="text-[13px] whitespace-pre-wrap font-sans leading-relaxed opacity-90">
{data.alerts.whatsapp_message[lang] || data.alerts.whatsapp_message.en}
                        </pre>
                      </div>
                      <div className="bg-white/15 backdrop-blur-sm rounded-2xl p-4">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-sm">📊</span>
                          <span className="font-mono text-[9px] uppercase tracking-wider opacity-60">daily digest</span>
                        </div>
                        <pre className="text-[13px] whitespace-pre-wrap font-sans leading-relaxed opacity-90">
{lang === "hi" ? `📊 *पवन दैनिक वायु रिपोर्ट — ${data.city || alertCity}*\n\n📅 ${new Date().toLocaleDateString("hi-IN")}\n\nऔसत AQI: *${data.alerts.avg_aqi}*\nPM2.5: ${Math.round(data.alerts.avg_aqi * 0.52)} µg/m³\n\n*स्टेशन रिपोर्ट:*\n${data.alerts.zone_alerts.map(z => `• ${z.station.split(",")[0]} — AQI ${z.aqi}`).join("\n")}\n\n*24h पूर्वानुमान:* स्थिर — कोई सुधार नहीं\n\n📊 pavan-aqi.vercel.app\n_पवन AI · दैनिक रिपोर्ट_`
: lang === "ta" ? `📊 *பவன் தினசரி அறிக்கை — ${data.city || alertCity}*\n\n📅 ${new Date().toLocaleDateString("ta-IN")}\n\nசராசரி AQI: *${data.alerts.avg_aqi}*\nPM2.5: ${Math.round(data.alerts.avg_aqi * 0.52)} µg/m³\n\n*நிலைய அறிக்கை:*\n${data.alerts.zone_alerts.map(z => `• ${z.station.split(",")[0]} — AQI ${z.aqi}`).join("\n")}\n\n📊 pavan-aqi.vercel.app\n_பவன் AI · தினசரி அறிக்கை_`
: lang === "bn" ? `📊 *পবন দৈনিক প্রতিবেদন — ${data.city || alertCity}*\n\n📅 ${new Date().toLocaleDateString("bn-IN")}\n\nগড় AQI: *${data.alerts.avg_aqi}*\nPM2.5: ${Math.round(data.alerts.avg_aqi * 0.52)} µg/m³\n\n*স্টেশন প্রতিবেদন:*\n${data.alerts.zone_alerts.map(z => `• ${z.station.split(",")[0]} — AQI ${z.aqi}`).join("\n")}\n\n📊 pavan-aqi.vercel.app\n_পবন AI · দৈনিক প্রতিবেদন_`
: `📊 *Pavan Daily AQI Report — ${data.city || alertCity}*\n\n📅 ${new Date().toLocaleDateString("en-IN")}\n\nAvg AQI: *${data.alerts.avg_aqi}* (${data.alerts.level.toUpperCase()})\nPM2.5: ${Math.round(data.alerts.avg_aqi * 0.52)} µg/m³\n\n*Station Report:*\n${data.alerts.zone_alerts.map(z => `• ${z.station.split(",")[0]} — AQI ${z.aqi}`).join("\n")}\n\n*24h Forecast:* Stable — no improvement expected\n\n📊 pavan-aqi.vercel.app\n🤖 @PavanETbot\n_Pavan AI · Daily Digest_`}
                        </pre>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Zone alerts */}
              {data && data.alerts.zone_alerts.length > 0 && (
                <div className="ru-bento">
                  <div className="p-6">
                    <div className="flex items-center gap-2.5 border-b border-[var(--hairline-soft)] pb-2 mb-4">
                      <span className="inline-block h-2 w-2 rounded-[2px]" style={{ background: "var(--entity-poor)" }} />
                      <span className="font-mono text-[10px] uppercase tracking-[0.2em]">zone alerts</span>
                      <span className="ml-auto font-mono text-[10px] tabular-nums text-muted-foreground">
                        {data.alerts.alert_count.toString().padStart(2, "0")}
                      </span>
                    </div>
                    {data.alerts.zone_alerts.map((alert, i) => (
                      <div key={i} className="flex items-center gap-3 py-2" style={{ boxShadow: `inset 4px 0 0 0 var(--entity-poor)` }}>
                        <span className="font-mono text-[12px] tabular-nums font-semibold pl-4" style={{ color: "var(--entity-poor)" }}>
                          {alert.aqi}
                        </span>
                        <span className="text-[13px] truncate lowercase">{alert.station.split(",")[0].toLowerCase()}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Notification channels — dark text on light colors for contrast */}
              <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                <div className="ru-bento" style={{ "--bento-bg": "var(--entity-forecast)", "--bento-fg": "#ffffff" } as React.CSSProperties}>
                  <div className="p-7 min-h-[200px] flex flex-col">
                    <span className="text-3xl mb-3">🤖</span>
                    <p className="text-[18px] lowercase" style={{ fontVariationSettings: "'wght' 680" }}>telegram bot</p>
                    <p className="text-[14px] opacity-80 mt-2 leading-relaxed" style={{ fontVariationSettings: "'wght' 480" }}>real-time aqi alerts, health advisories, and ai-powered questions on telegram</p>
                    <div className="mt-auto pt-4">
                      <span className="font-mono text-[10px] uppercase tracking-wider bg-white/20 rounded-full px-3 py-1.5">@PavanETbot</span>
                    </div>
                  </div>
                </div>

                <div className="ru-bento" style={{ "--bento-bg": "var(--entity-moderate)", "--bento-fg": "#1a1a18" } as React.CSSProperties}>
                  <div className="p-7 min-h-[200px] flex flex-col">
                    <span className="text-3xl mb-3">📧</span>
                    <p className="text-[18px] lowercase" style={{ fontVariationSettings: "'wght' 680" }}>email notifications</p>
                    <p className="text-[14px] opacity-75 mt-2 leading-relaxed" style={{ fontVariationSettings: "'wght' 500" }}>automated grap compliance reports and aqi threshold alerts delivered to your inbox via gmail smtp with branded html design</p>
                    <div className="mt-auto pt-4">
                      <span className="font-mono text-[10px] uppercase tracking-wider bg-white/20 rounded-full px-3 py-1.5">grap + threshold alerts</span>
                    </div>
                  </div>
                </div>

                <a href="https://whatsapp.com/channel/0029Vb92jm97IUYYREzcKk0L" target="_blank" rel="noopener noreferrer" className="ru-bento block" style={{ "--bento-bg": "var(--entity-good)", "--bento-fg": "#f0fdf4" } as React.CSSProperties}>
                  <div className="p-7 min-h-[200px] flex flex-col">
                    <span className="text-3xl mb-3">💬</span>
                    <p className="text-[18px] lowercase" style={{ fontVariationSettings: "'wght' 680" }}>whatsapp channel</p>
                    <p className="text-[14px] opacity-80 mt-2 leading-relaxed" style={{ fontVariationSettings: "'wght' 500" }}>join our broadcast channel for daily aqi digests, threshold alerts, grap notifications, and health advisories in hindi + english</p>
                    <div className="mt-auto pt-4 flex gap-2">
                      <span className="font-mono text-[10px] uppercase tracking-wider bg-white/20 rounded-full px-3 py-1.5">join channel →</span>
                      <span className="font-mono text-[10px] uppercase tracking-wider bg-white/20 rounded-full px-3 py-1.5">live</span>
                    </div>
                  </div>
                </a>
              </div>
            </>
          )}
        </div>
      </main>
    </div>
  );
}
