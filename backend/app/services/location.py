import asyncio

from app.services.earthquakes import fetch_recent_earthquakes
from app.services.weather import fetch_current_weather


async def fetch_location_data(latitude: float, longitude: float) -> dict:
    """
    Orchestrate and aggregate weather and seismic data for given coordinates concurrently.
    """
    # Execute both external service requests concurrently
    weather_data, earthquake_data = await asyncio.gather(
        fetch_current_weather(latitude, longitude),
        fetch_recent_earthquakes(latitude, longitude),
    )

    return {
        "location": {
            "latitude": latitude,
            "longitude": longitude,
        },
        "weather": weather_data.get("weather", {}),
        "earthquakes": {
            "search_radius_km": earthquake_data.get("search_radius_km", 250),
            "events": earthquake_data.get("earthquakes", []),
        },
    }
