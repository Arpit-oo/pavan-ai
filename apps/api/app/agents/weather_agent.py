from typing import Dict, Optional
from app.agents.base import BaseAgent, AgentResult
from app.services.weather import WeatherService


class WeatherAgent(BaseAgent):
    name = "weather"
    description = "Analyzes weather conditions and wind patterns for pollution dispersion"

    async def run(self, query="", context=None):
        # type: (str, Optional[Dict]) -> AgentResult
        city = (context or {}).get("city", "Delhi")
        svc = WeatherService()

        try:
            current = await svc.get_current(city)
            wind = await svc.get_wind_analysis(city)
            forecast = await svc.get_forecast(city, hours=24)

            rain_coming = any(f.get("rain_3h", 0) > 0 for f in forecast[:8])
            wind_shift = self._detect_wind_shift(forecast)

            return AgentResult(
                self.name,
                {
                    "current": current,
                    "wind_analysis": wind,
                    "forecast_24h": forecast,
                    "alerts": {
                        "stagnation": wind["stagnation_detected"],
                        "inversion_risk": wind["inversion_risk"],
                        "rain_expected": rain_coming,
                        "wind_shift_expected": wind_shift,
                    },
                    "pollution_outlook": self._assess_outlook(wind, rain_coming),
                },
                reasoning="Wind {}m/s from {}. Dispersion: {}. {}{}".format(
                    wind["current_wind_speed"],
                    wind["wind_direction_label"],
                    wind["pollution_dispersion"],
                    "STAGNATION ALERT. " if wind["stagnation_detected"] else "",
                    "Rain expected — AQI relief likely." if rain_coming else "",
                ),
                confidence=0.7 if current.get("_synthetic") else 0.9,
            )
        finally:
            await svc.close()

    def _detect_wind_shift(self, forecast):
        # type: (list) -> bool
        if len(forecast) < 4:
            return False
        dirs = [f.get("wind_direction", 0) for f in forecast[:8]]
        spread = max(dirs) - min(dirs)
        return spread > 120

    def _assess_outlook(self, wind, rain_coming):
        # type: (Dict, bool) -> str
        if rain_coming:
            return "improving — rain expected to wash out particulates"
        if wind["stagnation_detected"]:
            return "worsening — stagnant conditions trapping pollutants"
        if wind["inversion_risk"]:
            return "worsening — temperature inversion likely"
        if wind["pollution_dispersion"] == "good":
            return "stable — good wind dispersion"
        return "moderate — watch for changes"
