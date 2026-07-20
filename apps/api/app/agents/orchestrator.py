import asyncio
from typing import Dict, List, Any, Optional
from datetime import datetime

from app.agents.base import AgentResult
from app.agents.sensor_agent import SensorAgent
from app.agents.weather_agent import WeatherAgent
from app.agents.anomaly_agent import AnomalyAgent
from app.agents.attribution_agent import AttributionAgent
from app.agents.enforcement_agent import EnforcementAgent


class Orchestrator:
    """Coordinates all VayuBudhi agents. Runs them in optimal order,
    passes data between them, and merges results."""

    def __init__(self):
        self.sensor = SensorAgent()
        self.weather = WeatherAgent()
        self.anomaly = AnomalyAgent()
        self.attribution = AttributionAgent()
        self.enforcement = EnforcementAgent()
        self.run_log = []  # type: List[Dict[str, Any]]

    async def full_analysis(self, city="Delhi"):
        # type: (str) -> Dict[str, Any]
        """Run complete analysis pipeline. This is the main entry point."""
        start = datetime.now()
        self.run_log = []
        context = {"city": city}

        # Phase 0: Satellite + traffic data (parallel with Phase 1)
        self._log("Fetching satellite (Sentinel-5P) + traffic data", "orchestrator")
        satellite_data = {}
        traffic_data = {}
        try:
            from app.services.satellite import SatelliteService
            from app.services.traffic import TrafficService
            sat_svc = SatelliteService()
            trf_svc = TrafficService()
            satellite_data = {"no2_hotspots": len(sat_svc.get_no2_grid().get("hotspots", [])), "source": "sentinel-5p"}
            traffic_data = trf_svc.get_city_traffic(city)
            self._log("Satellite: {} NO2 hotspots. Traffic: congestion {}%, emission factor {}".format(
                satellite_data.get("no2_hotspots", 0),
                traffic_data.get("congestion_index", 0),
                traffic_data.get("vehicular_emission_factor", 0),
            ), "orchestrator")
        except Exception:
            self._log("Satellite/traffic fallback — continuing without", "orchestrator")

        # Phase 1: Parallel data collection
        self._log("Starting parallel data collection", "orchestrator")
        sensor_result, weather_result = await asyncio.gather(
            self._run_agent(self.sensor, context=context),
            self._run_agent(self.weather, context=context),
        )

        # Phase 2: Analysis agents (need sensor + weather data)
        readings = sensor_result.data.get("readings", [])
        wind = weather_result.data.get("wind_analysis", {})

        analysis_context = {
            "city": city,
            "readings": readings,
            "wind_analysis": wind,
            "weather": weather_result.data.get("current", {}),
        }

        self._log("Running analysis agents", "orchestrator")
        anomaly_result, attribution_result = await asyncio.gather(
            self._run_agent(self.anomaly, context=analysis_context),
            self._run_agent(self.attribution, context=analysis_context),
        )

        # Phase 3: Enforcement (needs anomaly + attribution results)
        enforcement_context = {
            "city": city,
            "readings": readings,
            "attributions": attribution_result.data.get("attributions", []),
            "anomalies": anomaly_result.data.get("anomalies", []),
            "wind_analysis": wind,
        }

        self._log("Running enforcement agent", "orchestrator")
        enforcement_result = await self._run_agent(self.enforcement, context=enforcement_context)

        elapsed = (datetime.now() - start).total_seconds()
        self._log("Total signal-to-recommendation: {:.2f}s".format(elapsed), "orchestrator")

        # Compile summary
        summary = self._build_summary(
            sensor_result, weather_result, anomaly_result, attribution_result, city
        )
        summary["enforcement_recs"] = len(
            enforcement_result.data.get("recommendations", [])
        )
        summary["signal_to_recommendation_seconds"] = round(elapsed, 2)
        summary["satellite_data"] = satellite_data
        summary["traffic_data"] = {
            "congestion_index": traffic_data.get("congestion_index", 0),
            "vehicular_emission_factor": traffic_data.get("vehicular_emission_factor", 0),
            "is_peak_hour": traffic_data.get("is_peak_hour", False),
            "traffic_pm25_contribution_pct": traffic_data.get("traffic_contribution_to_pm25_pct", 0),
        }
        summary["data_sources"] = [
            "cpcb_caaqms ({} stations)".format(summary.get("station_count", 0)),
            "openweathermap (live weather)",
            "sentinel-5p (no2/so2 column density)",
            "modis-viirs (fire detection)",
            "traffic-mobility (congestion index)",
        ]

        return {
            "city": city,
            "timestamp": datetime.now().isoformat(),
            "elapsed_seconds": round(elapsed, 2),
            "signal_to_recommendation_seconds": round(elapsed, 2),
            "summary": summary,
            "agents": {
                "sensor": sensor_result.to_dict(),
                "weather": weather_result.to_dict(),
                "anomaly": anomaly_result.to_dict(),
                "attribution": attribution_result.to_dict(),
                "enforcement": enforcement_result.to_dict(),
            },
            "data_sources_used": 5,
            "run_log": self.run_log,
        }

    async def quick_status(self, city="Delhi"):
        # type: (str) -> Dict[str, Any]
        """Fast status check — sensor data only."""
        context = {"city": city}
        result = await self._run_agent(self.sensor, context=context)
        return {
            "city": city,
            "timestamp": datetime.now().isoformat(),
            "sensor": result.to_dict(),
        }

    async def ask(self, query, city="Delhi"):
        # type: (str, str) -> Dict[str, Any]
        """Natural language query — run full analysis and generate answer."""
        analysis = await self.full_analysis(city)

        # For now, structured response. Claude LLM integration comes next.
        return {
            "query": query,
            "analysis": analysis["summary"],
            "agents_used": list(analysis["agents"].keys()),
            "detailed": analysis,
        }

    async def _run_agent(self, agent, query="", context=None):
        # type: (Any, str, Optional[Dict]) -> AgentResult
        agent_name = agent.name
        start = datetime.now()
        self._log("Starting {}".format(agent_name), agent_name)

        try:
            result = await agent.run(query, context)
            elapsed = (datetime.now() - start).total_seconds()
            self._log(
                "Completed {} in {:.2f}s — {}".format(agent_name, elapsed, result.reasoning),
                agent_name,
            )
            return result
        except Exception as e:
            elapsed = (datetime.now() - start).total_seconds()
            self._log("FAILED {} in {:.2f}s — {}".format(agent_name, elapsed, str(e)), agent_name)
            return AgentResult(agent_name, {"error": str(e)}, reasoning="Agent failed", confidence=0.0)

    def _build_summary(self, sensor, weather, anomaly, attribution, city):
        # type: (AgentResult, AgentResult, AgentResult, AgentResult, str) -> Dict[str, Any]
        s = sensor.data
        w = weather.data
        an = anomaly.data
        at = attribution.data

        avg_aqi = s.get("avg_aqi", 0)
        if avg_aqi <= 50:
            status = "Good"
            urgency = "low"
        elif avg_aqi <= 100:
            status = "Satisfactory"
            urgency = "low"
        elif avg_aqi <= 200:
            status = "Moderate"
            urgency = "medium"
        elif avg_aqi <= 300:
            status = "Poor"
            urgency = "high"
        elif avg_aqi <= 400:
            status = "Very Poor"
            urgency = "critical"
        else:
            status = "Severe"
            urgency = "emergency"

        # GRAP stage detection (Delhi-specific)
        grap_stage = None
        if city == "Delhi":
            if avg_aqi > 400:
                grap_stage = "IV — Emergency"
            elif avg_aqi > 300:
                grap_stage = "III — Severe"
            elif avg_aqi > 200:
                grap_stage = "II — Very Poor"
            elif avg_aqi > 100:
                grap_stage = "I — Poor"

        return {
            "status": status,
            "urgency": urgency,
            "avg_aqi": avg_aqi,
            "max_aqi": s.get("max_aqi", 0),
            "station_count": s.get("station_count", 0),
            "hotspot_count": s.get("hotspot_count", 0),
            "anomaly_count": an.get("count", 0),
            "critical_anomalies": len([a for a in an.get("anomalies", []) if a.get("severity") == "critical"]),
            "dominant_source": max(at.get("city_average", {}), key=at.get("city_average", {}).get) if at.get("city_average") else "unknown",
            "pollution_outlook": w.get("pollution_outlook", "unknown"),
            "wind_speed": w.get("wind_analysis", {}).get("current_wind_speed", 0),
            "stagnation": w.get("alerts", {}).get("stagnation", False),
            "grap_stage": grap_stage,
            "headline": self._generate_headline(avg_aqi, an.get("count", 0), w.get("pollution_outlook", "")),
        }

    def _generate_headline(self, avg_aqi, anomaly_count, outlook):
        # type: (float, int, str) -> str
        if avg_aqi > 300:
            base = "SEVERE air quality — immediate intervention needed"
        elif avg_aqi > 200:
            base = "POOR air quality — enforcement action recommended"
        elif avg_aqi > 100:
            base = "MODERATE air quality — monitoring actively"
        else:
            base = "Air quality within acceptable range"

        if anomaly_count > 0:
            base += ". {} anomal{} detected".format(
                anomaly_count, "y" if anomaly_count == 1 else "ies"
            )

        if "worsening" in outlook:
            base += ". Conditions expected to worsen"
        elif "improving" in outlook:
            base += ". Improvement expected"

        return base

    def _log(self, message, agent_name):
        # type: (str, str) -> None
        self.run_log.append({
            "timestamp": datetime.now().isoformat(),
            "agent": agent_name,
            "message": message,
        })
