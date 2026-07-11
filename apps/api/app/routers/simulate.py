from typing import List, Optional
from fastapi import APIRouter, Query
from pydantic import BaseModel

router = APIRouter()


class SimulationRequest(BaseModel):
    intervention_type: str
    city: str = "Delhi"


@router.post("/run")
async def run_simulation(req: SimulationRequest):
    """Run intervention simulation and predict AQI impact."""
    from app.services.cpcb import CPCBService
    from app.agents.attribution_agent import AttributionAgent
    from app.services.weather import WeatherService
    from app.services.simulator import SimulatorService

    cpcb = CPCBService()
    weather_svc = WeatherService()

    try:
        readings = await cpcb.get_city_readings(req.city)
        wind = await weather_svc.get_wind_analysis(req.city)

        attr_agent = AttributionAgent()
        attr_result = await attr_agent.run(
            context={"readings": readings, "wind_analysis": wind, "city": req.city}
        )
        attributions = attr_result.data.get("attributions", [])

        sim = SimulatorService()
        result = sim.simulate(req.intervention_type, readings, attributions)
        return result
    finally:
        await cpcb.close()
        await weather_svc.close()


@router.get("/compare")
async def compare_interventions(city: str = Query(default="Delhi")):
    """Compare all interventions side by side."""
    from app.services.cpcb import CPCBService
    from app.agents.attribution_agent import AttributionAgent
    from app.services.weather import WeatherService
    from app.services.simulator import SimulatorService

    cpcb = CPCBService()
    weather_svc = WeatherService()

    try:
        readings = await cpcb.get_city_readings(city)
        wind = await weather_svc.get_wind_analysis(city)

        attr_agent = AttributionAgent()
        attr_result = await attr_agent.run(
            context={"readings": readings, "wind_analysis": wind, "city": city}
        )
        attributions = attr_result.data.get("attributions", [])

        sim = SimulatorService()
        return sim.compare_interventions(readings, attributions)
    finally:
        await cpcb.close()
        await weather_svc.close()


@router.get("/types")
async def get_intervention_types():
    """List available intervention types."""
    from app.services.simulator import INTERVENTION_IMPACTS

    return {
        "interventions": [
            {
                "type": k,
                "description": v["description"],
                "pm25_reduction_pct": v["pm25_reduction_pct"],
                "pm10_reduction_pct": v["pm10_reduction_pct"],
                "time_to_effect": v["implementation_time"],
            }
            for k, v in INTERVENTION_IMPACTS.items()
        ]
    }
