# ET AI Hackathon 2026 — Problem Statement Analysis

**Analyst**: Expert hackathon judge evaluation
**Criteria**: Buildability (11 days), Demo Impact, Product Potential, Innovation Score, Data Availability, Competition Risk

---

## Scoring Matrix (each /10)

| # | Problem Statement | Buildability | Demo Wow | Product Potential | Innovation | Data Access | Low Competition | **TOTAL /60** |
|---|---|---|---|---|---|---|---|---|
| 1 | Industrial Safety Intelligence | 5 | 7 | 6 | 6 | 3 | 5 | **32** |
| 2 | Energy Supply Chain Resilience | 6 | 8 | 5 | 7 | 6 | 6 | **38** |
| 3 | EV Supply Chain & Asset Intel | 5 | 6 | 6 | 5 | 4 | 5 | **31** |
| 4 | Data Centre EPC Intelligence | 7 | 7 | 8 | 7 | 7 | 8 | **44** |
| 5 | Urban Air Quality Intelligence | 8 | 9 | 9 | 8 | 9 | 7 | **50** |
| 6 | Digital Public Safety (Fraud/Scams) | 7 | 8 | 8 | 7 | 5 | 4 | **39** |
| 7 | Cyber Resilience for CNI | 4 | 5 | 5 | 5 | 3 | 4 | **26** |
| 8 | Industrial Knowledge Intelligence | 8 | 7 | 9 | 6 | 8 | 6 | **44** |

---

## Detailed Analysis

### WINNER: #5 — AI-Powered Urban Air Quality Intelligence
**Score: 50/60** | **Recommendation: BUILD THIS**

**Why this wins:**
- **Data is FREE and abundant**: CPCB publishes real-time AQI from 900+ CAAQMS stations via public APIs. OpenWeatherMap, Sentinel satellite imagery (Copernicus), OpenStreetMap land use — all free, all accessible NOW.
- **Demo is SPECTACULAR**: Geospatial heatmap with live AQI data, ward-level forecasting, source attribution overlay — judges can literally see their own city's air quality. Emotional + visual + immediate.
- **Ships as independent product**: B2G SaaS to municipal corporations under Smart Cities Mission. B2C health advisory app. Both are real markets. India has 100+ cities under NCAP that NEED this.
- **Buildable in 11 days**: Core is data pipeline (CPCB API) → ML forecasting model → geospatial visualization. No proprietary data dependencies. No hardware requirements.
- **Hackathon scoring alignment**: Innovation (25%) — multi-modal source attribution is novel. Business Impact (25%) — 1.67M premature deaths/year, cities actively budgeting for this. Scalability (15%) — same stack works for any Indian city. UX (15%) — map-based UI is inherently good UX.

**What to build (MVP scope):**
1. Real-time AQI dashboard with geospatial heatmap (Mapbox/Leaflet)
2. Source attribution engine (correlate AQI with land use, traffic, construction permits)
3. 24-hour ward-level AQI forecast using weather + historical patterns
4. Enforcement recommendation agent (where to send inspectors)
5. Multi-language citizen alert system (WhatsApp bot)

**Tech stack**: Next.js + Mapbox/Deck.gl + Python ML backend + CPCB API + OpenWeatherMap + Supabase

---

### STRONG RUNNER-UP: #8 — Industrial Knowledge Intelligence
**Score: 44/60**

**Why it's strong:**
- RAG over documents is well-understood tech — fast to build, reliable
- Demo: upload industrial docs, ask questions, get cited answers. Clear value prop.
- Product potential is massive — every manufacturing plant needs this
- Problem statement is broadest — easiest to scope down to a tight MVP

**Why #5 beats it:**
- Knowledge intelligence is becoming commodity (many RAG products exist). Less novel.
- Demo lacks visual punch compared to geospatial air quality maps
- Judges see RAG demos constantly. Air quality + geospatial = fresh.

---

### RUNNER-UP: #4 — Data Centre EPC Intelligence
**Score: 44/60**

**Why it's strong:**
- India's $15B data centre boom = timely narrative
- Spec compliance checking is very demoable (upload PDF spec, find deviations)
- Low competition — niche enough that few teams will pick it

**Why #5 beats it:**
- Needs domain expertise in EPC/construction to build convincingly
- Demo requires realistic sample data that's hard to synthesize
- Narrower product market

---

### #6 — Digital Public Safety
**Score: 39/60**

Crowd-pleaser topic but: fraud detection data is hard to get (privacy, law enforcement sensitivity), and counterfeit currency CV models need training data you won't have. Many teams will pick this because it sounds exciting — means more competition for same judges.

### #2 — Energy Supply Chain
**Score: 38/60**

Great narrative, great geopolitics angle. But: AIS ship tracking data costs money, commodity APIs are expensive, and "scenario simulation" is hard to demo convincingly in a prototype. High risk of looking like a fancy dashboard with made-up numbers.

### #1 — Industrial Safety
**Score: 32/60**

Needs SCADA/IoT data you don't have. Compound risk detection needs real sensor streams. Hard to fake convincingly for demo.

### #3 — EV Supply Chain
**Score: 31/60**

Too broad (fleet + manufacturing + carbon). Battery BMS data not accessible. Multiple sub-problems means shallow coverage of each.

### #7 — Cyber Resilience
**Score: 26/60** | **AVOID**

Hardest to demo. Behavioral anomaly detection needs months of baseline data. MITRE ATT&CK mapping is well-trodden. SOC tools market is saturated with real companies (Splunk, CrowdStrike, SentinelOne). Judges will compare to production-grade tools. Worst risk/reward ratio.

---

## Final Verdict

**Pick #5 (Urban Air Quality Intelligence). No hesitation.**

It has the rare combination of: free public data, spectacular visual demo, clear product-market fit, social impact narrative, and technical depth that scales to your ambition level. You can build a genuine working product in 11 days, not a mockup.

The air quality crisis is emotionally resonant to every Indian judge in that room. Show them their own city's ward-level pollution — they'll remember your demo.
