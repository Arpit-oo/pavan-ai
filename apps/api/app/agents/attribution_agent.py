import math
from typing import Dict, List, Optional
from datetime import datetime
from app.agents.base import BaseAgent, AgentResult


# Simplified land use profiles for Delhi zones
DELHI_LAND_USE = {
    "north": {"industrial": 0.25, "residential": 0.40, "commercial": 0.15, "green": 0.10, "transport": 0.10},
    "south": {"industrial": 0.05, "residential": 0.45, "commercial": 0.25, "green": 0.15, "transport": 0.10},
    "east": {"industrial": 0.20, "residential": 0.45, "commercial": 0.10, "green": 0.05, "transport": 0.20},
    "west": {"industrial": 0.30, "residential": 0.35, "commercial": 0.10, "green": 0.05, "transport": 0.20},
    "central": {"industrial": 0.05, "residential": 0.30, "commercial": 0.35, "green": 0.15, "transport": 0.15},
}


class AttributionAgent(BaseAgent):
    name = "attribution"
    description = "Decomposes pollution sources per station using wind, land use, and temporal patterns"

    async def run(self, query="", context=None):
        # type: (str, Optional[Dict]) -> AgentResult
        ctx = context or {}
        readings = ctx.get("readings", [])
        wind = ctx.get("wind_analysis", {})

        if not readings:
            return AgentResult(self.name, {"attributions": []}, confidence=0.0)

        wind_dir = wind.get("current_wind_direction", 0)
        wind_speed = wind.get("current_wind_speed", 2)
        upwind_dir = (wind_dir + 180) % 360

        attributions = []
        for r in readings:
            attr = self._attribute_station(r, upwind_dir, wind_speed)
            attributions.append(attr)

        city_avg = self._aggregate_attributions(attributions)

        return AgentResult(
            self.name,
            {
                "attributions": attributions,
                "city_average": city_avg,
                "wind_direction": wind_dir,
                "upwind_direction": upwind_dir,
                "methodology": "Wind-weighted land use correlation with temporal pattern adjustment",
            },
            reasoning="Attributed {} stations. Dominant source: {} ({:.0f}%). Wind from {}.".format(
                len(attributions),
                max(city_avg, key=city_avg.get) if city_avg else "unknown",
                max(city_avg.values()) * 100 if city_avg else 0,
                wind.get("wind_direction_label", "unknown"),
            ),
            confidence=0.65,
        )

    def _attribute_station(self, reading, upwind_dir, wind_speed):
        # type: (Dict, float, float) -> Dict
        lat = reading.get("latitude", 28.6)
        zone = self._get_zone(lat, reading.get("longitude", 77.2))
        land_use = DELHI_LAND_USE.get(zone, DELHI_LAND_USE["central"])

        hour = datetime.now().hour
        aqi = reading.get("aqi", 100)
        pm25 = reading.get("pm25", 50) or 50
        pm10 = reading.get("pm10", 80) or 80

        # Base attribution from land use + satellite fire data
        vehicular = land_use["transport"] * 0.6 + land_use["commercial"] * 0.2
        industrial = land_use["industrial"] * 0.8
        construction = 0.10
        burning = 0.05
        background = 0.10

        # Cross-reference with MODIS/VIIRS fire detection
        try:
            from app.services.satellite import SatelliteService
            fires = SatelliteService().get_thermal_anomalies()
            for fire in fires.get("fires", []):
                fire_dist = ((lat - fire["lat"]) ** 2 + (lng - fire["lng"]) ** 2) ** 0.5
                if fire_dist < 0.5:
                    burning *= 2.5 if fire["type"] == "crop_burning" else 1.5
                    if fire["confidence"] > 80:
                        burning *= 1.3
        except Exception:
            pass

        # Time-of-day adjustments
        if 7 <= hour <= 10 or 17 <= hour <= 21:
            vehicular *= 1.8  # Rush hour
        if 5 <= hour <= 7 or 19 <= hour <= 22:
            burning *= 3.0  # Burning times
        if 9 <= hour <= 17:
            construction *= 1.5  # Work hours
        if hour < 6 or hour > 22:
            industrial *= 0.5  # Reduced industrial at night

        # PM ratio adjustment — high PM2.5/PM10 = combustion sources
        if pm10 > 0:
            ratio = pm25 / pm10
            if ratio > 0.7:
                vehicular *= 1.3
                burning *= 1.5
                construction *= 0.5
            elif ratio < 0.4:
                construction *= 2.0
                vehicular *= 0.7

        # Wind speed adjustment — stagnation amplifies local sources
        if wind_speed < 2:
            industrial *= 0.7  # Less distant industrial
            vehicular *= 1.3  # More local buildup
            burning *= 1.5

        # Normalize
        total = vehicular + industrial + construction + burning + background
        if total > 0:
            vehicular /= total
            industrial /= total
            construction /= total
            burning /= total
            background /= total

        return {
            "station_id": reading["station_id"],
            "station_name": reading["station_name"],
            "zone": zone,
            "sources": {
                "vehicular": round(vehicular, 3),
                "industrial": round(industrial, 3),
                "construction": round(construction, 3),
                "burning": round(burning, 3),
                "background": round(background, 3),
            },
            "confidence": {
                "vehicular": round(0.6 + vehicular * 0.3, 2),
                "industrial": round(0.5 + industrial * 0.3, 2),
                "construction": round(0.4 + construction * 0.2, 2),
                "burning": round(0.3 + burning * 0.3, 2),
                "background": 0.9,
            },
            "dominant_source": max(
                {"vehicular": vehicular, "industrial": industrial,
                 "construction": construction, "burning": burning},
                key=lambda k: {"vehicular": vehicular, "industrial": industrial,
                               "construction": construction, "burning": burning}[k],
            ),
        }

    def _get_zone(self, lat, lng):
        # type: (float, float) -> str
        if lat > 28.72:
            return "north"
        if lat < 28.55:
            return "south"
        if lng > 77.25:
            return "east"
        if lng < 77.1:
            return "west"
        return "central"

    def _aggregate_attributions(self, attributions):
        # type: (List[Dict]) -> Dict[str, float]
        if not attributions:
            return {}
        sources = {"vehicular": 0, "industrial": 0, "construction": 0, "burning": 0, "background": 0}
        for a in attributions:
            for src, val in a["sources"].items():
                sources[src] += val
        n = len(attributions)
        return {k: round(v / n, 3) for k, v in sources.items()}
