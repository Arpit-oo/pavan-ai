# Pavan — Demo Video Script (Final v3)

**Duration:** 2-3 minutes
**URL:** https://pavan-aqi.vercel.app
**Bot:** @PavanETbot on Telegram
**WhatsApp:** whatsapp.com/channel/0029Vb92jm97IUYYREzcKk0L
**Team:** EdgeRunner

---

## SCRIPT

### 0:00–0:20 — Landing Page (Piyush's hero)
> "This is Pavan — AI-powered air quality intelligence for India. We fuse 5 data sources through a 6-agent pipeline to turn raw monitoring data into actionable intelligence."

**Action:** Let the hero animation play — smog clears to blue sky. Scroll slowly through:
- Stakes section (1.67M deaths, 900+ stations, 31% gap)
- Data fusion section (5 sources shown visually)
- Capabilities section

> "Built for the ET AI Hackathon 2026, Problem Statement 5. Team EdgeRunner."

---

### 0:20–0:45 — Dashboard
> "The dashboard shows live AQI across all India — 105 stations, 57 cities. Watch what happens when I switch layers..."

**Action:** Click "Dashboard" from landing CTA. Show the map with AQI stations.

> "Satellite NO2 view from Sentinel-5P..."

**Action:** Click 🛰️ NO2 toggle — map changes to purple heatmap, numbers change.

> "Traffic congestion overlay..."

**Action:** Click 🚗 Traffic toggle — map changes to blue, values change.

> "Our XGBoost forecast — 86% better than persistence baseline. I can switch cities..."

**Action:** Click "Mumbai" pill under forecast chart. Then "Lucknow" — shows higher AQI.

> "All 5 data sources feeding in real-time on the right."

**Action:** Point at Data Sources panel.

---

### 0:45–1:05 — Intervention Simulator
> "Our killer feature — counterfactual intervention simulation."

**Action:** Click "Simulator" in navbar. Select "Mumbai" from city selector.

> "What happens if Mumbai bans trucks?"

**Action:** Click "Truck Ban" card. Watch 3-step loading animation. Show results.

> "AQI drops by 8 points. Empirical factors from published studies. Now compare all five..."

**Action:** Click "Compare All Interventions." Show ranking — burning ban highest.

---

### 1:05–1:25 — GRAP Compliance + Agents
> "GRAP compliance — all 4 stages detected automatically."

**Action:** Click "GRAP" in navbar. Select "Delhi" from city selector. Show 4 stages — all visible, readable.

> "Generate a full compliance report..."

**Action:** Click "Generate Compliance Report." Watch 3-step loading. Show report with executive summary + enforcement recs.

> "Powered by 6 AI agents..."

**Action:** Click "Agents." Select a city. Click "Run Full Analysis." Watch phase 1→2→3 animation with colored dots.

> "Signal to recommendation — under 3 seconds."

---

### 1:25–1:50 — Alerts + Chatbot + Channels
> "4 notification channels — all live."

**Action:** Click "Alerts." Show Telegram (blue), Email (orange), WhatsApp (green) cards.

> "Our Telegram bot has 10 commands, responds in Hindi..."

**Action:** Switch to phone — show @PavanETbot. Type /start. Show command menu.

> "WhatsApp broadcast channel with daily digests..."

**Action:** Show WhatsApp channel with seeded messages on phone.

> "AI chatbot — multilingual. Watch..."

**Action:** Back to laptop. Click blue chat bubble. Type "दिल्ली में हवा कैसी है?" — show Hindi response.

---

### 1:50–2:10 — Compare + Login
> "Compare 57 cities side by side."

**Action:** Click "Compare." Show ranking. Click different cities.

> "Users subscribe for alerts — choose cities, frequency, channels."

**Action:** Click "Subscribe" in navbar. Show login page with multi-city selector, frequency options, channel checkboxes.

---

### 2:10–2:20 — Architecture
> "Under the hood — 5 data sources, 6 agents, 28 API endpoints, Gaussian plume atmospheric dispersion."

**Action:** Click "Architecture." Quick scroll through layers.

---

### 2:20–2:30 — Close
> "Pavan. 5 data sources fused. 105 stations. 57 cities. 6 AI agents. 86% RMSE improvement. 4 live channels. Signal to recommendation under 3 seconds. Team EdgeRunner. Thank you."

**Action:** Scroll to landing page CTA or show pavan. logo.

---

## KEY NUMBERS TO SAY

- **5** data sources (CPCB, Sentinel-5P, MODIS, weather, traffic)
- **105** stations, **57** cities
- **6** AI agents, **3** phases
- **28** API endpoints
- **86%** RMSE improvement over baseline
- **4** notification channels (web, telegram, email, whatsapp)
- **<3 seconds** signal to recommendation
- **4** languages (auto-detect)
- **10** Telegram commands

## RECORDING TIPS

1. **Chrome full screen (F11)**, 1080p
2. **Pre-click everything once** — pages cached = fast loading
3. **OBS or Win+G** to record screen
4. **Show the hero animation** — let smog→clear play, it's impressive
5. **Show layer toggles** — judges MUST see map change
6. **Show loading animations** — 3-step dots on simulator/compliance/agents
7. **Show Hindi chatbot** — proves multilingual
8. **Phone for Telegram + WhatsApp** — split screen or quick switch
9. **Slow deliberate mouse** — don't rush
10. **Confident voice** — slightly fast pace, 2:30 is tight

## PAGE ORDER

1. Landing (/) — hero animation, scroll through sections — 20s
2. Dashboard (/dashboard) — map layers, forecast city switch — 25s
3. Simulator (/simulate) — city select, run, compare — 20s
4. GRAP (/compliance) — stages, generate report — 10s
5. Agents (/agents) — phase animation — 10s
6. Alerts (/alerts) — channels + chatbot in Hindi — 25s
7. Compare (/compare) — city ranking — 10s
8. Login (/login) — subscribe flow — 10s
9. Architecture (/architecture) — quick scroll — 10s
10. Close — 10s

## WHAT'S LIVE RIGHT NOW

```
Website:   pavan-aqi.vercel.app (10 pages)
Telegram:  @PavanETbot (10 commands, multilingual)
WhatsApp:  whatsapp.com/channel/0029Vb92jm97IUYYREzcKk0L
Email:     Gmail SMTP (sends real branded emails)
Chatbot:   GPT-4o (auto-detects Hindi/Tamil/Bengali/Punjabi)
Backend:   Railway (28 endpoints)
Database:  Supabase (61 stations, 1464 readings)
```
