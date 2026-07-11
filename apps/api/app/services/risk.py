"""Compound Risk Scoring Engine.
Fuses AQI + weather + population + vulnerability into single 0-100 risk score.
Not just "how bad is air" but "how dangerous is this for people right now"."""

from typing import Dict, List, Any
from datetime import datetime


class RiskService:
    # Weight each factor
    WEIGHTS = {
        "aqi": 0.35,
        "weather": 0.20,
        "population": 0.15,
        "vulnerability": 0.15,
        "trend": 0.15,
    }

    def score_zone(self, zone, readings, weather, forecast=None):
        # type: (Dict, List[Dict], Dict, List[Dict]) -> Dict[str, Any]
        """Compute compound risk score for a zone."""

        # 1. AQI component (0-100)
        zone_readings = self._readings_in_zone(readings, zone)
        if zone_readings:
            avg_aqi = sum(r.get("aqi", 0) for r in zone_readings) / len(zone_readings)
        else:
            avg_aqi = sum(r.get("aqi", 0) for r in readings) / max(len(readings), 1)

        aqi_score = min(100, (avg_aqi / 500) * 100)

        # 2. Weather component (0-100)
        wind_speed = weather.get("wind_speed", 3) or 3
        humidity = weather.get("humidity", 50) or 50

        stagnation_score = max(0, (3 - wind_speed) / 3) * 60
        humidity_score = max(0, (humidity - 50) / 50) * 30
        hour = datetime.now().hour
        inversion_score = 20 if (hour < 8 or hour > 20) and wind_speed < 2 else 0
        weather_score = min(100, stagnation_score + humidity_score + inversion_score)

        # 3. Population density component (0-100)
        population = zone.get("population", 500000)
        area = zone.get("area_sq_km", 50)
        density = population / max(area, 1)
        # Delhi avg density ~11,000/km2. Scale relative.
        pop_score = min(100, (density / 20000) * 100)

        # 4. Vulnerability component (0-100)
        vulnerable_sites = zone.get("vulnerable_sites", [])
        vuln_counts = {}
        for site in vulnerable_sites:
            t = site.get("type", "other")
            vuln_counts[t] = vuln_counts.get(t, 0) + 1

        hospital_factor = vuln_counts.get("hospital", 0) * 15
        school_factor = vuln_counts.get("school", 0) * 20
        base_vuln = 30  # Every zone has some vulnerable population
        vuln_score = min(100, base_vuln + hospital_factor + school_factor)

        # 5. Trend component (0-100) — is it getting worse?
        trend_score = 50  # Neutral default
        if forecast:
            future_aqis = [f.get("predicted_aqi", avg_aqi) for f in forecast[:6]]
            if future_aqis:
                avg_future = sum(future_aqis) / len(future_aqis)
                if avg_future > avg_aqi * 1.1:
                    trend_score = 75  # Worsening
                elif avg_future > avg_aqi * 1.2:
                    trend_score = 90  # Rapidly worsening
                elif avg_future < avg_aqi * 0.9:
                    trend_score = 25  # Improving

        # Weighted compound score
        compound = (
            aqi_score * self.WEIGHTS["aqi"]
            + weather_score * self.WEIGHTS["weather"]
            + pop_score * self.WEIGHTS["population"]
            + vuln_score * self.WEIGHTS["vulnerability"]
            + trend_score * self.WEIGHTS["trend"]
        )

        return {
            "zone_id": zone.get("id"),
            "zone_name": zone.get("name"),
            "compound_risk": round(compound, 1),
            "risk_level": self._risk_level(compound),
            "components": {
                "aqi": {"score": round(aqi_score, 1), "value": round(avg_aqi, 1), "weight": self.WEIGHTS["aqi"]},
                "weather": {"score": round(weather_score, 1), "detail": "wind {}m/s, humidity {}%".format(wind_speed, humidity), "weight": self.WEIGHTS["weather"]},
                "population": {"score": round(pop_score, 1), "density": round(density, 0), "weight": self.WEIGHTS["population"]},
                "vulnerability": {"score": round(vuln_score, 1), "sites": len(vulnerable_sites), "weight": self.WEIGHTS["vulnerability"]},
                "trend": {"score": round(trend_score, 1), "direction": "worsening" if trend_score > 60 else "improving" if trend_score < 40 else "stable", "weight": self.WEIGHTS["trend"]},
            },
            "action_needed": compound > 60,
            "stations_in_zone": len(zone_readings),
        }

    def score_all_zones(self, zones, readings, weather, forecasts=None):
        # type: (List[Dict], List[Dict], Dict, Dict) -> List[Dict]
        """Score all zones and rank by risk."""
        scores = []
        for zone in zones:
            zone_forecast = None
            if forecasts:
                # Get forecast for nearest station in zone
                for sid, fdata in forecasts.items():
                    if self._in_zone(fdata.get("latitude", 0), fdata.get("longitude", 0), zone):
                        zone_forecast = fdata.get("forecasts", [])
                        break

            score = self.score_zone(zone, readings, weather, zone_forecast)
            scores.append(score)

        scores.sort(key=lambda s: s["compound_risk"], reverse=True)
        return scores

    def _readings_in_zone(self, readings, zone):
        # type: (List[Dict], Dict) -> List[Dict]
        return [r for r in readings if self._in_zone(r.get("latitude", 0), r.get("longitude", 0), zone)]

    def _in_zone(self, lat, lng, zone):
        # type: (float, float, Dict) -> bool
        bounds = zone.get("bounds", [[0, 0], [0, 0]])
        return (bounds[0][0] <= lat <= bounds[1][0] and bounds[0][1] <= lng <= bounds[1][1])

    def _risk_level(self, score):
        # type: (float) -> str
        if score < 20:
            return "low"
        if score < 40:
            return "moderate"
        if score < 60:
            return "elevated"
        if score < 80:
            return "high"
        return "critical"
