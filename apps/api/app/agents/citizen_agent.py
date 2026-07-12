"""Citizen Alert Agent — generates health advisories in multiple languages."""

from typing import Dict, List, Optional
from datetime import datetime
from app.agents.base import BaseAgent, AgentResult


HEALTH_ADVISORIES = {
    "good": {
        "en": "Air quality is good. Enjoy outdoor activities.",
        "hi": "हवा की गुणवत्ता अच्छी है। बाहरी गतिविधियों का आनंद लें।",
        "ta": "காற்றுத் தரம் நல்லதாக உள்ளது. வெளிப்புற செயல்களை ரசிக்கவும்.",
        "bn": "বাতাসের মান ভালো। বাইরে কাজকর্ম উপভোগ করুন।",
    },
    "moderate": {
        "en": "Air quality is moderate. Sensitive groups should limit prolonged outdoor exertion.",
        "hi": "हवा की गुणवत्ता मध्यम है। संवेदनशील लोग लंबे समय तक बाहर रहने से बचें।",
        "ta": "காற்றுத் தரம் மிதமாக உள்ளது. நெடுநேர வெளிப்புற செயல்களை குறைக்கவும்.",
        "bn": "বাতাসের মান মাঝারি। সংবেদনশীল ব্যক্তিরা দীর্ঘ সময় বাইরে থাকা এড়িয়ে চলুন।",
    },
    "poor": {
        "en": "Air quality is POOR. Avoid outdoor exercise. Use N95 masks outdoors. Keep windows closed.",
        "hi": "हवा की गुणवत्ता खराब है। बाहर व्यायाम न करें। N95 मास्क पहनें। खिड़कियाँ बंद रखें।",
        "ta": "காற்றுத் தரம் மோசமாக உள்ளது. வெளியில் உடற்பயிற்சி வேண்டாம். N95 மாஸ்க் அணியவும்.",
        "bn": "বাতাসের মান খারাপ। বাইরে ব্যায়াম করবেন না। N95 মাস্ক পরুন। জানালা বন্ধ রাখুন।",
    },
    "very_poor": {
        "en": "ALERT: Air quality is VERY POOR. Stay indoors. Use air purifiers. Avoid all outdoor activity. Seek medical help if breathing difficulty.",
        "hi": "चेतावनी: हवा बहुत खराब है। घर में रहें। एयर प्यूरीफायर चलाएं। सांस लेने में तकलीफ हो तो डॉक्टर से संपर्क करें।",
        "ta": "எச்சரிக்கை: காற்று மிகவும் மோசமாக உள்ளது. வீட்டில் இருங்கள். மூச்சு திணறல் இருந்தால் மருத்துவரை அணுகவும்.",
        "bn": "সতর্কতা: বাতাস অত্যন্ত খারাপ। ঘরে থাকুন। এয়ার পিউরিফায়ার চালান। শ্বাসকষ্ট হলে ডাক্তারের সাথে যোগাযোগ করুন।",
    },
    "severe": {
        "en": "EMERGENCY: Severe air pollution. DO NOT go outdoors. All schools should close. Use air purifiers on max. Call 112 if medical emergency.",
        "hi": "आपातकाल: गंभीर वायु प्रदूषण। बाहर न जाएं। सभी स्कूल बंद होने चाहिए। एयर प्यूरीफायर अधिकतम पर चलाएं। आपातकाल में 112 पर कॉल करें।",
        "ta": "அவசரகாலம்: கடுமையான காற்று மாசுபாடு. வெளியே செல்ல வேண்டாம். பள்ளிகள் மூடப்பட வேண்டும். 112 அழைக்கவும்.",
        "bn": "জরুরি অবস্থা: ভয়াবহ বায়ু দূষণ। বাইরে যাবেন না। সব স্কুল বন্ধ হওয়া উচিত। 112 নম্বরে কল করুন।",
    },
}


class CitizenAgent(BaseAgent):
    name = "citizen"
    description = "Generates multilingual health advisories for citizens"

    async def run(self, query="", context=None):
        # type: (str, Optional[Dict]) -> AgentResult
        ctx = context or {}
        readings = ctx.get("readings", [])
        zones = ctx.get("zones", [])
        city = ctx.get("city", "Delhi")

        if not readings:
            return AgentResult(self.name, {"alerts": []}, confidence=0.0)

        aqi_values = [r.get("aqi", 0) for r in readings if r.get("aqi")]
        avg_aqi = sum(aqi_values) / max(len(aqi_values), 1)

        level = self._aqi_to_level(avg_aqi)
        advisory = HEALTH_ADVISORIES.get(level, HEALTH_ADVISORIES["moderate"])

        # Generate zone-level alerts
        zone_alerts = []
        for r in readings:
            station_aqi = r.get("aqi", 0)
            station_level = self._aqi_to_level(station_aqi)

            if station_level in ("poor", "very_poor", "severe"):
                station_advisory = HEALTH_ADVISORIES.get(station_level, {})
                zone_alerts.append({
                    "station": r.get("station_name", ""),
                    "aqi": station_aqi,
                    "level": station_level,
                    "message_en": station_advisory.get("en", ""),
                    "message_hi": station_advisory.get("hi", ""),
                    "lat": r.get("latitude"),
                    "lng": r.get("longitude"),
                })

        # WhatsApp-style message
        whatsapp_msg = self._format_whatsapp(city, avg_aqi, level, advisory, zone_alerts)

        return AgentResult(
            self.name,
            {
                "city": city,
                "avg_aqi": round(avg_aqi, 1),
                "level": level,
                "city_advisory": advisory,
                "zone_alerts": zone_alerts,
                "alert_count": len(zone_alerts),
                "whatsapp_message": whatsapp_msg,
                "languages": ["en", "hi", "ta", "bn"],
            },
            reasoning="{} zone alerts. City level: {}. {} languages.".format(
                len(zone_alerts), level, 4
            ),
            confidence=0.85,
        )

    def _aqi_to_level(self, aqi):
        # type: (float) -> str
        if aqi <= 50:
            return "good"
        if aqi <= 100:
            return "moderate"
        if aqi <= 200:
            return "moderate"
        if aqi <= 300:
            return "poor"
        if aqi <= 400:
            return "very_poor"
        return "severe"

    def _format_whatsapp(self, city, avg_aqi, level, advisory, zone_alerts):
        # type: (str, float, str, Dict, List[Dict]) -> Dict[str, str]
        emoji = {"good": "✅", "moderate": "⚠️", "poor": "🟠", "very_poor": "🔴", "severe": "🚨"}.get(level, "⚠️")

        en = "{emoji} *Pavan Air Quality Alert — {city}*\n\nAQI: *{aqi}* ({level})\n\n{msg}\n\n{zones}\n\n_Updated: {time}_\n_Powered by Pavan AI_".format(
            emoji=emoji, city=city, aqi=int(avg_aqi), level=level.upper(),
            msg=advisory.get("en", ""),
            zones="\n".join(["- {}: AQI {}".format(a["station"].split(",")[0], a["aqi"]) for a in zone_alerts[:5]]) if zone_alerts else "No critical zones.",
            time=datetime.now().strftime("%I:%M %p"),
        )

        hi = "{emoji} *पवन वायु गुणवत्ता अलर्ट — {city}*\n\nAQI: *{aqi}*\n\n{msg}\n\n_पवन AI द्वारा संचालित_".format(
            emoji=emoji, city=city, aqi=int(avg_aqi),
            msg=advisory.get("hi", ""),
        )

        return {"en": en, "hi": hi}
