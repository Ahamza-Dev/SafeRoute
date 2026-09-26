import logging
from typing import Any, Dict, List, Optional
import httpx

logger = logging.getLogger(__name__)

NOMINATIM_BASE_URL = "https://nominatim.openstreetmap.org/search"
REQUEST_TIMEOUT_SECONDS = 5.0
SEARCH_LIMIT = 5
USER_AGENT = "SafeRoute/0.1 (educational project)"


def _safe_float(val: Any) -> Optional[float]:
    if val is None:
        return None
    try:
        f = float(val)
        return f if not (f != f) else None
    except (ValueError, TypeError):
        return None


async def search_locations(query: str) -> Dict[str, Any]:
    """
    Search for geographic locations using OpenStreetMap's Nominatim geocoding API.
    """
    clean_query = query.strip() if query else ""
    if not clean_query:
        return {
            "query": "",
            "results": [],
            "source": "Nominatim",
        }

    params = {
        "q": clean_query,
        "format": "jsonv2",
        "limit": SEARCH_LIMIT,
        "addressdetails": 1,
    }

    headers = {
        "User-Agent": USER_AGENT,
    }

    logger.debug("Executing Nominatim geocode search for query: '%s'", clean_query)

    try:
        async with httpx.AsyncClient(timeout=REQUEST_TIMEOUT_SECONDS) as client:
            response = await client.get(NOMINATIM_BASE_URL, params=params, headers=headers)
            response.raise_for_status()
            raw_results = response.json()
    except (httpx.TimeoutException, httpx.HTTPStatusError, httpx.RequestError) as exc:
        logger.warning("Nominatim geocoding request failed for '%s': %s", clean_query, exc)
        raise

    results: List[Dict[str, Any]] = []
    if isinstance(raw_results, list):
        for item in raw_results:
            if not isinstance(item, dict):
                continue
            try:
                lat = _safe_float(item.get("lat"))
                lon = _safe_float(item.get("lon"))
                if lat is None or lon is None or not (-90.0 <= lat <= 90.0) or not (-180.0 <= lon <= 180.0):
                    continue

                display_name = str(item.get("display_name", "")).strip()
                name = item.get("name")
                if not name and display_name:
                    name = display_name.split(",")[0].strip()
                elif not name:
                    name = "Unknown Location"

                results.append(
                    {
                        "name": str(name),
                        "latitude": lat,
                        "longitude": lon,
                        "display_name": display_name,
                        "source": "Nominatim",
                    }
                )
            except Exception as item_err:
                logger.debug("Skipping malformed Nominatim entry: %s", item_err)
                continue

    return {
        "query": clean_query,
        "results": results,
        "source": "Nominatim",
    }
