import httpx
import json
from datetime import datetime, timedelta
from pathlib import Path
from typing import Optional, List, Dict

CACHE_DIR = Path(__file__).parent.parent.parent.parent.parent / "data" / "cache"
CACHE_DIR.mkdir(parents=True, exist_ok=True)

CPCB_BASE_URL = "https://app.cpcbccr.com/ccr_docs/ccr_docs"
CPCB_API_URL = "https://app.cpcbccr.com/caaqms/caaqms_viewData_v2"

DELHI_STATIONS = [
    {"id": "site_1544", "name": "Anand Vihar, Delhi - DPCC", "lat": 28.6468, "lng": 77.3160},
    {"id": "site_1545", "name": "Ashok Vihar, Delhi - DPCC", "lat": 28.6953, "lng": 77.1818},
    {"id": "site_1546", "name": "Bawana, Delhi - DPCC", "lat": 28.7763, "lng": 77.0513},
    {"id": "site_1547", "name": "CRRI Mathura Road, Delhi - IMD", "lat": 28.5512, "lng": 77.2735},
    {"id": "site_1548", "name": "DTU, Delhi - CPCB", "lat": 28.7500, "lng": 77.1112},
    {"id": "site_1549", "name": "Dwarka Sector 8, Delhi - DPCC", "lat": 28.5700, "lng": 77.0700},
    {"id": "site_1550", "name": "IGI Airport T3, Delhi - IMD", "lat": 28.5627, "lng": 77.1180},
    {"id": "site_1551", "name": "ITO, Delhi - CPCB", "lat": 28.6285, "lng": 77.2413},
    {"id": "site_1552", "name": "Jahangirpuri, Delhi - DPCC", "lat": 28.7332, "lng": 77.1700},
    {"id": "site_1553", "name": "JLN Stadium, Delhi - DPCC", "lat": 28.5820, "lng": 77.2340},
    {"id": "site_1554", "name": "Lodhi Road, Delhi - IMD", "lat": 28.5918, "lng": 77.2273},
    {"id": "site_1555", "name": "Mandir Marg, Delhi - DPCC", "lat": 28.6363, "lng": 77.2009},
    {"id": "site_1556", "name": "Mundka, Delhi - DPCC", "lat": 28.6844, "lng": 77.0315},
    {"id": "site_1557", "name": "NSIT Dwarka, Delhi - CPCB", "lat": 28.6089, "lng": 77.0327},
    {"id": "site_1558", "name": "Najafgarh, Delhi - DPCC", "lat": 28.5703, "lng": 76.9329},
    {"id": "site_1559", "name": "Narela, Delhi - DPCC", "lat": 28.8225, "lng": 77.1025},
    {"id": "site_1560", "name": "Nehru Nagar, Delhi - DPCC", "lat": 28.5679, "lng": 77.2507},
    {"id": "site_1561", "name": "North Campus DU, Delhi - IMD", "lat": 28.6580, "lng": 77.2112},
    {"id": "site_1562", "name": "Okhla Phase 2, Delhi - DPCC", "lat": 28.5308, "lng": 77.2713},
    {"id": "site_1563", "name": "Patparganj, Delhi - DPCC", "lat": 28.6237, "lng": 77.2873},
    {"id": "site_1564", "name": "Punjabi Bagh, Delhi - DPCC", "lat": 28.6729, "lng": 77.1318},
    {"id": "site_1565", "name": "Pusa, Delhi - DPCC", "lat": 28.6398, "lng": 77.1461},
    {"id": "site_1566", "name": "RK Puram, Delhi - DPCC", "lat": 28.5633, "lng": 77.1866},
    {"id": "site_1567", "name": "Rohini, Delhi - DPCC", "lat": 28.7329, "lng": 77.1197},
    {"id": "site_1568", "name": "Shadipur, Delhi - CPCB", "lat": 28.6515, "lng": 77.1584},
    {"id": "site_1569", "name": "Siri Fort, Delhi - CPCB", "lat": 28.5504, "lng": 77.2159},
    {"id": "site_1570", "name": "Sonia Vihar, Delhi - DPCC", "lat": 28.7100, "lng": 77.2493},
    {"id": "site_1571", "name": "Sri Aurobindo Marg, Delhi - DPCC", "lat": 28.5315, "lng": 77.1901},
    {"id": "site_1572", "name": "Vivek Vihar, Delhi - DPCC", "lat": 28.6724, "lng": 77.3150},
    {"id": "site_1573", "name": "Wazirpur, Delhi - DPCC", "lat": 28.6997, "lng": 77.1640},
]

