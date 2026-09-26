"""
Milestone 8L — Backend Data Reliability & Contract Hardening Test Suite
Verifies all 12 required test scenarios:
1. Normal successful weather response
2. Weather provider failure
3. Weather malformed/incomplete response
4. USGS successful response with events
5. USGS successful response with zero qualifying events
6. USGS provider failure
7. Missing/invalid earthquake fields
8. Nominatim failure
9. /api/location successful response
10. /api/location degraded/partial response
11. Risk behavior when provider data is unavailable
12. Existing low-risk/high-risk behavior remains valid
"""

import asyncio
import sys
import unittest
from unittest.mock import AsyncMock, patch
import httpx

# Ensure backend directory is in python path
sys.path.insert(0, "C:/Users/amirh/Desktop/SafeRoute/backend")

from app.services.weather import fetch_current_weather
from app.services.earthquakes import fetch_recent_earthquakes
from app.services.geocoding import search_locations
from app.services.risk import (
    calculate_earthquake_score,
    calculate_wind_score,
    calculate_precipitation_score,
    calculate_severe_weather_score,
    calculate_risk_assessment,
    haversine_distance,
)
from app.services.location import fetch_location_data


class TestWeatherReliability(unittest.IsolatedAsyncioTestCase):
    @patch("httpx.AsyncClient.get")
    async def test_01_normal_weather_success(self, mock_get):
        mock_resp = unittest.mock.MagicMock()
        mock_resp.status_code = 200
        mock_resp.json.return_value = {
            "current": {
                "temperature_2m": 22.5,
                "wind_speed_10m": 15.0,
                "wind_gusts_10m": 28.0,
                "precipitation": 0.0,
                "precipitation_probability": 10,
                "weather_code": 1,
            },
            "current_units": {
                "temperature_2m": "°C",
                "wind_speed_10m": "km/h",
                "wind_gusts_10m": "km/h",
                "precipitation": "mm",
                "precipitation_probability": "%",
            },
            "hourly": {
                "time": ["2026-09-26T12:00", "2026-09-26T13:00"],
                "temperature_2m": [22.0, 23.0],
                "precipitation_probability": [10, 15],
                "precipitation": [0.0, 0.0],
                "wind_speed_10m": [14.0, 15.0],
                "wind_gusts_10m": [25.0, 28.0],
                "weather_code": [1, 1],
            },
        }
        mock_get.return_value = mock_resp

        data = await fetch_current_weather(37.7749, -122.4194)
        self.assertEqual(data["status"], "available")
        self.assertEqual(data["weather"]["temperature"], 22.5)
        self.assertEqual(data["weather"]["wind_speed"], 15.0)
        self.assertEqual(data["weather"]["wind_gusts"], 28.0)
        self.assertEqual(data["weather"]["weather_code"], 1)
        self.assertEqual(len(data["weather"]["hourly_forecast"]["time"]), 2)

    @patch("httpx.AsyncClient.get")
    async def test_02_weather_provider_timeout_failure(self, mock_get):
        mock_get.side_effect = httpx.TimeoutException("Connection timed out")

        with self.assertRaises(httpx.TimeoutException):
            await fetch_current_weather(37.7749, -122.4194)

    @patch("httpx.AsyncClient.get")
    async def test_03_weather_malformed_incomplete_response(self, mock_get):
        mock_resp = unittest.mock.MagicMock()
        mock_resp.status_code = 200
        # Malformed: missing current_units, missing hourly, string/corrupted fields in current
        mock_resp.json.return_value = {
            "current": {
                "temperature_2m": "invalid_temp",
                "wind_speed_10m": 12.0,
                "wind_gusts_10m": None,
                "precipitation": None,
                "weather_code": "unknown_code",
            }
        }
        mock_get.return_value = mock_resp

        data = await fetch_current_weather(37.7749, -122.4194)
        self.assertEqual(data["status"], "available")
        self.assertIsNone(data["weather"]["temperature"])
        self.assertEqual(data["weather"]["wind_speed"], 12.0)
        self.assertIsNone(data["weather"]["wind_gusts"])
        self.assertIsNone(data["weather"]["weather_code"])
        self.assertEqual(data["weather"]["hourly_forecast"]["time"], [])



