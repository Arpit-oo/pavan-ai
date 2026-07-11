import os
from functools import lru_cache


class Settings:
    def __init__(self):
        self.supabase_url = os.getenv("SUPABASE_URL", "")
        self.supabase_key = os.getenv("SUPABASE_KEY", "")
        self.anthropic_api_key = os.getenv("ANTHROPIC_API_KEY", "")
        self.openweathermap_api_key = os.getenv("OPENWEATHERMAP_API_KEY", "")
        self.mapbox_token = os.getenv("MAPBOX_TOKEN", "")
        self.cpcb_api_key = os.getenv("CPCB_API_KEY", "")
        self.target_city = os.getenv("TARGET_CITY", "Delhi")
        self.data_refresh_interval_minutes = int(
            os.getenv("DATA_REFRESH_INTERVAL_MINUTES", "15")
        )
        self.forecast_horizon_hours = int(
            os.getenv("FORECAST_HORIZON_HOURS", "72")
        )


@lru_cache()
def get_settings():
    return Settings()
