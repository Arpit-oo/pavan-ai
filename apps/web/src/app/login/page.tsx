"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { ALL_CITIES } from "@/components/dashboard/city-selector";

const SHOWN_CITIES = ["Delhi", "Mumbai", "Bangalore", "Chennai", "Kolkata", "Hyderabad", "Pune", "Lucknow", "Jaipur", "Ahmedabad"];

export default function LoginPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [cities, setCities] = useState<string[]>(["Delhi"]);
  const [channels, setChannels] = useState<string[]>(["email", "telegram"]);
  const [frequency, setFrequency] = useState("threshold");
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [query, setQuery] = useState("");

  const toggleCity = (c: string) => {
    if (cities.includes(c)) {
      if (cities.length > 1) setCities(cities.filter(x => x !== c));
    } else {
      setCities([...cities, c]);
    }
  };

  const toggleChannel = (ch: string) => {
    if (channels.includes(ch)) {
      if (channels.length > 0) setChannels(channels.filter(x => x !== ch));
    } else {
      setChannels([...channels, ch]);
    }
  };

  const filteredCities = ALL_CITIES.filter(c =>
    c.toLowerCase().includes(query.toLowerCase()) && !SHOWN_CITIES.includes(c)
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setLoading(true);

    try {
      await fetch("/api/notify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "send_alert",
          to: email,
          city: cities.join(", "),
          aqi: 185,
          level: "Moderate",
          headline: `Welcome to Pavan, ${name || "there"}! You're now subscribed to ${frequency} air quality alerts for ${cities.join(", ")} via ${channels.join(", ")}. We'll notify you when AQI exceeds threshold levels.`,
          recommendations: [
            `Monitor ${cities.join(", ")} AQI daily via pavan-aqi.vercel.app`,
            "Use @PavanETbot on Telegram for instant updates",
            `Alert frequency: ${frequency} · Channels: ${channels.join(", ")}`,
          ],
        }),
      });
    } catch {}

    setSubmitted(true);
    setLoading(false);
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-6">
        <div className="max-w-md w-full text-center space-y-6">
          <Image src="/claudy/pray.png" alt="Claudy" width={120} height={120} className="mx-auto" />
          <h1 className="text-[28px] lowercase" style={{ fontVariationSettings: "'wght' 720" }}>you&apos;re in!</h1>
          <p className="text-[16px] text-muted-foreground leading-relaxed">
            we&apos;ve sent a welcome alert to <strong style={{ fontVariationSettings: "'wght' 620" }}>{email}</strong>. you&apos;ll receive {frequency} aqi alerts for <strong style={{ fontVariationSettings: "'wght' 620" }}>{cities.map(c => c.toLowerCase()).join(", ")}</strong> via {channels.join(", ")}.
          </p>
          <div className="flex gap-3 justify-center flex-wrap">
            <Link href="/dashboard" className="ru-pill !text-[14px] !px-6 !py-3">open dashboard →</Link>
            <a href="https://t.me/PavanETbot" target="_blank" rel="noopener noreferrer" className="ru-pill !text-[14px] !px-6 !py-3" style={{ background: "var(--entity-forecast)", color: "white" }}>telegram bot →</a>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex">
      <div className="flex-1 flex items-center justify-center px-6 py-12">
        <div className="max-w-md w-full">
          <Link href="/" className="flex items-baseline gap-0.5 text-2xl mb-8">
            <span style={{ fontVariationSettings: "'wght' 720, 'wdth' 94" }}>pavan</span>
            <span className="inline-block h-[8px] w-[8px] translate-y-[-2px] rounded-full" style={{ background: "var(--entity-moderate)" }} />
          </Link>

          <h1 className="text-[32px] lowercase mb-2" style={{ fontVariationSettings: "'wght' 760, 'wdth' 94", letterSpacing: "-0.03em" }}>
            get air quality alerts
          </h1>
          <p className="text-[15px] text-muted-foreground mb-8 leading-relaxed">
            subscribe to receive aqi threshold alerts, grap stage notifications, and health advisories for your city.
          </p>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="font-mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground mb-2 block">full name</label>
              <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="your name" className="w-full bg-card border border-border rounded-2xl px-4 py-3 text-[15px] outline-none focus:border-[var(--entity-forecast)] transition-colors" style={{ fontVariationSettings: "'wght' 460" }} />
            </div>

            <div>
              <label className="font-mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground mb-2 block">email address</label>
              <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" className="w-full bg-card border border-border rounded-2xl px-4 py-3 text-[15px] outline-none focus:border-[var(--entity-forecast)] transition-colors" style={{ fontVariationSettings: "'wght' 460" }} />
            </div>

            <div>
              <label className="font-mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground mb-2 block">monitor cities (select multiple)</label>
              <div className="flex flex-wrap gap-2">
                {SHOWN_CITIES.map((c) => (
                  <button key={c} type="button" onClick={() => toggleCity(c)} className={`px-3 py-1.5 rounded-full text-[12px] transition-all ${cities.includes(c) ? "bg-foreground text-background" : "bg-secondary text-muted-foreground hover:text-foreground"}`} style={{ fontVariationSettings: cities.includes(c) ? "'wght' 620" : "'wght' 440" }}>
                    {c.toLowerCase()} {cities.includes(c) ? "✓" : ""}
                  </button>
                ))}
                <button type="button" onClick={() => setSearchOpen(!searchOpen)} className="w-8 h-8 rounded-full bg-secondary text-muted-foreground hover:text-foreground hover:bg-accent transition-all flex items-center justify-center text-[16px] font-mono" title="Search from 57 available cities">
                  {searchOpen ? "×" : "+"}
                </button>
              </div>
              {searchOpen && (
                <div className="mt-3 bg-card border border-border rounded-2xl p-3 shadow-lg" style={{ maxWidth: 360 }}>
                  <input type="text" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="search city..." autoFocus className="w-full bg-secondary rounded-full px-4 py-2 text-[14px] outline-none placeholder:text-muted-foreground/50 mb-2" style={{ fontVariationSettings: "'wght' 460" }} />
                  <div className="max-h-[160px] overflow-y-auto flex flex-wrap gap-1.5">
                    {filteredCities.length > 0 ? filteredCities.map((c) => (
                      <button key={c} type="button" onClick={() => { toggleCity(c); setQuery(""); }} className={`px-3 py-1.5 rounded-full text-[12px] transition-all ${cities.includes(c) ? "bg-foreground text-background" : "bg-secondary text-muted-foreground hover:text-foreground hover:bg-accent"}`} style={{ fontVariationSettings: cities.includes(c) ? "'wght' 620" : "'wght' 460" }}>
                        {c.toLowerCase()} {cities.includes(c) ? "✓" : ""}
                      </button>
                    )) : (
                      <p className="text-[12px] text-muted-foreground px-2 py-1">no cities found</p>
                    )}
                  </div>
                </div>
              )}
              <p className="text-[11px] text-muted-foreground mt-1">{cities.length} {cities.length === 1 ? "city" : "cities"} selected · 57 available</p>
            </div>

            <div>
              <label className="font-mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground mb-2 block">alert channels</label>
              <div className="space-y-2">
                {[
                  { key: "email", icon: "📧", label: "email alerts (grap + threshold)" },
                  { key: "telegram", icon: "🤖", label: "telegram bot (@PavanETbot)" },
                  { key: "whatsapp", icon: "💬", label: "whatsapp broadcast" },
                ].map((ch) => (
                  <label key={ch.key} className={`flex items-center gap-3 p-3 bg-card border rounded-xl cursor-pointer hover:border-[var(--entity-forecast)] transition-colors ${channels.includes(ch.key) ? "border-[var(--entity-forecast)]" : "border-border"}`}>
                    <input type="checkbox" checked={channels.includes(ch.key)} onChange={() => toggleChannel(ch.key)} className="w-4 h-4 rounded" />
                    <span className="text-lg">{ch.icon}</span>
                    <span className="text-[14px]" style={{ fontVariationSettings: "'wght' 500" }}>{ch.label}</span>
                  </label>
                ))}
              </div>
            </div>

            <div>
              <label className="font-mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground mb-2 block">alert frequency</label>
              <div className="flex gap-2">
                {[
                  { value: "threshold", label: "when threshold exceeded", desc: "instant" },
                  { value: "daily", label: "daily digest", desc: "every morning" },
                  { value: "weekly", label: "weekly report", desc: "every monday" },
                ].map((opt) => (
                  <label key={opt.value} className={`flex-1 flex flex-col items-center gap-1 p-3 bg-card border rounded-xl cursor-pointer hover:border-[var(--entity-forecast)] transition-colors text-center ${frequency === opt.value ? "border-[var(--entity-forecast)]" : "border-border"}`}>
                    <input type="radio" name="frequency" checked={frequency === opt.value} onChange={() => setFrequency(opt.value)} className="w-3.5 h-3.5" />
                    <span className="text-[12px]" style={{ fontVariationSettings: "'wght' 560" }}>{opt.label}</span>
                    <span className="text-[10px] text-muted-foreground">{opt.desc}</span>
                  </label>
                ))}
              </div>
            </div>

            <button type="submit" disabled={loading || !email} className="w-full ru-pill !text-[15px] !py-3.5 justify-center">
              {loading ? "setting up..." : "subscribe to alerts →"}
            </button>
          </form>

          <p className="mt-4 text-center text-[10px] text-muted-foreground">
            by subscribing you agree to receive air quality alerts. unsubscribe anytime.
          </p>
        </div>
      </div>

      <div className="hidden lg:flex flex-1 items-center justify-center" style={{ background: "var(--entity-forecast)" }}>
        <div className="text-center text-white p-12 max-w-md">
          <Image src="/claudy/sit.png" alt="Claudy" width={200} height={200} className="mx-auto mb-8 brightness-0 invert opacity-80" />
          <h2 className="text-[28px] lowercase mb-4" style={{ fontVariationSettings: "'wght' 720" }}>never miss an air quality alert</h2>
          <p className="text-[15px] opacity-75 leading-relaxed">
            get notified when aqi exceeds safe levels in your city. grap stage changes, health advisories, and enforcement updates — all delivered to your inbox, telegram, or whatsapp.
          </p>
          <div className="mt-8 flex gap-3 justify-center flex-wrap">
            <span className="font-mono text-[10px] uppercase tracking-wider bg-white/15 rounded-full px-3 py-1.5">105 stations</span>
            <span className="font-mono text-[10px] uppercase tracking-wider bg-white/15 rounded-full px-3 py-1.5">57 cities</span>
            <span className="font-mono text-[10px] uppercase tracking-wider bg-white/15 rounded-full px-3 py-1.5">4 languages</span>
          </div>
        </div>
      </div>
    </div>
  );
}
