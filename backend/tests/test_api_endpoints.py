"""
API Endpoints Integration Test Suite for Milestone 8L
Verifies FastAPI routing, query parameter validation, HTTP status codes, and error mapping.
"""

import sys
import unittest
from unittest.mock import patch
import httpx

sys.path.insert(0, "C:/Users/amirh/Desktop/SafeRoute/backend")

from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)


class TestApiEndpoints(unittest.TestCase):
    def test_health_endpoint(self):
        resp = client.get("/api/health")
        self.assertEqual(resp.status_code, 200)
        data = resp.json()
        self.assertEqual(data["status"], "ok")

    def test_weather_param_validation(self):
        # Missing required latitude/longitude
        resp = client.get("/api/weather")
        self.assertEqual(resp.status_code, 422)

        # Invalid latitude out of bounds
        resp = client.get("/api/weather?latitude=100.0&longitude=0.0")
        self.assertEqual(resp.status_code, 422)

    @patch("app.main.fetch_current_weather")
    def test_weather_endpoint_success(self, mock_fetch):
        mock_fetch.return_value = {
            "status": "available",
            "weather": {"temperature": 20.0},
        }
        resp = client.get("/api/weather?latitude=37.77&longitude=-122.41")
        self.assertEqual(resp.status_code, 200)
        self.assertEqual(resp.json()["status"], "available")

    @patch("app.main.fetch_current_weather")
    def test_weather_endpoint_timeout(self, mock_fetch):
        mock_fetch.side_effect = httpx.TimeoutException("Weather timeout")
        resp = client.get("/api/weather?latitude=37.77&longitude=-122.41")
        self.assertEqual(resp.status_code, 504)
        self.assertIn("timed out", resp.json()["detail"])

    @patch("app.main.fetch_recent_earthquakes")
    def test_earthquakes_endpoint_success(self, mock_fetch):
        mock_fetch.return_value = {
            "status": "available",
            "count": 0,
            "earthquakes": [],
        }
        resp = client.get("/api/earthquakes?latitude=37.77&longitude=-122.41")
        self.assertEqual(resp.status_code, 200)
        self.assertEqual(resp.json()["status"], "available")

    @patch("app.main.fetch_recent_earthquakes")
    def test_earthquakes_endpoint_provider_error(self, mock_fetch):
        mock_fetch.side_effect = httpx.HTTPStatusError(
            "USGS 502",
            request=unittest.mock.MagicMock(),
            response=unittest.mock.MagicMock(status_code=502),
        )
        resp = client.get("/api/earthquakes?latitude=37.77&longitude=-122.41")
        self.assertEqual(resp.status_code, 502)

    @patch("app.main.search_locations")
    def test_geocode_endpoint_success(self, mock_search):
        mock_search.return_value = {
            "query": "Paris",
            "results": [
                {
                    "name": "Paris",
                    "latitude": 48.8566,
                    "longitude": 2.3522,
                    "display_name": "Paris, France",
                    "source": "Nominatim",
                }
            ],
            "source": "Nominatim",
        }
        resp = client.get("/api/geocode?query=Paris")
        self.assertEqual(resp.status_code, 200)
        self.assertEqual(len(resp.json()["results"]), 1)

    @patch("app.main.search_locations")
    def test_geocode_endpoint_empty_query(self, mock_search):
        resp = client.get("/api/geocode?query=")
        self.assertEqual(resp.status_code, 422)

    @patch("app.main.fetch_location_data")
    def test_location_endpoint_success(self, mock_loc):
        mock_loc.return_value = {
            "status": "available",
            "location": {"latitude": 37.77, "longitude": -122.41},
            "weather": {"status": "available"},
            "earthquakes": {"status": "available"},
            "risk_assessment": {
                "status": "available",
                "overall_score": 15,
                "overall_level": "Low",
                "factors": {},
            },
        }
        resp = client.get("/api/location?latitude=37.77&longitude=-122.41")
        self.assertEqual(resp.status_code, 200)
        self.assertEqual(resp.json()["status"], "available")
        self.assertEqual(resp.json()["risk_assessment"]["overall_level"], "Low")


if __name__ == "__main__":
    unittest.main(verbosity=2)
