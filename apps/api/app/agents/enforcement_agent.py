from typing import Dict, List, Optional
from datetime import datetime
from app.agents.base import BaseAgent, AgentResult


class EnforcementAgent(BaseAgent):
    name = "enforcement"
    description = "Generates prioritized enforcement recommendations for pollution control authorities"

    async def run(self, query="", context=None):
        # type: (str, Optional[Dict]) -> AgentResult
        ctx = context or {}
        readings = ctx.get("readings", [])
        attributions = ctx.get("attributions", [])
        anomalies = ctx.get("anomalies", [])
        wind = ctx.get("wind_analysis", {})

        recommendations = []

        # Priority 1: Anomaly-based enforcement
        for anomaly in anomalies:
            if anomaly.get("severity") in ("critical", "high"):
                recommendations.append({
                    "priority": 1,
                    "type": "anomaly_investigation",
                    "action": "Deploy inspection team to {} — {} detected".format(
                        anomaly.get("station", "unknown"),
                        anomaly.get("type", "anomaly"),
                    ),
                    "location": {
                        "lat": anomaly.get("lat"),
                        "lng": anomaly.get("lng"),
                        "station": anomaly.get("station"),
                    },
                    "evidence": {
                        "aqi": anomaly.get("aqi"),
                        "deviation": anomaly.get("deviation_pct", 0),
                        "probable_cause": anomaly.get("probable_cause", ""),
                    },
                    "estimated_impact": "High — anomalous readings indicate active pollution event",
                    "urgency": "immediate",
                })

        # Priority 2: Attribution-based enforcement — target dominant sources
        for attr in attributions:
            sources = attr.get("sources", {})
            dominant = max(sources, key=sources.get) if sources else None

            if dominant == "industrial" and sources.get("industrial", 0) > 0.3:
                recommendations.append({
                    "priority": 2,
                    "type": "industrial_inspection",
                    "action": "Inspect industrial units upwind of {} — {:.0f}% industrial attribution".format(
                        attr.get("station_name", ""),
                        sources["industrial"] * 100,
                    ),
                    "location": {
                        "station": attr.get("station_name"),
                        "zone": attr.get("zone"),
                        "search_direction": wind.get("upwind_label", "unknown"),
                    },
                    "evidence": {
                        "attribution_pct": round(sources["industrial"] * 100, 1),
                        "confidence": attr.get("confidence", {}).get("industrial", 0),
                    },
                    "estimated_impact": "Medium — industrial source reduction could lower zone AQI by 10-25%",
                    "urgency": "today",
                })

            if dominant == "construction" and sources.get("construction", 0) > 0.2:
                recommendations.append({
                    "priority": 2,
                    "type": "construction_compliance",
                    "action": "Check dust suppression compliance at construction sites near {}".format(
                        attr.get("station_name", ""),
                    ),
                    "location": {
                        "station": attr.get("station_name"),
                        "zone": attr.get("zone"),
                    },
                    "evidence": {
                        "attribution_pct": round(sources["construction"] * 100, 1),
                        "pm10_elevated": True,
                    },
                    "estimated_impact": "Medium — dust suppression can reduce PM10 by 30-50% at source",
                    "urgency": "today",
                })

            if dominant == "burning" and sources.get("burning", 0) > 0.15:
                recommendations.append({
                    "priority": 1,
                    "type": "burning_enforcement",
                    "action": "Patrol for open burning near {} — {:.0f}% burning attribution".format(
                        attr.get("station_name", ""),
                        sources["burning"] * 100,
                    ),
                    "location": {
                        "station": attr.get("station_name"),
                        "zone": attr.get("zone"),
                    },
                    "evidence": {
                        "attribution_pct": round(sources["burning"] * 100, 1),
                        "time_pattern": "matches burning activity window",
                    },
                    "estimated_impact": "High — stopping active burning has immediate AQI impact",
                    "urgency": "immediate",
                })

        # Priority 3: Hotspot-based — high AQI stations
        for r in sorted(readings, key=lambda x: x.get("aqi", 0), reverse=True)[:3]:
            if r.get("aqi", 0) > 250:
                recommendations.append({
                    "priority": 3,
                    "type": "hotspot_patrol",
                    "action": "General patrol and source identification at {} (AQI: {})".format(
                        r.get("station_name", ""),
                        r.get("aqi", 0),
                    ),
                    "location": {
                        "lat": r.get("latitude"),
                        "lng": r.get("longitude"),
                        "station": r.get("station_name"),
                    },
                    "evidence": {"aqi": r.get("aqi", 0)},
                    "estimated_impact": "Variable — depends on source identified",
                    "urgency": "today",
                })

        # Deduplicate by station
        seen = set()
        unique_recs = []
        for rec in sorted(recommendations, key=lambda x: x["priority"]):
            station = rec.get("location", {}).get("station", "")
            if station not in seen:
                seen.add(station)
                unique_recs.append(rec)

        return AgentResult(
            self.name,
            {
                "recommendations": unique_recs[:10],
                "total_generated": len(recommendations),
                "total_after_dedup": len(unique_recs),
            },
            reasoning="{} enforcement recs. {} immediate priority.".format(
                len(unique_recs),
                len([r for r in unique_recs if r["urgency"] == "immediate"]),
            ),
            confidence=0.7,
        )
