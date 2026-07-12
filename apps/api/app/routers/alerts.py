from fastapi import APIRouter, Query

router = APIRouter()


@router.get("/active")
async def get_active_alerts(city: str = Query(default="Delhi")):
    """Get citizen health alerts for a city."""
    from app.services.cpcb import CPCBService
    from app.agents.citizen_agent import CitizenAgent

    cpcb = CPCBService()
    try:
        readings = await cpcb.get_city_readings(city)
        agent = CitizenAgent()
        result = await agent.run(context={"readings": readings, "city": city})

        return {
            "city": city,
            "alerts": result.data,
        }
    finally:
        await cpcb.close()


@router.get("/whatsapp")
async def get_whatsapp_alert(city: str = Query(default="Delhi"), lang: str = Query(default="en")):
    """Get formatted WhatsApp alert message."""
    from app.services.cpcb import CPCBService
    from app.agents.citizen_agent import CitizenAgent

    cpcb = CPCBService()
    try:
        readings = await cpcb.get_city_readings(city)
        agent = CitizenAgent()
        result = await agent.run(context={"readings": readings, "city": city})

        whatsapp = result.data.get("whatsapp_message", {})
        message = whatsapp.get(lang, whatsapp.get("en", "No alert"))

        return {
            "city": city,
            "language": lang,
            "message": message,
            "level": result.data.get("level"),
            "aqi": result.data.get("avg_aqi"),
        }
    finally:
        await cpcb.close()


@router.get("/health-impact")
async def get_health_impact(city: str = Query(default="Delhi")):
    """Estimate health impact based on current AQI levels."""
    from app.services.cpcb import CPCBService
    from app.services.wards import WardService

    cpcb = CPCBService()
    try:
        readings = await cpcb.get_city_readings(city)
        zones = WardService().get_zones(city)

        aqi_values = [r.get("aqi", 0) for r in readings if r.get("aqi")]
        avg_aqi = sum(aqi_values) / max(len(aqi_values), 1)

        total_pop = sum(z.get("population", 0) for z in zones)
        exposed_pop = 0
        schools_affected = 0
        hospitals_in_zone = 0

        for zone in zones:
            zone_pop = zone.get("population", 0)
            for site in zone.get("vulnerable_sites", []):
                if site["type"] == "school":
                    schools_affected += 1
                if site["type"] == "hospital":
                    hospitals_in_zone += 1
            if avg_aqi > 200:
                exposed_pop += zone_pop

        # WHO-based health impact estimates
        # PM2.5 exposure → hospital visits relationship (simplified)
        avg_pm25 = sum(r.get("pm25", 0) or 0 for r in readings) / max(len(readings), 1)
        excess_pm25 = max(0, avg_pm25 - 15)  # WHO guideline: 15 ug/m3

        # ~0.5% increase in respiratory admissions per 10 ug/m3 PM2.5 increase
        admission_increase_pct = (excess_pm25 / 10) * 0.5
        # Base respiratory admission rate ~2 per 100k/day for Delhi
        base_daily_admissions = (total_pop / 100000) * 2
        excess_admissions = base_daily_admissions * (admission_increase_pct / 100)

        return {
            "city": city,
            "avg_aqi": round(avg_aqi, 1),
            "avg_pm25": round(avg_pm25, 1),
            "who_pm25_limit": 15,
            "excess_over_who": round(excess_pm25, 1),
            "total_population": total_pop,
            "population_exposed_to_poor_aqi": exposed_pop,
            "schools_in_affected_zones": schools_affected,
            "hospitals_nearby": hospitals_in_zone,
            "estimated_excess_hospital_visits_24h": round(excess_admissions, 0),
            "admission_increase_pct": round(admission_increase_pct, 2),
            "methodology": "WHO PM2.5 exposure-response function (simplified)",
        }
    finally:
        await cpcb.close()
