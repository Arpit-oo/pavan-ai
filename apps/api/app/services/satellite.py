"""Sentinel-5P satellite data service.
Uses Copernicus Atmosphere Monitoring Service (CAMS) for NO2/SO2 column density.
For hackathon: generates realistic satellite-derived data based on known
pollution hotspot patterns. Production: integrate Copernicus API directly."""

import random
from typing import Dict, List, Any
from datetime import datetime

# Known NO2 hotspot regions from Sentinel-5P observations over India
# Values in 10^15 molecules/cm2 (tropospheric column density)
SATELLITE_HOTSPOTS = [
    {"region": "Delhi NCR", "center": [28.65, 77.20], "radius_deg": 0.5, "no2_base": 12.5, "so2_base": 3.2},
    {"region": "Mumbai-Pune corridor", "center": [19.00, 73.00], "radius_deg": 0.4, "no2_base": 8.3, "so2_base": 2.1},
    {"region": "Kolkata industrial belt", "center": [22.55, 88.35], "radius_deg": 0.3, "no2_base": 7.8, "so2_base": 2.8},
    {"region": "Chennai-Manali", "center": [13.10, 80.26], "radius_deg": 0.2, "no2_base": 6.5, "so2_base": 3.5},
    {"region": "Jharsuguda-Korba coal belt", "center": [21.85, 83.50], "radius_deg": 0.6, "no2_base": 5.2, "so2_base": 8.5},
    {"region": "Singrauli thermal cluster", "center": [24.10, 82.60], "radius_deg": 0.3, "no2_base": 4.8, "so2_base": 7.2},
    {"region": "Ahmedabad-Vadodara", "center": [22.30, 72.80], "radius_deg": 0.3, "no2_base": 6.1, "so2_base": 2.4},
    {"region": "Lucknow-Kanpur", "center": [26.60, 80.60], "radius_deg": 0.4, "no2_base": 7.2, "so2_base": 2.0},
    {"region": "Hyderabad", "center": [17.40, 78.45], "radius_deg": 0.2, "no2_base": 5.8, "so2_base": 1.8},
    {"region": "Bangalore", "center": [12.97, 77.59], "radius_deg": 0.2, "no2_base": 4.2, "so2_base": 1.2},
    {"region": "Vizag industrial", "center": [17.70, 83.30], "radius_deg": 0.2, "no2_base": 5.5, "so2_base": 4.2},
    {"region": "Jamshedpur steel belt", "center": [22.80, 86.20], "radius_deg": 0.3, "no2_base": 6.0, "so2_base": 5.5},
]


class SatelliteService:
    def get_no2_grid(self, bounds=None):
        # type: (Dict) -> Dict[str, Any]
        """Generate NO2 column density grid for India from Sentinel-5P patterns."""
        if bounds is None:
            bounds = {"min_lat": 8, "max_lat": 35, "min_lng": 68, "max_lng": 97}

        random.seed(int(datetime.now().hour))
        grid_res = 40
        points = []

        lat_step = (bounds["max_lat"] - bounds["min_lat"]) / grid_res
        lng_step = (bounds["max_lng"] - bounds["min_lng"]) / grid_res

        for i in range(grid_res):
            for j in range(grid_res):
                lat = bounds["min_lat"] + i * lat_step
                lng = bounds["min_lng"] + j * lng_step

                no2 = 1.5 + random.gauss(0, 0.3)
                so2 = 0.5 + random.gauss(0, 0.1)

                for hotspot in SATELLITE_HOTSPOTS:
                    clat, clng = hotspot["center"]
                    dist = ((lat - clat) ** 2 + (lng - clng) ** 2) ** 0.5
                    r = hotspot["radius_deg"]
                    if dist < r * 2:
                        weight = max(0, 1 - dist / (r * 2))
                        no2 += hotspot["no2_base"] * weight * (0.8 + random.random() * 0.4)
                        so2 += hotspot["so2_base"] * weight * (0.8 + random.random() * 0.4)

                points.append({
                    "lat": round(lat, 2),
                    "lng": round(lng, 2),
                    "no2": round(max(0.5, no2), 2),
                    "so2": round(max(0.2, so2), 2),
                })

        return {
            "source": "sentinel-5p-tropomi",
            "parameter": "tropospheric_no2_column_density",
            "unit": "10^15 molecules/cm2",
            "timestamp": datetime.now().isoformat(),
            "resolution": "7km x 3.5km (native), gridded to ~25km",
            "grid": points,
            "hotspots": SATELLITE_HOTSPOTS,
            "bounds": bounds,
        }

    def get_thermal_anomalies(self):
        # type: () -> Dict[str, Any]
        """MODIS/VIIRS active fire detection — crop burning and industrial thermal."""
        random.seed(int(datetime.now().strftime("%Y%m%d")))

        fires = []
        fire_regions = [
            {"name": "Punjab stubble", "center": [30.5, 75.5], "spread": 1.0, "count": 8},
            {"name": "Haryana stubble", "center": [29.5, 76.5], "spread": 0.8, "count": 5},
            {"name": "UP east burning", "center": [26.5, 83.0], "spread": 0.6, "count": 3},
            {"name": "Jharkhand industrial", "center": [23.5, 85.5], "spread": 0.4, "count": 2},
            {"name": "Odisha industrial", "center": [21.0, 84.0], "spread": 0.3, "count": 2},
        ]

        for region in fire_regions:
            for _ in range(region["count"]):
                fires.append({
                    "lat": round(region["center"][0] + random.gauss(0, region["spread"] * 0.3), 3),
                    "lng": round(region["center"][1] + random.gauss(0, region["spread"] * 0.3), 3),
                    "confidence": round(random.uniform(60, 99), 0),
                    "frp": round(random.uniform(5, 50), 1),
                    "type": "crop_burning" if "stubble" in region["name"] else "industrial",
                    "region": region["name"],
                })

        return {
            "source": "nasa-firms-modis-viirs",
            "timestamp": datetime.now().isoformat(),
            "fire_count": len(fires),
            "fires": fires,
        }
