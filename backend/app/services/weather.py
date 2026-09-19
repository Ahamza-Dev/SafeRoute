import httpx

OPEN_METEO_BASE_URL = "https://api.open-meteo.com/v1/forecast"
REQUEST_TIMEOUT_SECONDS = 5.0
WEATHER_VARIABLES = (
    "temperature_2m,wind_speed_10m,wind_gusts_10m,precipitation,precipitation_probability,weather_code"
)


async def fetch_current_weather(latitude: float, longitude: float) -> dict:
    """
    Fetch comprehensive current weather conditions for given coordinates from Open-Meteo API.
    """
    params = {
        "latitude": latitude,
        "longitude": longitude,
        "current": WEATHER_VARIABLES,
    }

    async with httpx.AsyncClient(timeout=REQUEST_TIMEOUT_SECONDS) as client:
        response = await client.get(OPEN_METEO_BASE_URL, params=params)
        response.raise_for_status()
        data = response.json()

    current = data.get("current") or {}
    current_units = data.get("current_units") or {}

    return {
        "location": {
            "latitude": latitude,
            "longitude": longitude,
        },
        "weather": {
            "temperature": current.get("temperature_2m"),
            "temperature_unit": current_units.get("temperature_2m", "°C"),
            "wind_speed": current.get("wind_speed_10m"),
            "wind_speed_unit": current_units.get("wind_speed_10m", "km/h"),
            "wind_gusts": current.get("wind_gusts_10m"),
            "wind_gusts_unit": current_units.get("wind_gusts_10m", "km/h"),
            "precipitation": current.get("precipitation"),
            "precipitation_unit": current_units.get("precipitation", "mm"),
            "precipitation_probability": current.get("precipitation_probability"),
            "precipitation_probability_unit": current_units.get("precipitation_probability", "%"),
            "weather_code": current.get("weather_code"),
        },
        "source": "Open-Meteo",
    }
