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


@router.get("/satellite")
async def get_satellite_data():
    """Get Sentinel-5P NO2/SO2 satellite data grid."""
    from app.services.satellite import SatelliteService
    svc = SatelliteService()
    return svc.get_no2_grid()


@router.get("/fires")
async def get_fire_data():
    """Get MODIS/VIIRS active fire detection."""
    from app.services.satellite import SatelliteService
    svc = SatelliteService()
    return svc.get_thermal_anomalies()


@router.get("/traffic")
async def get_traffic_data(city: str = Query(default="Delhi")):
    """Get traffic/mobility data for a city."""
    from app.services.traffic import TrafficService
    svc = TrafficService()
    return svc.get_city_traffic(city)


@router.get("/traffic/grid")
async def get_traffic_grid(city: str = Query(default="Delhi")):
    """Get traffic density grid for map overlay."""
    from app.services.traffic import TrafficService
    svc = TrafficService()
    return svc.get_traffic_grid(city)


@router.get("/all-india")
async def get_all_india_aqi():
    """Get AQI readings for all stations across India."""
    from app.services.india_stations import get_all_india_stations
    from app.services.cpcb import CPCBService

    svc = CPCBService()
    all_stations = get_all_india_stations()
    readings = []
    for station in all_stations:
        reading = svc._generate_realistic_reading(station)
        reading["city"] = station.get("city", "")
        readings.append(reading)
    await svc.close()
    return {"stations": readings, "count": len(readings), "cities": len(set(s["city"] for s in readings))}


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


@router.get("/weather")
async def get_weather(city: str = Query(default="Delhi")):
    """Get current weather and wind analysis."""
    from app.services.weather import WeatherService

    svc = WeatherService()
    try:
        current = await svc.get_current(city)
        wind = await svc.get_wind_analysis(city)
        return {"city": city, "current": current, "wind": wind}
    finally:
        await svc.close()


@router.get("/heatmap")
async def get_heatmap_data(city: str = Query(default="Delhi")):
    """Get interpolated AQI grid for heatmap rendering."""
    from app.services.interpolation import InterpolationService

    svc = InterpolationService()
    grid = await svc.get_interpolated_grid(city)
    return {"city": city, "grid": grid}


@router.get("/risk")
async def get_risk_scores(city: str = Query(default="Delhi")):
    """Get compound risk scores for all zones."""
    from app.services.cpcb import CPCBService
    from app.services.weather import WeatherService
    from app.services.wards import WardService
    from app.services.risk import RiskService

    cpcb = CPCBService()
    weather_svc = WeatherService()

    try:
        readings = await cpcb.get_city_readings(city)
        weather = await weather_svc.get_current(city)
        zones = WardService().get_zones(city)

        risk_svc = RiskService()
        scores = risk_svc.score_all_zones(zones, readings, weather)

        return {
            "city": city,
            "zones": scores,
            "highest_risk": scores[0] if scores else None,
            "zones_needing_action": len([s for s in scores if s["action_needed"]]),
        }
    finally:
        await cpcb.close()
        await weather_svc.close()


@router.get("/zones")
async def get_zones(city: str = Query(default="Delhi")):
    """Get zone/ward boundaries as GeoJSON."""
    from app.services.wards import WardService

    svc = WardService()
    geojson = svc.to_geojson(city)
    zones = svc.get_zones(city)
    return {"city": city, "geojson": geojson, "zones": zones, "count": len(zones)}