MUMBAI_STATIONS = [
    {"id": "site_5085", "name": "Bandra, Mumbai - MPCB", "lat": 19.0596, "lng": 72.8295},
    {"id": "site_5086", "name": "Borivali East, Mumbai - MPCB", "lat": 19.2321, "lng": 72.8567},
    {"id": "site_5087", "name": "Chembur, Mumbai - MPCB", "lat": 19.0522, "lng": 72.8994},
    {"id": "site_5088", "name": "Colaba, Mumbai - MPCB", "lat": 18.9067, "lng": 72.8147},
    {"id": "site_5089", "name": "Kurla, Mumbai - MPCB", "lat": 19.0726, "lng": 72.8794},
    {"id": "site_5090", "name": "Mazgaon, Mumbai - MPCB", "lat": 18.9679, "lng": 72.8454},
    {"id": "site_5091", "name": "Powai, Mumbai - MPCB", "lat": 19.1176, "lng": 72.9060},
    {"id": "site_5092", "name": "Sion, Mumbai - MPCB", "lat": 19.0400, "lng": 72.8628},
    {"id": "site_5093", "name": "Worli, Mumbai - MPCB", "lat": 19.0176, "lng": 72.8190},
]

CITY_STATIONS: Dict[str, List[Dict]] = {
    "Delhi": DELHI_STATIONS,
    "Mumbai": MUMBAI_STATIONS,
}


def _cache_key(city: str, date_str: str) -> Path:
    return CACHE_DIR / f"{city.lower()}_{date_str}.json"


def _read_cache(key: Path, max_age_minutes: int = 15) -> Optional[List]:
    if not key.exists():
        return None
    modified = datetime.fromtimestamp(key.stat().st_mtime)
    if datetime.now() - modified > timedelta(minutes=max_age_minutes):
        return None
    with open(key) as f:
        return json.load(f)


def _write_cache(key: Path, data: List):
    with open(key, "w") as f:
        json.dump(data, f)


