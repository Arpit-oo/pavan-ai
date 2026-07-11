from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.routers import aqi, forecast, agents, simulate, alerts, compliance

app = FastAPI(
    title="VayuBudhi API",
    description="Urban Air Quality Intelligence Platform",
    version="0.1.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "https://*.vercel.app"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/health")
async def health():
    return {"status": "ok", "service": "vayubudhi-api"}


app.include_router(aqi.router, prefix="/api/v1/aqi", tags=["aqi"])
app.include_router(forecast.router, prefix="/api/v1/forecast", tags=["forecast"])
app.include_router(agents.router, prefix="/api/v1/agents", tags=["agents"])
app.include_router(simulate.router, prefix="/api/v1/simulate", tags=["simulate"])
app.include_router(alerts.router, prefix="/api/v1/alerts", tags=["alerts"])
app.include_router(compliance.router, prefix="/api/v1/compliance", tags=["compliance"])
