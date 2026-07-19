# pavan. — air quality intelligence for india

> AI-powered urban air quality intelligence platform with multi-agent orchestration, intervention simulation, and citizen health advisories.

**Live Demo:** [web-chi-five-95.vercel.app](https://web-chi-five-95.vercel.app)

---

## what it does

pavan fuses data from 105 CPCB monitoring stations across 57 Indian cities into an intelligent platform that goes beyond dashboards — it attributes pollution sources, forecasts AQI 24-72 hours ahead, simulates policy interventions, and generates multilingual citizen health advisories.

### key capabilities

| Capability | Description |
|---|---|
| **Multi-Agent Analysis** | 6 specialized AI agents coordinate in a 3-phase pipeline to analyze air quality |
| **Source Attribution** | Decomposes pollution by source (vehicular, industrial, construction, burning) using wind patterns and land use |
| **AQI Forecasting** | XGBoost model predicts ward-level AQI 1-72 hours ahead (MAE: 4.88) |
| **Intervention Simulator** | Counterfactual modeling — "what if we ban trucks?" with empirical reduction factors |
| **GRAP Compliance** | Auto-detects GRAP stages (I-IV) and generates regulatory compliance reports |
| **City Comparison** | Side-by-side comparison across 57 cities with ranking |
| **Citizen Alerts** | Health advisories in 4 languages (English, Hindi, Tamil, Bengali) + WhatsApp format |
| **AI Chatbot** | GPT-4o-mini powered assistant answers natural language queries about air quality |
| **Compound Risk Scoring** | Fuses AQI + weather + population + vulnerability into single 0-100 risk score |

---

## architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    PRESENTATION LAYER                        │
│  Next.js 16 · Mapbox GL · Recharts · Bricolage Grotesque   │
│  7 pages: dashboard, simulator, grap, alerts, agents,       │
│           compare, architecture                              │
└────────────────────────┬────────────────────────────────────┘
                         │
┌────────────────────────▼────────────────────────────────────┐
│                     API LAYER (FastAPI)                      │
│  25+ endpoints: /aqi, /forecast, /agents, /simulate,        │
│                 /alerts, /compliance                         │
└────────────────────────┬────────────────────────────────────┘
                         │
         ┌───────────────┼───────────────┐
         │               │               │
┌────────▼──────┐ ┌──────▼──────┐ ┌──────▼──────┐
│  AGENT MESH   │ │ ML PIPELINE │ │  DATA LAYER │
│               │ │             │ │             │
│ 🧠 Orchestrator│ │ XGBoost    │ │ Supabase   │
│ 📡 Sensor     │ │ Forecast   │ │ CPCB API   │
│ 🌤️ Weather    │ │ IDW Interp │ │ OpenWeather│
│ ⚡ Anomaly    │ │ Risk Score │ │ GPT-4o     │
│ 🔍 Attribution│ │ Simulator  │ │            │
│ 🛡️ Enforcement│ │            │ │            │
└───────────────┘ └────────────┘ └────────────┘
```

### agent pipeline (3 phases)

```
Phase 1: Data Collection (parallel)
  📡 Sensor Agent  ──┐
  🌤️ Weather Agent ──┤── collected in parallel
                      │
Phase 2: Analysis (parallel)
  ⚡ Anomaly Agent    ──┐
  🔍 Attribution Agent ──┤── runs after Phase 1
                          │
Phase 3: Enforcement
  🛡️ Enforcement Agent ──── needs Phase 2 results

🧠 Orchestrator coordinates all phases, merges results
```

---

## tech stack

| Layer | Technology |
|---|---|
| Frontend | Next.js 16 (App Router), Tailwind CSS, shadcn/ui |
| Maps | Mapbox GL JS with native circle/heatmap layers |
| Charts | Recharts (forecast visualization) |
| Typography | Bricolage Grotesque + Fraunces (variable fonts) |
| Backend | Python FastAPI, uvicorn |
| ML | XGBoost, scikit-learn, numpy, scipy |
| Database | Supabase (Postgres + Realtime) |
| AI | OpenAI GPT-4o-mini (chatbot) |
| Weather | OpenWeatherMap API (real-time) |
| AQI Data | CPCB (Central Pollution Control Board) stations |
| Deploy | Vercel (frontend), Railway (backend) |

---

## coverage

### 105 stations across 57 cities

**North India:** Delhi (17), Lucknow (3), Jaipur (2), Chandigarh (1), Dehradun (2), Shimla (1), Amritsar (1), Agra (1), Kanpur (1), Varanasi (2), Gorakhpur (1), Prayagraj (1), Gwalior (1), Srinagar (2), Jammu (1), Leh (1)

**West India:** Mumbai (6), Pune (3), Ahmedabad (3), Surat (1), Rajkot (1), Vadodara (1), Jodhpur (1), Indore (2), Nashik (1), Aurangabad (1), Panaji (1)

**South India:** Bangalore (5), Chennai (4), Hyderabad (4), Kochi (1), Thiruvananthapuram (1), Coimbatore (1), Madurai (1), Mangalore (1), Mysore (1), Trichy (1), Vijayawada (1), Visakhapatnam (1), Warangal (1)

**East India:** Kolkata (4), Patna (2), Bhubaneswar (2), Raipur (2), Ranchi (1)

**Northeast:** Guwahati (1), Imphal (1), Shillong (1), Aizawl (1), Kohima (1), Gangtok (1), Itanagar (1), Agartala (1)

**Central India:** Bhopal (1), Nagpur (2), Jabalpur (1)

---

## intervention simulator

5 evidence-based interventions with empirical reduction factors:

| Intervention | PM2.5 Reduction | PM10 Reduction | Time to Effect |
|---|---|---|---|
| Burning Ban | -20% | -15% | Immediate |
| Industrial Shutdown | -15% | -10% | 12-24 hours |
| Truck Ban | -12% | -18% | 4-6 hours |
| Odd-Even | -8% | -6% | 24-48 hours |
| Construction Halt | -5% | -25% | 2-4 hours |

Each simulation uses source-attribution-weighted reduction factors from published Delhi pollution studies.

---

## getting started

### prerequisites
- Node.js 18+
- Python 3.8+
- API keys: Mapbox, OpenWeatherMap, OpenAI (optional)

### frontend
```bash
cd apps/web
cp .env.example .env.local  # add your Mapbox token
npm install
npm run dev                  # http://localhost:3000
```

### backend
```bash
cd apps/api
cp .env.example .env         # add your API keys
pip install -r requirements.txt
python run.py                 # http://localhost:8000
```

### database
1. Create a Supabase project
2. Run `supabase/setup.sql` in the SQL editor
3. Add Supabase URL and keys to `.env`

---

## api reference

### AQI endpoints
| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/v1/aqi/live?city=Delhi` | Live readings for a city |
| GET | `/api/v1/aqi/all-india` | All 105 stations |
| GET | `/api/v1/aqi/heatmap?city=Delhi` | Interpolated heatmap grid |
| GET | `/api/v1/aqi/risk?city=Delhi` | Compound risk scores |
| GET | `/api/v1/aqi/zones?city=Delhi` | Zone boundaries (GeoJSON) |
| GET | `/api/v1/aqi/weather?city=Delhi` | Weather + wind analysis |

### Forecast endpoints
| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/v1/forecast/city?hours=24` | City-wide forecast |
| GET | `/api/v1/forecast/station/{id}` | Single station forecast |
| GET | `/api/v1/forecast/model` | Model metadata + metrics |

### Agent endpoints
| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/v1/agents/ask` | Natural language query |
| GET | `/api/v1/agents/analyze` | Full 6-agent analysis |
| GET | `/api/v1/agents/status` | Agent status overview |

### Simulator endpoints
| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/v1/simulate/run` | Run intervention simulation |
| GET | `/api/v1/simulate/compare` | Compare all interventions |
| GET | `/api/v1/simulate/types` | List intervention types |

### Alert endpoints
| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/v1/alerts/active` | Active citizen alerts |
| GET | `/api/v1/alerts/whatsapp?lang=hi` | WhatsApp formatted alert |
| GET | `/api/v1/alerts/health-impact` | Health impact estimates |

### Compliance endpoints
| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/v1/compliance/grap` | GRAP stage status |
| GET | `/api/v1/compliance/report` | Full compliance report |

---

## project structure

```
pavan-ai/
├── apps/
│   ├── web/                    # Next.js frontend
│   │   ├── src/
│   │   │   ├── app/            # Pages (7 routes)
│   │   │   │   ├── page.tsx            # Dashboard
│   │   │   │   ├── simulate/           # Intervention simulator
│   │   │   │   ├── compliance/         # GRAP compliance
│   │   │   │   ├── alerts/             # Citizen alerts
│   │   │   │   ├── agents/             # Agent console
│   │   │   │   ├── compare/            # City comparison
│   │   │   │   ├── architecture/       # System architecture
│   │   │   │   └── api/chat/           # GPT-4o chatbot route
│   │   │   ├── components/
│   │   │   │   ├── map/               # Mapbox AQI map
│   │   │   │   ├── dashboard/         # Stats, forecast, agent panel
│   │   │   │   ├── chat/              # Chat widget
│   │   │   │   ├── nav/               # Shared navbar
│   │   │   │   └── decorations/       # Geo patterns, textures
│   │   │   └── lib/
│   │   │       ├── api.ts             # API client + types
│   │   │       └── mock-data.ts       # 105-station mock dataset
│   │   └── .env.example
│   │
│   └── api/                    # FastAPI backend
│       ├── app/
│       │   ├── main.py                # FastAPI app
│       │   ├── config.py              # Environment config
│       │   ├── routers/               # 6 API routers
│       │   ├── agents/                # 6 AI agents + orchestrator
│       │   └── services/              # CPCB, weather, forecast, risk,
│       │                              # simulator, wards, LLM
│       ├── ml/                        # XGBoost model artifacts
│       ├── Dockerfile
│       ├── requirements.txt
│       └── .env.example
│
├── supabase/
│   └── setup.sql              # Database schema + RLS policies
│
├── docs/
│   └── superpowers/specs/     # Design specification
│
└── data/
    ├── cache/                 # API response cache
    └── models/                # Trained ML models
```

---

## design system

Inspired by [Ru](https://github.com/PiyushMalik01/Ru) — warm, editorial, playful-but-confident.

- **Palette:** Warm cream `#f5f0e6` / graphite `#2c2c2e`
- **Fonts:** Bricolage Grotesque (body) + Fraunces (display numbers)
- **Tiles:** 28px border-radius, saturated entity colors, hover lift
- **Entity Colors:** Cobalt (forecast), Coral (moderate), Red (poor), Purple (severe), Teal (wind), Pink (alerts), Charcoal (dark tiles)
- **Typography:** Lowercase editorial voice, letterspaced mono eyebrows, giant serif display numbers

---

## judging criteria alignment

| Criteria (25%) | How Pavan Scores |
|---|---|
| **Innovation** | Multi-agent orchestration, counterfactual intervention simulator, compound risk scoring, GPT-4o chatbot — none exist in current air quality tools |
| **Business Impact** | 100+ NCAP cities need this. 1.67M deaths/year from air pollution. Health impact quantification. GRAP auto-compliance. |
| **Technical Excellence** | 6-agent pipeline, XGBoost forecasting, 25+ API endpoints, real weather data, Supabase persistence |
| **Scalability** | 57 cities already. Same architecture works for any Indian city — add stations, retrain model |
| **User Experience** | Ru-inspired design system, variable fonts, entity-colored tiles, 7 functional pages, AI chatbot |

---

## team

Built for **ET AI Hackathon 2026** — Problem Statement #5: AI-Powered Urban Air Quality Intelligence for Smart City Intervention.

---

## license

MIT
