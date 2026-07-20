"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV_ITEMS = [
  { href: "/dashboard", label: "dashboard", tone: "var(--entity-moderate)" },
  { href: "/simulate", label: "simulator", tone: "var(--entity-forecast)" },
  { href: "/compliance", label: "grap", tone: "var(--entity-poor)" },
  { href: "/alerts", label: "alerts", tone: "var(--entity-alert)" },
  { href: "/agents", label: "agents", tone: "var(--entity-wind)" },
  { href: "/compare", label: "compare", tone: "var(--entity-severe)" },
  { href: "/architecture", label: "architecture", tone: "var(--entity-forecast)" },
  { href: "/login", label: "subscribe", tone: "var(--entity-alert)" },
];

export default function NavBar() {
  const pathname = usePathname();
  const activeIdx = NAV_ITEMS.findIndex((item) => item.href === pathname);
  const activeItem = NAV_ITEMS[activeIdx >= 0 ? activeIdx : 0];
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 bg-background/85 backdrop-blur-xl">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 py-3 sm:py-4">
        <div className="flex items-center justify-between">
          {/* Brand */}
          <Link href="/" className="flex items-baseline gap-0.5 text-xl sm:text-2xl shrink-0">
            <span style={{ fontVariationSettings: "'wght' 720, 'wdth' 94" }}>pavan</span>
            <span className="inline-block h-[7px] w-[7px] sm:h-[9px] sm:w-[9px] translate-y-[-2px] rounded-full transition-colors duration-500" style={{ background: activeItem.tone }} />
          </Link>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-5">
            {NAV_ITEMS.map((item, i) => {
              const isActive = i === (activeIdx >= 0 ? activeIdx : 0);
              return (
                <Link key={item.href} href={item.href} className="relative flex flex-col items-center gap-0.5">
                  <span className={`text-[14px] transition-colors ${isActive ? "text-foreground" : "text-muted-foreground hover:text-foreground"}`} style={{ fontVariationSettings: isActive ? "'wght' 620" : "'wght' 440" }}>
                    {item.label}
                  </span>
                  {isActive && <span className="absolute -bottom-[8px] left-1/2 block h-1.5 w-1.5 -translate-x-1/2 rounded-full" style={{ background: item.tone }} />}
                </Link>
              );
            })}
          </nav>

          {/* Desktop controls */}
          <div className="hidden md:flex items-center gap-2">
            <button onClick={() => document.documentElement.classList.toggle("dark")} className="w-7 h-7 rounded-full bg-secondary flex items-center justify-center text-[12px] hover:bg-accent transition-colors" aria-label="Toggle theme">🌓</button>
            <button onClick={() => { const s = document.documentElement.style; s.fontSize = Math.min(130, (parseFloat(s.fontSize || "100") || 100) + 5) + "%"; }} className="w-7 h-7 rounded-full bg-secondary flex items-center justify-center text-[10px] hover:bg-accent transition-colors font-mono" aria-label="Increase text">A+</button>
            <button onClick={() => { const s = document.documentElement.style; s.fontSize = Math.max(85, (parseFloat(s.fontSize || "100") || 100) - 5) + "%"; }} className="w-7 h-7 rounded-full bg-secondary flex items-center justify-center text-[10px] hover:bg-accent transition-colors font-mono" aria-label="Decrease text">A-</button>
          </div>

          {/* Mobile hamburger */}
          <button className="md:hidden w-10 h-10 rounded-xl bg-secondary flex items-center justify-center" onClick={() => setMenuOpen(!menuOpen)} aria-label="Menu">
            {menuOpen ? (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
            ) : (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="4" y1="7" x2="20" y2="7"/><line x1="4" y1="12" x2="20" y2="12"/><line x1="4" y1="17" x2="20" y2="17"/></svg>
            )}
          </button>
        </div>
      </div>

      {/* Entity tint line */}
      <div className="pointer-events-none h-[2px] opacity-90 transition-colors duration-500" style={{ background: `linear-gradient(90deg, transparent 0%, ${activeItem.tone} 30%, ${activeItem.tone} 70%, transparent 100%)` }} />

      {/* Mobile menu overlay */}
      {menuOpen && (
        <div className="md:hidden fixed inset-x-0 top-0 bottom-0 z-[100]" style={{backgroundColor: "#f5f0e6"}}>
          <div className="flex items-center justify-between px-4 py-3">
            <Link href="/" className="text-xl" style={{ fontVariationSettings: "'wght' 720, 'wdth' 94" }}>pavan<span style={{ color: activeItem.tone }}>.</span></Link>
            <button className="w-10 h-10 rounded-xl bg-secondary flex items-center justify-center" onClick={() => setMenuOpen(false)}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
            </button>
          </div>
          <nav className="flex flex-col px-6 gap-1">
            {NAV_ITEMS.map((item, i) => {
              const isActive = i === (activeIdx >= 0 ? activeIdx : 0);
              return (
                <Link key={item.href} href={item.href} onClick={() => setMenuOpen(false)}
                  className="flex items-center gap-4 px-4 py-4 rounded-2xl transition-all" style={{background: isActive ? "var(--secondary)" : "transparent"}}>
                  <span className="w-3 h-3 rounded-full shrink-0" style={{ background: item.tone }} />
                  <span className={`text-[18px] ${isActive ? "text-foreground" : "text-muted-foreground"}`} style={{ fontVariationSettings: isActive ? "'wght' 640" : "'wght' 460" }}>
                    {item.label}
                  </span>
                  {isActive && <span className="ml-auto font-mono text-[10px] uppercase tracking-wider text-muted-foreground">active</span>}
                </Link>
              );
            })}

            {/* Mobile controls */}
            <div className="flex items-center gap-3 mt-6 px-4">
              <button onClick={() => document.documentElement.classList.toggle("dark")} className="w-10 h-10 rounded-xl bg-secondary flex items-center justify-center text-[16px]" aria-label="Theme">🌓</button>
              <button onClick={() => { const s = document.documentElement.style; s.fontSize = Math.min(130, (parseFloat(s.fontSize || "100") || 100) + 5) + "%"; }} className="w-10 h-10 rounded-xl bg-secondary flex items-center justify-center text-[14px] font-mono" aria-label="Bigger">A+</button>
              <button onClick={() => { const s = document.documentElement.style; s.fontSize = Math.max(85, (parseFloat(s.fontSize || "100") || 100) - 5) + "%"; }} className="w-10 h-10 rounded-xl bg-secondary flex items-center justify-center text-[14px] font-mono" aria-label="Smaller">A-</button>
              <span className="ml-auto font-mono text-[10px] uppercase tracking-wider text-muted-foreground bg-secondary px-3 py-2 rounded-full">all india</span>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
