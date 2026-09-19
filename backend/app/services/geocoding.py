import httpx

NOMINATIM_BASE_URL = "https://nominatim.openstreetmap.org/search"
REQUEST_TIMEOUT_SECONDS = 5.0
SEARCH_LIMIT = 5
USER_AGENT = "SafeRoute/0.1 (educational project)"


async def search_locations(query: str) -> dict:
    """
    Search for geographic locations using OpenStreetMap's Nominatim geocoding API.
    """
    params = {
        "q": query.strip(),
        "format": "jsonv2",
        "limit": SEARCH_LIMIT,
        "addressdetails": 1,
    }

    headers = {
        "User-Agent": USER_AGENT,
    }

    async with httpx.AsyncClient(timeout=REQUEST_TIMEOUT_SECONDS) as client:
        response = await client.get(NOMINATIM_BASE_URL, params=params, headers=headers)
        response.raise_for_status()
        raw_results = response.json()

    results = []
    if isinstance(raw_results, list):
        for item in raw_results:
            try:
                lat_str = item.get("lat")
                lon_str = item.get("lon")
                if lat_str is None or lon_str is None:
                    continue

                lat = float(lat_str)
                lon = float(lon_str)

                display_name = item.get("display_name", "")
                name = item.get("name") or (display_name.split(",")[0].strip() if display_name else "Unknown")

                results.append(
                    {
                        "name": name,
                        "latitude": lat,
                        "longitude": lon,
                        "display_name": display_name,
                        "source": "Nominatim",
                    }
                )
            except (ValueError, TypeError):
                # Skip any individual malformed entry without crashing the entire search
                continue

    return {
        "query": query,
        "results": results,
        "source": "Nominatim",
    }
