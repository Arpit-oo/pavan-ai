from fastapi import APIRouter, Query
from typing import Optional

router = APIRouter()


@router.get("/live")
async def get_live_aqi(
    city: str = Query(default="Delhi"),
    station_id: Optional[str] = Query(default=None),
):
    """Get latest AQI readings for a city or specific station."""
    from app.services.cpcb import CPCBService

    svc = CPCBService()
    if station_id:
        data = await svc.get_station_reading(station_id)
    else:
        data = await svc.get_city_readings(city)
    return {"city": city, "stations": data, "count": len(data)}


@router.get("/historical")
async def get_historical_aqi(
    city: str = Query(default="Delhi"),
    hours: int = Query(default=24, le=168),
):
    """Get historical AQI data for a city."""
    from app.services.cpcb import CPCBService

    svc = CPCBService()
    data = await svc.get_historical(city, hours)
    return {"city": city, "hours": hours, "readings": data}


@router.get("/stations")
async def get_stations(city: str = Query(default="Delhi")):
    """Get all monitoring stations for a city."""
    from app.services.cpcb import CPCBService

    svc = CPCBService()
    stations = await svc.get_stations(city)
    return {"city": city, "stations": stations, "count": len(stations)}


@router.get("/heatmap")
async def get_heatmap_data(city: str = Query(default="Delhi")):
    """Get interpolated AQI grid for heatmap rendering."""
    from app.services.interpolation import InterpolationService

    svc = InterpolationService()
    grid = await svc.get_interpolated_grid(city)
    return {"city": city, "grid": grid}
