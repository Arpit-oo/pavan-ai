# Deployment Guide — Pavan

## Frontend (Vercel)

**Live:** https://web-chi-five-95.vercel.app

### Deploy via CLI
```bash
cd apps/web
npx vercel --prod
```

### Environment Variables (Vercel Dashboard)
| Variable | Required | Description |
|---|---|---|
| `NEXT_PUBLIC_MAPBOX_TOKEN` | Yes | Mapbox GL access token |
| `OPENAI_API_KEY` | Yes | GPT-4o-mini for chatbot |
| `NEXT_PUBLIC_API_URL` | Optional | Backend URL (empty = demo mode) |
| `NEXT_PUBLIC_SUPABASE_URL` | Optional | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Optional | Supabase anon key |

### Deploy via GitHub
1. Go to vercel.com/new
2. Import `Arpit-oo/pavan-ai`
3. Root Directory: `apps/web`
4. Add env vars above
5. Deploy

---

## Backend (Railway)

### Deploy via Railway Dashboard
1. Go to railway.com/new
2. Deploy from GitHub → `Arpit-oo/pavan-ai`
3. Root Directory: `apps/api`
4. Railway auto-detects Dockerfile
5. Add environment variables:

| Variable | Required |
|---|---|
| `OPENWEATHERMAP_API_KEY` | Yes |
| `OPENAI_API_KEY` | Yes |
| `SUPABASE_URL` | Yes |
| `SUPABASE_KEY` | Yes |
| `SUPABASE_SERVICE_KEY` | Yes |

6. Deploy → get URL
7. Update Vercel env: `NEXT_PUBLIC_API_URL` = Railway URL

### Deploy via CLI
```bash
cd apps/api
railway login
railway init
railway up
```

---

## Database (Supabase)

1. Create project at supabase.com
2. Go to SQL Editor
3. Paste contents of `supabase/setup.sql`
4. Run — creates 5 tables with indexes and RLS
5. Copy URL + anon key + service_role key to `.env` files

### Tables
- `stations` — 105 monitoring stations
- `readings` — time-series AQI data
- `forecasts` — model predictions
- `alerts` — citizen health advisories
- `anomalies` — detected anomalies

---

## Architecture

```
User → Vercel (Next.js) → Railway (FastAPI) → CPCB + OpenWeatherMap
                ↓                    ↓
           Mapbox GL          Supabase (Postgres)
           GPT-4o-mini        XGBoost Model
```
