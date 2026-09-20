import { Activity, Clock, MapPin } from 'lucide-react'
import { Card, CardHeader, CardTitle, CardContent, Badge, MetricDisplay } from '@/components/ui'

/**
 * Format ISO timestamp into human-readable UTC string.
 */
function formatEventTime(isoString) {
  if (!isoString) return '—'
  try {
    const d = new Date(isoString)
    return d.toUTCString().replace('GMT', 'UTC')
  } catch {
    return isoString
  }
}

export function SeismicTelemetry({
  earthquakes,
  seismicFactor,
}) {
  const events = earthquakes?.events || []
  const radiusKm = earthquakes?.search_radius_km || 250
  const mostRelevant = seismicFactor?.details

  // Find strongest earthquake in the list if details not passed
  const topEvent = mostRelevant || (events.length > 0 ? events[0] : null)

  return (
    <Card variant="default" className="overflow-hidden border-slate-700/80">
      <CardHeader className="pb-3 border-b border-slate-800/80 bg-slate-950/40">
        <div className="flex items-center justify-between gap-3">
          <CardTitle className="text-sm font-semibold text-white">
            <Activity className="w-4 h-4 text-orange-400" aria-hidden="true" />
            <span>Seismic Telemetry</span>
          </CardTitle>
          <Badge variant="secondary" size="sm">USGS (250 km Radius)</Badge>
        </div>
      </CardHeader>

      <CardContent className="pt-4 space-y-4">
        {/* Metric Summary Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          <MetricDisplay
            label="Total Events (30d)"
            value={events.length}
            subtext={`M ≥ 3.0 within ${radiusKm}km`}
            icon={Activity}
            iconColor="text-orange-400"
          />
          <MetricDisplay
            label="Highest Magnitude"
            value={topEvent?.magnitude ? `M ${topEvent.magnitude}` : 'None recorded'}
            subtext={topEvent?.place ? topEvent.place.split(',')[0] : 'No matching events'}
            icon={Activity}
            iconColor="text-red-400"
          />
          <MetricDisplay
            label="Closest Event"
            value={topEvent?.distance_km !== undefined ? `${topEvent.distance_km} km` : (events.length > 0 ? 'Recorded' : 'None in range')}
            subtext="Distance to target"
            icon={MapPin}
            iconColor="text-cyan-400"
          />
        </div>

        {/* Most Relevant Event Detailed Banner */}
        {topEvent ? (
          <div className="p-3.5 rounded-lg bg-slate-950/60 border border-slate-800/80 space-y-2">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded text-xs font-bold bg-orange-500/15 text-orange-300 border border-orange-500/30 font-tabular">
                  M {topEvent.magnitude}
                </span>
                <span className="text-xs font-semibold text-slate-200 truncate max-w-sm">
                  {topEvent.place || 'Seismic Event'}
                </span>
              </div>
              {topEvent.distance_km !== undefined && (
                <span className="text-[11px] text-slate-400 font-mono font-tabular">
                  {topEvent.distance_km} km away
                </span>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] text-slate-400">
              {topEvent.depth_km !== undefined && topEvent.depth_km !== null && (
                <span>Focal Depth: <strong className="text-slate-300 font-tabular">{topEvent.depth_km} km</strong></span>
              )}
              {topEvent.time && (
                <span className="flex items-center gap-1 font-tabular">
                  <Clock className="w-3 h-3 text-slate-500" />
                  {formatEventTime(topEvent.time)}
                </span>
              )}
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-2.5 p-3 rounded-lg bg-slate-950/60 border border-slate-800 text-xs text-slate-400">
            <Activity className="w-4 h-4 text-slate-500 shrink-0" aria-hidden="true" />
            <span>No M ≥ 3.0 events recorded within 250 km in the past 30 days.</span>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
