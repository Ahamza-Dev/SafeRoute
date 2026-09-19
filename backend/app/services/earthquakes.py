from datetime import datetime, timedelta, timezone
import httpx

USGS_BASE_URL = "https://earthquake.usgs.gov/fdsnws/event/1/query"
REQUEST_TIMEOUT_SECONDS = 5.0
SEARCH_RADIUS_KM = 250
LOOKBACK_DAYS = 30
MIN_MAGNITUDE = 3.0


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

    async with httpx.AsyncClient(timeout=REQUEST_TIMEOUT_SECONDS) as client:
        response = await client.get(USGS_BASE_URL, params=params)
        response.raise_for_status()
        data = response.json()

    raw_features = data.get("features", [])
    earthquakes = []

    for feature in raw_features:
        properties = feature.get("properties") or {}
        geometry = feature.get("geometry") or {}
        coordinates = geometry.get("coordinates") or []

        # USGS GeoJSON coordinates format: [longitude, latitude, depth_km]
        eq_longitude = coordinates[0] if len(coordinates) > 0 else None
        eq_latitude = coordinates[1] if len(coordinates) > 1 else None
        depth_km = coordinates[2] if len(coordinates) > 2 else None

        # USGS time is an epoch timestamp in milliseconds
        raw_time = properties.get("time")
        if raw_time is not None:
            time_str = datetime.fromtimestamp(raw_time / 1000.0, tz=timezone.utc).isoformat()
        else:
            time_str = None

        earthquakes.append(
            {
                "id": feature.get("id"),
                "magnitude": properties.get("mag"),
                "place": properties.get("place"),
                "latitude": eq_latitude,
                "longitude": eq_longitude,
                "depth_km": depth_km,
                "time": time_str,
            }
        )

    return {
        "location": {
            "latitude": latitude,
            "longitude": longitude,
        },
        "search_radius_km": SEARCH_RADIUS_KM,
        "earthquakes": earthquakes,
        "source": "USGS",
    }
