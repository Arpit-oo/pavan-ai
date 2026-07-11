from typing import Dict, Optional
from app.agents.base import BaseAgent, AgentResult
from app.services.cpcb import CPCBService


class SensorAgent(BaseAgent):
    name = "sensor"
    description = "Pulls and analyzes real-time CPCB sensor data"

    async def run(self, query="", context=None):
        # type: (str, Optional[Dict]) -> AgentResult
        city = (context or {}).get("city", "Delhi")
        svc = CPCBService()

        try:
            readings = await svc.get_city_readings(city)

            if not readings:
                return AgentResult(
                    self.name,
                    {"error": "No readings available"},
                    reasoning="CPCB API returned no data",
                    confidence=0.0,
                )

            aqi_values = [r.get("aqi", 0) for r in readings if r.get("aqi")]
            pm25_values = [r.get("pm25", 0) for r in readings if r.get("pm25")]

            avg_aqi = sum(aqi_values) / max(len(aqi_values), 1)
            max_aqi = max(aqi_values) if aqi_values else 0
            min_aqi = min(aqi_values) if aqi_values else 0
            avg_pm25 = sum(pm25_values) / max(len(pm25_values), 1)

            worst = max(readings, key=lambda r: r.get("aqi", 0))
            best = min(readings, key=lambda r: r.get("aqi", 0))

            hotspots = [r for r in readings if r.get("aqi", 0) > 200]
            stale = [r for r in readings if r.get("_synthetic")]

            return AgentResult(
                self.name,
                {
                    "city": city,
                    "station_count": len(readings),
                    "avg_aqi": round(avg_aqi, 1),
                    "max_aqi": max_aqi,
                    "min_aqi": min_aqi,
                    "avg_pm25": round(avg_pm25, 1),
                    "worst_station": {
                        "name": worst["station_name"],
                        "aqi": worst.get("aqi", 0),
                        "lat": worst["latitude"],
                        "lng": worst["longitude"],
                    },
                    "best_station": {
                        "name": best["station_name"],
                        "aqi": best.get("aqi", 0),
                    },
                    "hotspot_count": len(hotspots),
                    "hotspots": [
                        {"name": h["station_name"], "aqi": h.get("aqi", 0)}
                        for h in sorted(hotspots, key=lambda x: x.get("aqi", 0), reverse=True)[:5]
                    ],
                    "stale_stations": len(stale),
                    "readings": readings,
                },
                reasoning="Pulled {} stations. Avg AQI: {}. {} hotspots (AQI>200).".format(
                    len(readings), round(avg_aqi, 1), len(hotspots)
                ),
                confidence=0.5 if stale else 0.95,
            )
        finally:
            await svc.close()
