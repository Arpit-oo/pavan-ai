"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";

const FEATURES = [
  {
    icon: "🗺️", title: "real-time aqi dashboard", color: "var(--entity-moderate)",
    desc: "live air quality data from 105 cpcb stations across 57 cities, fused with sentinel-5p satellite no2/so2 data, modis fire detection, and traffic congestion feeds. 5 data sources, one unified view.",
  },
  {
    icon: "🧪", title: "intervention simulator", color: "var(--entity-forecast)",
    desc: "ask 'what if we ban trucks?' and get data-backed answers. our simulator models 5 policy interventions using empirical reduction factors from published delhi pollution studies. see before/after aqi impact per station.",
  },
  {
    icon: "📋", title: "grap compliance", color: "var(--entity-poor)",
    desc: "grap (graded response action plan) is delhi's staged pollution response system. pavan auto-detects which grap stage is active based on current aqi and generates compliance reports listing all required government actions — from road sweeping to construction bans.",
  },
  {
    icon: "🧠", title: "multi-agent ai pipeline", color: "var(--entity-severe)",
    desc: "6 specialized ai agents work in 3 coordinated phases: sensor + weather agents collect data, anomaly + attribution agents analyze it, enforcement agent generates inspector recommendations. all orchestrated automatically.",
  },
  {
    icon: "📱", title: "citizen alerts", color: "var(--entity-alert)",
    desc: "health advisories in 4 languages — english, hindi, tamil, bengali. delivered via telegram bot (@PavanETbot), branded email alerts, and whatsapp-ready messages. includes who-based health impact estimates.",
  },
  {
    icon: "📊", title: "city comparison", color: "var(--entity-wind)",
    desc: "compare air quality across 57 indian cities side by side. select up to 6 cities, see their aqi rankings, pm2.5 levels, and regional patterns. every state capital is covered.",
  },
];

const FAQS = [
  {
    q: "where does pavan get its data?",
    a: "pavan pulls data from cpcb (central pollution control board) monitoring stations — the same government infrastructure that feeds official air quality reports. we monitor 105 stations across 57 cities. weather data comes from openweathermap's live api. all data sources are verified and publicly available.",
  },
  {
    q: "what is grap and why does it matter?",
    a: "grap (graded response action plan) is the delhi government's staged response system for air pollution emergencies. it has 4 stages: stage i (poor, aqi > 201) triggers road sweeping and puc enforcement. stage ii (very poor, aqi > 301) adds parking fee hikes and diesel generator bans. stage iii (severe, aqi > 401) bans construction and truck entry. stage iv (emergency, aqi > 451) closes schools and halts all construction. pavan auto-detects the active stage and generates compliance checklists.",
  },
  {
    q: "how does the intervention simulator work?",
    a: "our simulator uses empirical reduction factors from published pollution studies to model what happens when you apply a policy intervention. for example, a truck ban typically reduces pm2.5 by 12% and pm10 by 18% based on ngt orders from 2023. we weight these reductions by each station's source attribution — so a station near an industrial zone sees different impact than one near a highway. the result is a per-station before/after aqi prediction.",
  },
  {
    q: "what are the 6 ai agents?",
    a: "pavan uses a multi-agent architecture where specialized agents handle different aspects of air quality analysis: (1) sensor agent pulls cpcb data, (2) weather agent analyzes wind patterns and stagnation, (3) anomaly agent detects unusual aqi spikes, (4) attribution agent decomposes pollution by source (vehicular, industrial, construction, burning), (5) enforcement agent generates prioritized inspector recommendations, (6) orchestrator coordinates all agents in optimal order.",
  },
  {
    q: "how accurate is the aqi forecast?",
    a: "our xgboost forecast model achieves a mean absolute error (mae) of 4.88 on our validation set. the model uses 12 features including historical aqi, temperature, humidity, wind speed/direction, time of day, and day of week. it generates predictions for 1 to 72 hours ahead with confidence intervals that widen appropriately over longer horizons.",
  },
  {
    q: "is the data verified?",
    a: "yes. all air quality data comes from cpcb's official caaqms (continuous ambient air quality monitoring stations) network. weather data is from openweathermap's verified api. our source attribution methodology is validated against safar delhi's published source apportionment studies. health impact estimates use who's established pm2.5 exposure-response functions. we are transparent about our methodology in our data validation report.",
  },
  {
    q: "how many cities does pavan cover?",
    a: "pavan monitors 105 stations across 57 cities — every state capital plus major metros. coverage spans from srinagar and leh in the north to thiruvananthapuram and kochi in the south, from mumbai and rajkot in the west to guwahati and imphal in the northeast. delhi has the densest coverage with 17 stations.",
  },
  {
    q: "can i get alerts on telegram?",
    a: "yes! search for @PavanETbot on telegram. the bot responds to commands like /aqi (national overview), /delhi (delhi-specific status), /cities (all 57 monitored cities), and /health (health advisory). you can also ask free-form questions — the bot uses gpt-4o to answer intelligently about air quality in any indian city.",
  },
];

