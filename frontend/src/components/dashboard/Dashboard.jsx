import { useState, useEffect, useRef, useCallback } from 'react'
import { AlertCircle, RefreshCw, Loader2 } from 'lucide-react'
import { fetchLocationData } from '@/services/api'
import { LocationHeader } from './LocationHeader'
import { RiskOverviewCard } from './RiskOverviewCard'
import { WeatherTelemetry } from './WeatherTelemetry'
import { SeismicTelemetry } from './SeismicTelemetry'
import { AnalysisPathways } from './AnalysisPathways'
import { MapView } from '@/components/map'
import { Button, Card } from '@/components/ui'

export function Dashboard({
  location,
  onChangeLocation,
}) {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const abortControllerRef = useRef(null)
  const requestSeqRef = useRef(0)

  // Load aggregated location telemetry from FastAPI backend
  const loadTelemetry = useCallback(async (targetLocation) => {
    if (!targetLocation || typeof targetLocation.latitude !== 'number' || typeof targetLocation.longitude !== 'number') {
      setData(null)
      setLoading(false)
      setError(null)
      return
    }

    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
    }

    const controller = new AbortController()
    abortControllerRef.current = controller
    const currentSeq = ++requestSeqRef.current

    setLoading(true)
    setError(null)

    try {
      const result = await fetchLocationData(
        targetLocation.latitude,
        targetLocation.longitude,
        controller.signal
      )

      if (currentSeq === requestSeqRef.current) {
        setData(result)
      }
    } catch (err) {
      if (err.name === 'AbortError' || currentSeq !== requestSeqRef.current) {
        return
      }
      setError(err.message || 'Unable to retrieve telemetry data for the selected location.')
    } finally {
      if (currentSeq === requestSeqRef.current) {
        setLoading(false)
      }
    }
  }, [])

  // Fetch telemetry whenever target location coordinates change
  useEffect(() => {
    let ignore = false
    const controller = new AbortController()
    abortControllerRef.current = controller
    const currentSeq = ++requestSeqRef.current

    if (!location || typeof location.latitude !== 'number' || typeof location.longitude !== 'number') {
      return
    }

    async function fetchInitial() {
      setLoading(true)
      setError(null)
      try {
        const result = await fetchLocationData(
          location.latitude,
          location.longitude,
          controller.signal
        )
        if (!ignore && currentSeq === requestSeqRef.current) {
          setData(result)
        }
      } catch (err) {
        if (!ignore && err.name !== 'AbortError' && currentSeq === requestSeqRef.current) {
          setError(err.message || 'Unable to retrieve telemetry data for the selected location.')
        }
      } finally {
        if (!ignore && currentSeq === requestSeqRef.current) {
          setLoading(false)
        }
      }
    }

    fetchInitial()

    return () => {
      ignore = true
      controller.abort()
    }
  }, [location])

  const handleRefresh = () => {
    loadTelemetry(location)
  }

  if (!location) return null

  return (
    <div className="space-y-6">
      {/* Target Location Context Anchor */}
      <LocationHeader
        location={location}
        loading={loading}
        onRefresh={handleRefresh}
        onChangeLocation={onChangeLocation}
      />

      {/* Loading State (Initial Fetch) */}
      {loading && !data && (
        <Card variant="glass" className="p-12 text-center space-y-3">
          <Loader2 className="w-8 h-8 text-cyan-400 animate-spin mx-auto" aria-hidden="true" />
          <p className="text-sm font-semibold text-slate-200">
            Retrieving situational telemetry for {location.name}...
          </p>
          <p className="text-xs text-slate-400 max-w-md mx-auto leading-relaxed">
            Querying Open-Meteo atmospheric models, USGS seismic feeds, and deterministic risk algorithms.
          </p>
        </Card>
      )}

      {/* Error State with Retry */}
      {!loading && error && !data && (
        <Card variant="default" className="border-red-500/30 bg-red-950/20 p-6 space-y-4">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" aria-hidden="true" />
            <div className="space-y-1">
              <h3 className="text-sm font-bold text-red-200">Telemetry Data Unavailable</h3>
              <p className="text-xs text-slate-300 leading-relaxed max-w-xl">
                {error}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 pt-2">
            <Button
              variant="secondary"
              size="sm"
              onClick={handleRefresh}
              className="border-red-500/30 text-slate-200 hover:text-white"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              Retry Telemetry Query
            </Button>
            {onChangeLocation && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onChangeLocation}
                className="text-slate-400"
              >
                Choose Another Location
              </Button>
            )}
          </div>
        </Card>
      )}

      {/* Active Telemetry Dashboard Presentation */}
      {data && (
        <div className="space-y-6">
          {/* Top Anchor: Concise Situational Risk Overview */}
          <RiskOverviewCard
            riskAssessment={data.risk_assessment}
          />

          {/* Environmental & Seismic Intelligence Split */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <WeatherTelemetry
              weather={data.weather}
              loading={loading}
            />
            <SeismicTelemetry
              earthquakes={data.earthquakes}
              seismicFactor={data.risk_assessment?.factors?.earthquake}
              location={data.location || location}
            />
          </div>

          {/* Interactive Geospatial Map Viewport (Milestone 8E) */}
          <MapView location={location} />

          {/* Deep-Analysis Roadmap Pathways */}
          <AnalysisPathways />
        </div>
      )}
    </div>
  )
}
