# pavan. — air quality intelligence for india

> AI-powered urban air quality intelligence platform fusing 5 data sources through a 6-agent pipeline — from monitoring to enforcement in under 3 seconds.

**Live Demo:** [pavan-aqi.vercel.app](https://pavan-aqi.vercel.app)
**Telegram Bot:** [@PavanETbot](https://t.me/PavanETbot)
**Team:** EdgeRunner
**Hackathon:** ET AI Hackathon 2026 — Problem Statement #5

---

## what it does

pavan fuses 5 data sources — CPCB monitoring stations, Sentinel-5P satellite imagery, MODIS fire detection, OpenWeatherMap forecasts, and traffic mobility data — across 105 stations in 57 Indian cities. it goes beyond dashboards: attributing pollution sources, forecasting AQI 24-72 hours ahead, simulating policy interventions, and delivering multilingual citizen alerts.

### key capabilities

| Capability | Description |
|---|---|
| **5-Source Data Fusion** | CPCB CAAQMS + Sentinel-5P NO2/SO2 + MODIS fire detection + OpenWeatherMap + traffic congestion — unified intelligence |
| **Multi-Agent Analysis** | 6 specialized AI agents coordinate in a 3-phase pipeline (data → analysis → enforcement) |
| **Source Attribution** | Decomposes pollution by source (vehicular, industrial, construction, burning) using wind, satellite, and traffic data |
| **AQI Forecasting** | XGBoost model — RMSE 11.74 vs persistence baseline 83.65 (86% improvement). 1-72hr predictions with confidence intervals |
| **Intervention Simulator** | Counterfactual modeling — "what if we ban trucks?" with empirical reduction factors from published Delhi studies |
| **GRAP Compliance** | Auto-detects GRAP stages (I-IV) and generates regulatory compliance reports with enforcement recommendations |
| **City Comparison** | Side-by-side comparison across 57 cities with AQI ranking |
| **Citizen Alerts** | Health advisories in 4 languages (English, Hindi, Tamil, Bengali) via Telegram bot, email, WhatsApp |
| **AI Chatbot** | GPT-4o-mini powered — natural language queries about air quality in any Indian city |
| **Compound Risk Scoring** | Fuses AQI + weather + population + vulnerability + forecast trend into single 0-100 risk score |
| **Satellite Layer** | Sentinel-5P NO2/SO2 column density visualization with 12 identified hotspot regions |
| **Fire Detection** | MODIS/VIIRS active fire mapping — crop burning and industrial thermal anomalies |
| **Traffic Integration** | Congestion index, truck route identification, vehicular emission factor per city |

---

## data sources (5 fused)

| Source | Data | Coverage |
|---|---|---|
| **CPCB CAAQMS** | PM2.5, PM10, NO2, SO2, CO, O3, temperature, humidity, wind | 105 stations, 57 cities |
| **Sentinel-5P TROPOMI** | NO2/SO2 tropospheric column density | 1600 grid points, 12 hotspot regions |
| **MODIS/VIIRS** | Active fire detection (crop burning, industrial thermal) | 20+ fire detections |
| **OpenWeatherMap** | Wind speed/direction, temperature, humidity, forecast | All 57 cities, live |
| **Traffic Mobility** | Congestion index, avg speed, truck routes, emission factors | 8 major cities |

---

## architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    PRESENTATION LAYER                        │
│  Next.js 16 · Mapbox GL · Recharts · Bricolage Grotesque   │
│  9 pages: landing, dashboard, simulator, grap, alerts,      │
│           agents, compare, architecture, api/chat            │
└────────────────────────┬────────────────────────────────────┘
                         │
┌────────────────────────▼────────────────────────────────────┐
│                     API LAYER (FastAPI)                      │
│  27 endpoints: /aqi, /forecast, /agents, /simulate,         │
│  /alerts, /compliance, /satellite, /fires, /traffic         │
└────────────────────────┬────────────────────────────────────┘
                         │
         ┌───────────────┼───────────────┐
         │               │               │
┌────────▼──────┐ ┌──────▼──────┐ ┌──────▼──────┐
│  AGENT MESH   │ │ ML PIPELINE │ │  DATA LAYER │
│               │ │             │ │             │
│ 🧠 Orchestrator│ │ XGBoost    │ │ Supabase   │
│ 📡 Sensor     │ │ Forecast   │ │ CPCB API   │
│ 🌤️ Weather    │ │ IDW Interp │ │ Sentinel-5P│
│ ⚡ Anomaly    │ │ Risk Score │ │ MODIS-VIIRS│
│ 🔍 Attribution│ │ Simulator  │ │ Traffic    │
│ 🛡️ Enforcement│ │            │ │ OpenWeather│
│               │ │            │ │ GPT-4o     │
└───────────────┘ └────────────┘ └────────────┘
```

### agent pipeline (3 phases)

```
Phase 0: Satellite + Traffic (parallel with Phase 1)
  🛰️ Sentinel-5P NO2/SO2 grid
  🔥 MODIS fire detection
  🚗 Traffic congestion + emission factors

Phase 1: Data Collection (parallel)
  📡 Sensor Agent  → 105 CPCB stations
  🌤️ Weather Agent → wind, stagnation, inversion

Phase 2: Analysis (parallel)
  ⚡ Anomaly Agent    → spike detection, PM ratio
  🔍 Attribution Agent → source decomposition with traffic + satellite

Phase 3: Enforcement
  🛡️ Enforcement Agent → prioritized inspector recommendations

🧠 Orchestrator coordinates all phases
⏱️ Signal to recommendation: <3 seconds
```

---

## forecast model validation

| Metric | Model | Persistence Baseline | Improvement |
|---|---|---|---|
| **RMSE** | 11.74 | 83.65 | **86.0%** |
| **MAE** | 4.88 | 68.69 | **84.8%** |

- XGBoost with 200 estimators, max_depth 6
- 12 features: hour, day, month, temp, humidity, wind speed/direction, lag AQI (1h/6h/24h), weekend
- 10,000 training samples, validated on 500 test samples
- Predictions: 1-72 hour horizon with confidence intervals

---

## intervention simulator

5 evidence-based interventions with empirical reduction factors:

| Intervention | PM2.5 Reduction | PM10 Reduction | Time to Effect | Source |
|---|---|---|---|---|
| Burning Ban | -20% | -15% | Immediate | SAFAR studies |
| Industrial Shutdown | -15% | -10% | 12-24 hours | GRAP Stage IV data |
| Truck Ban | -12% | -18% | 4-6 hours | NGT orders 2023 |
| Odd-Even | -8% | -6% | 24-48 hours | Delhi 2016/2019 studies |
| Construction Halt | -5% | -25% | 2-4 hours | GRAP Stage III data |

Each simulation uses source-attribution-weighted reduction factors.

---

## tech stack

| Layer | Technology |
|---|---|
| Frontend | Next.js 16 (App Router), Tailwind CSS, shadcn/ui |
| Maps | Mapbox GL JS with AQI/satellite/traffic layer toggles |
| Charts | Recharts (forecast with city switcher) |
| Typography | Bricolage Grotesque + Fraunces (variable fonts) |
| Backend | Python FastAPI, uvicorn |
| ML | XGBoost, scikit-learn, numpy, scipy |
| Database | Supabase (Postgres + Realtime) |
| AI | OpenAI GPT-4o-mini (chatbot + Telegram bot) |
| Satellite | Sentinel-5P TROPOMI patterns, MODIS/VIIRS fire |
| Traffic | TomTom Traffic Index patterns, congestion modeling |
| Weather | OpenWeatherMap API (real-time) |
| AQI Data | CPCB CAAQMS (105 stations) |
| Email | Gmail SMTP via Nodemailer |
| Deploy | Vercel (frontend), Railway (backend) |
| Mascot | Claudy — cloud character with 6 poses |

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

## notification channels

| Channel | Status | Details |
|---|---|---|
| **Web Chatbot** | ✅ Live | GPT-4o-mini, /api/chat on Vercel |
| **Telegram Bot** | ✅ Live | @PavanETbot — 6 commands + free-form AI |
| **Email Alerts** | ✅ Live | Gmail SMTP, branded HTML with Ru-style design |
| **WhatsApp** | ✅ Ready | Formatted messages in 4 languages |

---

## getting started

### prerequisites
- Node.js 18+
- Python 3.8+
- API keys: Mapbox, OpenWeatherMap, OpenAI

### frontend
```bash
cd apps/web
cp .env.example .env.local
npm install
npm run dev                  # http://localhost:3000
```

### backend
```bash
cd apps/api
cp .env.example .env
pip install -r requirements.txt
python run.py                 # http://localhost:8000
```

### database
1. Create a Supabase project
2. Run `supabase/setup.sql` in the SQL editor
3. Add Supabase URL and keys to `.env`

---

## api reference (27 endpoints)

### AQI + Data Sources
| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/v1/aqi/live` | Live readings for a city |
| GET | `/api/v1/aqi/all-india` | All 105 stations |
| GET | `/api/v1/aqi/heatmap` | Interpolated heatmap grid |
| GET | `/api/v1/aqi/risk` | Compound risk scores |
| GET | `/api/v1/aqi/zones` | Zone boundaries (GeoJSON) |
| GET | `/api/v1/aqi/weather` | Weather + wind analysis |
| GET | `/api/v1/aqi/satellite` | Sentinel-5P NO2/SO2 grid |
| GET | `/api/v1/aqi/fires` | MODIS/VIIRS fire detection |
| GET | `/api/v1/aqi/traffic` | Traffic congestion data |
| GET | `/api/v1/aqi/traffic/grid` | Traffic density grid |

### Forecast
| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/v1/forecast/city` | City-wide forecast |
| GET | `/api/v1/forecast/station/{id}` | Single station forecast |
| GET | `/api/v1/forecast/model` | Model metadata + RMSE validation |

### Agents
| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/v1/agents/ask` | Natural language query (GPT-4o) |
| GET | `/api/v1/agents/analyze` | Full 6-agent analysis with timing |
| GET | `/api/v1/agents/status` | Agent status overview |

### Simulator
| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/v1/simulate/run` | Run intervention simulation |
| GET | `/api/v1/simulate/compare` | Compare all interventions |
| GET | `/api/v1/simulate/types` | List intervention types |

### Alerts + Compliance
| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/v1/alerts/active` | Active citizen alerts |
| GET | `/api/v1/alerts/whatsapp` | WhatsApp formatted alert |
| GET | `/api/v1/alerts/health-impact` | Health impact estimates |
| GET | `/api/v1/compliance/grap` | GRAP stage status |
| GET | `/api/v1/compliance/report` | Full compliance report |

---

## project structure

```
pavan-ai/
├── apps/
│   ├── web/                    # Next.js frontend
│   │   ├── src/app/            # 9 routes + 3 API routes
│   │   │   ├── page.tsx              # Landing page
│   │   │   ├── dashboard/            # AQI dashboard
│   │   │   ├── simulate/             # Intervention simulator
│   │   │   ├── compliance/           # GRAP compliance
│   │   │   ├── alerts/               # Citizen alerts
│   │   │   ├── agents/               # Agent console
│   │   │   ├── compare/              # City comparison
│   │   │   ├── architecture/         # System architecture
│   │   │   └── api/                  # chat, notify, telegram
│   │   ├── src/components/
│   │   │   ├── map/                  # Mapbox with layer toggles
│   │   │   ├── dashboard/            # Stats, forecast, agents, data sources
│   │   │   ├── chat/                 # GPT-4o chat widget
│   │   │   ├── nav/                  # Shared navbar
│   │   │   └── decorations/          # Geo patterns, textures
│   │   └── public/claudy/           # Mascot poses (6)
│   │
│   └── api/                    # FastAPI backend
│       ├── app/
│       │   ├── routers/              # 6 API routers (27 endpoints)
│       │   ├── agents/               # 6 AI agents + orchestrator
│       │   └── services/             # cpcb, weather, forecast, risk,
│       │                             # simulator, satellite, traffic,
│       │                             # wards, llm, interpolation
│       └── Dockerfile
│
├── deliverables/
│   ├── presentation-deck.html  # 10-slide scroll deck
│   ├── architecture-diagram.html
│   └── demo-script.md          # 2-min video script
│
├── supabase/setup.sql          # Database schema + RLS
├── docs/
│   ├── data-validation.md      # Methodology + metrics
│   └── deployment.md           # Vercel + Railway + Supabase
└── README.md
```

---

## design system

Inspired by [Ru](https://github.com/PiyushMalik01/Ru) — warm, editorial, playful-but-confident.

- **Palette:** Warm cream `#f5f0e6` / graphite `#2c2c2e`
- **Fonts:** Bricolage Grotesque (body) + Fraunces (display numbers)
- **Tiles:** 28px border-radius, saturated entity colors, hover lift
- **Entity Colors:** Cobalt (forecast), Coral (moderate), Red (poor), Purple (severe), Teal (wind), Pink (alerts)
- **Typography:** Lowercase editorial voice, letterspaced mono eyebrows, giant serif display numbers
- **Mascot:** Claudy — cloud character with 6 poses (sit, chill, pray, pond, sleep, wave)
- **Texture:** SVG noise grain overlay, geometric patterns (dots, diamonds, circles, waves)
- **Accessibility:** Focus outlines, reduced motion support, 44px touch targets

---

## judging criteria alignment

| Criteria (Weight) | How Pavan Scores |
|---|---|
| **Innovation (25%)** | 5-source data fusion (CPCB + Sentinel-5P + MODIS + weather + traffic), counterfactual intervention simulator, compound risk scoring, multi-agent orchestration, GPT-4o chatbot + Telegram bot |
| **Business Impact (25%)** | 100+ NCAP cities need this. 1.67M deaths/year. Health impact quantification (WHO methodology). GRAP auto-compliance. Multi-channel delivery. |
| **Technical Excellence (20%)** | RMSE 11.74 (86% vs baseline). 6-agent pipeline. 27 API endpoints. Signal-to-recommendation <3s. 5 data sources fused. Satellite + fire + traffic integration. |
| **Scalability (15%)** | 57 cities, 105 stations. Vercel + Railway + Supabase + Docker. City switcher. Same architecture works nationwide. |
| **User Experience (15%)** | Ru-inspired design. Claudy mascot. 9 pages. Layer toggles. City comparison. Landing page with FAQs. Telegram + email + WhatsApp. 4 languages. |

---

## team

**Team EdgeRunner** — ET AI Hackathon 2026, Problem Statement #5

---

## license

MIT
