import { useMemo } from 'react'
import { Activity, Clock, MapPin } from 'lucide-react'
import { Card, CardHeader, CardTitle, CardContent, Badge, MetricDisplay } from '@/components/ui'
import { calculateHaversineDistance } from '@/lib/utils'
import { EarthquakeActivityChart } from './EarthquakeActivityChart'

/**
 * Format ISO timestamp into human-readable UTC string.
 */
function formatEventTime(isoString) {
  if (!isoString) return '—'
  try {
    const d = new Date(isoString)
    if (isNaN(d.getTime())) return isoString
    return d.toUTCString().replace('GMT', 'UTC')
  } catch {
    return isoString
  }
}

export function SeismicTelemetry({
  earthquakes,
  seismicFactor,
  location,
}) {
  const events = earthquakes?.events
  const radiusKm = earthquakes?.search_radius_km || 250
  const mostRelevant = seismicFactor?.details

  const targetLat = location?.latitude ?? earthquakes?.location?.latitude
  const targetLon = location?.longitude ?? earthquakes?.location?.longitude

  // Calculate distance from target coordinates for every event if coordinates are available
  const enrichedEvents = useMemo(() => {
    if (!Array.isArray(events) || events.length === 0) return []

    return events.map((e) => {
      if (!e || typeof e !== 'object') return e
      let dist = e.distance_km
      if (
        (dist === undefined || dist === null) &&
        typeof e.latitude === 'number' &&
        typeof e.longitude === 'number' &&
        typeof targetLat === 'number' &&
        typeof targetLon === 'number'
      ) {
        dist = calculateHaversineDistance(targetLat, targetLon, e.latitude, e.longitude)
      }
      return {
        ...e,
        distance_km: dist,
      }
    })
  }, [events, targetLat, targetLon])

  // Truthfully find the highest-magnitude event
  const highestMagEvent = useMemo(() => {
    const valid = enrichedEvents.filter(
      (e) => typeof e.magnitude === 'number' && !isNaN(e.magnitude)
    )
    if (valid.length === 0) return null
    return valid.reduce((prev, curr) => (curr.magnitude > prev.magnitude ? curr : prev))
  }, [enrichedEvents])

  // Truthfully find the closest event to target location
  const closestEvent = useMemo(() => {
    const valid = enrichedEvents.filter(
      (e) => typeof e.distance_km === 'number' && !isNaN(e.distance_km)
    )
    if (valid.length === 0) return null
    return valid.reduce((prev, curr) => (curr.distance_km < prev.distance_km ? curr : prev))
  }, [enrichedEvents])

  // Featured event for detailed callout banner: most relevant from risk factor or highest magnitude
  const featuredEvent = mostRelevant || highestMagEvent || (enrichedEvents.length > 0 ? enrichedEvents[0] : null)

  return (
    <Card variant="default" className="overflow-hidden border-slate-700/80">
      <CardHeader className="pb-3 border-b border-slate-800/80 bg-slate-950/40">
        <div className="flex items-center justify-between gap-3">
          <CardTitle className="text-sm font-semibold text-white">
            <Activity className="w-4 h-4 text-orange-400" aria-hidden="true" />
            <span>Seismic Telemetry</span>
          </CardTitle>
          <Badge variant="secondary" size="sm">USGS ({radiusKm} km Radius)</Badge>
        </div>
      </CardHeader>

      <CardContent className="pt-4 space-y-4">
        {/* Metric Summary Grid with Truthful Calculations */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          <MetricDisplay
            label="Total Events (30d)"
            value={enrichedEvents.length}
            subtext={`M ≥ 3.0 within ${radiusKm}km`}
            icon={Activity}
            iconColor="text-orange-400"
          />
          <MetricDisplay
            label="Highest Magnitude"
            value={
              highestMagEvent?.magnitude !== null && highestMagEvent?.magnitude !== undefined
                ? `M ${highestMagEvent.magnitude.toFixed(1)}`
                : 'None recorded'
            }
            subtext={highestMagEvent?.place ? highestMagEvent.place.split(',')[0] : 'No matching events'}
            icon={Activity}
            iconColor="text-red-400"
          />
          <MetricDisplay
            label="Closest Event"
            value={
              closestEvent?.distance_km !== null && closestEvent?.distance_km !== undefined
                ? `${closestEvent.distance_km} km`
                : (enrichedEvents.length > 0 ? 'Recorded' : 'None in range')
            }
            subtext={closestEvent?.place ? closestEvent.place.split(',')[0] : 'Distance to target'}
            icon={MapPin}
            iconColor="text-cyan-400"
            className="col-span-2 sm:col-span-1"
          />
        </div>

        {/* Featured / Most Relevant Event Detailed Banner */}
        {featuredEvent ? (
          <div className="p-3.5 rounded-lg bg-slate-950/60 border border-slate-800/80 space-y-2 transition-all duration-200 hover:border-slate-700/80 hover:bg-slate-900/80">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded text-xs font-bold bg-orange-500/15 text-orange-300 border border-orange-500/30 font-tabular">
                  M {typeof featuredEvent.magnitude === 'number' ? featuredEvent.magnitude.toFixed(1) : '—'}
                </span>
                <span className="text-xs font-semibold text-slate-200 truncate max-w-sm">
                  {featuredEvent.place || 'Seismic Event'}
                </span>
              </div>
              {featuredEvent.distance_km !== undefined && featuredEvent.distance_km !== null && (
                <span className="text-[11px] text-slate-400 font-mono font-tabular">
                  {featuredEvent.distance_km} km away
                </span>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] text-slate-400">
              {featuredEvent.depth_km !== undefined && featuredEvent.depth_km !== null && (
                <span>Focal Depth: <strong className="text-slate-300 font-tabular">{featuredEvent.depth_km} km</strong></span>
              )}
              {featuredEvent.time && (
                <span className="flex items-center gap-1 font-tabular">
                  <Clock className="w-3 h-3 text-slate-500" />
                  {formatEventTime(featuredEvent.time)}
                </span>
              )}
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-2.5 p-3 rounded-lg bg-slate-950/60 border border-slate-800 text-xs text-slate-400">
            <Activity className="w-4 h-4 text-slate-500 shrink-0" aria-hidden="true" />
            <span>No M ≥ 3.0 events recorded within {radiusKm} km in the past 30 days.</span>
          </div>
        )}

        {/* 30-Day Seismic Activity Timeline Visualization (Milestone 8G) */}
        <EarthquakeActivityChart
          events={enrichedEvents}
          searchRadiusKm={radiusKm}
        />
      </CardContent>
    </Card>
  )
}
