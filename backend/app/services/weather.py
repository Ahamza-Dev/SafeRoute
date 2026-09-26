import httpx

OPEN_METEO_BASE_URL = "https://api.open-meteo.com/v1/forecast"
REQUEST_TIMEOUT_SECONDS = 10.0

CURRENT_WEATHER_VARIABLES = (
    "temperature_2m,wind_speed_10m,wind_gusts_10m,precipitation,precipitation_probability,weather_code"
)

HOURLY_WEATHER_VARIABLES = (
    "temperature_2m,precipitation_probability,precipitation,wind_speed_10m,weather_code"
)


def _clean_unit(unit: str | None, default: str) -> str:
    """Sanitize unit strings and return proper Unicode representations."""
    if not unit:
        return default
    if "C" in unit:
        return "°C"
    if "F" in unit:
        return "°F"
    if "%" in unit:
        return "%"
    if "mm" in unit:
        return "mm"
    if "km/h" in unit or "kmh" in unit:
        return "km/h"
    return unit if unit.strip() else default


async def fetch_current_weather(latitude: float, longitude: float) -> dict:
    """
    Fetch comprehensive current weather conditions and a 24-hour hourly forecast
    for given coordinates from the Open-Meteo API.
    """
    params = {
        "latitude": latitude,
        "longitude": longitude,
        "current": CURRENT_WEATHER_VARIABLES,
        "hourly": HOURLY_WEATHER_VARIABLES,
        "forecast_days": 2,
        "timezone": "auto",
    }

    async with httpx.AsyncClient(timeout=REQUEST_TIMEOUT_SECONDS) as client:
        response = await client.get(OPEN_METEO_BASE_URL, params=params)
        response.raise_for_status()
        data = response.json()

    current = data.get("current") or {}
    current_units = data.get("current_units") or {}
    hourly = data.get("hourly") or {}
    hourly_units = data.get("hourly_units") or {}

    current_time = current.get("time")
    hourly_times = hourly.get("time") or []

    # Select the next 24 hourly records starting from the current hour
    start_idx = 0
    if current_time and hourly_times:
        try:
            start_idx = hourly_times.index(current_time)
        except ValueError:
            for i, t in enumerate(hourly_times):
                if t >= current_time:
                    start_idx = i
                    break

    end_idx = start_idx + 24

    hourly_forecast = {
        "time": hourly_times[start_idx:end_idx],
        "temperature": (hourly.get("temperature_2m") or [])[start_idx:end_idx],
        "temperature_unit": _clean_unit(hourly_units.get("temperature_2m"), "°C"),
        "precipitation_probability": (hourly.get("precipitation_probability") or [])[start_idx:end_idx],
        "precipitation_probability_unit": hourly_units.get("precipitation_probability", "%"),
        "precipitation": (hourly.get("precipitation") or [])[start_idx:end_idx],
        "precipitation_unit": hourly_units.get("precipitation", "mm"),
        "wind_speed": (hourly.get("wind_speed_10m") or [])[start_idx:end_idx],
        "wind_speed_unit": hourly_units.get("wind_speed_10m", "km/h"),
        "weather_code": (hourly.get("weather_code") or [])[start_idx:end_idx],
    }

    return {
        "location": {
            "latitude": latitude,
            "longitude": longitude,
        },
        "weather": {
            "temperature": current.get("temperature_2m"),
            "temperature_unit": _clean_unit(current_units.get("temperature_2m"), "°C"),
            "wind_speed": current.get("wind_speed_10m"),
            "wind_speed_unit": current_units.get("wind_speed_10m", "km/h"),
            "wind_gusts": current.get("wind_gusts_10m"),
            "wind_gusts_unit": current_units.get("wind_gusts_10m", "km/h"),
            "precipitation": current.get("precipitation"),
            "precipitation_unit": current_units.get("precipitation", "mm"),
            "precipitation_probability": current.get("precipitation_probability"),
            "precipitation_probability_unit": current_units.get("precipitation_probability", "%"),
            "weather_code": current.get("weather_code"),
            "hourly_forecast": hourly_forecast,
        },
        "source": "Open-Meteo",
    }
