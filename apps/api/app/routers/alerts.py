from fastapi import APIRouter, Query

router = APIRouter()


@router.get("/active")
async def get_active_alerts(city: str = Query(default="Delhi")):
    """Get all active citizen alerts for a city."""
    return {"city": city, "alerts": []}


@router.get("/ward/{ward_id}")
async def get_ward_alerts(ward_id: str):
    """Get alerts for a specific ward."""
    return {"ward_id": ward_id, "alerts": []}
