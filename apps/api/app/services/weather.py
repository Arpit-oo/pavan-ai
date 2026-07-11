import httpx
import json
from datetime import datetime, timedelta
from pathlib import Path
from typing import Optional, List, Dict, Any

from app.config import get_settings

CACHE_DIR = Path(__file__).parent.parent.parent.parent.parent / "data" / "cache"
CACHE_DIR.mkdir(parents=True, exist_ok=True)

CITY_COORDS = {
    "Delhi": {"lat": 28.6139, "lon": 77.2090},
    "Mumbai": {"lat": 19.0760, "lon": 72.8777},
    "Bangalore": {"lat": 12.9716, "lon": 77.5946},
    "Kolkata": {"lat": 22.5726, "lon": 88.3639},
    "Chennai": {"lat": 13.0827, "lon": 80.2707},
}


class WeatherService:
    BASE_URL = "https://api.openweathermap.org/data/2.5"

    def __init__(self):
        self.client = httpx.AsyncClient(timeout=15.0)
        self.api_key = get_settings().openweathermap_api_key

    async def get_current(self, city: str = "Delhi") -> Dict[str, Any]:
        """Current weather for city."""
        coords = CITY_COORDS.get(city, CITY_COORDS["Delhi"])
        cache_key = CACHE_DIR / "weather_{}_current_{}.json".format(
            city.lower(), datetime.now().strftime("%Y%m%d_%H")
        )

        cached = self._read_cache(cache_key, max_age_minutes=30)
        if cached:
            return cached

        if not self.api_key:
            return self._mock_weather(city)

        try:
            resp = await self.client.get(
                "{}/weather".format(self.BASE_URL),
                params={
                    "lat": coords["lat"],
                    "lon": coords["lon"],
                    "appid": self.api_key,
                    "units": "metric",
                },
            )
            if resp.status_code == 200:
                data = resp.json()
                result = self._parse_current(data, city)
                self._write_cache(cache_key, result)
                return result
        except Exception:
            pass

        return self._mock_weather(city)

    async def get_forecast(self, city: str = "Delhi", hours: int = 72) -> List[Dict]:
        """3-hour interval forecast up to 5 days."""
        coords = CITY_COORDS.get(city, CITY_COORDS["Delhi"])
        cache_key = CACHE_DIR / "weather_{}_forecast_{}.json".format(
            city.lower(), datetime.now().strftime("%Y%m%d_%H")
        )

        cached = self._read_cache(cache_key, max_age_minutes=60)
        if cached:
            return cached

        if not self.api_key:
            return self._mock_forecast(city, hours)

        try:
            resp = await self.client.get(
                "{}/forecast".format(self.BASE_URL),
                params={
                    "lat": coords["lat"],
                    "lon": coords["lon"],
                    "appid": self.api_key,
                    "units": "metric",
                },
            )
            if resp.status_code == 200:
                data = resp.json()
                forecasts = self._parse_forecast(data, city, hours)
                self._write_cache(cache_key, forecasts)
                return forecasts
        except Exception:
            pass

        return self._mock_forecast(city, hours)

    async def get_wind_analysis(self, city: str = "Delhi") -> Dict[str, Any]:
        """Wind pattern analysis for source attribution."""
        current = await self.get_current(city)
        forecast = await self.get_forecast(city, hours=24)

        wind_speed = current.get("wind_speed", 0)
        wind_dir = current.get("wind_direction", 0)

        stagnation = wind_speed < 2.0
        inversion_risk = (
            current.get("humidity", 0) > 70
            and wind_speed < 3.0
            and (datetime.now().hour < 8 or datetime.now().hour > 20)
        )

        wind_directions = [f.get("wind_direction", 0) for f in forecast[:8]]
        avg_wind_dir = sum(wind_directions) / max(len(wind_directions), 1)

        return {
            "current_wind_speed": wind_speed,
            "current_wind_direction": wind_dir,
            "wind_direction_label": self._deg_to_compass(wind_dir),
            "stagnation_detected": stagnation,
            "inversion_risk": inversion_risk,
            "avg_forecast_wind_dir": round(avg_wind_dir, 1),
            "pollution_dispersion": "poor" if stagnation else "moderate" if wind_speed < 5 else "good",
            "upwind_direction": (wind_dir + 180) % 360,
            "upwind_label": self._deg_to_compass((wind_dir + 180) % 360),
        }

    def _parse_current(self, data: Dict, city: str) -> Dict[str, Any]:
        wind = data.get("wind", {})
        main = data.get("main", {})
        return {
            "city": city,
            "timestamp": datetime.now().isoformat(),
            "temperature": main.get("temp"),
            "feels_like": main.get("feels_like"),
            "humidity": main.get("humidity"),
            "pressure": main.get("pressure"),
            "wind_speed": wind.get("speed"),
            "wind_direction": wind.get("deg"),
            "wind_gust": wind.get("gust"),
            "clouds": data.get("clouds", {}).get("all"),
            "visibility": data.get("visibility"),
            "description": data.get("weather", [{}])[0].get("description", ""),
        }

    def _parse_forecast(self, data: Dict, city: str, hours: int) -> List[Dict]:
        forecasts = []
        items = data.get("list", [])
        max_items = hours // 3

        for item in items[:max_items]:
            wind = item.get("wind", {})
            main = item.get("main", {})
            forecasts.append({
                "city": city,
                "timestamp": item.get("dt_txt", ""),
                "temperature": main.get("temp"),
                "humidity": main.get("humidity"),
                "wind_speed": wind.get("speed"),
                "wind_direction": wind.get("deg"),
                "wind_gust": wind.get("gust"),
                "clouds": item.get("clouds", {}).get("all"),
                "rain_3h": item.get("rain", {}).get("3h", 0),
                "description": item.get("weather", [{}])[0].get("description", ""),
            })

        return forecasts

    def _mock_weather(self, city: str) -> Dict[str, Any]:
        import random
        hour = datetime.now().hour
        base_temp = 35 if city == "Delhi" else 30
        temp_var = -5 if hour < 6 or hour > 20 else 3

        return {
            "city": city,
            "timestamp": datetime.now().isoformat(),
            "temperature": round(base_temp + temp_var + random.gauss(0, 2), 1),
            "feels_like": round(base_temp + temp_var + 3 + random.gauss(0, 2), 1),
            "humidity": round(random.uniform(35, 75), 0),
            "pressure": round(random.uniform(1005, 1015), 0),
            "wind_speed": round(random.uniform(0.5, 8), 1),
            "wind_direction": round(random.uniform(0, 360), 0),
            "wind_gust": round(random.uniform(2, 12), 1),
            "clouds": round(random.uniform(10, 80), 0),
            "visibility": round(random.uniform(2000, 10000), 0),
            "description": "haze" if hour < 8 else "partly cloudy",
            "_synthetic": True,
        }

    def _mock_forecast(self, city: str, hours: int) -> List[Dict]:
        import random
        forecasts = []
        now = datetime.now()

        for i in range(0, hours, 3):
            ts = now + timedelta(hours=i)
            hour = ts.hour
            base_temp = 35 if city == "Delhi" else 30
            temp_var = -5 if hour < 6 or hour > 20 else 3

            forecasts.append({
                "city": city,
                "timestamp": ts.strftime("%Y-%m-%d %H:%M:%S"),
                "temperature": round(base_temp + temp_var + random.gauss(0, 2), 1),
                "humidity": round(random.uniform(35, 75), 0),
                "wind_speed": round(random.uniform(0.5, 8), 1),
                "wind_direction": round(random.uniform(0, 360), 0),
                "wind_gust": round(random.uniform(2, 12), 1),
                "clouds": round(random.uniform(10, 80), 0),
                "rain_3h": 0,
                "description": "haze" if hour < 8 else "partly cloudy",
                "_synthetic": True,
            })

        return forecasts

    def _deg_to_compass(self, deg: float) -> str:
        dirs = ["N", "NNE", "NE", "ENE", "E", "ESE", "SE", "SSE",
                "S", "SSW", "SW", "WSW", "W", "WNW", "NW", "NNW"]
        idx = int((deg + 11.25) / 22.5) % 16
        return dirs[idx]

    def _read_cache(self, key: Path, max_age_minutes: int = 30):
        if not key.exists():
            return None
        modified = datetime.fromtimestamp(key.stat().st_mtime)
        if datetime.now() - modified > timedelta(minutes=max_age_minutes):
            return None
        with open(key) as f:
            return json.load(f)

    def _write_cache(self, key: Path, data):
        with open(key, "w") as f:
            json.dump(data, f)

    async def close(self):
        await self.client.aclose()
