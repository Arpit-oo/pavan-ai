"""Delhi ward/zone boundary data and services.
Using MCD zone boundaries (12 zones) as primary unit for demo.
Full 272-ward data can be loaded from GeoJSON file when available."""

from typing import Dict, List, Any

# Delhi MCD Zones — simplified boundaries as center + radius for interpolation
DELHI_ZONES = [
    {
        "id": "zone_central",
        "name": "Central Delhi",
        "center": [28.6353, 77.2250],
        "bounds": [[28.61, 77.19], [28.66, 77.26]],
        "population": 582320,
        "area_sq_km": 25.2,
        "land_use": {"residential": 0.30, "commercial": 0.35, "industrial": 0.05, "green": 0.15, "transport": 0.15},
        "vulnerable_sites": [
            {"type": "hospital", "name": "RML Hospital", "lat": 28.6270, "lng": 77.2050},
            {"type": "school", "name": "Modern School", "lat": 28.5910, "lng": 77.2270},
        ],
    },
    {
        "id": "zone_north",
        "name": "North Delhi",
        "center": [28.7200, 77.1900],
        "bounds": [[28.69, 77.14], [28.76, 77.24]],
        "population": 887978,
        "area_sq_km": 60.1,
        "land_use": {"residential": 0.40, "commercial": 0.15, "industrial": 0.20, "green": 0.10, "transport": 0.15},
        "vulnerable_sites": [
            {"type": "hospital", "name": "Hindu Rao Hospital", "lat": 28.6855, "lng": 77.2105},
        ],
    },
    {
        "id": "zone_south",
        "name": "South Delhi",
        "center": [28.5300, 77.2200],
        "bounds": [[28.49, 77.17], [28.58, 77.28]],
        "population": 1063240,
        "area_sq_km": 81.3,
        "land_use": {"residential": 0.45, "commercial": 0.25, "industrial": 0.05, "green": 0.15, "transport": 0.10},
        "vulnerable_sites": [
            {"type": "hospital", "name": "AIIMS", "lat": 28.5672, "lng": 77.2100},
            {"type": "school", "name": "Sanskriti School", "lat": 28.5485, "lng": 77.1790},
        ],
    },
    {
        "id": "zone_east",
        "name": "East Delhi",
        "center": [28.6300, 77.2900],
        "bounds": [[28.59, 77.26], [28.68, 77.33]],
        "population": 1709346,
        "area_sq_km": 49.9,
        "land_use": {"residential": 0.45, "commercial": 0.10, "industrial": 0.20, "green": 0.05, "transport": 0.20},
        "vulnerable_sites": [
            {"type": "hospital", "name": "GTB Hospital", "lat": 28.6848, "lng": 77.3100},
        ],
    },
    {
        "id": "zone_west",
        "name": "West Delhi",
        "center": [28.6500, 77.0800],
        "bounds": [[28.61, 77.03], [28.70, 77.14]],
        "population": 2543243,
        "area_sq_km": 129.0,
        "land_use": {"residential": 0.35, "commercial": 0.10, "industrial": 0.30, "green": 0.05, "transport": 0.20},
        "vulnerable_sites": [],
    },
    {
        "id": "zone_northeast",
        "name": "North East Delhi",
        "center": [28.6900, 77.2700],
        "bounds": [[28.66, 77.24], [28.72, 77.30]],
        "population": 2241624,
        "area_sq_km": 60.0,
        "land_use": {"residential": 0.50, "commercial": 0.15, "industrial": 0.15, "green": 0.05, "transport": 0.15},
        "vulnerable_sites": [],
    },
    {
        "id": "zone_northwest",
        "name": "North West Delhi",
        "center": [28.7400, 77.0600],
        "bounds": [[28.70, 77.01], [28.79, 77.12]],
        "population": 3656539,
        "area_sq_km": 440.0,
        "land_use": {"residential": 0.35, "commercial": 0.10, "industrial": 0.25, "green": 0.15, "transport": 0.15},
        "vulnerable_sites": [],
    },
    {
        "id": "zone_southeast",
        "name": "South East Delhi",
        "center": [28.5600, 77.2700],
        "bounds": [[28.52, 77.24], [28.60, 77.31]],
        "population": 1575280,
        "area_sq_km": 45.0,
        "land_use": {"residential": 0.40, "commercial": 0.20, "industrial": 0.10, "green": 0.15, "transport": 0.15},
        "vulnerable_sites": [
            {"type": "hospital", "name": "Holy Family Hospital", "lat": 28.5640, "lng": 77.2800},
        ],
    },
    {
        "id": "zone_southwest",
        "name": "South West Delhi",
        "center": [28.5800, 77.0700],
        "bounds": [[28.53, 77.01], [28.63, 77.13]],
        "population": 2292958,
        "area_sq_km": 420.0,
        "land_use": {"residential": 0.30, "commercial": 0.10, "industrial": 0.10, "green": 0.35, "transport": 0.15},
        "vulnerable_sites": [],
    },
    {
        "id": "zone_newdelhi",
        "name": "New Delhi (NDMC)",
        "center": [28.6100, 77.2100],
        "bounds": [[28.59, 77.19], [28.64, 77.24]],
        "population": 257803,
        "area_sq_km": 35.0,
        "land_use": {"residential": 0.15, "commercial": 0.20, "industrial": 0.02, "green": 0.40, "transport": 0.23},
        "vulnerable_sites": [
            {"type": "hospital", "name": "Safdarjung Hospital", "lat": 28.5694, "lng": 77.2072},
        ],
    },
    {
        "id": "zone_shahdara_n",
        "name": "Shahdara North",
        "center": [28.6900, 77.3000],
        "bounds": [[28.66, 77.28], [28.73, 77.33]],
        "population": 1345402,
        "area_sq_km": 30.0,
        "land_use": {"residential": 0.45, "commercial": 0.15, "industrial": 0.20, "green": 0.05, "transport": 0.15},
        "vulnerable_sites": [],
    },
    {
        "id": "zone_shahdara_s",
        "name": "Shahdara South",
        "center": [28.6500, 77.3100],
        "bounds": [[28.62, 77.28], [28.68, 77.34]],
        "population": 1189808,
        "area_sq_km": 25.0,
        "land_use": {"residential": 0.45, "commercial": 0.15, "industrial": 0.20, "green": 0.05, "transport": 0.15},
        "vulnerable_sites": [],
    },
]


