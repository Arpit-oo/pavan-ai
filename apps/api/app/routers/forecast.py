from fastapi import APIRouter, Query

router = APIRouter()


@router.get("/ward/{ward_id}")
async def get_ward_forecast(ward_id: str, hours: int = Query(default=24, le=72)):
    """Get AQI forecast for a specific ward."""
    return {"ward_id": ward_id, "hours": hours, "forecasts": [], "status": "pending"}


@router.get("/city")
async def get_city_forecast(city: str = Query(default="Delhi"), hours: int = Query(default=24, le=72)):
    """Get AQI forecast for entire city, ward-level."""
    return {"city": city, "hours": hours, "forecasts": [], "status": "pending"}
