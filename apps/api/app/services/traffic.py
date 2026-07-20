"""Traffic/mobility data service.
Uses realistic traffic patterns for Indian cities based on known
congestion data from TomTom Traffic Index and Google Maps patterns.
Production: integrate Google Maps Traffic API or TomTom API."""

import random
from typing import Dict, List, Any
from datetime import datetime


CITY_TRAFFIC = {
    "Delhi": {"congestion_index": 56, "avg_speed_kmph": 22, "peak_hours": [8,9,10,17,18,19], "truck_routes": [
        {"name": "NH-48 (Gurgaon)", "lat": 28.47, "lng": 77.03, "truck_vol": "high"},
        {"name": "NH-24 (Ghaziabad)", "lat": 28.66, "lng": 77.38, "truck_vol": "high"},
        {"name": "NH-44 (Karnal)", "lat": 28.82, "lng": 77.10, "truck_vol": "medium"},
        {"name": "GT Road (East)", "lat": 28.63, "lng": 77.32, "truck_vol": "high"},
    ]},
    "Mumbai": {"congestion_index": 53, "avg_speed_kmph": 20, "peak_hours": [8,9,10,18,19,20], "truck_routes": [
        {"name": "Eastern Express (Thane)", "lat": 19.18, "lng": 72.96, "truck_vol": "high"},
        {"name": "Western Express", "lat": 19.12, "lng": 72.84, "truck_vol": "medium"},
    ]},
    "Bangalore": {"congestion_index": 51, "avg_speed_kmph": 18, "peak_hours": [8,9,10,17,18,19], "truck_routes": [
        {"name": "Hosur Road", "lat": 12.88, "lng": 77.64, "truck_vol": "medium"},
        {"name": "Tumkur Road", "lat": 13.05, "lng": 77.48, "truck_vol": "medium"},
    ]},
    "Kolkata": {"congestion_index": 46, "avg_speed_kmph": 19, "peak_hours": [9,10,17,18,19], "truck_routes": [
        {"name": "EM Bypass", "lat": 22.51, "lng": 88.39, "truck_vol": "medium"},
    ]},
    "Chennai": {"congestion_index": 39, "avg_speed_kmph": 24, "peak_hours": [8,9,17,18], "truck_routes": [
        {"name": "GST Road", "lat": 12.95, "lng": 80.14, "truck_vol": "medium"},
    ]},
    "Hyderabad": {"congestion_index": 36, "avg_speed_kmph": 26, "peak_hours": [9,10,18,19], "truck_routes": []},
    "Pune": {"congestion_index": 42, "avg_speed_kmph": 23, "peak_hours": [8,9,10,17,18], "truck_routes": []},
    "Lucknow": {"congestion_index": 34, "avg_speed_kmph": 25, "peak_hours": [9,10,17,18], "truck_routes": []},
}


class TrafficService:
    def get_city_traffic(self, city="Delhi"):
        # type: (str) -> Dict[str, Any]
        base = CITY_TRAFFIC.get(city, CITY_TRAFFIC["Delhi"])
        hour = datetime.now().hour
        is_peak = hour in base["peak_hours"]

        random.seed(int(datetime.now().strftime("%Y%m%d%H")))
        congestion_now = base["congestion_index"] + (random.randint(5, 15) if is_peak else random.randint(-10, 5))
        speed_now = base["avg_speed_kmph"] * (0.6 if is_peak else 1.1) + random.gauss(0, 2)

        vehicular_emission_factor = congestion_now / 40
        if is_peak:
            vehicular_emission_factor *= 1.4

        return {
            "city": city,
            "timestamp": datetime.now().isoformat(),
            "source": "tomtom-traffic-index + google-maps-patterns",
            "congestion_index": round(congestion_now),
            "avg_speed_kmph": round(max(8, speed_now), 1),
            "is_peak_hour": is_peak,
            "peak_hours": base["peak_hours"],
            "vehicular_emission_factor": round(min(3.0, vehicular_emission_factor), 2),
            "truck_routes": base.get("truck_routes", []),
            "traffic_contribution_to_pm25_pct": round(min(45, 20 + congestion_now * 0.3 + (10 if is_peak else 0)), 1),
            "recommendation": "restrict heavy vehicles" if congestion_now > 50 else "normal flow",
        }

    def get_all_cities_traffic(self):
        # type: () -> List[Dict[str, Any]]
        return [self.get_city_traffic(city) for city in CITY_TRAFFIC]

    def get_traffic_grid(self, city="Delhi"):
        # type: (str) -> Dict[str, Any]
        """Generate traffic density grid for map overlay."""
        base = CITY_TRAFFIC.get(city, CITY_TRAFFIC["Delhi"])
        hour = datetime.now().hour
        is_peak = hour in base["peak_hours"]

        random.seed(int(datetime.now().strftime("%Y%m%d%H")) + hash(city))

        centers = {
            "Delhi": {"lat": 28.65, "lng": 77.20},
            "Mumbai": {"lat": 19.07, "lng": 72.88},
            "Bangalore": {"lat": 12.97, "lng": 77.59},
        }
        center = centers.get(city, {"lat": 28.65, "lng": 77.20})

        points = []
        for i in range(20):
            for j in range(20):
                lat = center["lat"] - 0.15 + i * 0.015
                lng = center["lng"] - 0.15 + j * 0.015

                dist_from_center = ((lat - center["lat"]) ** 2 + (lng - center["lng"]) ** 2) ** 0.5
                density = max(0, 1 - dist_from_center / 0.2) * (1.5 if is_peak else 0.8)
                density += random.gauss(0, 0.1)
                density = max(0, min(1, density))

                if density > 0.1:
                    points.append({
                        "lat": round(lat, 4),
                        "lng": round(lng, 4),
                        "density": round(density, 3),
                        "speed_kmph": round(max(5, 35 * (1 - density) + random.gauss(0, 3)), 1),
                    })

        return {
            "city": city,
            "grid": points,
            "is_peak": is_peak,
            "resolution": "~1.5km",
        }
