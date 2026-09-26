import { useMemo } from 'react'
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Cell,
} from 'recharts'
import { Activity, MapPin, Clock } from 'lucide-react'
import { Badge } from '@/components/ui'

/**
 * Custom dark glassmorphic tooltip for earthquake activity events.
 */
function EarthquakeCustomTooltip({ active, payload }) {
  if (!active || !payload || !payload.length) {
    return null
  }

  const data = payload[0]?.payload
  if (!data) return null

  const magColorClass =
    data.magnitude >= 5.0
      ? 'text-red-300 bg-red-500/20 border-red-500/40'
      : data.magnitude >= 4.0
      ? 'text-orange-300 bg-orange-500/20 border-orange-500/40'
      : 'text-amber-300 bg-amber-500/20 border-amber-500/40'

  return (
    <div className="rounded-xl border border-orange-500/30 bg-slate-950/95 p-3 shadow-2xl backdrop-blur-md text-xs space-y-2 min-w-[210px] max-w-xs pointer-events-none z-50">
      <div className="flex items-center justify-between border-b border-slate-800 pb-1.5 gap-2">
        <span className={`px-2 py-0.5 rounded text-xs font-bold border font-tabular ${magColorClass}`}>
          M {typeof data.magnitude === 'number' ? data.magnitude.toFixed(1) : '—'}
        </span>
        <span className="text-[10px] text-slate-400 font-mono font-tabular">
          {data.displayTime}
        </span>
      </div>

      <div className="text-[11px] font-semibold text-slate-200 leading-tight">
        {data.place || 'Seismic Event'}
      </div>

      <div className="space-y-1 pt-0.5 text-slate-300 font-mono font-tabular text-[11px]">
        <div className="flex items-center justify-between">
          <span className="flex items-center gap-1 text-cyan-400">
            <MapPin className="w-3 h-3" />
            Distance:
          </span>
          <span className="font-bold text-white">
            {data.distance_km !== null && data.distance_km !== undefined ? `${data.distance_km} km` : '—'}
          </span>
        </div>

        <div className="flex items-center justify-between">
          <span className="flex items-center gap-1 text-orange-400">
            <Activity className="w-3 h-3" />
            Focal Depth:
          </span>
          <span className="font-bold text-white">
            {data.depth_km !== null && data.depth_km !== undefined ? `${data.depth_km} km` : '—'}
          </span>
        </div>

        {data.fullTime && (
          <div className="flex items-center justify-between text-[10px] text-slate-400 pt-1 border-t border-slate-900">
            <span className="flex items-center gap-1 text-slate-500">
              <Clock className="w-3 h-3" />
              UTC:
            </span>
            <span className="truncate max-w-[150px]">{data.fullTime}</span>
          </div>
        )}
      </div>
    </div>
  )
}

function getBarColor(mag) {
  if (mag >= 5.0) return '#ef4444' // Red (Significant)
  if (mag >= 4.0) return '#f97316' // Orange (Moderate)
  return '#f59e0b' // Amber (Minor)
}