class TestEarthquakeReliability(unittest.IsolatedAsyncioTestCase):
    @patch("httpx.AsyncClient.get")
    async def test_04_usgs_successful_with_events(self, mock_get):
        mock_resp = unittest.mock.MagicMock()
        mock_resp.status_code = 200
        mock_resp.json.return_value = {
            "type": "FeatureCollection",
            "features": [
                {
                    "id": "nc73900001",
                    "properties": {
                        "mag": 4.2,
                        "place": "12km N of San Francisco, CA",
                        "time": 1727376000000,
                        "url": "https://earthquake.usgs.gov/earthquakes/eventpage/nc73900001",
                        "status": "reviewed",
                        "significance": 270,
                    },
                    "geometry": {
                        "type": "Point",
                        "coordinates": [-122.4194, 37.8749, 10.5],
                    },
                }
            ],
        }
        mock_get.return_value = mock_resp

        data = await fetch_recent_earthquakes(37.7749, -122.4194)
        self.assertEqual(data["status"], "available")
        self.assertEqual(data["count"], 1)
        self.assertEqual(len(data["earthquakes"]), 1)
        eq = data["earthquakes"][0]
        self.assertEqual(eq["id"], "nc73900001")
        self.assertEqual(eq["magnitude"], 4.2)
        self.assertAlmostEqual(eq["latitude"], 37.8749)
        self.assertAlmostEqual(eq["longitude"], -122.4194)
        self.assertEqual(eq["depth_km"], 10.5)

    @patch("httpx.AsyncClient.get")
    async def test_05_usgs_successful_zero_qualifying_events(self, mock_get):
        mock_resp = unittest.mock.MagicMock()
        mock_resp.status_code = 200
        mock_resp.json.return_value = {
            "type": "FeatureCollection",
            "features": [],
        }
        mock_get.return_value = mock_resp

        data = await fetch_recent_earthquakes(37.7749, -122.4194)
        self.assertEqual(data["status"], "available")
        self.assertEqual(data["count"], 0)
        self.assertEqual(data["earthquakes"], [])

    @patch("httpx.AsyncClient.get")
    async def test_06_usgs_provider_failure(self, mock_get):
        mock_get.side_effect = httpx.HTTPStatusError(
            "Service Unavailable",
            request=unittest.mock.MagicMock(),
            response=unittest.mock.MagicMock(status_code=503),
        )

        with self.assertRaises(httpx.HTTPStatusError):
            await fetch_recent_earthquakes(37.7749, -122.4194)

    @patch("httpx.AsyncClient.get")
    async def test_07_usgs_malformed_features(self, mock_get):
        mock_resp = unittest.mock.MagicMock()
        mock_resp.status_code = 200
        mock_resp.json.return_value = {
            "type": "FeatureCollection",
            "features": [
                # Feature missing geometry
                {"id": "eq_bad_1", "properties": {"mag": 4.5}},
                # Feature with invalid coordinates
                {
                    "id": "eq_bad_2",
                    "properties": {"mag": 4.5},
                    "geometry": {"coordinates": ["invalid", "bad"]},
                },
                # Feature with missing magnitude
                {
                    "id": "eq_bad_3",
                    "properties": {"mag": None},
                    "geometry": {"coordinates": [-122.0, 37.0, 5.0]},
                },
                # Valid feature
                {
                    "id": "eq_valid",
                    "properties": {
                        "mag": 3.5,
                        "place": "San Jose",
                        "time": 1727376000000,
                    },
                    "geometry": {"coordinates": [-121.88, 37.33, 8.0]},
                },
            ],
        }
        mock_get.return_value = mock_resp

        data = await fetch_recent_earthquakes(37.7749, -122.4194)
        self.assertEqual(data["status"], "available")
        self.assertEqual(data["count"], 1)
        self.assertEqual(data["earthquakes"][0]["id"], "eq_valid")


