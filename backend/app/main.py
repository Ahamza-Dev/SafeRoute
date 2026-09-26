import logging
from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
import httpx

from app.services.earthquakes import fetch_recent_earthquakes
from app.services.geocoding import search_locations
from app.services.location import fetch_location_data
from app.services.weather import fetch_current_weather

logger = logging.getLogger(__name__)

app = FastAPI(
    title="SafeRoute API",
    description="Backend API for the SafeRoute disaster risk intelligence platform.",
    version="0.1.0",
)

# Allow requests only from local frontend development origins
allowed_origins = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/api/health")
def health_check():
    return {
        "status": "ok",
        "service": "SafeRoute backend",
    }


@app.get("/api/weather")
async def get_weather(
    latitude: float = Query(
        ...,
        ge=-90.0,
        le=90.0,
        description="Geographic latitude coordinate (-90.0 to 90.0)",
    ),
    longitude: float = Query(
        ...,
        ge=-180.0,
        le=180.0,
        description="Geographic longitude coordinate (-180.0 to 180.0)",
    ),
):
    """
    Fetch current meteorological metrics for specified coordinates, including:
    - Temperature
    - Sustained wind speed
    - Peak wind gusts
    - Precipitation accumulation
    - Precipitation probability
    - WMO weather code
    """
    try:
        weather_data = await fetch_current_weather(latitude, longitude)
        return weather_data
    except httpx.TimeoutException:
        raise HTTPException(
            status_code=504,
            detail="The external weather service timed out. Please try again.",
        )
    except httpx.HTTPStatusError as exc:
        raise HTTPException(
            status_code=502,
            detail=f"External weather provider returned an error: {exc.response.status_code}",
        )
    except httpx.RequestError:
        raise HTTPException(
            status_code=502,
            detail="Unable to reach the external weather provider. Please check network connectivity.",
        )
    except Exception:
        raise HTTPException(
            status_code=500,
            detail="An unexpected error occurred while fetching weather data.",
        )


@app.get("/api/earthquakes")
async def get_earthquakes(
    latitude: float = Query(
        ...,
        ge=-90.0,
        le=90.0,
        description="Geographic latitude coordinate (-90.0 to 90.0)",
    ),
    longitude: float = Query(
        ...,
        ge=-180.0,
        le=180.0,
        description="Geographic longitude coordinate (-180.0 to 180.0)",
    ),
):
    """
    Fetch recent earthquakes (magnitude >= 3.0 within 250km over the past 30 days) from USGS.
    """
    try:
        earthquake_data = await fetch_recent_earthquakes(latitude, longitude)
        return earthquake_data
    except httpx.TimeoutException:
        raise HTTPException(
            status_code=504,
            detail="The external earthquake service timed out. Please try again.",
        )
    except httpx.HTTPStatusError as exc:
        raise HTTPException(
            status_code=502,
            detail=f"External earthquake provider returned an error: {exc.response.status_code}",
        )
    except httpx.RequestError:
        raise HTTPException(
            status_code=502,
            detail="Unable to reach the external earthquake provider. Please check network connectivity.",
        )
    except Exception:
        raise HTTPException(
            status_code=500,
            detail="An unexpected error occurred while fetching earthquake data.",
        )


@app.get("/api/geocode")
async def get_geocode(
    query: str = Query(
        ...,
        min_length=1,
        max_length=200,
        description="Location search query (e.g. city name, region, address)",
    ),
):
    """
    Search for locations matching a text query using OpenStreetMap's Nominatim geocoder.
    """
    try:
        location_data = await search_locations(query)
        return location_data
    except httpx.TimeoutException:
        raise HTTPException(
            status_code=504,
            detail="The external geocoding service timed out. Please try again.",
        )
    except httpx.HTTPStatusError as exc:
        raise HTTPException(
            status_code=502,
            detail=f"External geocoding provider returned an error: {exc.response.status_code}",
        )
    except httpx.RequestError:
        raise HTTPException(
            status_code=502,
            detail="Unable to reach the external geocoding provider. Please check network connectivity.",
        )
    except Exception:
        raise HTTPException(
            status_code=500,
            detail="An unexpected error occurred while processing location search.",
        )


@app.get("/api/location")
async def get_location_data(
    latitude: float = Query(
        ...,
        ge=-90.0,
        le=90.0,
        description="Geographic latitude coordinate (-90.0 to 90.0)",
    ),
    longitude: float = Query(
        ...,
        ge=-180.0,
        le=180.0,
        description="Geographic longitude coordinate (-180.0 to 180.0)",
    ),
):
    """
    Fetch comprehensive situational awareness data for specified coordinates, aggregating:
    - Current meteorological conditions (temperature, wind gusts, precipitation, weather code)
    - Recent seismic events within a 250km radius from USGS
    - SafeRoute deterministic prototype risk assessment

    Important: The risk assessment is an academic/prototype assessment based on available
    public meteorological and seismic data and is NOT an official alert, forecast, or emergency warning.
    """
    try:
        aggregated_data = await fetch_location_data(latitude, longitude)
        return aggregated_data
    except httpx.TimeoutException:
        raise HTTPException(
            status_code=504,
            detail="One or more external services timed out. Please try again.",
        )
    except httpx.HTTPStatusError as exc:
        raise HTTPException(
            status_code=502,
            detail=f"An external data provider returned an error: {exc.response.status_code}",
        )
    except httpx.RequestError:
        raise HTTPException(
            status_code=502,
            detail="Unable to reach external data providers. Please check network connectivity.",
        )
    except Exception:
        raise HTTPException(
            status_code=500,
            detail="An unexpected error occurred while aggregating location data.",
        )
