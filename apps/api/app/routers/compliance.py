from fastapi import APIRouter, Query

router = APIRouter()


@router.get("/grap")
async def get_grap_status(city: str = Query(default="Delhi")):
    """Get current GRAP stage and compliance status."""
    return {
        "city": city,
        "current_stage": None,
        "triggers": [],
        "required_actions": [],
        "status": "pending",
    }


@router.get("/report")
async def generate_compliance_report(city: str = Query(default="Delhi")):
    """Generate CPCB/SPCB format compliance report."""
    return {"city": city, "report": None, "status": "pending"}
