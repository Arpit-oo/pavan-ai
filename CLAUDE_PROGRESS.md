# Claude's Build Progress — VayuBudhi

## Status: DESIGN PHASE
Last updated: 2026-07-11

---

## Phase 1: Foundation (Days 1-2) — July 11-12
- [ ] Write design spec doc
- [ ] Scaffold monorepo (apps/web, apps/api, packages/shared)
- [ ] Set up Next.js 15 + Tailwind + shadcn/ui
- [ ] Set up FastAPI backend with project structure
- [ ] Build CPCB data ingestion pipeline
- [ ] Build OpenWeatherMap data pipeline
- [ ] Set up Supabase schema (stations, readings, forecasts, alerts)
- [ ] Basic Deck.gl map with real CPCB station data

## Phase 2: Intelligence Core (Days 3-5) — July 13-15
- [ ] XGBoost forecast model (24hr ward-level AQI prediction)
- [ ] Source attribution engine (wind + land use correlation)
- [ ] Agent orchestrator (Claude multi-agent coordination)
- [ ] Sensor agent implementation
- [ ] Weather agent implementation
- [ ] Ward-level AQI interpolation (IDW from sparse stations)

## Phase 3: Power Features (Days 5-7) — July 15-17
- [ ] Anomaly detection agent (real-time spike flagging)
- [ ] Intervention simulator (counterfactual modeling)
- [ ] Enforcement recommendation agent
- [ ] Attribution agent with confidence scores
- [ ] Compound risk scoring system

## Phase 4: Citizen Layer (Days 8-9) — July 18-19
- [ ] GRAP compliance auto-reporter
- [ ] WhatsApp/citizen alert system
- [ ] Multilingual support (Hindi + 2 regional)
- [ ] Health impact quantifier

## Phase 5: Polish & Demo (Days 9-11) — July 19-22
- [ ] UI polish — animations, transitions, dark mode
- [ ] Demo flow optimization
- [ ] Error handling + edge cases
- [ ] Performance optimization
- [ ] Demo video support
- [ ] Final deployment

---

## Decisions Log
| Date | Decision | Reason |
|---|---|---|
| 2026-07-11 | Monorepo structure | Single deploy story, shared types |
| 2026-07-11 | No LangChain — raw Claude API | Less abstraction, fewer bugs |
| 2026-07-11 | XGBoost over deep learning | Fast training, no GPU, interpretable |
| 2026-07-11 | Deck.gl over plain Mapbox | 3D heatmaps, hex bins, visual wow |

## Blockers
| Blocker | Status | Owner |
|---|---|---|
| Mapbox API key | Waiting | Arpit |
| Supabase project | Waiting | Arpit |
| OpenWeatherMap key | Waiting | Arpit |
| Anthropic API key | Waiting | Arpit |
