from fastapi import APIRouter
from typing import List
from pydantic import BaseModel

router = APIRouter()


class SimulationRequest(BaseModel):
    intervention_type: str  # truck_ban, construction_halt, industrial_shutdown
    parameters: dict = {}
    city: str = "Delhi"
    ward_ids: List[str] = []


@router.post("/run")
async def run_simulation(req: SimulationRequest):
    """Run intervention simulation and predict AQI impact."""
    return {
        "intervention": req.intervention_type,
        "parameters": req.parameters,
        "predicted_impact": {},
        "status": "pending",
    }
