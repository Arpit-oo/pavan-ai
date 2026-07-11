from fastapi import APIRouter, Query

router = APIRouter()


@router.get("/city")
async def get_city_forecast(
    city: str = Query(default="Delhi"),
    hours: int = Query(default=24, le=72),
):
    """Get AQI forecast for all stations in a city."""
    from app.services.cpcb import CPCBService
    from app.services.weather import WeatherService
    from app.services.forecast import ForecastService

    cpcb = CPCBService()
    weather_svc = WeatherService()

    try:
        readings = await cpcb.get_city_readings(city)
        weather = await weather_svc.get_current(city)

        forecast_svc = ForecastService()
        forecasts = forecast_svc.predict_zones(readings, weather, hours)

        return {
            "city": city,
            "hours": hours,
            "station_count": len(forecasts),
            "forecasts": forecasts,
            "model_info": forecast_svc.get_model_info(),
        }
    finally:
        await cpcb.close()
        await weather_svc.close()


@router.get("/station/{station_id}")
async def get_station_forecast(
    station_id: str,
    hours: int = Query(default=24, le=72),
):
    """Get AQI forecast for a specific station."""
    from app.services.cpcb import CPCBService
    from app.services.weather import WeatherService
    from app.services.forecast import ForecastService

    cpcb = CPCBService()
    weather_svc = WeatherService()

    try:
        reading = await cpcb.get_station_reading(station_id)
        if not reading:
            return {"error": "Station not found", "station_id": station_id}

        weather = await weather_svc.get_current("Delhi")
        forecast_svc = ForecastService()
        predictions = forecast_svc.predict(reading, weather, hours)

        return {
            "station_id": station_id,
            "station_name": reading.get("station_name"),
            "current_aqi": reading.get("aqi"),
            "hours": hours,
            "forecasts": predictions,
            "model_info": forecast_svc.get_model_info(),
        }
    finally:
        await cpcb.close()
        await weather_svc.close()


@router.get("/model")
async def get_model_info():
    """Get forecast model metadata and metrics."""
    from app.services.forecast import ForecastService
    svc = ForecastService()
    return svc.get_model_info()
