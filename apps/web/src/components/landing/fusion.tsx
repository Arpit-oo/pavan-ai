"use client";

import Image from "next/image";
import { Reveal, Eyebrow, HeadingChip, GlassCard, ACCENT } from "./ui";

/**
 * The turn (dark → warm cream) + "what pavan sees": the five fused data
 * sources shown as an editorial list beside a satellite-aerosol visual with a
 * floating fused-reading card that proves the fusion is real.
 */

const SOURCES = [
  { chip: "/landing/monitoring-station.jpg", pos: "50% 55%", name: "CPCB ground stations", detail: "105 CAAQMS sensors · pm2.5, pm10, no2, so2, co, o3" },
  { chip: "/landing/satellite.jpg", pos: "50% 45%", name: "Sentinel-5P satellite", detail: "no2 / so2 column density across 1,600 grid points" },
  { chip: "/landing/stubble-fire.jpg", pos: "50% 70%", name: "MODIS fire detection", detail: "active fires + crop-burning thermal anomalies" },
  { chip: "/landing/clear-sky.jpg", pos: "50% 40%", name: "OpenWeatherMap", detail: "live wind, stagnation & temperature-inversion risk" },
  { chip: "/landing/traffic.jpg", pos: "50% 55%", name: "Traffic mobility", detail: "congestion index + per-city vehicular emission factors" },
];

export function Fusion() {
  return (
    <>
      {/* Dark → cream transition strip */}
      <div aria-hidden style={{ height: 120, background: "linear-gradient(180deg, #12110f 0%, #f5f0e6 100%)" }} />

      {/* The turn */}
      <section className="mx-auto max-w-[1240px] px-5 pb-4 sm:px-8">
        <Reveal>
          <p
            className="max-w-[24ch] lowercase"
            style={{ fontSize: "clamp(28px, 3.8vw, 50px)", lineHeight: 1.08, letterSpacing: "-0.03em", fontVariationSettings: "'wght' 600, 'wdth' 94" }}
          >
            dashboards tell you the air is bad. <span style={{ color: ACCENT }}>pavan tells you why</span> — and
            what to do about it.
          </p>
        </Reveal>
      </section>

      {/* What pavan sees */}
      <section className="mx-auto max-w-[1240px] px-5 py-20 sm:px-8 sm:py-24">
        <Reveal>
          <Eyebrow>what pavan sees</Eyebrow>
          <h2
            className="mt-5 max-w-[18ch] lowercase"
            style={{ fontSize: "clamp(30px, 4vw, 52px)", lineHeight: 1.03, letterSpacing: "-0.035em", fontVariationSettings: "'wght' 660, 'wdth' 94" }}
          >
            five live signals<HeadingChip src="/landing/satellite.jpg" position="50% 45%" />fused into one picture.
          </h2>
        </Reveal>

        <div className="mt-14 grid grid-cols-1 gap-10 lg:grid-cols-[0.95fr_1.05fr] lg:items-center">
          {/* Source list */}
          <div className="flex flex-col">
            {SOURCES.map((s, i) => (
              <Reveal key={s.name} delay={i * 0.06}>
                <div className="flex items-center gap-4 border-t border-black/10 py-5" style={{ borderTop: i === 0 ? "none" : undefined }}>
                  <span
                    aria-hidden
                    className="h-[52px] w-[52px] shrink-0 rounded-[14px] ring-1 ring-black/10"
                    style={{ backgroundImage: `url(${s.chip})`, backgroundSize: "cover", backgroundPosition: s.pos }}
                  />
                  <div>
                    <p className="text-[17px]" style={{ fontVariationSettings: "'wght' 600" }}>{s.name}</p>
                    <p className="text-[14px] text-muted-foreground">{s.detail}</p>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>

          {/* Satellite visual with floating fused reading */}
          <Reveal delay={0.1}>
            <div className="relative overflow-hidden rounded-[26px] ring-1 ring-black/10" style={{ aspectRatio: "4 / 3", background: "#0d1b2a" }}>
              <Image src="/landing/satellite.jpg" alt="Satellite aerosol-index map" fill sizes="(max-width: 1024px) 100vw, 620px" className="object-cover" />
              <div aria-hidden className="absolute inset-0" style={{ background: "linear-gradient(180deg, rgba(5,10,20,0.1) 0%, rgba(5,10,20,0.55) 100%)" }} />

              {/* Location marker */}
              <div className="absolute left-[38%] top-[40%]">
                <span className="ping-dot block h-[12px] w-[12px] rounded-full ring-2 ring-white" style={{ background: ACCENT }} />
              </div>

              {/* Fused reading card */}
              <GlassCard className="absolute bottom-5 left-5 right-5 sm:right-auto sm:w-[300px]">
                <div className="flex items-center justify-between font-mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
                  <span>fused reading · anand vihar</span>
                  <span style={{ color: "#ef4444" }}>severe</span>
                </div>
                <div className="mt-2 flex items-end gap-2">
                  <span className="font-display text-[40px] leading-[0.8]">312</span>
                  <span className="mb-1 text-[12px] text-muted-foreground">aqi</span>
                </div>
                <div className="mt-3 grid grid-cols-2 gap-x-3 gap-y-2 text-[12px]">
                  <Row k="satellite no₂" v="high ↑" />
                  <Row k="wind" v="4 km/h NW" />
                  <Row k="fires upwind" v="2 · 12 km" />
                  <Row k="traffic" v="heavy" />
                </div>
              </GlassCard>
            </div>
          </Reveal>
        </div>
      </section>
    </>
  );
}

function Row({ k, v }: { k: string; v: string }) {
  return (
    <div className="flex items-center justify-between border-b border-black/5 pb-1">
      <span className="text-muted-foreground">{k}</span>
      <span style={{ fontVariationSettings: "'wght' 600" }}>{v}</span>
    </div>
  );
}