class WardService:
    def get_zones(self, city="Delhi"):
        # type: (str) -> List[Dict[str, Any]]
        if city != "Delhi":
            return []
        return DELHI_ZONES

    def get_zone(self, zone_id):
        # type: (str) -> Dict[str, Any]
        for z in DELHI_ZONES:
            if z["id"] == zone_id:
                return z
        return {}

    def get_zone_for_station(self, lat, lng):
        # type: (float, float) -> Dict[str, Any]
        """Find which zone a station belongs to."""
        best = None
        best_dist = float("inf")
        for zone in DELHI_ZONES:
            clat, clng = zone["center"]
            dist = ((lat - clat) ** 2 + (lng - clng) ** 2) ** 0.5
            if dist < best_dist:
                best_dist = dist
                best = zone
        return best or {}

    def to_geojson(self, city="Delhi"):
        # type: (str) -> Dict[str, Any]
        """Convert zones to GeoJSON for map rendering."""
        features = []
        for zone in self.get_zones(city):
            b = zone["bounds"]
            features.append({
                "type": "Feature",
                "properties": {
                    "id": zone["id"],
                    "name": zone["name"],
                    "population": zone["population"],
                    "area_sq_km": zone["area_sq_km"],
                },
                "geometry": {
                    "type": "Polygon",
                    "coordinates": [[
                        [b[0][1], b[0][0]],
                        [b[1][1], b[0][0]],
                        [b[1][1], b[1][0]],
                        [b[0][1], b[1][0]],
                        [b[0][1], b[0][0]],
                    ]],
                },
            })
        return {"type": "FeatureCollection", "features": features}