const STATS = [
  { value: "105", label: "stations", color: "var(--entity-moderate)" },
  { value: "57", label: "cities", color: "var(--entity-forecast)" },
  { value: "6", label: "ai agents", color: "var(--entity-severe)" },
  { value: "4", label: "languages", color: "var(--entity-alert)" },
  { value: "25+", label: "api endpoints", color: "var(--entity-wind)" },
  { value: "4.88", label: "forecast mae", color: "var(--entity-good)" },
];

function useScrollReveal() {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const sections = el.querySelectorAll("[data-reveal]");
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("animate-fade-in");
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.1 });
    sections.forEach((s) => observer.observe(s));
    return () => observer.disconnect();
  }, []);
  return ref;
}

export default function LandingPage() {
  const scrollRef = useScrollReveal();
  const [landingMenu, setLandingMenu] = useState(false);
  return (
    <div className="min-h-screen bg-background text-foreground" ref={scrollRef}>
      {/* Nav */}
      <header className="sticky top-0 z-50 bg-background/85 backdrop-blur-xl">
        <div className="mx-auto max-w-6xl flex items-center justify-between px-4 sm:px-6 py-4 sm:py-5">
          <span className="text-xl sm:text-2xl" style={{ fontVariationSettings: "'wght' 720, 'wdth' 94" }}>
            pavan<span style={{ color: "var(--entity-moderate)" }}>.</span>
          </span>
          <div className="hidden sm:flex items-center gap-4">
            <Link href="/dashboard" className="ru-pill !text-[14px] !px-5 !py-2.5">
              dashboard →
            </Link>
            <Link href="/login" className="ru-pill !text-[14px] !px-5 !py-2.5" style={{ background: "var(--entity-forecast)", color: "white" }}>
              subscribe →
            </Link>
          </div>
          <button className="sm:hidden w-10 h-10 rounded-xl bg-secondary flex items-center justify-center" onClick={() => setLandingMenu(!landingMenu)} aria-label="Menu">
            {landingMenu ? (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
            ) : (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="4" y1="7" x2="20" y2="7"/><line x1="4" y1="12" x2="20" y2="12"/><line x1="4" y1="17" x2="20" y2="17"/></svg>
            )}
          </button>
        </div>
        {landingMenu && (
          <div className="sm:hidden fixed inset-x-0 top-0 bottom-0 z-[100]" style={{backgroundColor:"#f5f0e6"}}>
            <div className="flex items-center justify-between px-4 py-4">
              <span className="text-xl" style={{ fontVariationSettings: "'wght' 720, 'wdth' 94" }}>pavan<span style={{ color: "var(--entity-moderate)" }}>.</span></span>
              <button className="w-10 h-10 rounded-xl bg-secondary flex items-center justify-center" onClick={() => setLandingMenu(false)}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
              </button>
            </div>
            <nav className="flex flex-col px-6 gap-2">
              <Link href="/dashboard" onClick={() => setLandingMenu(false)} className="flex items-center gap-3 px-4 py-4 rounded-2xl" style={{background:"var(--secondary)"}}>
                <span className="w-3 h-3 rounded-full" style={{background:"var(--entity-moderate)"}} />
                <span className="text-[18px]" style={{fontVariationSettings:"'wght' 600"}}>dashboard</span>
              </Link>
              <Link href="/login" onClick={() => setLandingMenu(false)} className="flex items-center gap-3 px-4 py-4 rounded-2xl" style={{background:"var(--secondary)"}}>
                <span className="w-3 h-3 rounded-full" style={{background:"var(--entity-forecast)"}} />
                <span className="text-[18px]" style={{fontVariationSettings:"'wght' 600"}}>subscribe to alerts</span>
              </Link>
              <a href="https://t.me/PavanETbot" target="_blank" rel="noopener noreferrer" onClick={() => setLandingMenu(false)} className="flex items-center gap-3 px-4 py-4 rounded-2xl" style={{background:"var(--secondary)"}}>
                <span className="w-3 h-3 rounded-full" style={{background:"var(--entity-wind)"}} />
                <span className="text-[18px]" style={{fontVariationSettings:"'wght' 600"}}>telegram bot</span>
              </a>
              <a href="https://whatsapp.com/channel/0029Vb92jm97IUYYREzcKk0L" target="_blank" rel="noopener noreferrer" onClick={() => setLandingMenu(false)} className="flex items-center gap-3 px-4 py-4 rounded-2xl" style={{background:"var(--secondary)"}}>
                <span className="w-3 h-3 rounded-full" style={{background:"var(--entity-good)"}} />
                <span className="text-[18px]" style={{fontVariationSettings:"'wght' 600"}}>whatsapp channel</span>
              </a>
            </nav>
          </div>
        )}
      </header>

      {/* Hero */}
      <section className="mx-auto max-w-6xl px-6 pt-16 pb-20 relative">
        <div className="font-mono text-[11px] uppercase tracking-[0.22em] text-muted-foreground mb-6">
          et ai hackathon 2026 · problem statement #5 · team edgerunner
        </div>
        <h1 className="lowercase leading-[0.92] mb-6" style={{ fontSize: "clamp(48px, 7vw, 80px)", fontVariationSettings: "'wght' 760, 'wdth' 94, 'opsz' 72", letterSpacing: "-0.04em" }}>
          air quality intelligence<br />for every indian city
        </h1>
        <p className="text-[19px] text-foreground/70 max-w-[60ch] leading-relaxed mb-10" style={{ fontVariationSettings: "'wght' 480" }}>
          pavan fuses data from 105 cpcb monitoring stations across 57 cities through a 6-agent ai pipeline — turning raw air quality numbers into actionable intelligence for city administrators, health authorities, and citizens.
        </p>
        <div className="flex gap-3 flex-wrap">
          <Link href="/dashboard" className="ru-pill !text-[15px] !px-6 !py-3">
            explore dashboard →
          </Link>
          <a href="https://t.me/PavanETbot" target="_blank" rel="noopener noreferrer" className="ru-pill !text-[15px] !px-6 !py-3" style={{ background: "var(--entity-forecast)", color: "white" }}>
            try telegram bot →
          </a>
        </div>

        {/* Claudy - sit/reading pose in hero */}
        <div className="absolute right-16 top-20 pointer-events-none hidden lg:block">
          <Image src="/claudy/sit.png" alt="Claudy reading" width={260} height={260} className="object-contain" />
        </div>
      </section>

      {/* Stats */}
      <section className="mx-auto max-w-6xl px-6 pb-20" data-reveal style={{opacity:0}}>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {STATS.map((s) => (
            <div key={s.label} className="ru-bento text-center" style={{ "--bento-bg": "var(--card)", "--bento-fg": "var(--fg)" } as React.CSSProperties}>
              <div className="p-6">
                <span className="font-display text-[40px] tracking-tight" style={{ color: s.color }}>{s.value}</span>
                <p className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground mt-2">{s.label}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="mx-auto max-w-6xl px-6 pb-20 relative" data-reveal style={{opacity:0}}>
        {/* Claudy - chill/hammock pose next to features header (smaller since quality lower) */}
        <div className="absolute right-4 -top-4 pointer-events-none hidden lg:block opacity-70">
          <Image src="/claudy/chill.png" alt="Claudy chilling" width={100} height={100} className="object-contain" />
        </div>
        <div className="font-mono text-[11px] uppercase tracking-[0.22em] text-muted-foreground mb-4">capabilities</div>
        <h2 className="lowercase mb-10" style={{ fontSize: "clamp(32px, 4vw, 48px)", fontVariationSettings: "'wght' 720, 'wdth' 94", letterSpacing: "-0.035em" }}>
          what pavan does
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {FEATURES.map((f) => (
            <div key={f.title} className="ru-bento" style={{ boxShadow: "0 2px 12px rgba(0,0,0,0.04)", border: "1px solid rgba(0,0,0,0.06)" }}>
              <div className="p-8">
                <div className="flex items-start gap-4">
                  <span className="text-3xl shrink-0">{f.icon}</span>
                  <div>
                    <p className="text-[18px] lowercase mb-3" style={{ fontVariationSettings: "'wght' 680" }}>
                      {f.title}
                    </p>
                    <p className="text-[15px] text-muted-foreground leading-relaxed" style={{ fontVariationSettings: "'wght' 440" }}>
                      {f.desc}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Data Trust */}
      <section className="mx-auto max-w-6xl px-6 pb-20" data-reveal style={{opacity:0}}>
        <div className="ru-bento relative overflow-visible" style={{ "--bento-bg": "#1a1a18", "--bento-fg": "#f5f0e6" } as React.CSSProperties}>
          {/* Claudy - pray/meditating pose — shifted down to be fully visible */}
          <div className="absolute -bottom-14 -right-6 pointer-events-none hidden md:block">
            <Image src="/claudy/pray.png" alt="Claudy meditating" width={110} height={110} className="object-contain" />
          </div>
          <div className="p-10 text-center">
            <span className="text-4xl mb-4 block">✅</span>
            <h3 className="text-[24px] lowercase mb-4" style={{ fontVariationSettings: "'wght' 720" }}>verified data. transparent methodology.</h3>
            <p className="text-[16px] opacity-80 max-w-[55ch] mx-auto leading-relaxed">
              all air quality data comes from cpcb&apos;s official monitoring network. weather from openweathermap. attribution validated against safar studies. health estimates use who methodology. we publish our data validation report openly.
            </p>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="mx-auto max-w-6xl px-6 pb-20 relative" data-reveal style={{opacity:0}}>
        {/* Claudy - pond/digging pose — shifted right so it doesn't overlap "questions" */}
        <div className="absolute right-8 -top-6 pointer-events-none hidden lg:block opacity-70">
          <Image src="/claudy/pond.png" alt="Claudy investigating" width={100} height={100} className="object-contain" />
        </div>
        <div className="font-mono text-[11px] uppercase tracking-[0.22em] text-muted-foreground mb-4">frequently asked</div>
        <h2 className="lowercase mb-10" style={{ fontSize: "clamp(32px, 4vw, 48px)", fontVariationSettings: "'wght' 720, 'wdth' 94", letterSpacing: "-0.035em" }}>
          questions
        </h2>
        <div className="space-y-4">
          {FAQS.map((faq) => (
            <details key={faq.q} className="ru-bento group">
              <summary className="p-6 cursor-pointer list-none flex items-center justify-between">
                <span className="text-[16px] lowercase" style={{ fontVariationSettings: "'wght' 620" }}>{faq.q}</span>
                <span className="text-muted-foreground text-[20px] transition-transform group-open:rotate-45 shrink-0 ml-4">+</span>
              </summary>
              <div className="px-6 pb-6 -mt-2">
                <p className="text-[15px] text-muted-foreground leading-relaxed" style={{ fontVariationSettings: "'wght' 440" }}>
                  {faq.a}
                </p>
              </div>
            </details>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-6xl px-6 pb-20 text-center relative">
        <h2 className="lowercase mb-6" style={{ fontSize: "clamp(32px, 5vw, 56px)", fontVariationSettings: "'wght' 760, 'wdth' 94", letterSpacing: "-0.035em" }}>
          try pavan now
        </h2>
        <div className="flex gap-4 justify-center flex-wrap">
          <Link href="/dashboard" className="ru-pill !text-[16px] !px-8 !py-4">
            open dashboard →
          </Link>
          <a href="https://t.me/PavanETbot" target="_blank" rel="noopener noreferrer" className="ru-pill !text-[16px] !px-8 !py-4" style={{ background: "var(--entity-forecast)", color: "white" }}>
            telegram bot →
          </a>
          <a href="https://whatsapp.com/channel/0029Vb92jm97IUYYREzcKk0L" target="_blank" rel="noopener noreferrer" className="ru-pill !text-[16px] !px-8 !py-4" style={{ background: "var(--entity-good)", color: "#f0fdf4" }}>
            whatsapp channel →
          </a>
        </div>
        <p className="mt-8 font-mono text-[11px] uppercase tracking-wider text-muted-foreground">
          et ai hackathon 2026 · team edgerunner · pavan-aqi.vercel.app
        </p>
        {/* Claudy - sleep pose */}
        <div className="flex justify-center mt-8 opacity-60">
          <Image src="/claudy/sleep.png" alt="Claudy sleeping" width={100} height={80} className="object-contain" />
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-8 text-center">
        <p className="font-mono text-[11px] text-muted-foreground uppercase tracking-wider">
          pavan · 105 stations · 57 cities · 6 ai agents · all india
        </p>
      </footer>
    </div>
  );
}
