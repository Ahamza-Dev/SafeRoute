const BACKEND_BASE_URL = "http://127.0.0.1:8001";

/**
 * Fetch aggregated weather, seismic, and risk assessment data from the SafeRoute backend.
 *
 * @param {number} latitude - Latitude coordinate (-90 to 90)
 * @param {number} longitude - Longitude coordinate (-180 to 180)
 * @returns {Promise<Object>} The aggregated SafeRoute location response
 */
export async function fetchLocationData(latitude, longitude) {
  const url = new URL("/api/location", BACKEND_BASE_URL);
  url.searchParams.set("latitude", latitude);
  url.searchParams.set("longitude", longitude);

  const response = await fetch(url.toString(), {
    method: "GET",
    headers: {
      "Accept": "application/json",
    },
  });

  if (!response.ok) {
    let errorDetail = `Request failed with status ${response.status}`;
    try {
      const errorJson = await response.json();
      if (errorJson?.detail) {
        errorDetail = typeof errorJson.detail === "string"
          ? errorJson.detail
          : JSON.stringify(errorJson.detail);
      }
    } catch {
      // Use fallback errorDetail if JSON parsing fails
    }
    throw new Error(errorDetail);
  }

  return await response.json();
}
