"""Intervention simulator — counterfactual AQI modeling.
Given a proposed intervention (truck ban, construction halt, industrial shutdown),
estimates AQI impact across affected zones."""

from typing import Dict, List, Any
from datetime import datetime

# Empirical impact factors (from Delhi pollution studies)
INTERVENTION_IMPACTS = {
    "truck_ban": {
        "description": "Ban heavy trucks from city limits during specified hours",
        "pm25_reduction_pct": 12,
        "pm10_reduction_pct": 18,
        "primary_source": "vehicular",
        "affected_radius_km": 15,
        "implementation_time": "4-6 hours",
        "precedent": "Delhi already implements truck bans; NGT orders in 2023 showed 10-15% PM reduction",
    },
    "construction_halt": {
        "description": "Halt construction activity and mandate dust suppression",
        "pm25_reduction_pct": 5,
        "pm10_reduction_pct": 25,
        "primary_source": "construction",
        "affected_radius_km": 5,
        "implementation_time": "2-4 hours",
        "precedent": "GRAP Stage III/IV includes construction bans; 2024 Delhi data showed 20-30% PM10 drop",
    },
    "industrial_shutdown": {
        "description": "Temporary shutdown of non-essential industrial units",
        "pm25_reduction_pct": 15,
        "pm10_reduction_pct": 10,
        "primary_source": "industrial",
        "affected_radius_km": 10,
        "implementation_time": "12-24 hours",
        "precedent": "GRAP Stage IV measure; partial shutdowns in 2023 winter showed measurable improvement",
    },
    "odd_even": {
        "description": "Odd-even vehicle rationing scheme",
        "pm25_reduction_pct": 8,
        "pm10_reduction_pct": 6,
        "primary_source": "vehicular",
        "affected_radius_km": 20,
        "implementation_time": "24-48 hours",
        "precedent": "Delhi odd-even 2016/2019 — contested 3-13% reduction depending on study",
    },
    "burning_ban": {
        "description": "Strict enforcement against open burning (waste, crop residue)",
        "pm25_reduction_pct": 20,
        "pm10_reduction_pct": 15,
        "primary_source": "burning",
        "affected_radius_km": 8,
        "implementation_time": "immediate",
        "precedent": "Stubble burning contributes 25-40% of Delhi winter PM2.5 per SAFAR studies",
    },
}


class SimulatorService:
    def simulate(self, intervention_type, readings, attributions=None, zones=None):
        # type: (str, List[Dict], List[Dict], List[Dict]) -> Dict[str, Any]
        impact = INTERVENTION_IMPACTS.get(intervention_type)
        if not impact:
            return {"error": "Unknown intervention: {}".format(intervention_type)}

        pm25_factor = 1 - (impact["pm25_reduction_pct"] / 100)
        pm10_factor = 1 - (impact["pm10_reduction_pct"] / 100)

        before = []
        after = []
        station_impacts = []

        for r in readings:
            aqi_before = r.get("aqi", 0)
            pm25_before = r.get("pm25", 0) or 0
            pm10_before = r.get("pm10", 0) or 0

            # Adjust reduction by source attribution if available
            source_weight = 1.0
            if attributions:
                for attr in attributions:
                    if attr.get("station_id") == r.get("station_id"):
                        src = attr.get("sources", {})
                        source_weight = src.get(impact["primary_source"], 0.2) * 3
                        source_weight = min(source_weight, 1.5)
                        break

            pm25_after = pm25_before * (1 - (1 - pm25_factor) * source_weight)
            pm10_after = pm10_before * (1 - (1 - pm10_factor) * source_weight)
            aqi_after = self._pm25_to_aqi(pm25_after)

            before.append(aqi_before)
            after.append(aqi_after)

            station_impacts.append({
                "station_id": r.get("station_id"),
                "station_name": r.get("station_name"),
                "latitude": r.get("latitude"),
                "longitude": r.get("longitude"),
                "before": {
                    "aqi": aqi_before,
                    "pm25": round(pm25_before, 1),
                    "pm10": round(pm10_before, 1),
                },
                "after": {
                    "aqi": aqi_after,
                    "pm25": round(pm25_after, 1),
                    "pm10": round(pm10_after, 1),
                },
                "reduction": {
                    "aqi_points": aqi_before - aqi_after,
                    "aqi_pct": round((1 - aqi_after / max(aqi_before, 1)) * 100, 1),
                    "pm25_pct": round((1 - pm25_after / max(pm25_before, 1)) * 100, 1),
                },
            })

        avg_before = sum(before) / max(len(before), 1)
        avg_after = sum(after) / max(len(after), 1)

        return {
            "intervention": intervention_type,
            "description": impact["description"],
            "timestamp": datetime.now().isoformat(),
            "city_impact": {
                "avg_aqi_before": round(avg_before, 1),
                "avg_aqi_after": round(avg_after, 1),
                "aqi_reduction": round(avg_before - avg_after, 1),
                "aqi_reduction_pct": round((1 - avg_after / max(avg_before, 1)) * 100, 1),
                "stations_improved": len([s for s in station_impacts if s["reduction"]["aqi_points"] > 5]),
            },
            "station_impacts": sorted(
                station_impacts,
                key=lambda s: s["reduction"]["aqi_points"],
                reverse=True,
            ),
            "implementation": {
                "time_to_effect": impact["implementation_time"],
                "affected_radius_km": impact["affected_radius_km"],
                "precedent": impact["precedent"],
            },
            "methodology": "Source-attribution-weighted empirical reduction factors from Delhi pollution studies",
        }

    def compare_interventions(self, readings, attributions=None):
        # type: (List[Dict], List[Dict]) -> Dict[str, Any]
        """Compare all available interventions side by side."""
        comparisons = []
        for itype in INTERVENTION_IMPACTS:
            result = self.simulate(itype, readings, attributions)
            if "error" not in result:
                comparisons.append({
                    "intervention": itype,
                    "description": result["description"],
                    "avg_aqi_reduction": result["city_impact"]["aqi_reduction"],
                    "reduction_pct": result["city_impact"]["aqi_reduction_pct"],
                    "time_to_effect": result["implementation"]["time_to_effect"],
                    "stations_improved": result["city_impact"]["stations_improved"],
                })

        comparisons.sort(key=lambda c: c["avg_aqi_reduction"], reverse=True)

        return {
            "comparisons": comparisons,
            "recommended": comparisons[0]["intervention"] if comparisons else None,
            "recommended_reason": "Highest projected AQI reduction" if comparisons else None,
        }

    def _pm25_to_aqi(self, pm25):
        # type: (float) -> int
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