class CPCBService:
    def __init__(self):
        self.client = httpx.AsyncClient(timeout=30.0)

    async def get_stations(self, city: str = "Delhi") -> List[Dict]:
        return CITY_STATIONS.get(city, DELHI_STATIONS)

    async def get_city_readings(self, city: str = "Delhi") -> List[Dict]:
        now = datetime.now()
        cache_key = _cache_key(city, now.strftime("%Y%m%d_%H"))
        cached = _read_cache(cache_key)
        if cached:
            return cached

        stations = CITY_STATIONS.get(city, DELHI_STATIONS)
        readings = []

        for station in stations:
            try:
                reading = await self._fetch_station_data(station)
                if reading:
                    readings.append(reading)
            except Exception:
                continue

        if readings:
            _write_cache(cache_key, readings)
        return readings

    async def _fetch_station_data(self, station: Dict) -> Optional[Dict]:
        headers = {
            "Content-Type": "application/x-www-form-urlencoded",
            "Accept": "application/json",
            "Origin": "https://app.cpcbccr.com",
            "Referer": "https://app.cpcbccr.com/ccr/",
        }

        now = datetime.now()
        payload = {
            "site_id": station["id"],
            "report_type": "tabular",
            "from_date": now.strftime("%d-%b-%Y"),
            "to_date": now.strftime("%d-%b-%Y"),
        }

        try:
            resp = await self.client.post(
                CPCB_API_URL, data=payload, headers=headers
            )
            if resp.status_code == 200:
                data = resp.json()
                return self._parse_response(station, data)
        except Exception:
            pass

        return self._generate_realistic_reading(station)

    def _parse_response(self, station: Dict, data: Dict) -> Optional[Dict]:
        try:
            table_data = data.get("tabularData", {}).get("bodyContent", [])
            if not table_data:
                return None

            latest = table_data[-1]
            return {
                "station_id": station["id"],
                "station_name": station["name"],
                "latitude": station["lat"],
                "longitude": station["lng"],
                "timestamp": latest.get("from_date", datetime.now().isoformat()),
                "pm25": self._safe_float(latest.get("PM2.5")),
                "pm10": self._safe_float(latest.get("PM10")),
                "no2": self._safe_float(latest.get("NO2")),
                "so2": self._safe_float(latest.get("SO2")),
                "co": self._safe_float(latest.get("CO")),
                "o3": self._safe_float(latest.get("Ozone")),
                "aqi": self._calculate_aqi(latest),
                "temperature": self._safe_float(latest.get("AT")),
                "humidity": self._safe_float(latest.get("RH")),
                "wind_speed": self._safe_float(latest.get("WS")),
                "wind_direction": self._safe_float(latest.get("WD")),
            }
        except Exception:
            return None

    def _generate_realistic_reading(self, station: Dict) -> Dict:
        """Generate realistic AQI data based on Delhi's actual patterns.
        Used as fallback when CPCB API is unavailable."""
        import random
        from datetime import datetime

        hour = datetime.now().hour
        # Delhi AQI patterns: worse at night/early morning, better midday
        base_pm25 = 85 + random.gauss(0, 20)
        if hour < 6 or hour > 20:
            base_pm25 *= 1.4
        elif 10 <= hour <= 16:
            base_pm25 *= 0.7

        # Spatial variation based on known hotspots
        if "Anand Vihar" in station["name"] or "Wazirpur" in station["name"]:
            base_pm25 *= 1.5
        elif "Lodhi" in station["name"] or "Siri Fort" in station["name"]:
            base_pm25 *= 0.7

        pm25 = max(10, base_pm25 + random.gauss(0, 15))
        pm10 = pm25 * random.uniform(1.5, 2.2)

        return {
            "station_id": station["id"],
            "station_name": station["name"],
            "latitude": station["lat"],
            "longitude": station["lng"],
            "timestamp": datetime.now().isoformat(),
            "pm25": round(pm25, 1),
            "pm10": round(pm10, 1),
            "no2": round(random.uniform(20, 80), 1),
            "so2": round(random.uniform(5, 30), 1),
            "co": round(random.uniform(0.5, 3.0), 2),
            "o3": round(random.uniform(15, 60), 1),
            "aqi": self._pm25_to_aqi(pm25),
            "temperature": round(random.uniform(28, 42), 1),
            "humidity": round(random.uniform(30, 70), 1),
            "wind_speed": round(random.uniform(0.5, 8.0), 1),
            "wind_direction": round(random.uniform(0, 360), 0),
            "_synthetic": True,
        }

    def _pm25_to_aqi(self, pm25: float) -> int:
        breakpoints = [
            (0, 12, 0, 50),
            (12.1, 35.4, 51, 100),
            (35.5, 55.4, 101, 150),
            (55.5, 150.4, 151, 200),
            (150.5, 250.4, 201, 300),
            (250.5, 350.4, 301, 400),
            (350.5, 500.4, 401, 500),
        ]
        for bp_lo, bp_hi, aqi_lo, aqi_hi in breakpoints:
            if bp_lo <= pm25 <= bp_hi:
                return round(
                    ((aqi_hi - aqi_lo) / (bp_hi - bp_lo)) * (pm25 - bp_lo) + aqi_lo
                )
        return 500

    def _calculate_aqi(self, row: dict) -> int:
        pm25 = self._safe_float(row.get("PM2.5"))
        if pm25 is not None:
            return self._pm25_to_aqi(pm25)
        return 0

    def _safe_float(self, val) -> Optional[float]:
        if val is None or val == "" or val == "NA" or val == "None":
            return None
        try:
            return float(val)
        except (ValueError, TypeError):
            return None

    async def get_station_reading(self, station_id: str) -> Optional[Dict]:
        for city_stations in CITY_STATIONS.values():
            for s in city_stations:
                if s["id"] == station_id:
                    return await self._fetch_station_data(s)
        return None

    async def get_historical(self, city: str, hours: int = 24) -> List[Dict]:
        # For hackathon: return cached data or generate time series
        readings = []
        stations = CITY_STATIONS.get(city, DELHI_STATIONS)
        now = datetime.now()

        for h in range(hours, 0, -1):
            ts = now - timedelta(hours=h)
            for station in stations[:5]:  # Limit for performance
                reading = self._generate_realistic_reading(station)
                reading["timestamp"] = ts.isoformat()
                readings.append(reading)

        return readings

    async def close(self):
        await self.client.aclose()
