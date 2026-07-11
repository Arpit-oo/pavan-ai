from typing import Dict, List, Optional
from datetime import datetime
from app.agents.base import BaseAgent, AgentResult


class AnomalyAgent(BaseAgent):
    name = "anomaly"
    description = "Detects anomalous AQI spikes and deviations from expected patterns"

    async def run(self, query="", context=None):
        # type: (str, Optional[Dict]) -> AgentResult
        ctx = context or {}
        readings = ctx.get("readings", [])

        if not readings:
            return AgentResult(
                self.name,
                {"anomalies": [], "count": 0},
                reasoning="No readings to analyze",
                confidence=0.0,
            )

        anomalies = []

        # Spatial anomaly: station deviates from neighbors
        aqi_values = [r.get("aqi", 0) for r in readings if r.get("aqi")]
        if aqi_values:
            mean_aqi = sum(aqi_values) / len(aqi_values)
            variance = sum((v - mean_aqi) ** 2 for v in aqi_values) / len(aqi_values)
            std_aqi = variance ** 0.5

            if std_aqi > 0:
                for r in readings:
                    aqi = r.get("aqi", 0)
                    z_score = (aqi - mean_aqi) / std_aqi

                    if z_score > 2.0:
                        anomalies.append({
                            "type": "spatial_spike",
                            "severity": "critical" if z_score > 3.0 else "high",
                            "station": r["station_name"],
                            "station_id": r["station_id"],
                            "aqi": aqi,
                            "z_score": round(z_score, 2),
                            "city_avg": round(mean_aqi, 1),
                            "deviation_pct": round(((aqi - mean_aqi) / mean_aqi) * 100, 1),
                            "lat": r["latitude"],
                            "lng": r["longitude"],
                            "probable_cause": self._guess_cause(r, z_score),
                            "detected_at": datetime.now().isoformat(),
                        })

        # PM2.5/PM10 ratio anomaly (indicates unusual source)
        for r in readings:
            pm25 = r.get("pm25", 0) or 0
            pm10 = r.get("pm10", 0) or 0
            if pm10 > 0 and pm25 > 0:
                ratio = pm25 / pm10
                if ratio > 0.8:
                    anomalies.append({
                        "type": "source_anomaly",
                        "severity": "medium",
                        "station": r["station_name"],
                        "station_id": r["station_id"],
                        "detail": "PM2.5/PM10 ratio {:.2f} — unusually high fine particle fraction".format(ratio),
                        "probable_cause": "combustion source (burning, vehicles) rather than dust",
                        "lat": r["latitude"],
                        "lng": r["longitude"],
                        "detected_at": datetime.now().isoformat(),
                    })

        anomalies.sort(key=lambda a: {"critical": 0, "high": 1, "medium": 2}.get(a["severity"], 3))

        return AgentResult(
            self.name,
            {
                "anomalies": anomalies,
                "count": len(anomalies),
                "city_mean_aqi": round(mean_aqi, 1) if aqi_values else 0,
                "city_std_aqi": round(std_aqi, 1) if aqi_values else 0,
            },
            reasoning="{} anomalies detected. {} critical.".format(
                len(anomalies),
                len([a for a in anomalies if a["severity"] == "critical"]),
            ),
            confidence=0.8,
        )

    def _guess_cause(self, reading, z_score):
        # type: (Dict, float) -> str
        name = reading.get("station_name", "").lower()
        hour = datetime.now().hour

        if "anand vihar" in name or "wazirpur" in name:
            return "Known industrial/traffic hotspot — elevated baseline expected but current spike abnormal"
        if z_score > 3.5:
            if 5 <= hour <= 8 or 18 <= hour <= 22:
                return "Likely localized burning event (crop residue, waste) — timing matches burning patterns"
            return "Severe localized event — possible industrial emission, fire, or construction without dust suppression"
        if hour < 8:
            return "Morning inversion trapping overnight emissions — likely resolves by midday"
        return "Localized pollution source — needs field investigation"
