# pavan landing page — premium redesign

**Date:** 2026-07-20
**Status:** approved direction, pending spec review
**Owner:** web (`apps/web`)

---

## Problem

The current landing (`apps/web/src/app/page.tsx`) fails on four fronts the team named:

1. **Doesn't sell the problem.** Jumps straight to a feature list; never makes the air-pollution crisis *felt*. No stakes, no emotional hook.
2. **Looks templated / flat.** Emoji-icon bento cards, uniform tiles, no hierarchy, no wow-moment. Reads as "AI slop."
3. **Doesn't show the product.** All words, no glimpse of the real dashboard / map / forecast — judges can't see it's real and working.
4. **Weak story.** Disconnected sections instead of a narrative that builds.

A near-duplicate older version exists at `/landing` and should be removed.

## Goal

A premium, editorial, emotionally-grounded landing page that (a) makes the crisis land, (b) shows pavan is a real, working intelligence platform, and (c) holds up to hackathon judges. Quality bar: the `component_library` **Stryde** mockup — full-bleed photography, giant serif wordmark, floating glass data-cards over photos, one accent color, zero emoji.

## Art direction

- **Mood: atmospheric → clarity.** Opens dark and cinematic (smog crisis), then the page visibly "clears" into the warm cream editorial body for the solution. The tonal shift *is* the story: pollution → clarity.
- **One accent:** AQI orange `#fb923c` (already the brand "." in `pavan.`). No rainbow of entity colors on the landing.
- **No emoji, no decorative icons.** Type + photography carry meaning. `lucide-react` only for tiny functional affordances (arrows).
- **Fonts (already installed):** Bricolage Grotesque (UI/headlines) + Fraunces (giant wordmark, display numbers).
- **Emotional tone: strong but dignified.** Cinematic smog + bold data. No distressing imagery of human suffering.
- **Mascot (Claudy) retired from the landing.** Undercuts the serious/premium tone. Stays on app pages.

## Tech

- **Add dependency:** `motion` (Framer Motion) — hero scale-in, scroll reveals. Same lib Stryde uses.
- **Ported primitives** (new, in `components/landing/ui.tsx`), adapted from Stryde to pavan's tokens:
  - `Reveal` — scroll-triggered fade + rise (respects `prefers-reduced-motion`).
  - `Eyebrow` — dot + uppercase mono label.
  - `HeadingChip` — a real photo inlined into a headline word.
  - `GlassCard` — floating data card that sits over photography.
- **Structure:** one file per section under `components/landing/`, composed by `app/page.tsx` (mirrors Stryde's `app/stryde/*` layout). Keeps each section small and independently editable.
- **No changes** to dashboard/app pages, API, or navbar. Landing gets its own self-contained header (dark-aware).

## Data / facts used (verified 2026-07, defensible for judges)

| Stat | Value | Source |
|---|---|---|
| Deaths/year from air pollution in India | ~1.6M | State of Global Air; Lancet PM2.5 ≈ 1.5M |
| World's 20 most polluted cities that are Indian | 13 of 20 | IQAir World Air Quality Report 2024 |
| Delhi | most polluted capital, 6 yrs running | IQAir 2024 |
| India avg PM2.5 vs WHO limit | ~10× (50.6 vs 5 µg/m³) | IQAir 2024 / WHO |
| Stations / cities covered | 105 / 57 | project data |
| Forecast RMSE | 11.74 vs 83.65 baseline (86% better) | project model validation |
| Signal → recommendation | <3 s | agent pipeline |

Product facts (5 sources, 6 agents, GRAP, 4 languages, Telegram `@PavanETbot`) per `README.md`.

## Page structure (narrative arc)

1. **Hero (dark).** Full-bleed smog photograph; `pavan` in giant Fraunces bleeding off the bottom edge. Eyebrow `URBAN AIR INTELLIGENCE · 57 CITIES · INDIA`. Emotional headline. A small live-AQI glass chip. Scroll cue. Own minimal nav (logo + dashboard CTA), light text over photo.
2. **The stakes (dark).** Giant Fraunces numbers sell the crisis: `1.6M` deaths/year · `13 of 20` most polluted cities · `10×` WHO limit · Delhi capital line. Hazy imagery. The gut-punch that's missing today.
3. **The turn (dark → cream).** Visible warm transition. One line: *"dashboards tell you the air is bad. pavan tells you why — and what to do about it."*
4. **What pavan sees.** 5-source fusion as an editorial layer-stack (CPCB, Sentinel-5P, MODIS fire, weather, traffic), each with a photo chip + a floating fused-reading card.
5. **What pavan does.** Five capabilities as premium bentos with real data cards over photography (NOT emoji tiles): source attribution · 72-hr forecast (real RMSE proof + mini chart) · intervention simulator (truck-ban before/after) · GRAP auto-compliance · citizen alerts (Telegram + 4 languages).
6. **The pipeline.** 6 agents, 3 phases, signal → recommendation `<3s` — horizontal pipeline visual on a dark accent band.
7. **Proof & trust.** Numbers band (105 stations · 57 cities · 86% better forecast) + verified sources (CPCB, Sentinel-5P, MODIS, WHO) + India coverage note/map.
8. **CTA + footer.** *"see your city's air"* → dashboard + Telegram; giant `pavan` wordmark repeated (Stryde footer move). Team EdgeRunner / hackathon credit.

## Imagery

Fetched during build from Unsplash (free license), stored in `apps/web/public/landing/`:
`hero-smog`, `stakes-haze`, `satellite`, `stubble-fire`, `traffic`, `monitoring-station`, `clear-sky`. Team may swap in their own Pinterest-sourced shots into the same filenames later.

Pinterest / stock search words provided to team: `delhi smog india gate photography`, `new delhi skyline haze aesthetic`, `indian city aerial pollution cinematic`, `stubble burning punjab fields aerial`, `delhi traffic congestion night aerial`, `air quality monitoring station`, `sentinel satellite earth atmosphere`, `moody atmospheric fog city dark ui`.

## Scope

- **In:** rebuild `apps/web/src/app/page.tsx` + new `components/landing/*`; add `motion`; add landing images; delete `apps/web/src/app/landing/`.
- **Out:** dashboard/app pages, API, navbar, data pipeline, mascot on app pages.

## Success criteria

- Crisis is felt within the first two screens (emotional + data).
- Real product/data is visibly shown, not just described.
- Zero emoji; consistent single-accent premium system; matches Stryde quality bar.
- Responsive (mobile → desktop), respects reduced-motion, keeps focus states.
- Builds clean (`npm run build`), no console errors, dark→cream transition renders correctly.

## Risks

- **Image licensing / quality.** Mitigation: Unsplash free-license only; filenames stable so team can swap.
- **Bundle from `motion`.** Acceptable; it's the primary premium lever and tree-shakes.
- **Stat accuracy.** Mitigation: verified against IQAir 2024 / WHO / Lancet; sources recorded above.
