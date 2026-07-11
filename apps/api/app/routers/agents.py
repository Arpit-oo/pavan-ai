from typing import Optional
from fastapi import APIRouter, Query
from pydantic import BaseModel

router = APIRouter()


class AgentQuery(BaseModel):
    query: str
    city: str = "Delhi"
    ward_id: Optional[str] = None


@router.post("/ask")
async def ask_agent(req: AgentQuery):
    """Query the orchestrator agent with a natural language question."""
    from app.agents.orchestrator import Orchestrator

    orch = Orchestrator()
    result = await orch.ask(req.query, req.city)
    return result


@router.get("/analyze")
async def full_analysis(city: str = Query(default="Delhi")):
    """Run complete multi-agent analysis pipeline."""
    from app.agents.orchestrator import Orchestrator

    orch = Orchestrator()
    result = await orch.full_analysis(city)
    return result


@router.get("/quick")
async def quick_status(city: str = Query(default="Delhi")):
    """Quick sensor status check."""
    from app.agents.orchestrator import Orchestrator

    orch = Orchestrator()
    result = await orch.quick_status(city)
    return result


@router.get("/status")
async def agent_status():
    """Get current status of all agents."""
    agents = [
        {"name": "orchestrator", "status": "ready", "description": "Coordinates all agents"},
        {"name": "sensor", "status": "ready", "description": "CPCB real-time data"},
        {"name": "weather", "status": "ready", "description": "Wind and weather analysis"},
        {"name": "anomaly", "status": "ready", "description": "Spike and deviation detection"},
        {"name": "attribution", "status": "ready", "description": "Pollution source decomposition"},
        {"name": "enforcement", "status": "pending", "description": "Inspector deployment recs"},
        {"name": "citizen", "status": "pending", "description": "Multilingual health alerts"},
    ]
    return {"agents": agents, "active_count": len([a for a in agents if a["status"] == "ready"])}
