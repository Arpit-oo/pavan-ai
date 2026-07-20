"use client";

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

  return (
    <header className="sticky top-0 z-50 bg-background/85 backdrop-blur-xl">
      <div className="mx-auto max-w-7xl px-3 sm:px-6 py-3 sm:py-5">
        <div className="flex items-center justify-between mb-2 sm:mb-0">
          <Link href="/" className="flex items-baseline gap-0.5 text-xl sm:text-2xl shrink-0">
            <span style={{ fontVariationSettings: "'wght' 720, 'wdth' 94" }}>pavan</span>
            <span
              className="inline-block h-[7px] w-[7px] sm:h-[9px] sm:w-[9px] translate-y-[-2px] rounded-full transition-colors duration-500"
              style={{ background: activeItem.tone }}
            />
          </Link>
          <div className="flex items-center gap-2 sm:hidden">
            <button onClick={() => document.documentElement.classList.toggle("dark")} className="w-7 h-7 rounded-full bg-secondary flex items-center justify-center text-[12px]" aria-label="Toggle theme">🌓</button>
            <span className="font-mono text-[9px] uppercase tracking-wider bg-secondary px-2 py-1 rounded-full">india</span>
          </div>
        </div>
        <div className="flex items-center justify-between">
          <nav className="flex items-center gap-2 sm:gap-5 overflow-x-auto pb-1" style={{scrollbarWidth:"none"}}>
            {NAV_ITEMS.map((item, i) => {
              const isActive = i === (activeIdx >= 0 ? activeIdx : 0);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className="relative flex flex-col items-center gap-0.5"
                >
                  <span
                    className={`text-[12px] sm:text-[15px] transition-colors whitespace-nowrap ${
                      isActive ? "text-foreground" : "text-muted-foreground hover:text-foreground"
                    }`}
                    style={{ fontVariationSettings: isActive ? "'wght' 620" : "'wght' 440" }}
                  >
                    {item.label}
                  </span>
                  {isActive && (
                    <span
                      className="absolute -bottom-[10px] left-1/2 block h-2 w-2 -translate-x-1/2 rounded-full"
                      style={{ background: item.tone }}
                    />
                  )}
                </Link>
              );
            })}
          </nav>
          <div className="hidden sm:flex items-center gap-2 shrink-0 ml-4">
            <button onClick={() => document.documentElement.classList.toggle("dark")} className="w-7 h-7 rounded-full bg-secondary flex items-center justify-center text-[12px] hover:bg-accent transition-colors" aria-label="Toggle theme">🌓</button>
            <button onClick={() => { const s = document.documentElement.style; const cur = parseFloat(s.fontSize || "100") || 100; s.fontSize = Math.min(130, cur + 5) + "%"; }} className="w-7 h-7 rounded-full bg-secondary flex items-center justify-center text-[10px] hover:bg-accent transition-colors font-mono" aria-label="Increase text">A+</button>
            <button onClick={() => { const s = document.documentElement.style; const cur = parseFloat(s.fontSize || "100") || 100; s.fontSize = Math.max(85, cur - 5) + "%"; }} className="w-7 h-7 rounded-full bg-secondary flex items-center justify-center text-[10px] hover:bg-accent transition-colors font-mono" aria-label="Decrease text">A-</button>
            <span className="font-mono text-[10px] uppercase tracking-wider bg-secondary px-2.5 py-1 rounded-full">india</span>
          </div>
        </div>
      </div>
      <div
        className="pointer-events-none h-[2px] opacity-90 transition-colors duration-500"
        style={{
          background: `linear-gradient(90deg, transparent 0%, ${activeItem.tone} 30%, ${activeItem.tone} 70%, transparent 100%)`,
        }}
      />
    </header>
  );
}
