import { useState, useEffect, useRef, useCallback } from 'react'
import { AlertCircle, RefreshCw } from 'lucide-react'
import { fetchLocationData } from '@/services/api'
import { LocationHeader } from './LocationHeader'
import { RiskOverviewCard } from './RiskOverviewCard'
import { WeatherTelemetry } from './WeatherTelemetry'
import { SeismicTelemetry } from './SeismicTelemetry'
import { AnalysisPathways } from './AnalysisPathways'
import { MapView } from '@/components/map'
import { Button, Card, CardHeader, CardContent, Skeleton } from '@/components/ui'
import { cn } from '@/lib/utils'

function DashboardSkeleton({ locationName }) {
  return (
    <div
      className="space-y-6 animate-fade-in"
      aria-busy="true"
      aria-live="polite"
    >
      <span className="sr-only">
        Loading situational telemetry and environmental risk data for {locationName}...
      </span>

      {/* Risk Overview Skeleton */}
      <Card variant="elevated" className="overflow-hidden border-slate-700/80">
        <CardHeader className="pb-3 border-b border-slate-800/80 bg-slate-950/40">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <Skeleton className="w-4 h-4 rounded-full" />
              <Skeleton className="h-4 w-48 sm:w-56" />
            </div>
            <Skeleton className="h-5 w-20 sm:w-24 rounded" />
          </div>
        </CardHeader>
        <CardContent className="pt-4 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl bg-slate-950/60 border border-slate-800/80">
            <div className="space-y-2 max-w-xl w-full">
              <Skeleton className="h-3 w-36" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-3 w-4/5" />
            </div>
            <div className="flex flex-col items-start sm:items-end gap-1.5 shrink-0 pt-2 sm:pt-0">
              <Skeleton className="h-8 w-24" />
              <Skeleton className="h-3 w-32" />
            </div>
          </div>
          <div className="space-y-1.5">
            <div className="flex justify-between">
              <Skeleton className="h-2.5 w-12" />
              <Skeleton className="h-2.5 w-16" />
              <Skeleton className="h-2.5 w-16" />
              <Skeleton className="h-2.5 w-12" />
              <Skeleton className="h-2.5 w-8" />
            </div>
            <Skeleton className="h-2.5 w-full rounded-full" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="p-3.5 rounded-lg bg-slate-950/60 border border-slate-800/80 space-y-2.5">
                <div className="flex justify-between items-center">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-4 w-12" />
                </div>
                <Skeleton className="h-1.5 w-full rounded-full" />
                <Skeleton className="h-8 w-full rounded" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Weather & Seismic Grid Skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Weather Skeleton */}
        <Card variant="default" className="overflow-hidden border-slate-700/80">
          <CardHeader className="pb-3 border-b border-slate-800/80 bg-slate-950/40">
            <div className="flex items-center justify-between">
              <Skeleton className="h-4 w-40" />
              <Skeleton className="h-5 w-20 rounded" />
            </div>
          </CardHeader>
          <CardContent className="pt-4 space-y-4">
            <Skeleton className="h-10 w-full rounded-lg" />
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <Skeleton key={i} className="h-16 w-full rounded-lg" />
              ))}
            </div>
            <Skeleton className="h-[175px] sm:h-[195px] w-full rounded-lg" />
          </CardContent>
        </Card>

        {/* Seismic Skeleton */}
        <Card variant="default" className="overflow-hidden border-slate-700/80">
          <CardHeader className="pb-3 border-b border-slate-800/80 bg-slate-950/40">
            <div className="flex items-center justify-between">
              <Skeleton className="h-4 w-36" />
              <Skeleton className="h-5 w-24 rounded" />
            </div>
          </CardHeader>
          <CardContent className="pt-4 space-y-4">
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className={cn('h-16 w-full rounded-lg', i === 3 && 'col-span-2 sm:col-span-1')} />
              ))}
            </div>
            <Skeleton className="h-16 w-full rounded-lg" />
            <Skeleton className="h-[175px] sm:h-[195px] w-full rounded-lg" />
          </CardContent>
        </Card>
      </div>

      {/* Map Skeleton */}
      <Card variant="default" className="overflow-hidden border-slate-700/80">
        <CardHeader className="pb-3 border-b border-slate-800/80 bg-slate-950/40">
          <div className="flex items-center justify-between">
            <Skeleton className="h-4 w-44" />
            <Skeleton className="h-4 w-32" />
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <Skeleton className="h-[320px] sm:h-[400px] md:h-[460px] w-full rounded-none" />
        </CardContent>
      </Card>
    </div>
  )
}

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

      {/* Non-blocking error banner if a subsequent refresh fails while data exists */}
      {error && data && (
        <div
          role="alert"
          aria-live="polite"
          className="flex flex-wrap items-center justify-between gap-3 p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-xs text-amber-200"
        >
          <div className="flex items-center gap-2 min-w-0">
            <AlertCircle className="w-4 h-4 text-amber-400 shrink-0" aria-hidden="true" />
            <span className="truncate">
              Telemetry update failed: {error}. Showing last retrieved assessment.
            </span>
          </div>
          <Button
            variant="secondary"
            size="sm"
            onClick={handleRefresh}
            className="border-amber-500/30 text-amber-100 hover:text-white shrink-0"
            aria-label="Retry updating telemetry data"
          >
            <RefreshCw className="w-3 h-3" />
            Retry
          </Button>
        </div>
      )}

      {/* Loading State (Initial Fetch via Skeleton) */}
      {loading && !data && (
        <DashboardSkeleton locationName={location.name || 'Target Location'} />
      )}

      {/* Initial Fetch Error State with Retry */}
      {!loading && error && !data && (
        <Card
          variant="default"
          className="border-red-500/30 bg-red-950/20 p-6 space-y-4"
          role="alert"
          aria-live="assertive"
        >
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
              aria-label="Retry retrieving telemetry data"
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
                aria-label="Choose another location"
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
