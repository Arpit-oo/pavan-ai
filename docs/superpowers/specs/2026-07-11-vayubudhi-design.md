# VayuBudhi — Urban Air Quality Intelligence Platform

**Project:** ET AI Hackathon 2026 — Problem Statement #5
**Deadline:** 2026-07-22
**Codename:** VayuBudhi (वायुबुद्धि — "Air Intelligence")

---

## 1. Problem

India's 900+ air quality monitoring stations generate data continuously. Only 31% of cities with monitoring data have actionable response protocols linked to readings. The intelligence layer between data and action does not exist. VayuBudhi builds it.

## 2. Solution

Multi-agent AI platform that fuses CPCB sensor data, weather, satellite imagery, traffic, and land use data into:
- Real-time geospatial AQI intelligence (not just dashboards)
- Ward-level 24-72hr forecasting
- Source attribution with confidence scores
- Counterfactual intervention simulation
- Automated enforcement recommendations
- GRAP compliance reporting
- Multilingual citizen health alerts

## 3. Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    PRESENTATION LAYER                        │
│  Next.js 15 + Tailwind + shadcn/ui + Deck.gl + Mapbox GL   │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐      │
│  │ Map View │ │ Forecast │ │ Agents   │ │ Citizen  │      │
│  │ Heatmap  │ │ Panel    │ │ Console  │ │ Alerts   │      │
│  └──────────┘ └──────────┘ └──────────┘ └──────────┘      │
└────────────────────────┬────────────────────────────────────┘
                         │ REST + WebSocket
┌────────────────────────▼────────────────────────────────────┐
│                     API LAYER (FastAPI)                      │
│  /api/v1/aqi          — real-time + historical readings     │
│  /api/v1/forecast     — ward-level predictions              │
│  /api/v1/attribution  — source decomposition                │
│  /api/v1/agents       — agent orchestration endpoints       │
│  /api/v1/simulate     — intervention simulator              │
│  /api/v1/alerts       — citizen alert management            │
│  /api/v1/compliance   — GRAP status + reports               │
│  /ws/live             — real-time data stream                │
└────────────────────────┬────────────────────────────────────┘
                         │
         ┌───────────────┼───────────────┐
         │               │               │
┌────────▼──────┐ ┌──────▼──────┐ ┌──────▼──────┐
│  SUPABASE DB  │ │ AGENT MESH  │ │ ML PIPELINE │
│               │ │             │ │             │
│ stations      │ │ Orchestrator│ │ XGBoost     │
│ readings      │ │ Sensor      │ │ forecast    │
│ forecasts     │ │ Weather     │ │ models      │
│ alerts        │ │ Attribution │ │             │
│ wards         │ │ Forecast    │ │ Attribution │
│ interventions │ │ Anomaly     │ │ engine      │
│               │ │ Enforcement │ │             │
│               │ │ Citizen     │ │ Anomaly     │
│               │ │             │ │ detection   │
└───────────────┘ └─────────────┘ └─────────────┘
                         │
┌────────────────────────▼────────────────────────────────────┐
│                  DATA INGESTION LAYER                        │
│  ┌─────────┐ ┌──────────┐ ┌──────────┐ ┌────────────────┐ │
│  │ CPCB    │ │ OpenWea- │ │Sentinel  │ │ NASA FIRMS     │ │
│  │ API     │ │ therMap  │ │ 5P       │ │ Fire detection │ │
│  │         │ │          │ │          │ │                │ │
│  │ 900+    │ │ Wind/    │ │ NO2/SO2  │ │ Burning events │ │
│  │stations │ │ Temp/    │ │ column   │ │                │ │
│  │ RT AQI  │ │ Humidity │ │ density  │ │                │ │
│  └─────────┘ └──────────┘ └──────────┘ └────────────────┘ │
│  ┌──────────────┐ ┌──────────────┐ ┌──────────────────┐   │
│  │ OpenStreetMap │ │ Google Maps  │ │ Census 2011      │   │
│  │ Land use      │ │ Traffic API  │ │ Population/demo  │   │
│  └──────────────┘ └──────────────┘ └──────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

## 4. Database Schema (Supabase/Postgres)

