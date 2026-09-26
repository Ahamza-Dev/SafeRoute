from datetime import datetime, timedelta, timezone
import logging
from typing import Any
import httpx

logger = logging.getLogger(__name__)

USGS_BASE_URL = "https://earthquake.usgs.gov/fdsnws/event/1/query"
REQUEST_TIMEOUT_SECONDS = 8.0
SEARCH_RADIUS_KM = 250
LOOKBACK_DAYS = 30
MIN_MAGNITUDE = 3.0


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


async def fetch_recent_earthquakes(latitude: float, longitude: float) -> dict:
    """
    Fetch earthquakes with magnitude >= 3.0 within a 250km radius over the past 30 days from USGS.
    """
    now = datetime.now(timezone.utc)
    start_time = now - timedelta(days=LOOKBACK_DAYS)

    params = {
        "format": "geojson",
        "latitude": latitude,
        "longitude": longitude,
        "maxradiuskm": SEARCH_RADIUS_KM,
        "starttime": start_time.isoformat(),
        "endtime": now.isoformat(),
        "minmagnitude": MIN_MAGNITUDE,
        "orderby": "time",
    }

    try:
        async with httpx.AsyncClient(timeout=REQUEST_TIMEOUT_SECONDS) as client:
            response = await client.get(USGS_BASE_URL, params=params)
            response.raise_for_status()
            data = response.json()
    except (httpx.TimeoutException, httpx.HTTPStatusError, httpx.RequestError) as exc:
        logger.warning(
            "USGS earthquake request failed for coords (%f, %f): %s",
            latitude,
            longitude,
            exc,
        )
        raise
    except ValueError as exc:
        logger.error(
            "USGS returned malformed JSON for coords (%f, %f): %s",
            latitude,
            longitude,
            exc,
        )
        raise httpx.RequestError("Invalid JSON received from earthquake service.") from exc

    if not isinstance(data, dict):
        logger.error("USGS returned non-dict response: %s", type(data))
        raise httpx.RequestError("Unexpected response format from earthquake service.")

    raw_features = data.get("features") if isinstance(data.get("features"), list) else []
    earthquakes = []

    for feature in raw_features:
        if not isinstance(feature, dict):
            continue

        properties = feature.get("properties") if isinstance(feature.get("properties"), dict) else {}
        geometry = feature.get("geometry") if isinstance(feature.get("geometry"), dict) else {}
        coordinates = geometry.get("coordinates") if isinstance(geometry.get("coordinates"), list) else []

        # USGS GeoJSON coordinates format: [longitude, latitude, depth_km]
        raw_lon = coordinates[0] if len(coordinates) > 0 else None
        raw_lat = coordinates[1] if len(coordinates) > 1 else None
        raw_depth = coordinates[2] if len(coordinates) > 2 else None

        eq_longitude = _safe_float(raw_lon)
        eq_latitude = _safe_float(raw_lat)
        depth_km = _safe_float(raw_depth)
        magnitude = _safe_float(properties.get("mag"))

        # Skip entries that have completely invalid coordinates or missing magnitude
        if eq_latitude is None or eq_longitude is None or magnitude is None:
            continue

        # USGS time is an epoch timestamp in milliseconds
        raw_time = properties.get("time")
        time_str = None
        if isinstance(raw_time, (int, float)) and raw_time > 0:
            try:
                time_str = datetime.fromtimestamp(raw_time / 1000.0, tz=timezone.utc).isoformat()
            except (ValueError, OSError):
                time_str = None

        place = str(properties.get("place") or "").strip() or "Unknown location"
        event_id = str(feature.get("id") or f"eq-{len(earthquakes)}")

        earthquakes.append(
            {
                "id": event_id,
                "magnitude": magnitude,
                "place": place,
                "latitude": eq_latitude,
                "longitude": eq_longitude,
                "depth_km": depth_km,
                "time": time_str,
            }
        )

    return {
        "status": "available",
        "location": {
            "latitude": latitude,
            "longitude": longitude,
        },
        "search_radius_km": SEARCH_RADIUS_KM,
        "count": len(earthquakes),
        "earthquakes": earthquakes,
        "source": "USGS",
    }
