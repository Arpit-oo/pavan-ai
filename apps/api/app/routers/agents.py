from fastapi import APIRouter
from typing import Optional
from pydantic import BaseModel

router = APIRouter()


class AgentQuery(BaseModel):
    query: str
    city: str = "Delhi"
    ward_id: Optional[str] = None


@router.post("/ask")
async def ask_agent(req: AgentQuery):
    """Query the orchestrator agent with a natural language question."""
    return {"query": req.query, "response": "Agent system initializing...", "agents_used": []}


@router.get("/status")
async def agent_status():
    """Get current status of all agents."""
    agents = [
        {"name": "orchestrator", "status": "idle"},
        {"name": "sensor", "status": "idle"},
        {"name": "weather", "status": "idle"},
        {"name": "attribution", "status": "idle"},
        {"name": "forecast", "status": "idle"},
        {"name": "anomaly", "status": "idle"},
        {"name": "enforcement", "status": "idle"},
        {"name": "citizen", "status": "idle"},
    ]
    return {"agents": agents}
