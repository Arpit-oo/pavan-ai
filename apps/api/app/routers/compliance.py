from fastapi import APIRouter, Query
from datetime import datetime

router = APIRouter()

# Delhi GRAP (Graded Response Action Plan) stages
GRAP_STAGES = {
    "I": {
        "name": "Stage I — Poor",
        "trigger_aqi": 201,
        "color": "orange",
        "actions": [
            "Intensify frequency of mechanized/vacuum sweeping of roads",
            "Water sprinkling on roads with high dust generation",
            "Strictly enforce GRAP action on C&D waste management",
            "Ensure PUC compliance — impound visibly polluting vehicles",
            "No burning of waste in the open",
            "Enforce ban on use of coal/firewood in tandoors",
            "Strictly enforce dust mitigation at construction sites",
        ],
    },
    "II": {
        "name": "Stage II — Very Poor",
        "trigger_aqi": 301,
        "color": "red",
        "actions": [
            "All Stage I actions continue",
            "Enhance parking fees by 3-4 times to discourage private vehicles",
            "Augment CNG/electric bus and metro services",
            "Residents advised to use public transport",
            "Restrict use of diesel generator sets (except emergency)",
            "Intensify inspections of pollution control devices in industries",
            "Daily review by Task Force",
        ],
    },
    "III": {
        "name": "Stage III — Severe",
        "trigger_aqi": 401,
        "color": "purple",
        "actions": [
            "All Stage I and II actions continue",
            "Ban construction and demolition activities",
            "Shut brick kilns, hot mix plants, stone crushers",
            "Ban entry of truck traffic into Delhi (except essential/CNG/LNG/electric)",
            "Stringent action on industries causing air pollution",
            "State governments to decide on closure of schools",
            "Advisory for work from home where possible",
        ],
    },
    "IV": {
        "name": "Stage IV — Emergency",
        "trigger_aqi": 451,
        "color": "maroon",
        "actions": [
            "All Stage I, II, and III actions continue",
            "Stop entry of ALL truck traffic except electric and essential services",
            "Ban plying of Delhi-registered diesel medium and heavy goods vehicles",
            "State governments may take call on allowing 50% staff in offices",
            "State governments may consider odd-even scheme",
            "Close schools, shift to online classes",
            "Suspend all construction including highways and flyovers",
        ],
    },
}


@router.get("/grap")
async def get_grap_status(city: str = Query(default="Delhi")):
    """Get current GRAP stage and required actions."""
    from app.services.cpcb import CPCBService

    cpcb = CPCBService()
    try:
        readings = await cpcb.get_city_readings(city)
    finally:
        await cpcb.close()

    aqi_values = [r.get("aqi", 0) for r in readings if r.get("aqi")]
    avg_aqi = sum(aqi_values) / max(len(aqi_values), 1) if aqi_values else 0

    current_stage = None
    current_stage_key = None
    for key in ["IV", "III", "II", "I"]:
        if avg_aqi >= GRAP_STAGES[key]["trigger_aqi"]:
            current_stage = GRAP_STAGES[key]
            current_stage_key = key
            break

    # Stations exceeding thresholds
    stations_poor = len([r for r in readings if r.get("aqi", 0) > 200])
    stations_severe = len([r for r in readings if r.get("aqi", 0) > 400])

    return {
        "city": city,
        "avg_aqi": round(avg_aqi, 1),
        "total_stations": len(readings),
        "stations_exceeding_poor": stations_poor,
        "stations_exceeding_severe": stations_severe,
        "grap_stage": current_stage_key,
        "grap_details": current_stage,
        "all_stages": GRAP_STAGES,
        "timestamp": datetime.now().isoformat(),
    }


@router.get("/report")
async def generate_compliance_report(city: str = Query(default="Delhi")):
    """Generate CPCB/SPCB format compliance report."""
    from app.services.cpcb import CPCBService
    from app.services.weather import WeatherService
    from app.agents.orchestrator import Orchestrator

    orch = Orchestrator()
    analysis = await orch.full_analysis(city)
    summary = analysis["summary"]

    grap_stage = summary.get("grap_stage")
    grap_details = None
    if grap_stage:
        for key in GRAP_STAGES:
            if GRAP_STAGES[key]["name"].startswith("Stage {}".format(key)) and key in (grap_stage or "").split(" ")[0]:
                grap_details = GRAP_STAGES[key]
                break

    # Parse GRAP key from summary
    grap_key = None
    gs = summary.get("grap_stage", "") or ""
    for k in ["IV", "III", "II", "I"]:
        if k in gs:
            grap_key = k
            break

    report = {
        "title": "Air Quality Compliance Report — {}".format(city),
        "generated_at": datetime.now().isoformat(),
        "generated_by": "VayuBudhi AI Platform",
        "period": datetime.now().strftime("%d %B %Y, %H:%M IST"),
        "city": city,
        "executive_summary": {
            "overall_status": summary["status"],
            "avg_aqi": summary["avg_aqi"],
            "max_aqi": summary["max_aqi"],
            "stations_monitored": summary["station_count"],
            "hotspots_detected": summary["hotspot_count"],
            "anomalies_flagged": summary["anomaly_count"],
            "dominant_pollution_source": summary["dominant_source"],
            "weather_outlook": summary["pollution_outlook"],
            "headline": summary["headline"],
        },
        "grap_compliance": {
            "current_stage": grap_stage,
            "required_actions": GRAP_STAGES.get(grap_key, {}).get("actions", []) if grap_key else [],
            "trigger_aqi": GRAP_STAGES.get(grap_key, {}).get("trigger_aqi") if grap_key else None,
        },
        "enforcement_recommendations": analysis["agents"].get("enforcement", {}).get("data", {}).get("recommendations", [])[:5],
        "attribution_summary": analysis["agents"].get("attribution", {}).get("data", {}).get("city_average", {}),
        "wind_conditions": {
            "speed": summary.get("wind_speed"),
            "stagnation": summary.get("stagnation"),
        },
        "disclaimer": "This report is auto-generated by VayuBudhi AI platform for decision support. Official compliance reporting should follow CPCB/SPCB prescribed formats.",
    }

    return report
