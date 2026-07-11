import numpy as np
from typing import Optional, List, Dict


class InterpolationService:
    """Inverse Distance Weighting interpolation for AQI heatmap generation."""

    def __init__(self, power: float = 2.0, grid_resolution: int = 50):
        self.power = power
        self.grid_resolution = grid_resolution

    async def get_interpolated_grid(self, city: str = "Delhi") -> dict:
        from app.services.cpcb import CPCBService

        svc = CPCBService()
        readings = await svc.get_city_readings(city)

        if not readings:
            return {"points": [], "bounds": {}}

        lats = [r["latitude"] for r in readings]
        lngs = [r["longitude"] for r in readings]
        values = [r.get("aqi", 0) or 0 for r in readings]

        bounds = {
            "min_lat": min(lats) - 0.02,
            "max_lat": max(lats) + 0.02,
            "min_lng": min(lngs) - 0.02,
            "max_lng": max(lngs) + 0.02,
        }

        grid_points = self._idw_interpolate(
            np.array(lats),
            np.array(lngs),
            np.array(values),
            bounds,
        )

        return {
            "points": grid_points,
            "bounds": bounds,
            "stations": [
                {
                    "lat": r["latitude"],
                    "lng": r["longitude"],
                    "aqi": r.get("aqi", 0),
                    "name": r["station_name"],
                    "pm25": r.get("pm25"),
                }
                for r in readings
            ],
            "resolution": self.grid_resolution,
        }

    def _idw_interpolate(
        self,
        lats: np.ndarray,
        lngs: np.ndarray,
        values: np.ndarray,
        bounds: dict,
    ) -> list[dict]:
        grid_lat = np.linspace(
            bounds["min_lat"], bounds["max_lat"], self.grid_resolution
        )
        grid_lng = np.linspace(
            bounds["min_lng"], bounds["max_lng"], self.grid_resolution
        )

        points = []
        for lat in grid_lat:
            for lng in grid_lng:
                distances = np.sqrt((lats - lat) ** 2 + (lngs - lng) ** 2)
                min_dist_idx = np.argmin(distances)

                if distances[min_dist_idx] < 1e-10:
                    interpolated = values[min_dist_idx]
                else:
                    weights = 1.0 / (distances**self.power)
                    interpolated = float(np.sum(weights * values) / np.sum(weights))

                points.append(
                    {
                        "lat": round(float(lat), 5),
                        "lng": round(float(lng), 5),
                        "aqi": round(interpolated, 1),
                        "color": self._aqi_to_color(interpolated),
                    }
                )

        return points

    def _aqi_to_color(self, aqi: float) -> List[int]:
        if aqi <= 50:
            return [0, 228, 0, 160]       # Good — green
        elif aqi <= 100:
            return [255, 255, 0, 160]      # Satisfactory — yellow
        elif aqi <= 200:
            return [255, 126, 0, 180]      # Moderate — orange
        elif aqi <= 300:
            return [255, 0, 0, 200]        # Poor — red
        elif aqi <= 400:
            return [143, 63, 151, 220]     # Very Poor — purple
        else:
            return [126, 0, 35, 240]       # Severe — maroon
