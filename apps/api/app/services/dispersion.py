"""Atmospheric Dispersion Modeling Service.
Implements simplified Gaussian plume dispersion model for pollution spread
prediction based on wind speed, direction, atmospheric stability, and source
location. Used to predict how pollution disperses from identified sources."""

import math
from typing import Dict, List, Any
from datetime import datetime


# Pasquill-Gifford stability classes
STABILITY_CLASSES = {
    "A": {"sigma_y": 0.22, "sigma_z": 0.20, "label": "very unstable", "conditions": "strong solar, light wind"},
    "B": {"sigma_y": 0.16, "sigma_z": 0.12, "label": "unstable", "conditions": "moderate solar, light wind"},
    "C": {"sigma_y": 0.11, "sigma_z": 0.08, "label": "slightly unstable", "conditions": "weak solar, moderate wind"},
    "D": {"sigma_y": 0.08, "sigma_z": 0.06, "label": "neutral", "conditions": "overcast or strong wind"},
    "E": {"sigma_y": 0.06, "sigma_z": 0.03, "label": "slightly stable", "conditions": "night, moderate wind"},
    "F": {"sigma_y": 0.04, "sigma_z": 0.016, "label": "stable", "conditions": "night, light wind — worst dispersion"},
}


class DispersionService:
    def classify_stability(self, wind_speed, hour, cloud_cover=50):
        # type: (float, int, int) -> str
        is_day = 6 <= hour <= 18
        if is_day:
            if wind_speed < 2:
                return "A" if cloud_cover < 50 else "B"
            elif wind_speed < 5:
                return "B" if cloud_cover < 50 else "C"
            else:
                return "C" if cloud_cover < 50 else "D"
        else:
            if wind_speed < 3:
                return "F"
            elif wind_speed < 5:
                return "E"
            else:
                return "D"

    def gaussian_plume(self, x, y, Q, H, wind_speed, stability_class):
        # type: (float, float, float, float, float, str) -> float
        """Calculate concentration at point (x,y) from source.
        x: downwind distance (m)
        y: crosswind distance (m)
        Q: emission rate (ug/s)
        H: effective stack height (m)
        wind_speed: m/s
        Returns: concentration in ug/m3"""
        if x <= 0 or wind_speed <= 0:
            return 0.0

        sc = STABILITY_CLASSES.get(stability_class, STABILITY_CLASSES["D"])
        sigma_y = sc["sigma_y"] * x * (1 + 0.0001 * x) ** (-0.5)
        sigma_z = sc["sigma_z"] * x * (1 + 0.0001 * x) ** (-0.5)

        if sigma_y <= 0 or sigma_z <= 0:
            return 0.0

        exp_y = math.exp(-0.5 * (y / sigma_y) ** 2)
        exp_z = math.exp(-0.5 * (H / sigma_z) ** 2) + math.exp(-0.5 * (H / sigma_z) ** 2)

        C = (Q / (2 * math.pi * wind_speed * sigma_y * sigma_z)) * exp_y * exp_z
        return max(0, C)

    def predict_dispersion(self, source, wind_speed, wind_direction, stability=None, grid_size=20, extent_km=10):
        # type: (Dict, float, float, str, int, int) -> Dict[str, Any]
        """Predict pollution dispersion from a source point."""
        hour = datetime.now().hour
        if stability is None:
            stability = self.classify_stability(wind_speed, hour)

        sc = STABILITY_CLASSES[stability]
        src_lat = source.get("lat", 28.65)
        src_lng = source.get("lng", 77.20)
        Q = source.get("emission_rate", 1000)
        H = source.get("stack_height", 30)

        wind_rad = math.radians(wind_direction)
        km_per_deg = 111.0

        grid = []
        for i in range(grid_size):
            for j in range(grid_size):
                dx_km = (i - grid_size / 2) * extent_km / grid_size
                dy_km = (j - grid_size / 2) * extent_km / grid_size

                downwind = dx_km * math.cos(wind_rad) + dy_km * math.sin(wind_rad)
                crosswind = -dx_km * math.sin(wind_rad) + dy_km * math.cos(wind_rad)

                conc = self.gaussian_plume(
                    max(1, downwind * 1000),
                    crosswind * 1000,
                    Q, H, max(0.5, wind_speed), stability
                )

                if conc > 0.1:
                    grid.append({
                        "lat": round(src_lat + dx_km / km_per_deg, 4),
                        "lng": round(src_lng + dy_km / km_per_deg, 4),
                        "concentration": round(conc, 2),
                        "downwind_km": round(downwind, 2),
                        "crosswind_km": round(crosswind, 2),
                    })

        return {
            "source": source,
            "wind_speed": wind_speed,
            "wind_direction": wind_direction,
            "stability_class": stability,
            "stability_label": sc["label"],
            "stability_conditions": sc["conditions"],
            "model": "gaussian_plume_pasquill_gifford",
            "grid_points": len(grid),
            "grid": sorted(grid, key=lambda g: g["concentration"], reverse=True),
            "max_concentration": max([g["concentration"] for g in grid]) if grid else 0,
            "dispersion_quality": "poor" if stability in ("E", "F") else "moderate" if stability == "D" else "good",
            "timestamp": datetime.now().isoformat(),
        }

    def predict_city_dispersion(self, city, readings, wind_speed, wind_direction):
        # type: (str, List[Dict], float, float) -> Dict[str, Any]
        """Run dispersion model for worst pollution sources in a city."""
        hour = datetime.now().hour
        stability = self.classify_stability(wind_speed, hour)

        worst = sorted(readings, key=lambda r: r.get("aqi", 0), reverse=True)[:3]

        source_dispersions = []
        for station in worst:
            source = {
                "lat": station.get("latitude", 28.65),
                "lng": station.get("longitude", 77.20),
                "name": station.get("station_name", ""),
                "aqi": station.get("aqi", 0),
                "emission_rate": station.get("aqi", 100) * 5,
                "stack_height": 15,
            }
            result = self.predict_dispersion(
                source, wind_speed, wind_direction, stability,
                grid_size=15, extent_km=8
            )
            source_dispersions.append(result)

        return {
            "city": city,
            "stability_class": stability,
            "stability_label": STABILITY_CLASSES[stability]["label"],
            "wind_speed": wind_speed,
            "wind_direction": wind_direction,
            "sources_modeled": len(source_dispersions),
            "dispersions": source_dispersions,
            "timestamp": datetime.now().isoformat(),
        }
