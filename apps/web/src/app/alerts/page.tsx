"use client";

import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { fetchAPI } from "@/lib/api";
import Link from "next/link";

interface AlertData {
  city: string;
  alerts: {
    avg_aqi: number;
    level: string;
    alert_count: number;
    city_advisory: Record<string, string>;
    zone_alerts: Array<{
      station: string;
      aqi: number;
      level: string;
      message_en: string;
      message_hi: string;
    }>;
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
  population_exposed_to_poor_aqi: number;
  schools_in_affected_zones: number;
  hospitals_nearby: number;
  estimated_excess_hospital_visits_24h: number;
  admission_increase_pct: number;
}

const levelEmoji: Record<string, string> = {
  good: "✅",
  moderate: "⚠️",
  poor: "🟠",
  very_poor: "🔴",
  severe: "🚨",
};

const langNames: Record<string, string> = {
  en: "English",
  hi: "हिन्दी",
  ta: "தமிழ்",
  bn: "বাংলা",
};

export default function AlertsPage() {
  const [data, setData] = useState<AlertData | null>(null);
  const [health, setHealth] = useState<HealthImpact | null>(null);
  const [loading, setLoading] = useState(true);
  const [lang, setLang] = useState("en");

  useEffect(() => {
    Promise.all([
      fetchAPI<AlertData>("/api/v1/alerts/active?city=Delhi"),
      fetchAPI<HealthImpact>("/api/v1/alerts/health-impact?city=Delhi"),
    ]).then(([alerts, impact]) => {
      setData(alerts);
      setHealth(impact);
    }).finally(() => setLoading(false));
  }, []);

  return (
    <div className="flex flex-col h-screen">
      <header className="flex items-center justify-between px-6 py-3 border-b border-zinc-800 bg-zinc-950">
        <div className="flex items-center gap-3">
          <Link href="/" className="text-xl font-bold tracking-tight">
            <span className="text-orange-400">Pa</span>
            <span className="text-zinc-100">van</span>
          </Link>
          <Badge variant="outline" className="text-xs text-zinc-400 border-zinc-700">
            Citizen Alerts
          </Badge>
        </div>
        <div className="flex gap-2">
          <Link href="/compliance">
            <Button variant="outline" size="sm" className="text-xs border-zinc-700">GRAP</Button>
          </Link>
          <Link href="/">
            <Button variant="outline" size="sm" className="text-xs border-zinc-700">Dashboard</Button>
          </Link>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto p-6 space-y-6">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-6 h-6 border-2 border-orange-400 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : data && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card className="p-5 bg-zinc-900/50 border-zinc-800">
                <p className="text-xs text-zinc-500 uppercase">Alert Level</p>
                <p className="text-3xl mt-1">
                  {levelEmoji[data.alerts.level] || "⚠️"}{" "}
                  <span className="text-zinc-100 font-bold">{data.alerts.level.toUpperCase()}</span>
                </p>
                <p className="text-xs text-zinc-500 mt-1">AQI: {data.alerts.avg_aqi}</p>
              </Card>

              {health && (
                <>
                  <Card className="p-5 bg-zinc-900/50 border-zinc-800">
                    <p className="text-xs text-zinc-500 uppercase">PM2.5 Exposure</p>
                    <p className="text-3xl font-bold text-red-400 mt-1">{health.avg_pm25}</p>
                    <p className="text-xs text-zinc-500 mt-1">
                      {health.excess_over_who}x over WHO limit ({health.who_pm25_limit} ug/m3)
                    </p>
                  </Card>
                  <Card className="p-5 bg-zinc-900/50 border-zinc-800">
                    <p className="text-xs text-zinc-500 uppercase">Est. Excess Hospital Visits (24h)</p>
                    <p className="text-3xl font-bold text-orange-400 mt-1">
                      +{health.estimated_excess_hospital_visits_24h}
                    </p>
                    <p className="text-xs text-zinc-500 mt-1">
                      {health.schools_in_affected_zones} schools in affected zones
                    </p>
                  </Card>
                </>
              )}
            </div>

            <Card className="p-5 bg-zinc-900/50 border-zinc-800">
              <h3 className="text-sm font-semibold text-zinc-300 mb-3">Health Advisory</h3>
              <Tabs defaultValue="en" onValueChange={setLang}>
                <TabsList className="bg-zinc-800">
                  {data.alerts.languages.map((l) => (
                    <TabsTrigger key={l} value={l} className="text-xs">
                      {langNames[l] || l}
                    </TabsTrigger>
                  ))}
                </TabsList>
                {data.alerts.languages.map((l) => (
                  <TabsContent key={l} value={l} className="mt-3">
                    <p className="text-sm text-zinc-300 leading-relaxed">
                      {data.alerts.city_advisory[l] || data.alerts.city_advisory.en}
                    </p>
                  </TabsContent>
                ))}
              </Tabs>
            </Card>

            <Card className="p-5 bg-zinc-900/50 border-zinc-800">
              <h3 className="text-sm font-semibold text-zinc-300 mb-3">
                WhatsApp Alert Preview
              </h3>
              <div className="bg-[#0b141a] rounded-xl p-4 max-w-md border border-[#233138]">
                <div className="bg-[#005c4b] rounded-lg p-3">
                  <pre className="text-xs text-white whitespace-pre-wrap font-sans leading-relaxed">
                    {data.alerts.whatsapp_message[lang] || data.alerts.whatsapp_message.en}
                  </pre>
                </div>
                <p className="text-[10px] text-zinc-500 mt-1 text-right">
                  {new Date().toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}
                </p>
              </div>
            </Card>

            {data.alerts.zone_alerts.length > 0 && (
              <Card className="p-5 bg-zinc-900/50 border-zinc-800">
                <h3 className="text-sm font-semibold text-zinc-300 mb-3">
                  Zone-Level Alerts ({data.alerts.alert_count})
                </h3>
                <div className="space-y-2">
                  {data.alerts.zone_alerts.map((alert, i) => (
                    <div key={i} className="flex items-center gap-3 p-2 bg-zinc-800/30 rounded">
                      <Badge className={
                        alert.level === "severe" ? "bg-rose-700/20 text-rose-400" :
                        alert.level === "very_poor" ? "bg-red-500/20 text-red-400" :
                        "bg-orange-500/20 text-orange-400"
                      }>
                        {alert.aqi}
                      </Badge>
                      <div>
                        <p className="text-xs text-zinc-300">{alert.station.split(",")[0]}</p>
                        <p className="text-[10px] text-zinc-500">{alert.message_en}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            )}
          </>
        )}
      </main>
    </div>
  );
}
