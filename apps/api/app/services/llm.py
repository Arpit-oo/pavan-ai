"""LLM service — OpenAI GPT-4o for natural language agent responses."""

import os
from typing import Dict, Any
from dotenv import load_dotenv

load_dotenv(os.path.join(os.path.dirname(__file__), '..', '..', '.env'))

try:
    import openai
    HAS_OPENAI = True
except ImportError:
    HAS_OPENAI = False


class LLMService:
    def __init__(self):
        self.api_key = os.getenv("OPENAI_API_KEY", "")
        if HAS_OPENAI and self.api_key:
            self.client = openai.OpenAI(api_key=self.api_key)
        else:
            self.client = None

    def generate_response(self, query, analysis_data):
        # type: (str, Dict[str, Any]) -> str
        if not self.client:
            return self._fallback_response(query, analysis_data)

        summary = analysis_data.get("summary", {})
        system_prompt = """you are pavan, an ai air quality intelligence assistant for delhi, india.
you speak in lowercase, concise, warm but data-driven. like a smart friend who happens to be an environmental scientist.
you have access to real-time multi-agent analysis data. use it to answer questions accurately.
never make up numbers — only reference what's in the data provided.
keep responses under 150 words. use **bold** for key metrics."""

        context = """current analysis data:
- city: delhi
- avg aqi: {aqi}
- status: {status}
- dominant source: {source}
- pollution outlook: {outlook}
- hotspots: {hotspots}
- anomalies: {anomalies}
- grap stage: {grap}
- wind speed: {wind} m/s
- stagnation: {stag}
- stations monitored: {stations}""".format(
            aqi=summary.get("avg_aqi", "unknown"),
            status=summary.get("status", "unknown"),
            source=summary.get("dominant_source", "unknown"),
            outlook=summary.get("pollution_outlook", "unknown"),
            hotspots=summary.get("hotspot_count", 0),
            anomalies=summary.get("anomaly_count", 0),
            grap=summary.get("grap_stage", "none"),
            wind=summary.get("wind_speed", "unknown"),
            stag=summary.get("stagnation", False),
            stations=summary.get("station_count", 0),
        )

        try:
            r = self.client.chat.completions.create(
                model="gpt-4o-mini",
                messages=[
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": context + "\n\nuser question: " + query},
                ],
                max_tokens=300,
                temperature=0.7,
            )
            return r.choices[0].message.content or self._fallback_response(query, analysis_data)
        except Exception as e:
            return self._fallback_response(query, analysis_data)

    def _fallback_response(self, query, analysis_data):
        # type: (str, Dict[str, Any]) -> str
        s = analysis_data.get("summary", {})
        return "based on current data: **aqi {aqi}** ({status}). dominant source is **{source}**. outlook: {outlook}. {extra}".format(
            aqi=s.get("avg_aqi", "—"),
            status=s.get("status", "unknown").lower(),
            source=s.get("dominant_source", "unknown"),
            outlook=s.get("pollution_outlook", "unknown"),
            extra="⚠ stagnation detected — pollutants trapped." if s.get("stagnation") else "",
        )