```sql
-- Monitoring stations
CREATE TABLE stations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    station_name TEXT NOT NULL,
    city TEXT NOT NULL,
    state TEXT NOT NULL,
    latitude DOUBLE PRECISION NOT NULL,
    longitude DOUBLE PRECISION NOT NULL,
    station_type TEXT, -- CAAQMS, manual, etc
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- AQI readings (time-series)
CREATE TABLE readings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    station_id UUID REFERENCES stations(id),
    timestamp TIMESTAMPTZ NOT NULL,
    aqi INTEGER,
    pm25 DOUBLE PRECISION,
    pm10 DOUBLE PRECISION,
    no2 DOUBLE PRECISION,
    so2 DOUBLE PRECISION,
    co DOUBLE PRECISION,
    o3 DOUBLE PRECISION,
    temperature DOUBLE PRECISION,
    humidity DOUBLE PRECISION,
    wind_speed DOUBLE PRECISION,
    wind_direction DOUBLE PRECISION,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Ward boundaries and metadata
CREATE TABLE wards (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    city TEXT NOT NULL,
    ward_name TEXT NOT NULL,
    ward_number INTEGER,
    geometry JSONB NOT NULL, -- GeoJSON polygon
    population INTEGER,
    area_sq_km DOUBLE PRECISION,
    land_use_profile JSONB, -- {industrial: 0.2, residential: 0.5, ...}
    vulnerable_sites JSONB, -- [{type: "school", name: "...", lat, lng}, ...]
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Forecasts
CREATE TABLE forecasts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    ward_id UUID REFERENCES wards(id),
    forecast_timestamp TIMESTAMPTZ NOT NULL,
    target_timestamp TIMESTAMPTZ NOT NULL,
    predicted_aqi INTEGER,
    predicted_pm25 DOUBLE PRECISION,
    confidence_lower INTEGER,
    confidence_upper INTEGER,
    model_version TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Source attributions
CREATE TABLE attributions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    ward_id UUID REFERENCES wards(id),
    timestamp TIMESTAMPTZ NOT NULL,
    vehicular_pct DOUBLE PRECISION,
    industrial_pct DOUBLE PRECISION,
    construction_pct DOUBLE PRECISION,
    burning_pct DOUBLE PRECISION,
    background_pct DOUBLE PRECISION,
    confidence_scores JSONB,
    methodology TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Anomalies detected
CREATE TABLE anomalies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    station_id UUID REFERENCES stations(id),
    ward_id UUID REFERENCES wards(id),
    detected_at TIMESTAMPTZ NOT NULL,
    anomaly_type TEXT, -- spike, deviation, pattern_break
    severity TEXT, -- low, medium, high, critical
    description TEXT,
    probable_cause TEXT,
    is_resolved BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Citizen alerts
CREATE TABLE alerts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    ward_id UUID REFERENCES wards(id),
    alert_type TEXT, -- health_advisory, grap_stage, anomaly
    severity TEXT,
    message_en TEXT,
    message_hi TEXT,
    message_regional TEXT,
    is_active BOOLEAN DEFAULT true,
    expires_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Intervention simulations
CREATE TABLE simulations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    intervention_type TEXT, -- truck_ban, construction_halt, industrial_shutdown
    parameters JSONB,
    affected_wards UUID[],
    predicted_impact JSONB, -- {aqi_reduction: 15, pm25_reduction: 12.3, ...}
    created_at TIMESTAMPTZ DEFAULT now()
);
```

## 5. Agent Definitions

### Orchestrator Agent
- Coordinates all sub-agents
- Receives user queries or scheduled triggers
- Routes to appropriate agent(s)
- Merges responses into unified intelligence

### Sensor Agent
- Pulls latest CPCB data
- Normalizes across station types
- Detects missing/stale readings
- Fills gaps via interpolation

### Weather Agent
- Pulls OpenWeatherMap forecasts
- Identifies stagnation conditions (low wind + high humidity = pollution trap)
- Predicts inversion layers
- Wind trajectory analysis for source direction

### Attribution Agent
- Correlates AQI with wind direction → upwind source identification
- Cross-references land use (OSM) for source categorization
- Time-of-day pattern analysis (burning = morning/evening spikes)
- Outputs source decomposition with confidence scores

### Forecast Agent
- Runs XGBoost model with features: historical AQI, weather forecast, day-of-week, season, events
- Produces ward-level 24-72hr predictions
- Generates confidence intervals
- Triggers alerts when forecast exceeds thresholds

