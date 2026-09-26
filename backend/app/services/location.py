import asyncio
import logging
from typing import Any, Dict

from app.services.earthquakes import fetch_recent_earthquakes
from app.services.risk import calculate_risk_assessment
from app.services.weather import fetch_current_weather

logger = logging.getLogger(__name__)


async def fetch_location_data(latitude: float, longitude: float) -> Dict[str, Any]:
    """
    Orchestrate and aggregate weather, seismic, and risk assessment data for given coordinates concurrently.
    Shields individual provider failures so that available telemetry is preserved.
    """
    # Execute both external service requests concurrently with shielded exception capture
    results = await asyncio.gather(
        fetch_current_weather(latitude, longitude),
        fetch_recent_earthquakes(latitude, longitude),
        return_exceptions=True,
    )

    weather_res, earthquake_res = results

    # Process weather provider outcome
    if isinstance(weather_res, Exception):
        logger.warning(
            "Weather provider failed for coordinates (%.4f, %.4f): %s",
            latitude,
            longitude,
            weather_res,
        )
        weather_status = "unavailable"
        weather_obj: Dict[str, Any] = {
            "status": "unavailable",
            "temperature": None,
            "wind_speed": None,
            "wind_gusts": None,
            "precipitation": None,
            "precipitation_probability": None,
            "weather_code": None,
            "hourly_forecast": [],
        }
    elif isinstance(weather_res, dict):
        weather_status = weather_res.get("status", "available")
        inner_weather = weather_res.get("weather")
        if isinstance(inner_weather, dict):
            weather_obj = dict(inner_weather)
            weather_obj["status"] = weather_status
        else:
            weather_obj = {
                "status": weather_status,
                "temperature": None,
                "wind_speed": None,
                "wind_gusts": None,
                "precipitation": None,
                "precipitation_probability": None,
                "weather_code": None,
                "hourly_forecast": [],
            }
    else:
        weather_status = "unavailable"
        weather_obj = {
            "status": "unavailable",
            "temperature": None,
            "wind_speed": None,
            "wind_gusts": None,
            "precipitation": None,
            "precipitation_probability": None,
            "weather_code": None,
            "hourly_forecast": [],
        }

    # Process earthquake provider outcome
    if isinstance(earthquake_res, Exception):
        logger.warning(
            "USGS earthquake provider failed for coordinates (%.4f, %.4f): %s",
            latitude,
            longitude,
            earthquake_res,
        )
        earthquake_status = "unavailable"
        earthquake_obj: Dict[str, Any] = {
            "status": "unavailable",
            "search_radius_km": 250,
            "count": None,
            "events": None,
        }
    elif isinstance(earthquake_res, dict):
        earthquake_status = earthquake_res.get("status", "available")
        events_list = (
            earthquake_res.get("earthquakes")
            if "earthquakes" in earthquake_res
            else earthquake_res.get("events")
        )
        earthquake_obj = {
            "status": earthquake_status,
            "search_radius_km": earthquake_res.get("search_radius_km", 250),
            "count": earthquake_res.get("count", len(events_list) if isinstance(events_list, list) else None),
            "events": events_list if isinstance(events_list, list) else None,
        }
    else:
        earthquake_status = "unavailable"
        earthquake_obj = {
            "status": "unavailable",
            "search_radius_km": 250,
            "count": None,
            "events": None,
        }

    # Compute deterministic risk assessment
    risk_assessment = calculate_risk_assessment(
        latitude=latitude,
        longitude=longitude,
        weather_data=weather_obj,
        earthquake_data=earthquake_obj,
    )

    # Determine aggregated location status
    if weather_status == "available" and earthquake_status == "available":
        overall_status = "available"
    elif weather_status == "unavailable" and earthquake_status == "unavailable":
        overall_status = "unavailable"
    else:
        overall_status = "partial"

    # Format risk payload cleanly without redundant location coordinates
    risk_payload = {
        "status": risk_assessment.get("status", overall_status),
        "overall_score": risk_assessment.get("overall_score"),
        "overall_level": risk_assessment.get("overall_level"),
        "factors": risk_assessment.get("factors", {}),
        "disclaimer": risk_assessment.get("disclaimer"),
    }

    return {
        "status": overall_status,
        "location": {
            "latitude": latitude,
            "longitude": longitude,
        },
        "weather": weather_obj,
        "earthquakes": earthquake_obj,
        "risk_assessment": risk_payload,
    }
