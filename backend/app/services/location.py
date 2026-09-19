import asyncio

from app.services.earthquakes import fetch_recent_earthquakes
from app.services.risk import calculate_risk_assessment
from app.services.weather import fetch_current_weather


async def fetch_location_data(latitude: float, longitude: float) -> dict:
    """
    Orchestrate and aggregate weather, seismic, and risk assessment data for given coordinates concurrently.
    """
    # Execute both external service requests concurrently
    weather_data, earthquake_data = await asyncio.gather(
        fetch_current_weather(latitude, longitude),
        fetch_recent_earthquakes(latitude, longitude),
    )

    weather_obj = weather_data.get("weather", {})
    earthquake_obj = {
        "search_radius_km": earthquake_data.get("search_radius_km", 250),
        "events": earthquake_data.get("earthquakes", []),
    }

    # Compute deterministic risk assessment
    risk_assessment = calculate_risk_assessment(
        latitude=latitude,
        longitude=longitude,
        weather_data=weather_obj,
        earthquake_data=earthquake_obj,
    )

    # Format risk payload cleanly without redundant location coordinates
    risk_payload = {
        "overall_score": risk_assessment.get("overall_score"),
        "overall_level": risk_assessment.get("overall_level"),
        "factors": risk_assessment.get("factors", {}),
        "disclaimer": risk_assessment.get("disclaimer"),
    }

    return {
        "location": {
            "latitude": latitude,
            "longitude": longitude,
        },
        "weather": weather_obj,
        "earthquakes": earthquake_obj,
        "risk_assessment": risk_payload,
    }
