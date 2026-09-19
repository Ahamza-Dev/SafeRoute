from fastapi import FastAPI, HTTPException, Query
import httpx

from app.services.weather import fetch_current_weather

app = FastAPI(
    title="SafeRoute API",
    description="Backend API for the SafeRoute disaster risk intelligence platform.",
    version="0.1.0",
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
    Fetch current weather metrics (temperature and wind speed) for specified coordinates.
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
    except Exception as exc:
        raise HTTPException(
            status_code=500,
            detail="An unexpected error occurred while fetching weather data.",
        )
