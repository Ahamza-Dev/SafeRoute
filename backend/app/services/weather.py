import logging
from typing import Any
import httpx

logger = logging.getLogger(__name__)

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


def _safe_float(value: Any) -> float | None:
    """Safely convert a value to float, returning None if invalid."""
    if value is None:
        return None
    try:
        f = float(value)
        import math
        return None if math.isnan(f) or math.isinf(f) else f
    except (ValueError, TypeError):
        return None


def _safe_int(value: Any) -> int | None:
    """Safely convert a value to int, returning None if invalid."""
    if value is None:
        return None
    try:
        return int(value)
    except (ValueError, TypeError):
        return None


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

    try:
        async with httpx.AsyncClient(timeout=REQUEST_TIMEOUT_SECONDS) as client:
            response = await client.get(OPEN_METEO_BASE_URL, params=params)
            response.raise_for_status()
            data = response.json()
    except (httpx.TimeoutException, httpx.HTTPStatusError, httpx.RequestError) as exc:
        logger.warning(
            "Open-Meteo request failed for coords (%f, %f): %s",
            latitude,
            longitude,
            exc,
        )
        raise
    except ValueError as exc:
        logger.error(
            "Open-Meteo returned malformed JSON for coords (%f, %f): %s",
            latitude,
            longitude,
            exc,
        )
        raise httpx.RequestError("Invalid JSON received from weather service.") from exc

    if not isinstance(data, dict):
        logger.error("Open-Meteo returned non-dict response: %s", type(data))
        raise httpx.RequestError("Unexpected response format from weather service.")

    current = data.get("current") if isinstance(data.get("current"), dict) else {}
    current_units = data.get("current_units") if isinstance(data.get("current_units"), dict) else {}
    hourly = data.get("hourly") if isinstance(data.get("hourly"), dict) else {}
    hourly_units = data.get("hourly_units") if isinstance(data.get("hourly_units"), dict) else {}

    current_time = current.get("time")
    hourly_times = hourly.get("time") if isinstance(hourly.get("time"), list) else []

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

    raw_temps = hourly.get("temperature_2m") if isinstance(hourly.get("temperature_2m"), list) else []
    raw_probs = hourly.get("precipitation_probability") if isinstance(hourly.get("precipitation_probability"), list) else []
    raw_precips = hourly.get("precipitation") if isinstance(hourly.get("precipitation"), list) else []
    raw_winds = hourly.get("wind_speed_10m") if isinstance(hourly.get("wind_speed_10m"), list) else []
    raw_codes = hourly.get("weather_code") if isinstance(hourly.get("weather_code"), list) else []

    hourly_forecast = {
        "time": hourly_times[start_idx:end_idx],
        "temperature": [_safe_float(v) for v in raw_temps[start_idx:end_idx]],
        "temperature_unit": _clean_unit(hourly_units.get("temperature_2m"), "°C"),
        "precipitation_probability": [_safe_int(v) for v in raw_probs[start_idx:end_idx]],
        "precipitation_probability_unit": hourly_units.get("precipitation_probability", "%"),
        "precipitation": [_safe_float(v) for v in raw_precips[start_idx:end_idx]],
        "precipitation_unit": hourly_units.get("precipitation", "mm"),
        "wind_speed": [_safe_float(v) for v in raw_winds[start_idx:end_idx]],
        "wind_speed_unit": hourly_units.get("wind_speed_10m", "km/h"),
        "weather_code": [_safe_int(v) for v in raw_codes[start_idx:end_idx]],
    }

    temperature = _safe_float(current.get("temperature_2m"))
    wind_speed = _safe_float(current.get("wind_speed_10m"))
    wind_gusts = _safe_float(current.get("wind_gusts_10m"))
    precipitation = _safe_float(current.get("precipitation"))
    precipitation_probability = _safe_int(current.get("precipitation_probability"))
    weather_code = _safe_int(current.get("weather_code"))

    return {
        "status": "available",
        "location": {
            "latitude": latitude,
            "longitude": longitude,
        },
        "weather": {
            "temperature": temperature,
            "temperature_unit": _clean_unit(current_units.get("temperature_2m"), "°C"),
            "wind_speed": wind_speed,
            "wind_speed_unit": current_units.get("wind_speed_10m", "km/h"),
            "wind_gusts": wind_gusts,
            "wind_gusts_unit": current_units.get("wind_gusts_10m", "km/h"),
            "precipitation": precipitation,
            "precipitation_unit": current_units.get("precipitation", "mm"),
            "precipitation_probability": precipitation_probability,
            "precipitation_probability_unit": current_units.get("precipitation_probability", "%"),
            "weather_code": weather_code,
            "hourly_forecast": hourly_forecast,
        },
        "source": "Open-Meteo",
    }