class TestGeocodingReliability(unittest.IsolatedAsyncioTestCase):
    @patch("httpx.AsyncClient.get")
    async def test_08_nominatim_failure_and_fallback(self, mock_get):
        mock_get.side_effect = httpx.TimeoutException("Nominatim timed out")

        with self.assertRaises(httpx.TimeoutException):
            await search_locations("Tokyo")


class TestLocationAggregationAndDegradedStates(unittest.IsolatedAsyncioTestCase):
    @patch("app.services.location.fetch_recent_earthquakes")
    @patch("app.services.location.fetch_current_weather")
    async def test_09_location_all_available(self, mock_weather, mock_earthquakes):
        mock_weather.return_value = {
            "status": "available",
            "weather": {
                "temperature": 18.0,
                "wind_speed": 10.0,
                "wind_gusts": 15.0,
                "precipitation": 0.0,
                "precipitation_probability": 5,
                "weather_code": 0,
                "hourly_forecast": [],
            },
        }
        mock_earthquakes.return_value = {
            "status": "available",
            "search_radius_km": 250,
            "count": 0,
            "earthquakes": [],
        }

        result = await fetch_location_data(37.7749, -122.4194)
        self.assertEqual(result["status"], "available")
        self.assertEqual(result["weather"]["status"], "available")
        self.assertEqual(result["earthquakes"]["status"], "available")
        self.assertEqual(result["earthquakes"]["count"], 0)
        self.assertEqual(result["risk_assessment"]["status"], "available")
        self.assertEqual(result["risk_assessment"]["overall_score"], 0)
        self.assertEqual(result["risk_assessment"]["overall_level"], "Low")

    @patch("app.services.location.fetch_recent_earthquakes")
    @patch("app.services.location.fetch_current_weather")
    async def test_10_location_partial_degraded_weather_failure(
        self, mock_weather, mock_earthquakes
    ):
        # Weather times out, USGS succeeds with 0 events
        mock_weather.side_effect = httpx.TimeoutException("Open-Meteo timeout")
        mock_earthquakes.return_value = {
            "status": "available",
            "search_radius_km": 250,
            "count": 0,
            "earthquakes": [],
        }

        result = await fetch_location_data(37.7749, -122.4194)
        self.assertEqual(result["status"], "partial")
        self.assertEqual(result["weather"]["status"], "unavailable")
        self.assertEqual(result["earthquakes"]["status"], "available")
        self.assertEqual(result["earthquakes"]["count"], 0)
        self.assertEqual(result["risk_assessment"]["status"], "partial")
        self.assertIsNone(result["risk_assessment"]["overall_score"])
        self.assertEqual(result["risk_assessment"]["overall_level"], "Unavailable")
        # Factors: earthquake is available (score 0), weather factors are unavailable (score None)
        factors = result["risk_assessment"]["factors"]
        self.assertEqual(factors["earthquake"]["status"], "available")
        self.assertEqual(factors["earthquake"]["score"], 0)
        self.assertEqual(factors["wind"]["status"], "unavailable")
        self.assertIsNone(factors["wind"]["score"])

    @patch("app.services.location.fetch_recent_earthquakes")
    @patch("app.services.location.fetch_current_weather")
    async def test_10b_location_partial_degraded_earthquake_failure(
        self, mock_weather, mock_earthquakes
    ):
        # Weather succeeds, USGS times out
        mock_weather.return_value = {
            "status": "available",
            "weather": {
                "temperature": 20.0,
                "wind_speed": 40.0,
                "wind_gusts": 60.0,
                "precipitation": 5.0,
                "precipitation_probability": 80,
                "weather_code": 63,
                "hourly_forecast": [],
            },
        }
        mock_earthquakes.side_effect = httpx.RequestError("USGS offline")

        result = await fetch_location_data(37.7749, -122.4194)
        self.assertEqual(result["status"], "partial")
        self.assertEqual(result["weather"]["status"], "available")
        self.assertEqual(result["earthquakes"]["status"], "unavailable")
        self.assertIsNone(result["earthquakes"]["count"])
        self.assertIsNone(result["earthquakes"]["events"])
        self.assertEqual(result["risk_assessment"]["status"], "partial")
        self.assertIsNone(result["risk_assessment"]["overall_score"])
        self.assertEqual(result["risk_assessment"]["overall_level"], "Unavailable")
        # Factors: earthquake is unavailable, weather factors have valid scores
        factors = result["risk_assessment"]["factors"]
        self.assertEqual(factors["earthquake"]["status"], "unavailable")
        self.assertIsNone(factors["earthquake"]["score"])
        self.assertEqual(factors["wind"]["status"], "available")
        self.assertEqual(factors["wind"]["score"], 50)


