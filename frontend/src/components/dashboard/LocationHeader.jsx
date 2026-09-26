import { MapPin, Navigation, RefreshCw } from 'lucide-react'
import { Badge, Button } from '@/components/ui'
import { formatCoordinates } from '@/lib/utils'

export function LocationHeader({
  location,
  loading = false,
  onRefresh,
  onChangeLocation,
}) {
  if (!location) return null

  const parts = location.display_name ? location.display_name.split(',').map((p) => p.trim()) : []
  const primaryName = location.name || parts[0] || 'Target Location'
  const secondaryContext = parts.length > 1
    ? parts.slice(1).join(', ')
    : location.display_name || ''

  return (
    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 sm:p-5 rounded-xl border border-slate-700/80 bg-slate-900/90 backdrop-blur-md shadow-lg shadow-black/20">
      {/* Location Identity */}
      <div className="flex items-start gap-3.5 min-w-0">
        <div className="p-2.5 rounded-xl bg-cyan-500/15 border border-cyan-500/30 text-cyan-400 shrink-0 transition-transform duration-200 hover:scale-105">
          <Navigation className="w-5 h-5" aria-hidden="true" />
        </div>

        <div className="space-y-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-cyan-400">
              Active Situational Target
            </span>
            <Badge variant="secondary" size="sm">Telemetry</Badge>
            {location.source && (
              <span className="text-[10px] text-slate-400 font-mono">
                via {location.source}
              </span>
            )}
          </div>

          <h2 className="text-lg sm:text-xl font-bold text-white tracking-tight truncate">
            {primaryName}
          </h2>

          {secondaryContext && (
            <p className="text-xs text-slate-400 line-clamp-1 leading-relaxed">
              {secondaryContext}
            </p>
          )}
        </div>
      </div>

      {/* Coordinate Display & Telemetry Actions */}
      <div className="flex flex-wrap items-center justify-between md:justify-end gap-3 pt-3 md:pt-0 border-t md:border-t-0 border-slate-800">
        <div className="flex items-center gap-2 text-xs font-tabular font-mono text-slate-200 bg-slate-950/80 px-3 py-1.5 rounded-lg border border-slate-800 transition-colors duration-150 hover:border-slate-700">
          <MapPin className="w-3.5 h-3.5 text-cyan-400 shrink-0" aria-hidden="true" />
          <span>{formatCoordinates(location.latitude, location.longitude)}</span>
        </div>

        <div className="flex items-center gap-2">
          {onRefresh && (
            <Button
              variant="secondary"
              size="sm"
              disabled={loading}
              onClick={onRefresh}
              aria-label="Refresh telemetry data"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
              <span className="hidden sm:inline">{loading ? 'Updating...' : 'Refresh'}</span>
            </Button>
          )}

          {onChangeLocation && (
            <Button
              variant="outline"
              size="sm"
              onClick={onChangeLocation}
              aria-label="Change target location"
            >
              Change Target
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}
