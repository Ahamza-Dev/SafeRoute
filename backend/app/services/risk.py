from datetime import datetime, timezone
import logging
import math
from typing import Any, Dict, Optional

logger = logging.getLogger(__name__)


def haversine_distance(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    """
    Calculate the great-circle distance between two geographic coordinates in kilometers
    using the standard Haversine formula.
    """
    R = 6371.0  # Earth mean radius in kilometers

    phi1 = math.radians(lat1)
    phi2 = math.radians(lat2)
    delta_phi = math.radians(lat2 - lat1)
    delta_lambda = math.radians(lon2 - lon1)

    a = (
        math.sin(delta_phi / 2.0) ** 2
        + math.cos(phi1) * math.cos(phi2) * math.sin(delta_lambda / 2.0) ** 2
    )
    c = 2.0 * math.atan2(math.sqrt(a), math.sqrt(1.0 - a))

    return round(R * c, 2)


def calculate_earthquake_score(
    user_lat: float, user_lon: float, earthquake_data: Optional[Dict[str, Any]]
) -> Dict[str, Any]:
    """
    Calculate a prototype seismic factor (0-100) based on the most relevant recent earthquake.
    Considers magnitude, distance attenuation (Haversine), depth, and recency.
    """
    if earthquake_data is None or earthquake_data.get("status") == "unavailable":
        return {
            "score": None,
            "status": "unavailable",
            "details": None,
            "explanation": "Seismic monitoring data is currently unavailable from the provider.",
        }

    # Support both full earthquake service response or nested events list
    events = (
        earthquake_data.get("events")
        if "events" in earthquake_data
        else earthquake_data.get("earthquakes", [])
    )

    if events is None:
        return {
            "score": None,
            "status": "unavailable",
            "details": None,
            "explanation": "Seismic monitoring data is currently unavailable from the provider.",
        }

    if len(events) == 0:
        return {
            "score": 0,
            "status": "available",
            "details": None,
            "explanation": "No earthquakes of magnitude >= 3.0 recorded within 250km in the past 30 days.",
        }

    now = datetime.now(timezone.utc)
    most_relevant_event = None
    highest_impact_score = 0.0
    most_relevant_distance = None

    for event in events:
        if not isinstance(event, dict):
            continue
        eq_lat = event.get("latitude")
        eq_lon = event.get("longitude")
        mag = event.get("magnitude")
        depth = event.get("depth_km") or 10.0
        time_str = event.get("time")

        if eq_lat is None or eq_lon is None or mag is None:
            continue

        # 1. Distance Calculation (Haversine)
        distance_km = haversine_distance(user_lat, user_lon, eq_lat, eq_lon)
        if distance_km > 250.0:
            continue

        # 2. Magnitude Base Score (0 to 100)
        # M3.0 -> 25, M4.0 -> 50, M5.0 -> 75, M6.0+ -> 100
        mag_base = min(100.0, max(0.0, (mag - 2.0) * 25.0))

        # 3. Distance Attenuation Multiplier
        if distance_km <= 25.0:
            dist_factor = 1.0
        elif distance_km <= 75.0:
            dist_factor = 0.75
        elif distance_km <= 150.0:
            dist_factor = 0.50
        else:
            dist_factor = 0.25

        # 4. Focal Depth Attenuation Multiplier
        # Shallow earthquakes (< 30km) transfer more energy to surface structures
        if depth <= 30.0:
            depth_factor = 1.0
        elif depth <= 70.0:
            depth_factor = 0.85
        else:
            depth_factor = 0.70

        # 5. Recency Attenuation Multiplier
        recency_factor = 0.5
        if time_str:
            try:
                event_time = datetime.fromisoformat(time_str)
                age_days = (now - event_time).total_seconds() / 86400.0
                if age_days <= 2.0:
                    recency_factor = 1.0
                elif age_days <= 7.0:
                    recency_factor = 0.80
                elif age_days <= 14.0:
                    recency_factor = 0.65
                else:
                    recency_factor = 0.50
            except Exception:
                recency_factor = 0.50

        # Combined Impact Score for this single event
        impact_score = mag_base * dist_factor * depth_factor * recency_factor

        if impact_score > highest_impact_score or most_relevant_event is None:
            highest_impact_score = impact_score
            most_relevant_event = event
            most_relevant_distance = distance_km

    final_score = int(min(100, max(0, round(highest_impact_score))))

    if most_relevant_event:
        mag = most_relevant_event.get("magnitude")
        place = most_relevant_event.get("place", "Unknown location")
        explanation = (
            f"Most relevant seismic event: Magnitude {mag} near {place} "
            f"({most_relevant_distance:.1f} km away)."
        )
        details = {
            "id": most_relevant_event.get("id"),
            "magnitude": mag,
            "place": place,
            "distance_km": most_relevant_distance,
            "depth_km": most_relevant_event.get("depth_km"),
            "time": most_relevant_event.get("time"),
        }
    else:
        explanation = "No significant nearby seismic activity detected."
        details = None

    return {
        "score": final_score,
        "status": "available",
        "details": details,
        "explanation": explanation,
    }


def calculate_wind_score(weather_data: Optional[Dict[str, Any]]) -> Dict[str, Any]:
    """
    Calculate a prototype wind factor (0-100) using wind gusts and sustained wind speed.
    Thresholds:
      < 30 km/h   -> 0
      30-49 km/h  -> 25
      50-69 km/h  -> 50
      70-89 km/h  -> 75
      90+ km/h    -> 100
    """
    if not weather_data or weather_data.get("status") == "unavailable":
        return {
            "score": None,
            "status": "unavailable",
            "details": {
                "wind_speed": None,
                "wind_gusts": None,
                "unit": "km/h",
            },
            "explanation": "Wind telemetry is currently unavailable from the weather provider.",
        }

    gusts = weather_data.get("wind_gusts")
    speed = weather_data.get("wind_speed")

    if gusts is None and speed is None:
        return {
            "score": None,
            "status": "unavailable",
            "details": {
                "wind_speed": None,
                "wind_gusts": None,
                "unit": weather_data.get("wind_gusts_unit") or weather_data.get("wind_speed_unit") or "km/h",
            },
            "explanation": "Wind telemetry is currently unavailable from the weather provider.",
        }

    effective_wind = gusts if gusts is not None else speed

    if effective_wind < 30.0:
        score = 0
        explanation = f"Calm to moderate wind conditions ({effective_wind:.1f} km/h gusts)."
    elif effective_wind < 50.0:
        score = 25
        explanation = f"Breezy conditions with peak gusts reaching {effective_wind:.1f} km/h."
    elif effective_wind < 70.0:
        score = 50
        explanation = f"Strong wind gusts of {effective_wind:.1f} km/h; caution advised for exposed travel."
    elif effective_wind < 90.0:
        score = 75
        explanation = f"Gale-force wind gusts of {effective_wind:.1f} km/h; potential tree and structural hazards."
    else:
        score = 100
        explanation = f"Severe storm-force wind gusts exceeding {effective_wind:.1f} km/h."

    return {
        "score": score,
        "status": "available",
        "details": {
            "wind_speed": speed,
            "wind_gusts": gusts,
            "unit": weather_data.get("wind_gusts_unit") or weather_data.get("wind_speed_unit") or "km/h",
        },
        "explanation": explanation,
    }


def calculate_precipitation_score(weather_data: Optional[Dict[str, Any]]) -> Dict[str, Any]:
    """
    Calculate a prototype precipitation factor (0-100) using accumulation and probability.
    Note: Indicates precipitation intensity; does not predict flooding.
    """
    if not weather_data or weather_data.get("status") == "unavailable":
        return {
            "score": None,
            "status": "unavailable",
            "details": {
                "precipitation": None,
                "precipitation_unit": "mm",
                "precipitation_probability": None,
                "precipitation_probability_unit": "%",
            },
            "explanation": "Precipitation telemetry is currently unavailable from the weather provider.",
        }

    precip = weather_data.get("precipitation")
    prob = weather_data.get("precipitation_probability")

    if precip is None and prob is None:
        return {
            "score": None,
            "status": "unavailable",
            "details": {
                "precipitation": None,
                "precipitation_unit": weather_data.get("precipitation_unit", "mm"),
                "precipitation_probability": None,
                "precipitation_probability_unit": weather_data.get("precipitation_probability_unit", "%"),
            },
            "explanation": "Precipitation telemetry is currently unavailable from the weather provider.",
        }

    # If only one is present, safely default the other for scoring
    effective_precip = precip if precip is not None else 0.0
    effective_prob = prob if prob is not None else 0

    if effective_precip >= 15.0:
        score = 100
        explanation = f"Very heavy precipitation recorded ({effective_precip:.1f} mm)."
    elif effective_precip >= 7.5:
        score = 75
        explanation = f"Heavy precipitation recorded ({effective_precip:.1f} mm)."
    elif effective_precip >= 2.5:
        score = 50
        explanation = f"Moderate precipitation recorded ({effective_precip:.1f} mm)."
    elif effective_precip > 0.0:
        score = 25
        explanation = f"Light precipitation observed ({effective_precip:.1f} mm)."
    else:
        # Dry right now, check probability
        if effective_prob >= 75:
            score = 25
            explanation = f"Currently dry, but high likelihood of precipitation ({effective_prob}% probability)."
        elif effective_prob >= 40:
            score = 15
            explanation = f"Currently dry with moderate precipitation likelihood ({effective_prob}% probability)."
        else:
            score = 0
            explanation = f"Dry conditions with low precipitation probability ({effective_prob}%)."

    return {
        "score": score,
        "status": "available",
        "details": {
            "precipitation": precip,
            "precipitation_unit": weather_data.get("precipitation_unit", "mm"),
            "precipitation_probability": prob,
            "precipitation_probability_unit": weather_data.get("precipitation_probability_unit", "%"),
        },
        "explanation": explanation,
    }


WMO_WEATHER_CODE_MAP = {
    0: (0, "Clear sky"),
    1: (0, "Mainly clear"),
    2: (0, "Partly cloudy"),
    3: (0, "Overcast"),
    45: (20, "Fog"),
    48: (20, "Depositing rime fog"),
    51: (25, "Light drizzle"),
    53: (25, "Moderate drizzle"),
    55: (30, "Dense drizzle"),
    56: (40, "Light freezing drizzle"),
    57: (45, "Dense freezing drizzle"),
    61: (35, "Slight rain"),
    63: (50, "Moderate rain"),
    65: (70, "Heavy rain"),
    66: (75, "Light freezing rain"),
    67: (85, "Heavy freezing rain"),
    71: (50, "Slight snow fall"),
    73: (65, "Moderate snow fall"),
    75: (80, "Heavy snow fall"),
    77: (40, "Snow grains"),
    80: (40, "Slight rain showers"),
    81: (55, "Moderate rain showers"),
    82: (75, "Violent rain showers"),
    85: (60, "Slight snow showers"),
    86: (80, "Heavy snow showers"),
    95: (85, "Thunderstorm"),
    96: (95, "Thunderstorm with slight hail"),
    99: (100, "Thunderstorm with heavy hail"),
}


def calculate_severe_weather_score(weather_data: Optional[Dict[str, Any]]) -> Dict[str, Any]:
    """
    Calculate a prototype severe weather factor (0-100) using the standard WMO weather code.
    """
    if not weather_data or weather_data.get("status") == "unavailable":
        return {
            "score": None,
            "status": "unavailable",
            "details": {
                "weather_code": None,
                "description": "Unavailable",
            },
            "explanation": "Atmospheric condition data is currently unavailable from the weather provider.",
        }

    code = weather_data.get("weather_code")
    if code is None:
        return {
            "score": None,
            "status": "unavailable",
            "details": {
                "weather_code": None,
                "description": "Unavailable",
            },
            "explanation": "Atmospheric condition data is currently unavailable from the weather provider.",
        }

    score, description = WMO_WEATHER_CODE_MAP.get(code, (0, "Normal / Unspecified conditions"))

    if score == 0:
        explanation = f"No severe atmospheric phenomena indicated (WMO Code {code}: {description})."
    else:
        explanation = f"Active weather condition: {description} (WMO Code {code})."

    return {
        "score": score,
        "status": "available",
        "details": {
            "weather_code": code,
            "description": description,
        },
        "explanation": explanation,
    }


def calculate_risk_assessment(
    latitude: float,
    longitude: float,
    weather_data: Optional[Dict[str, Any]],
    earthquake_data: Optional[Dict[str, Any]],
) -> Dict[str, Any]:
    """
    Calculate the overall SafeRoute prototype risk assessment from weather and earthquake inputs.
    Weights:
      - Earthquake: 40%
      - Wind: 25%
      - Precipitation: 20%
      - Severe Weather: 15%
    """
    # Extract nested structures if full responses were passed
    if isinstance(weather_data, dict) and "weather" in weather_data:
        if weather_data.get("status") == "unavailable":
            normalized_weather = {"status": "unavailable"}
        else:
            normalized_weather = weather_data.get("weather") or {}
    else:
        normalized_weather = weather_data

    normalized_earthquakes = earthquake_data

    # Calculate individual factors
    eq_factor = calculate_earthquake_score(latitude, longitude, normalized_earthquakes)
    wind_factor = calculate_wind_score(normalized_weather)
    precip_factor = calculate_precipitation_score(normalized_weather)
    severe_factor = calculate_severe_weather_score(normalized_weather)

    factors = {
        "earthquake": eq_factor,
        "wind": wind_factor,
        "precipitation": precip_factor,
        "severe_weather": severe_factor,
    }

    unavailable_factors = [k for k, v in factors.items() if v.get("score") is None or v.get("status") == "unavailable"]

    if len(unavailable_factors) == 4:
        overall_score = None
        overall_level = "Unavailable"
        assessment_status = "unavailable"
    elif len(unavailable_factors) > 0:
        overall_score = None
        overall_level = "Unavailable"
        assessment_status = "partial"
    else:
        assessment_status = "available"
        # Weighted composite score
        overall_score = round(
            (eq_factor["score"] * 0.40)
            + (wind_factor["score"] * 0.25)
            + (precip_factor["score"] * 0.20)
            + (severe_factor["score"] * 0.15)
        )
        overall_score = max(0, min(100, overall_score))

        # Determine qualitative risk level
        if overall_score < 25:
            overall_level = "Low"
        elif overall_score < 50:
            overall_level = "Moderate"
        elif overall_score < 75:
            overall_level = "Elevated"
        else:
            overall_level = "High"

    return {
        "location": {
            "latitude": latitude,
            "longitude": longitude,
        },
        "status": assessment_status,
        "overall_score": overall_score,
        "overall_level": overall_level,
        "factors": factors,
        "disclaimer": (
            "SafeRoute prototype risk assessment based on available public meteorological "
            "and seismic data. Not an official alert, forecast, or emergency warning."
        ),
    }