class TestRiskEngineTruthfulness(unittest.TestCase):
    def test_11_risk_behavior_when_provider_unavailable(self):
        # When all provider feeds are unavailable, score must be None and level 'Unavailable'
        unavailable_weather = {"status": "unavailable"}
        unavailable_earthquakes = {"status": "unavailable", "events": None}

        result = calculate_risk_assessment(
            37.7749, -122.4194, unavailable_weather, unavailable_earthquakes
        )
        self.assertEqual(result["status"], "unavailable")
        self.assertIsNone(result["overall_score"])
        self.assertEqual(result["overall_level"], "Unavailable")
        for factor_name, factor_data in result["factors"].items():
            self.assertEqual(factor_data["status"], "unavailable")
            self.assertIsNone(factor_data["score"])

    def test_12_existing_risk_algorithm_preservation(self):
        # Verify exact algorithm weights: Eq 40%, Wind 25%, Precip 20%, Severe 15%
        # Low risk scenario
        weather_low = {
            "status": "available",
            "wind_speed": 10.0,
            "wind_gusts": 15.0,
            "precipitation": 0.0,
            "precipitation_probability": 0,
            "weather_code": 0,
        }
        earthquakes_none = {
            "status": "available",
            "events": [],
        }
        res_low = calculate_risk_assessment(0.0, 0.0, weather_low, earthquakes_none)
        self.assertEqual(res_low["overall_score"], 0)
        self.assertEqual(res_low["overall_level"], "Low")

        # High risk scenario
        # Eq score: M7.0 at 10km (score = 100 * 1.0 * 1.0 * 1.0 = 100) -> 40 pts
        # Wind score: gusts 95 km/h (score = 100) -> 25 pts
        # Precip score: 20 mm (score = 100) -> 20 pts
        # Severe code: 99 (Thunderstorm with heavy hail, score = 100) -> 15 pts
        # Total = 40 + 25 + 20 + 15 = 100
        from datetime import datetime, timezone

        now_str = datetime.now(timezone.utc).isoformat()
        earthquakes_high = {
            "status": "available",
            "events": [
                {
                    "id": "test_high",
                    "latitude": 0.05,
                    "longitude": 0.05,
                    "magnitude": 7.0,
                    "depth_km": 10.0,
                    "time": now_str,
                    "place": "Epicenter Zone",
                }
            ],
        }
        weather_high = {
            "status": "available",
            "wind_speed": 80.0,
            "wind_gusts": 95.0,
            "precipitation": 20.0,
            "precipitation_probability": 100,
            "weather_code": 99,
        }
        res_high = calculate_risk_assessment(0.0, 0.0, weather_high, earthquakes_high)
        self.assertEqual(res_high["overall_score"], 100)
        self.assertEqual(res_high["overall_level"], "High")


if __name__ == "__main__":
    unittest.main(verbosity=2)
