const BACKEND_BASE_URL = 'http://127.0.0.1:8001'

/**
 * Search locations matching a query string using the SafeRoute backend geocoding endpoint.
 *
 * @param {string} query - Location search query (e.g. city name, address)
 * @param {AbortSignal} [signal] - Optional signal to cancel an in-flight search request
 * @returns {Promise<{ query: string, results: Array<{ name: string, latitude: number, longitude: number, display_name: string, source: string }> }>}
 */
export async function searchLocations(query, signal) {
  const cleanQuery = query?.trim()
  if (!cleanQuery) {
    return { query: '', results: [], source: 'Nominatim' }
  }

  const url = new URL('/api/geocode', BACKEND_BASE_URL)
  url.searchParams.set('query', cleanQuery)

  try {
    const response = await fetch(url.toString(), {
      method: 'GET',
      headers: {
        Accept: 'application/json',
      },
      signal,
    })

    if (!response.ok) {
      let errorDetail = `Search request failed with status ${response.status}`
      try {
        const errorJson = await response.json()
        if (errorJson?.detail) {
          errorDetail = typeof errorJson.detail === 'string'
            ? errorJson.detail
            : JSON.stringify(errorJson.detail)
        }
      } catch {
        // Fallback errorDetail
      }
      throw new Error(errorDetail)
    }

    return await response.json()
  } catch (error) {
    if (error.name === 'AbortError') {
      throw error
    }
    // Re-throw formatted error for consumer handling
    throw new Error(error.message || 'Unable to connect to location search service.')
  }
}

/**
 * Fetch aggregated weather, seismic, and risk assessment data from the SafeRoute backend.
 *
 * @param {number} latitude - Latitude coordinate (-90 to 90)
 * @param {number} longitude - Longitude coordinate (-180 to 180)
 * @param {AbortSignal} [signal] - Optional cancellation signal
 * @returns {Promise<Object>} The aggregated SafeRoute location response
 */
export async function fetchLocationData(latitude, longitude, signal) {
  const url = new URL('/api/location', BACKEND_BASE_URL)
  url.searchParams.set('latitude', latitude)
  url.searchParams.set('longitude', longitude)

  try {
    const response = await fetch(url.toString(), {
      method: 'GET',
      headers: {
        Accept: 'application/json',
      },
      signal,
    })

    if (!response.ok) {
      let errorDetail = `Request failed with status ${response.status}`
      try {
        const errorJson = await response.json()
        if (errorJson?.detail) {
          errorDetail = typeof errorJson.detail === 'string'
            ? errorJson.detail
            : JSON.stringify(errorJson.detail)
        }
      } catch {
        // Use fallback errorDetail if JSON parsing fails
      }
      throw new Error(errorDetail)
    }

    return await response.json()
  } catch (error) {
    if (error.name === 'AbortError') {
      throw error
    }
    throw new Error(error.message || 'Unable to connect to location telemetry service.')
  }
}
