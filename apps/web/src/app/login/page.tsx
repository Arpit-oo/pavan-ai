"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";

export default function LoginPage() {
  const [mode, setMode] = useState<"login" | "signup">("signup");
  const [email, setEmail] = useState("");
  const [cities, setCities] = useState<string[]>(["Delhi"]);
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const toggleCity = (c: string) => {
    if (cities.includes(c)) {
      if (cities.length > 1) setCities(cities.filter(x => x !== c));
    } else {
      setCities([...cities, c]);
    }
  };

  const CITIES = ["Delhi", "Mumbai", "Bangalore", "Chennai", "Kolkata", "Hyderabad", "Pune", "Lucknow", "Jaipur", "Ahmedabad"];

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
          headline: `Welcome to Pavan! You're now subscribed to air quality alerts for ${cities.join(", ")}. We'll notify you when AQI exceeds threshold levels.`,
          recommendations: [`Monitor ${cities.join(", ")} AQI daily via pavan-aqi.vercel.app`, "Use @PavanETbot on Telegram for instant updates"],
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
            we&apos;ve sent a welcome alert to <strong style={{ fontVariationSettings: "'wght' 620" }}>{email}</strong>. you&apos;ll receive aqi alerts for <strong style={{ fontVariationSettings: "'wght' 620" }}>{cities.map(c => c.toLowerCase()).join(", ")}</strong> when thresholds are exceeded.
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
      {/* Left — form */}
      <div className="flex-1 flex items-center justify-center px-6 py-12">
        <div className="max-w-md w-full">
          <Link href="/" className="flex items-baseline gap-0.5 text-2xl mb-8">
            <span style={{ fontVariationSettings: "'wght' 720, 'wdth' 94" }}>pavan</span>
            <span className="inline-block h-[8px] w-[8px] translate-y-[-2px] rounded-full" style={{ background: "var(--entity-moderate)" }} />
          </Link>

          <h1 className="text-[32px] lowercase mb-2" style={{ fontVariationSettings: "'wght' 760, 'wdth' 94", letterSpacing: "-0.03em" }}>
            {mode === "signup" ? "get air quality alerts" : "welcome back"}
          </h1>
          <p className="text-[15px] text-muted-foreground mb-8 leading-relaxed">
            {mode === "signup"
              ? "subscribe to receive aqi threshold alerts, grap stage notifications, and health advisories for your city."
              : "sign in to manage your alert preferences and view personalized reports."}
          </p>

          {/* Mode toggle */}
          <div className="flex gap-1 bg-secondary rounded-full p-1 mb-8">
            <button onClick={() => setMode("signup")} className={`flex-1 py-2 rounded-full text-[13px] transition-all ${mode === "signup" ? "bg-foreground text-background" : "text-muted-foreground"}`} style={{ fontVariationSettings: mode === "signup" ? "'wght' 620" : "'wght' 440" }}>
              sign up
            </button>
            <button onClick={() => setMode("login")} className={`flex-1 py-2 rounded-full text-[13px] transition-all ${mode === "login" ? "bg-foreground text-background" : "text-muted-foreground"}`} style={{ fontVariationSettings: mode === "login" ? "'wght' 620" : "'wght' 440" }}>
              log in
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {mode === "signup" && (
              <div>
                <label className="font-mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground mb-2 block">full name</label>
                <input type="text" placeholder="your name" className="w-full bg-card border border-border rounded-2xl px-4 py-3 text-[15px] outline-none focus:border-[var(--entity-forecast)] transition-colors" style={{ fontVariationSettings: "'wght' 460" }} />
              </div>
            )}

            <div>
              <label className="font-mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground mb-2 block">email address</label>
              <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" className="w-full bg-card border border-border rounded-2xl px-4 py-3 text-[15px] outline-none focus:border-[var(--entity-forecast)] transition-colors" style={{ fontVariationSettings: "'wght' 460" }} />
            </div>

            <div>
              <label className="font-mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground mb-2 block">password</label>
              <input type="password" required placeholder="••••••••" minLength={6} className="w-full bg-card border border-border rounded-2xl px-4 py-3 text-[15px] outline-none focus:border-[var(--entity-forecast)] transition-colors" style={{ fontVariationSettings: "'wght' 460" }} />
            </div>

            {mode === "signup" && (
              <div>
                <label className="font-mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground mb-2 block">monitor cities (select multiple)</label>
                <div className="flex flex-wrap gap-2">
                  {CITIES.map((c) => (
                    <button key={c} type="button" onClick={() => toggleCity(c)} className={`px-3 py-1.5 rounded-full text-[12px] transition-all ${cities.includes(c) ? "bg-foreground text-background" : "bg-secondary text-muted-foreground hover:text-foreground"}`} style={{ fontVariationSettings: cities.includes(c) ? "'wght' 620" : "'wght' 440" }}>
                      {c.toLowerCase()} {cities.includes(c) ? "✓" : ""}
                    </button>
                  ))}
                  <button type="button" className="w-8 h-8 rounded-full bg-secondary text-muted-foreground hover:text-foreground hover:bg-accent transition-all flex items-center justify-center text-[16px] font-mono" title="Add from 57 available cities">+</button>
                </div>
                <p className="text-[11px] text-muted-foreground mt-1">{cities.length} {cities.length === 1 ? "city" : "cities"} selected · 57 available</p>
              </div>
            )}

            {mode === "signup" && (
              <div>
                <label className="font-mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground mb-2 block">alert channels</label>
                <div className="space-y-2">
                  <label className="flex items-center gap-3 p-3 bg-card border border-border rounded-xl cursor-pointer hover:border-[var(--entity-forecast)] transition-colors">
                    <input type="checkbox" defaultChecked className="w-4 h-4 rounded" />
                    <span className="text-lg">📧</span>
                    <span className="text-[14px]" style={{ fontVariationSettings: "'wght' 500" }}>email alerts (grap + threshold)</span>
                  </label>
                  <label className="flex items-center gap-3 p-3 bg-card border border-border rounded-xl cursor-pointer hover:border-[var(--entity-forecast)] transition-colors">
                    <input type="checkbox" defaultChecked className="w-4 h-4 rounded" />
                    <span className="text-lg">🤖</span>
                    <span className="text-[14px]" style={{ fontVariationSettings: "'wght' 500" }}>telegram bot (@PavanETbot)</span>
                  </label>
                  <label className="flex items-center gap-3 p-3 bg-card border border-border rounded-xl cursor-pointer hover:border-[var(--entity-forecast)] transition-colors">
                    <input type="checkbox" className="w-4 h-4 rounded" />
                    <span className="text-lg">💬</span>
                    <span className="text-[14px]" style={{ fontVariationSettings: "'wght' 500" }}>whatsapp broadcast</span>
                  </label>
                </div>
              </div>
            )}

            {mode === "signup" && (
              <div>
                <label className="font-mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground mb-2 block">alert frequency</label>
                <div className="flex gap-2">
                  {[
                    { value: "threshold", label: "when threshold exceeded", desc: "instant" },
                    { value: "daily", label: "daily digest", desc: "every morning" },
                    { value: "weekly", label: "weekly report", desc: "every monday" },
                  ].map((opt) => (
                    <label key={opt.value} className="flex-1 flex flex-col items-center gap-1 p-3 bg-card border border-border rounded-xl cursor-pointer hover:border-[var(--entity-forecast)] transition-colors text-center">
                      <input type="radio" name="frequency" defaultChecked={opt.value === "threshold"} className="w-3.5 h-3.5" />
                      <span className="text-[12px]" style={{ fontVariationSettings: "'wght' 560" }}>{opt.label}</span>
                      <span className="text-[10px] text-muted-foreground">{opt.desc}</span>
                    </label>
                  ))}
                </div>
              </div>
            )}


            <button type="submit" disabled={loading} className="w-full ru-pill !text-[15px] !py-3.5 justify-center">
              {loading ? "setting up..." : mode === "signup" ? "subscribe to alerts →" : "sign in →"}
            </button>
          </form>

          <p className="mt-6 text-center text-[12px] text-muted-foreground">
            {mode === "signup" ? "already subscribed? " : "need an account? "}
            <button onClick={() => setMode(mode === "signup" ? "login" : "signup")} className="text-foreground underline" style={{ fontVariationSettings: "'wght' 560" }}>
              {mode === "signup" ? "log in" : "sign up"}
            </button>
          </p>

          <p className="mt-4 text-center text-[10px] text-muted-foreground">
            by subscribing you agree to receive air quality alerts. unsubscribe anytime.
          </p>
        </div>
      </div>

      {/* Right — visual */}
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
