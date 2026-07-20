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
];

export default function NavBar() {
  const pathname = usePathname();
  const activeIdx = NAV_ITEMS.findIndex((item) => item.href === pathname);
  const activeItem = NAV_ITEMS[activeIdx >= 0 ? activeIdx : 0];

  return (
    <header className="sticky top-0 z-50 bg-background/85 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-5 sm:px-6">
        <div className="flex items-center gap-6">
          <Link href="/" className="flex items-baseline gap-0.5 text-2xl">
            <span style={{ fontVariationSettings: "'wght' 720, 'wdth' 94" }}>pavan</span>
            <span
              className="inline-block h-[9px] w-[9px] translate-y-[-2px] rounded-full transition-colors duration-500"
              style={{ background: activeItem.tone }}
            />
          </Link>

          <nav className="flex items-center gap-4 md:gap-6 overflow-x-auto">
            {NAV_ITEMS.map((item, i) => {
              const isActive = i === (activeIdx >= 0 ? activeIdx : 0);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className="relative flex flex-col items-center gap-0.5"
                >
                  <span
                    className={`text-[15px] transition-colors ${
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
        </div>

        <div className="flex items-center gap-3">
          <span className="font-mono text-[11px] uppercase tracking-[0.16em] text-muted-foreground">
            {new Date().toLocaleTimeString()}
          </span>
          <span className="font-mono text-[11px] uppercase tracking-[0.16em] bg-secondary px-3 py-1.5 rounded-full">
            all india
          </span>
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