export function EarthquakeActivityChart({
  events = [],
  searchRadiusKm = 250,
  isUnavailable = false,
  className = '',
}) {
  const chartData = useMemo(() => {
    if (!Array.isArray(events) || events.length === 0) {
      return []
    }

    const valid = events.filter((e) => e && typeof e === 'object')

    // Sort chronologically ascending (oldest to newest for timeline flow)
    const sorted = [...valid].sort((a, b) => {
      const timeA = a.time ? new Date(a.time).getTime() : 0
      const timeB = b.time ? new Date(b.time).getTime() : 0
      return timeA - timeB
    })

    return sorted
      .map((event, idx) => {
        const mag =
          typeof event.magnitude === 'number' && !isNaN(event.magnitude)
            ? Number(event.magnitude.toFixed(1))
            : null
        const depth =
          typeof event.depth_km === 'number' && !isNaN(event.depth_km)
            ? Number(event.depth_km.toFixed(1))
            : null

        let displayTime = `Event #${idx + 1}`
        let fullTime = event.time || 'Unknown time'

        if (event.time) {
          try {
            const dateObj = new Date(event.time)
            if (!isNaN(dateObj.getTime())) {
              const month = dateObj.toLocaleDateString([], { month: 'short' })
              const day = dateObj.getDate()
              displayTime = `${month} ${day}`
              fullTime = dateObj.toUTCString().replace('GMT', 'UTC')
            }
          } catch {
            displayTime = event.time.slice(5, 10) || `Event #${idx + 1}`
          }
        }

        return {
          id: event.id || `eq-${idx}`,
          index: idx,
          magnitude: mag,
          depth_km: depth,
          place: event.place,
          distance_km: typeof event.distance_km === 'number' ? event.distance_km : null,
          latitude: event.latitude,
          longitude: event.longitude,
          time: event.time,
          displayTime,
          fullTime,
        }
      })
      .filter((item) => item.magnitude !== null)
  }, [events])

  const stats = useMemo(() => {
    if (!chartData.length) return null

    const mags = chartData.map((d) => d.magnitude).filter((m) => typeof m === 'number')
    const dists = chartData.map((d) => d.distance_km).filter((d) => typeof d === 'number')
    const depths = chartData.map((d) => d.depth_km).filter((dp) => typeof dp === 'number')

    const maxMag = mags.length ? Math.max(...mags) : null
    const minMag = mags.length ? Math.min(...mags) : null
    const minDist = dists.length ? Math.min(...dists) : null
    const avgDepth = depths.length
      ? Number((depths.reduce((a, b) => a + b, 0) / depths.length).toFixed(1))
      : null

    return {
      count: chartData.length,
      maxMag,
      minMag,
      minDist,
      avgDepth,
    }
  }, [chartData])

  if (!chartData.length) {
    return (
      <div className="py-6 text-center text-xs text-slate-500 rounded-lg bg-slate-950/40 border border-slate-800/80">
        {isUnavailable
          ? 'Seismic activity timeline is currently unavailable.'
          : `No M ≥ 3.0 events recorded within ${searchRadiusKm} km in the past 30 days.`}
      </div>
    )
  }

  return (
    <div
      className={`space-y-3 pt-3 border-t border-slate-800/80 ${className}`}
      aria-label="30-Day seismic activity timeline"
    >
      {/* Header & Meta Badges */}
      <div className="flex flex-wrap items-center justify-between gap-2.5">
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-white">
            <Activity className="w-3.5 h-3.5 text-orange-400" aria-hidden="true" />
            <span>30-Day Seismic Activity Timeline</span>
          </div>
          {stats && (
            <Badge variant="secondary" size="sm" className="font-mono text-[10px]">
              {stats.count} Event{stats.count === 1 ? '' : 's'} (M ≥ 3.0)
            </Badge>
          )}
        </div>

        <span className="text-[10px] text-slate-400 font-mono">
          USGS {searchRadiusKm}km Feed
        </span>
      </div>

      {/* Screen reader summary */}
      <div className="sr-only">
        {stats && (
          <p>
            30-day seismic event timeline. {stats.count} earthquakes of magnitude 3.0 or greater recorded within {searchRadiusKm} kilometers.
            Maximum magnitude was {stats.maxMag}. {stats.minDist !== null ? `Closest recorded event was ${stats.minDist} kilometers away.` : ''}
          </p>
        )}
      </div>

      {/* Summary Pill Bar */}
      <div className="flex flex-wrap items-center gap-3 text-[11px] text-slate-400 font-mono font-tabular px-1">
        {stats?.maxMag !== null && (
          <div className="flex items-center gap-1">
            <span className="text-slate-500">Max Mag:</span>
            <span className="text-orange-300 font-semibold">M {stats.maxMag}</span>
          </div>
        )}
        {stats?.minDist !== null && (
          <div className="flex items-center gap-1">
            <span className="text-slate-500">Closest:</span>
            <span className="text-cyan-300 font-semibold">{stats.minDist} km</span>
          </div>
        )}
        {stats?.avgDepth !== null && (
          <div className="flex items-center gap-1">
            <span className="text-slate-500">Avg Depth:</span>
            <span className="text-slate-300 font-semibold">{stats.avgDepth} km</span>
          </div>
        )}
      </div>

      {/* Responsive Chart Canvas */}
      <div className="h-[175px] sm:h-[195px] w-full pt-1">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={chartData}
            margin={{ top: 8, right: 10, left: -22, bottom: 0 }}
          >
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="rgba(255, 255, 255, 0.06)"
              vertical={false}
            />

            <XAxis
              dataKey="displayTime"
              stroke="#64748b"
              tick={{ fill: '#94a3b8', fontSize: 10 }}
              tickLine={false}
              axisLine={{ stroke: 'rgba(255, 255, 255, 0.1)' }}
              interval="preserveStartEnd"
              minTickGap={20}
            />

            <YAxis
              domain={[3.0, (dataMax) => Math.max(5.5, Math.ceil(dataMax + 0.5))]}
              stroke="#64748b"
              tick={{ fill: '#94a3b8', fontSize: 10 }}
              tickLine={false}
              axisLine={false}
              width={38}
              tickFormatter={(v) => `M${v}`}
            />

            <Tooltip content={<EarthquakeCustomTooltip />} />

            <Bar
              dataKey="magnitude"
              radius={[3, 3, 0, 0]}
              maxBarSize={28}
              isAnimationActive={false}
            >
              {chartData.map((entry) => (
                <Cell key={entry.id} fill={getBarColor(entry.magnitude)} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
