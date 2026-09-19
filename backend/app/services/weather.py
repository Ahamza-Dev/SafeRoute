import httpx

OPEN_METEO_BASE_URL = "https://api.open-meteo.com/v1/forecast"
REQUEST_TIMEOUT_SECONDS = 5.0


async def fetch_current_weather(latitude: float, longitude: float) -> dict:
    """
    Fetch current temperature and wind speed for given coordinates from Open-Meteo API.
    """
    params = {
        "latitude": latitude,
        "longitude": longitude,
        "current": "temperature_2m,wind_speed_10m",
    }

    async with httpx.AsyncClient(timeout=REQUEST_TIMEOUT_SECONDS) as client:
        response = await client.get(OPEN_METEO_BASE_URL, params=params)
        response.raise_for_status()
        data = response.json()

    current = data.get("current", {})
    current_units = data.get("current_units", {})

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
        },
        "source": "Open-Meteo",
    }