### Anomaly Agent
- Compares real-time readings against forecast baseline
- Flags statistical outliers (Z-score > 3)
- Correlates with nearby stations to classify local vs regional events
- Generates probable cause hypotheses

### Enforcement Agent
- Given attribution + anomaly data → ranked inspection priorities
- GPS coordinates of likely source
- Evidence documentation package
- Estimated impact if enforcement action taken

### Citizen Agent
- Generates ward-level health advisories
- Translates to Hindi + regional languages via Claude
- Formats for WhatsApp/IVR delivery
- Personalizes based on vulnerable population proximity

## 6. ML Models

### AQI Forecasting (XGBoost)
- **Features:** historical AQI (lag 1h, 6h, 24h, 7d), temperature, humidity, wind speed, wind direction, hour-of-day, day-of-week, month, is_weekend, is_holiday
- **Target:** AQI at t+1h, t+6h, t+24h
- **Training data:** Historical CPCB readings (available back to 2015+)
- **Validation:** Walk-forward validation, RMSE vs persistence baseline
- **Output:** Point prediction + confidence interval (quantile regression)

### Source Attribution (Statistical)
- Wind-direction weighted correlation with upwind land use
- Receptor modeling approach (simplified PMF)
- Time-series decomposition for diurnal source patterns
- Output: percentage contribution per source category with confidence

### Anomaly Detection
- Isolation Forest on multivariate AQI + weather features
- Z-score on per-station residuals (actual - forecast)
- Spatial anomaly: station deviates while neighbors don't → local event

## 7. Frontend Pages

1. **Dashboard (/)** — Full-screen Deck.gl map with AQI heatmap, station markers, ward boundaries. Sidebar with city summary, top anomalies, active alerts.

2. **Ward Detail (/ward/:id)** — Deep dive into single ward. Source attribution pie chart, 72hr forecast chart, historical trends, nearby vulnerable sites, active enforcement recommendations.

3. **Forecast (/forecast)** — City-wide forecast view. Animated time-slider showing predicted AQI evolution over next 72 hours on map. Confidence bands.

4. **Intervention Simulator (/simulate)** — Interactive tool. Select intervention type → see predicted AQI impact across affected wards. Before/after map comparison.

5. **Agent Console (/agents)** — Live view of agent activity. Shows orchestrator coordinating sub-agents, recent findings, anomaly timeline. Makes multi-agent architecture visible to judges.

6. **Alerts (/alerts)** — Active citizen alerts, GRAP stage status, enforcement queue. Multi-language preview.

7. **Compliance (/compliance)** — GRAP stage tracker, auto-generated compliance reports, intervention history.

## 8. Tech Stack

| Layer | Technology | Reason |
|---|---|---|
| Frontend | Next.js 15 (App Router) | SSR, API routes, modern React |
| Styling | Tailwind CSS + shadcn/ui | Rapid UI, consistent design |
| Maps | Deck.gl + Mapbox GL JS | 3D heatmaps, hex bins, animations |
| Backend | Python FastAPI | Async, fast, ML-friendly |
| ML | XGBoost + scikit-learn | Tabular data, fast training |
| DB | Supabase (Postgres) | Real-time subs, auth, free tier |
| AI | Claude API (Anthropic) | Multi-agent orchestration |
| Deploy | Vercel + Railway | Fast, free tiers available |

## 9. Judging Criteria Alignment

| Criteria (Weight) | How VayuBudhi scores |
|---|---|
| Innovation (25%) | Multi-agent orchestration, intervention simulator, compound risk scoring — none exist in current tools |
| Business Impact (25%) | 100+ NCAP cities need this. 1.67M deaths/year. Directly actionable by municipal authorities |
| Technical Excellence (20%) | Real data, validated ML models, multi-agent coordination, geospatial analysis |
| Scalability (15%) | Same architecture works for any Indian city — add stations, retrain model |
| User Experience (15%) | Deck.gl 3D maps, animated forecasts, mobile citizen alerts, multi-language |

## 10. Risk Mitigation

| Risk | Mitigation |
|---|---|
| CPCB API unreliable/rate-limited | Build scraper as fallback, cache aggressively |
| ML model accuracy low | Persistence baseline always available as comparison |
| Too many features for 11 days | Strict priority tiers (P0-P4), each tier independently demoable |
| Mapbox free tier limits | Use OpenStreetMap tiles as fallback |
| Demo with no live data | Pre-cache 7 days of data, demo runs on cached data if API down |
